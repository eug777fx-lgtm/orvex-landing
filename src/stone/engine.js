/*
 * Lithos stone engine.
 *
 * A polished obsidian stone built entirely from code (no models, no video),
 * cut into four slabs: Website, CRM, Automation, Marketing. The page scroll
 * drives a camera script (cues), the cursor turns a small photo studio that
 * the stone reflects, and the slabs come apart and lock back together.
 *
 * The React wrapper owns the loop and calls update(progress, dt) + render().
 */
import * as THREE from 'three'

const SLABS = 4
const HALF_H = 0.62 // half height of the whole stone
const GAP = 0.56 // vertical travel per slab step when exploded
const BEVEL_H = 0.016
const BEVEL_IN = 0.975

/* ---------------- shape ---------------- */

// Horizontal profile: 1 at the waist, 0 at the poles. Flatter base than top.
function profile(y) {
  const t = Math.max(-1, Math.min(1, y / HALF_H))
  const p = t > 0 ? 2.5 : 3.2
  return Math.pow(Math.max(0, 1 - Math.pow(Math.abs(t), p)), 1 / p)
}

// Pebble cross section radius at angle theta and height y.
function radius(theta, y) {
  const t = y / HALF_H
  const rx = 1.32
  const rz = 0.96
  const c = Math.cos(theta)
  const s = Math.sin(theta)
  const ell = 1 / Math.sqrt((c / rx) ** 2 + (s / rz) ** 2)
  const wobble =
    1 +
    0.05 * Math.sin(2 * theta + 0.9 + 1.1 * t) +
    0.035 * Math.sin(3 * theta + 2.1) +
    0.018 * Math.sin(5 * theta + 0.3 + 2 * t)
  return ell * wobble * profile(y)
}

// Slight natural lean: the cross sections drift as you go up.
function centerAt(y) {
  const t = y / HALF_H
  return [0.06 * t, -0.04 * t]
}

function point(theta, y, scale = 1) {
  const r = radius(theta, y) * scale
  const [cx, cz] = centerAt(y)
  return [cx + Math.cos(theta) * r, y, cz + Math.sin(theta) * r]
}

/*
 * One closed slab between y0 and y1. Group 0 is the stone surface,
 * group 1 the flat cut faces (with a small bevel ring so the edge catches light).
 */
function buildSlab(y0, y1, { seg = 160, rings = 22 } = {}) {
  const pos = []
  const uv = []
  const idx = []
  const cutBottom = y0 > -HALF_H + 1e-6
  const cutTop = y1 < HALF_H - 1e-6

  // wall rings
  const ys = []
  const lo = cutBottom ? y0 + BEVEL_H : y0 + 0.012
  const hi = cutTop ? y1 - BEVEL_H : y1 - 0.012
  if (cutBottom) ys.push({ y: y0, s: BEVEL_IN })
  for (let j = 0; j <= rings; j++) ys.push({ y: lo + ((hi - lo) * j) / rings, s: 1 })
  if (cutTop) ys.push({ y: y1, s: BEVEL_IN })

  const ringStart = []
  for (const { y, s } of ys) {
    ringStart.push(pos.length / 3)
    for (let k = 0; k < seg; k++) {
      const th = (k / seg) * Math.PI * 2
      pos.push(...point(th, y, s))
      uv.push(k / seg, (y + HALF_H) / (2 * HALF_H))
    }
  }
  for (let j = 0; j < ys.length - 1; j++) {
    const a0 = ringStart[j]
    const b0 = ringStart[j + 1]
    for (let k = 0; k < seg; k++) {
      const k1 = (k + 1) % seg
      idx.push(a0 + k, b0 + k, a0 + k1)
      idx.push(a0 + k1, b0 + k, b0 + k1)
    }
  }
  // close the poles of the outer slabs with a fan
  const addPole = (ring, y, up) => {
    const c = pos.length / 3
    const [cx, cz] = centerAt(y)
    pos.push(cx, y, cz)
    uv.push(0.5, up ? 1 : 0)
    const r0 = ringStart[ring]
    for (let k = 0; k < seg; k++) {
      const k1 = (k + 1) % seg
      if (up) idx.push(r0 + k, c, r0 + k1)
      else idx.push(r0 + k1, c, r0 + k)
    }
  }
  if (!cutBottom) addPole(0, y0, false)
  if (!cutTop) addPole(ys.length - 1, y1, true)
  const wallCount = idx.length

  // flat caps
  const addCap = (y, up) => {
    const c = pos.length / 3
    const [cx, cz] = centerAt(y)
    pos.push(cx, y, cz)
    uv.push(0.5, 0.5)
    const r0 = pos.length / 3
    for (let k = 0; k < seg; k++) {
      const th = (k / seg) * Math.PI * 2
      const p = point(th, y, BEVEL_IN)
      pos.push(...p)
      uv.push(0.5 + (p[0] - cx) / 3, 0.5 + (p[2] - cz) / 3)
    }
    for (let k = 0; k < seg; k++) {
      const k1 = (k + 1) % seg
      if (up) idx.push(c, r0 + k1, r0 + k)
      else idx.push(c, r0 + k, r0 + k1)
    }
  }
  if (cutBottom) addCap(y0, false)
  if (cutTop) addCap(y1, true)

  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2))
  g.setIndex(idx)
  g.addGroup(0, wallCount, 0)
  g.addGroup(wallCount, idx.length - wallCount, 1)
  g.computeVertexNormals()
  return g
}

/* ---------------- textures made in code ---------------- */

function ringsTexture() {
  const s = 512
  const cv = document.createElement('canvas')
  cv.width = cv.height = s
  const ctx = cv.getContext('2d')
  ctx.fillStyle = 'rgb(120,120,120)'
  ctx.fillRect(0, 0, s, s)
  // concentric machining rings
  for (let r = 2; r < s * 0.72; r += 2) {
    const v = 95 + Math.random() * 70
    ctx.strokeStyle = `rgb(${v},${v},${v})`
    ctx.lineWidth = 1 + Math.random()
    ctx.beginPath()
    ctx.arc(s / 2, s / 2, r, 0, Math.PI * 2)
    ctx.stroke()
  }
  const t = new THREE.CanvasTexture(cv)
  t.colorSpace = THREE.NoColorSpace
  return t
}

// Soft contact shadow: a gaussian falloff computed per pixel (no gradient
// stops, so no banding), with a touch of noise to dither the darkest ring.
function shadowTexture(rgb = 0) {
  const s = 256
  const cv = document.createElement('canvas')
  cv.width = cv.height = s
  const ctx = cv.getContext('2d')
  const img = ctx.createImageData(s, s)
  for (let y = 0; y < s; y++) {
    for (let x = 0; x < s; x++) {
      const dx = (x - s / 2) / (s / 2)
      const dy = (y - s / 2) / (s / 2)
      const r2 = dx * dx + dy * dy
      const a = r2 >= 1 ? 0 : Math.exp(-r2 * 4.2) * (1 - r2) * (1 - r2)
      const i = (y * s + x) * 4
      img.data[i] = img.data[i + 1] = img.data[i + 2] = rgb
      img.data[i + 3] = Math.max(0, Math.min(255, a * 255 + (Math.random() - 0.5) * 2))
    }
  }
  ctx.putImageData(img, 0, 0)
  const t = new THREE.CanvasTexture(cv)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

/* ---------------- the studio the stone reflects ---------------- */

// A product-photography studio for a white page: a pale cyclorama, a big
// off-axis softbox, two strip lights for the edge lines and two black flags
// that carve dark reflections into the stone so its shape reads.
function buildStudio() {
  const studio = new THREE.Scene()
  studio.background = new THREE.Color().setScalar(0.16)
  const panel = (w, h, intensity, position, lookAt = [0, 0, 0]) => {
    const m = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide })
    m.color.setScalar(intensity)
    const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m)
    p.position.set(...position)
    p.lookAt(...lookAt)
    studio.add(p)
  }
  panel(10, 6, 4.2, [-7, 8, 6]) // key softbox, off axis
  panel(1.2, 14, 4.5, [9, 1, -3]) // strip, edge line right
  panel(1.2, 14, 3.2, [-9, 1, -5]) // strip, edge line left
  panel(16, 3, 1.4, [0, 10, -9]) // top back fill
  panel(24, 24, 0.45, [0, -8, 0]) // sweep floor
  panel(5, 12, 0, [-4.5, 0, 7]) // black flag, front left
  panel(6, 12, 0, [6, -1, 4]) // black flag, front right
  return studio
}

/* ---------------- camera script ---------------- */

// at: scroll progress. frame: world units that must fit on screen.
// elev / az in degrees. offX / offY: screen shift (fraction of width/height).
const CUES_DESKTOP = [
  { at: 0.0, frame: 4.3, elev: 24, az: -18, offX: 0, offY: 0.09, explode: 0 },
  { at: 0.1, frame: 4.6, elev: 22, az: 0, offX: 0, offY: 0, explode: 0 },
  { at: 0.24, frame: 3.9, elev: 10, az: 40, offX: -0.21, offY: 0, explode: 0 },
  { at: 0.42, frame: 5.4, elev: 18, az: 75, offX: 0, offY: 0, explode: 1 },
  { at: 0.58, frame: 5.4, elev: 18, az: 95, offX: 0, offY: 0, explode: 1 },
  { at: 0.74, frame: 5.2, elev: -6, az: 230, offX: 0.18, offY: 0, explode: 0.85 },
  { at: 0.9, frame: 4.6, elev: 28, az: 360, offX: 0, offY: 0.17, explode: 0 },
  { at: 1.0, frame: 4.6, elev: 30, az: 380, offX: 0, offY: 0.17, explode: 0 },
]
const CUES_MOBILE = [
  { at: 0.0, frame: 3.7, elev: 24, az: -18, offX: 0, offY: 0.07, explode: 0 },
  { at: 0.1, frame: 3.6, elev: 22, az: 0, offX: 0, offY: 0.04, explode: 0 },
  { at: 0.24, frame: 3.0, elev: 10, az: 40, offX: 0, offY: 0.16, explode: 0 },
  { at: 0.42, frame: 5.0, elev: 18, az: 75, offX: 0, offY: 0.17, explode: 1 },
  { at: 0.58, frame: 5.0, elev: 18, az: 95, offX: 0, offY: 0.17, explode: 1 },
  { at: 0.74, frame: 4.6, elev: -6, az: 230, offX: 0, offY: 0.18, explode: 0.85 },
  { at: 0.9, frame: 3.6, elev: 28, az: 360, offX: 0, offY: 0.2, explode: 0 },
  { at: 1.0, frame: 3.6, elev: 30, az: 380, offX: 0, offY: 0.2, explode: 0 },
]
const KEYS = ['frame', 'elev', 'az', 'offX', 'offY', 'explode']
const smooth = (t) => t * t * (3 - 2 * t)
const clamp01 = (v) => Math.max(0, Math.min(1, v))
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

function sampleCues(cues, p) {
  if (p <= cues[0].at) return { ...cues[0] }
  for (let i = 0; i < cues.length - 1; i++) {
    const a = cues[i]
    const b = cues[i + 1]
    if (p <= b.at) {
      const t = smooth((p - a.at) / (b.at - a.at))
      const out = {}
      for (const k of KEYS) out[k] = a[k] + (b[k] - a[k]) * t
      return out
    }
  }
  return { ...cues[cues.length - 1] }
}

/* ---------------- engine ---------------- */

export function createStoneEngine(canvas, { mobile = false, reduced = false, onSlab } = {}) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  })
  renderer.setClearColor(0x000000, 0)
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.05
  renderer.outputColorSpace = THREE.SRGBColorSpace
  const maxDpr = mobile ? 1.75 : 2
  let dpr = Math.min(window.devicePixelRatio || 1, maxDpr)
  renderer.setPixelRatio(dpr)

  const scene = new THREE.Scene()
  const pmrem = new THREE.PMREMGenerator(renderer)
  const studio = buildStudio()
  const envRT = pmrem.fromScene(studio, 0.035)
  scene.environment = envRT.texture
  studio.traverse((o) => {
    if (o.geometry) o.geometry.dispose()
    if (o.material) o.material.dispose()
  })

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100)

  // materials: glossy obsidian for the stone, machined metal for the cut faces
  const rings = ringsTexture()
  const obsidian = new THREE.MeshPhysicalMaterial({
    color: 0x505055,
    metalness: 0.3,
    roughness: 0.16,
    clearcoat: 1,
    clearcoatRoughness: 0.04,
    ior: 1.6,
    envMapIntensity: 1.0,
  })
  const machined = new THREE.MeshPhysicalMaterial({
    color: 0x9a9a9a,
    metalness: 1,
    roughness: 0.3,
    roughnessMap: rings,
    envMapIntensity: 1.1,
  })
  const blueprintMat = new THREE.LineBasicMaterial({
    color: 0x111111,
    transparent: true,
    opacity: 0.55,
  })

  const stone = new THREE.Group()
  scene.add(stone)

  const slabs = []
  const step = (2 * HALF_H) / SLABS
  for (let i = 0; i < SLABS; i++) {
    // i = 0 is the top slab
    const y1 = HALF_H - i * step
    const y0 = y1 - step
    const geo = buildSlab(y0, y1, mobile ? { seg: 120, rings: 16 } : undefined)
    const mesh = new THREE.Mesh(geo, [obsidian, machined])
    const holder = new THREE.Group()
    holder.add(mesh)
    // blueprint: low resolution wire version of the same slab
    const lowGeo = buildSlab(y0, y1, { seg: 48, rings: 5 })
    const wire = new THREE.LineSegments(new THREE.WireframeGeometry(lowGeo), blueprintMat)
    lowGeo.dispose()
    wire.visible = false
    holder.add(wire)
    stone.add(holder)
    const mid = (y0 + y1) / 2
    let rMax = 0
    for (let k = 0; k < 32; k++) rMax = Math.max(rMax, radius((k / 32) * Math.PI * 2, mid))
    slabs.push({ holder, mesh, wire, mid, rMax })
  }

  // soft light pool under the stone
  // on the dark page this is a soft pool of light the stone sits in
  const glowTex = shadowTexture(255)
  const glow = new THREE.Mesh(
    new THREE.PlaneGeometry(4.6, 3.6),
    new THREE.MeshBasicMaterial({
      map: glowTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.16,
      toneMapped: false,
    })
  )
  glow.rotation.x = -Math.PI / 2
  glow.position.y = -HALF_H - 0.22
  scene.add(glow)

  const cues = mobile ? CUES_MOBILE : CUES_DESKTOP
  const cur = sampleCues(cues, 0)
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 }
  let spin = 0
  let spinVel = 0
  let explodeShown = 0
  let W = 1
  let H = 1
  let blueprint = false
  let hold = 0
  const slabOpen = slabs.map(() => false)
  const tmp = new THREE.Vector3()
  const right = new THREE.Vector3()
  const anchors = slabs.map(() => ({ x: 0, y: 0, visible: false }))

  // adaptive quality
  let frames = 0
  let acc = 0

  function resize(w, h) {
    W = Math.max(1, w)
    H = Math.max(1, h)
    renderer.setSize(W, H, false)
    camera.aspect = W / H
    camera.updateProjectionMatrix()
  }

  function setPointer(nx, ny) {
    pointer.tx = nx
    pointer.ty = ny
  }

  function nudge(dx) {
    spinVel += dx
  }

  function setHold(v) {
    hold = clamp01(v)
  }

  function setBlueprint(on) {
    blueprint = on
    for (const s of slabs) {
      s.mesh.visible = !on
      s.wire.visible = on
    }
    glow.visible = !on
  }

  function update(progress, dt) {
    dt = Math.min(dt, 0.05)
    const target = sampleCues(cues, clamp01(progress))
    target.explode = Math.max(target.explode, hold)
    const k = reduced ? 1 : 1 - Math.exp(-dt * 5.5)
    for (const key of KEYS) cur[key] += (target[key] - cur[key]) * k

    // cursor
    const pk = 1 - Math.exp(-dt * 4)
    pointer.x += (pointer.tx - pointer.x) * pk
    pointer.y += (pointer.ty - pointer.y) * pk
    scene.environmentRotation.set(pointer.y * 0.35, pointer.x * 0.9, 0)

    // idle spin + drag momentum
    spin += (reduced ? 0 : dt * 0.12) + spinVel * dt
    spinVel *= Math.exp(-dt * 2.2)
    stone.rotation.set(0.06 + pointer.y * 0.08, spin, pointer.x * -0.05)

    // explode: top slab leaves first, comes back last
    explodeShown = cur.explode
    for (let i = 0; i < SLABS; i++) {
      const delay = (i / (SLABS - 1)) * 0.32
      const t = easeInOut(clamp01((explodeShown - delay) / 0.68))
      const s = slabs[i]
      s.holder.position.set((i % 2 ? -0.07 : 0.07) * t, (1.5 - i) * GAP * t, 0)
      s.holder.rotation.y = (1.5 - i) * 0.22 * t
      const open = slabOpen[i] ? t > 0.35 : t > 0.55
      if (open !== slabOpen[i]) {
        slabOpen[i] = open
        if (onSlab) onSlab(i, open)
      }
    }
    glow.material.opacity = 0.16 * (1 - explodeShown * 0.55)

    // camera: frame by size so the same cue works on a phone and a monitor
    const fov = THREE.MathUtils.degToRad(camera.fov)
    const fit = Math.tan(fov / 2) * Math.min(1, camera.aspect)
    const dist = cur.frame / 2 / fit
    const el = THREE.MathUtils.degToRad(cur.elev)
    const az = THREE.MathUtils.degToRad(cur.az)
    camera.position.set(
      Math.sin(az) * Math.cos(el) * dist,
      Math.sin(el) * dist,
      Math.cos(az) * Math.cos(el) * dist
    )
    camera.lookAt(0, 0, 0)
    camera.setViewOffset(W, H, -cur.offX * W, cur.offY * H, W, H)
    camera.updateMatrixWorld()

    // label anchors: the rim of each slab, facing its label column
    right.setFromMatrixColumn(camera.matrixWorld, 0)
    for (let i = 0; i < SLABS; i++) {
      const s = slabs[i]
      const side = mobile ? 1 : i % 2 === 0 ? -1 : 1
      tmp.set(0, s.mid, 0)
      s.holder.localToWorld(tmp)
      tmp.addScaledVector(right, side * s.rMax * 0.92)
      tmp.project(camera)
      anchors[i].x = (tmp.x * 0.5 + 0.5) * W
      anchors[i].y = (-tmp.y * 0.5 + 0.5) * H
      anchors[i].side = side
    }

    // adaptive quality: step resolution down if we drop under ~40 fps
    frames++
    acc += dt
    if (frames >= 90) {
      const fps = frames / acc
      if (fps < 40 && dpr > 1) {
        dpr = Math.max(1, dpr - 0.25)
        renderer.setPixelRatio(dpr)
        renderer.setSize(W, H, false)
      }
      frames = 0
      acc = 0
    }
    return { explode: explodeShown, anchors }
  }

  function render() {
    renderer.render(scene, camera)
  }

  async function warm() {
    try {
      if (renderer.compileAsync) await renderer.compileAsync(scene, camera)
    } catch {
      /* compile on first frame instead */
    }
  }

  function dispose() {
    for (const s of slabs) {
      s.mesh.geometry.dispose()
      s.wire.geometry.dispose()
    }
    obsidian.dispose()
    machined.dispose()
    blueprintMat.dispose()
    rings.dispose()
    glowTex.dispose()
    glow.geometry.dispose()
    glow.material.dispose()
    envRT.dispose()
    pmrem.dispose()
    renderer.dispose()
  }

  return { resize, update, render, setPointer, nudge, setHold, setBlueprint, warm, dispose, get blueprint() { return blueprint } }
}

export function webglAvailable() {
  try {
    const c = document.createElement('canvas')
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')))
  } catch {
    return false
  }
}
