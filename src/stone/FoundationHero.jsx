import { useEffect, useRef, useState } from 'react'
import { unlockSound, tap, knock } from './sound.js'

/*
 * Scroll story hero. One sticky viewport, the live 3D stone behind,
 * the story in front. Every reveal is driven by scroll position (not
 * IntersectionObserver) so nothing gets skipped on heavy GPU frames.
 */

// hero, problem, layers, live, together
const SNAP_POINTS = [0, 0.25, 0.5, 0.75, 1]

const HERO_WORDS = ["We", "build", "the", "foundation", "your", "business", "runs", "on."]

const LAYERS = [
  { n: '01', t: 'Website', d: 'Your 24/7 storefront that turns visitors into bookings.' },
  { n: '02', t: 'CRM', d: 'Every lead, client and follow up in one place.' },
  { n: '03', t: 'Automation', d: 'Confirmations, reminders and reports that run themselves.' },
  { n: '04', t: 'Marketing', d: 'Content and campaigns that keep new customers coming.' },
]

// opacity for a beat: fades in over [a,b], holds, fades out over [c,d]
function band(p, a, b, c, d) {
  if (p <= a || p >= d) return 0
  if (p < b) return (p - a) / (b - a)
  if (p <= c) return 1
  return 1 - (p - c) / (d - c)
}
const clamp01 = (v) => Math.max(0, Math.min(1, v))

function useMedia(q) {
  const [m, setM] = useState(() => (typeof window !== 'undefined' ? window.matchMedia(q).matches : false))
  useEffect(() => {
    const mq = window.matchMedia(q)
    const on = () => setM(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [q])
  return m
}

export default function FoundationHero({ C, FONT, onBook, Fallback }) {
  const mobile = useMedia('(max-width: 860px)')
  const reduced = useMedia('(prefers-reduced-motion: reduce)')
  const sectionRef = useRef(null)
  const stickyRef = useRef(null)
  const canvasRef = useRef(null)
  const heroRef = useRef(null)
  const beatRefs = useRef([])
  const labelRefs = useRef([])
  const lineRefs = useRef([])
  const dotRefs = useRef([])
  const listRef = useRef(null)
  const railRef = useRef([])
  const engineRef = useRef(null)
  const ringRef = useRef(null)
  const hintRef = useRef(null)
  const wordRefs = useRef([])
  const restRef = useRef(null)
  const soundBtnRef = useRef(null)
  const soundRef = useRef(false)
  const [soundOn, setSoundOn] = useState(false)
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)
  const [blueprint, setBlueprint] = useState(false)

  useEffect(() => {
    let disposed = false
    let raf = 0
    let last = performance.now()
    let visible = true
    let engine = null
    let wordDirs = null
    let holding = false
    let holdV = 0
    let holdX = 0
    let holdY = 0
    let downX = 0
    let downY = 0
    let closedCount = 0
    const onSlab = (i, open) => {
      if (!soundRef.current || !(holding || holdV > 0.02)) return
      if (open) {
        closedCount = 0
        tap(1 + i * 0.18)
      } else if (++closedCount === 4) knock()
      else tap(0.8 - i * 0.05, 0.1)
    }

    const section = sectionRef.current
    const sticky = stickyRef.current
    const canvas = canvasRef.current

    const progress = () => {
      const r = section.getBoundingClientRect()
      const total = r.height - window.innerHeight
      return total > 0 ? clamp01(-r.top / total) : 0
    }

    const applyOverlay = (p, state) => {
      // hero copy leaves as the camera moves in
      const h = heroRef.current
      if (h) {
        // the headline explodes outward from the centre as you start to scroll,
        // like the slabs of the stone, and reveals the stone behind it
        const e = clamp01((p - 0.012) / 0.1)
        const ease = e * e * (3 - 2 * e)
        const o = 1 - e
        const W = sticky.clientWidth
        const H = sticky.clientHeight
        if (!wordDirs || wordDirs.w !== W || wordDirs.h !== H || e === 0) {
          const sr = sticky.getBoundingClientRect()
          const cx = sr.left + W / 2
          const cy = sr.top + H / 2
          wordDirs = { w: W, h: H, list: wordRefs.current.map((el, i) => {
            if (!el) return null
            const r = el.getBoundingClientRect()
            let dx = r.left + r.width / 2 - cx
            let dy = r.top + r.height / 2 - cy
            const len = Math.hypot(dx, dy) || 1
            dx /= len
            dy /= len
            return { dx, dy, rot: (dx >= 0 ? 1 : -1) * (14 + (i % 3) * 9) }
          }) }
        }
        wordRefs.current.forEach((el, i) => {
          const d = wordDirs.list[i]
          if (!el || !d) return
          const dist = ease * Math.max(W, H) * 0.55
          el.style.transform = `translate(${d.dx * dist}px, ${d.dy * dist}px) rotate(${d.rot * ease}deg) scale(${1 + ease * 0.5})`
          el.style.opacity = Math.max(0, 1 - ease * 1.15)
          el.style.filter = ease > 0.01 ? `blur(${ease * 7}px)` : 'none'
        })
        if (restRef.current) {
          const ro = 1 - clamp01(p / 0.035)
          restRef.current.style.opacity = ro
          restRef.current.style.transform = `translateY(${(1 - ro) * 24}px)`
        }
        h.style.visibility = o > 0.002 ? 'visible' : 'hidden'
        h.style.pointerEvents = e < 0.25 ? 'auto' : 'none'
        if (hintRef.current) hintRef.current.style.opacity = o * (1 - holdV)
        if (soundBtnRef.current) {
          soundBtnRef.current.style.opacity = o
          soundBtnRef.current.style.pointerEvents = o > 0.5 ? 'auto' : 'none'
        }
      }
      const beats = [
        band(p, 0.15, 0.2, 0.3, 0.35), // close up
        band(p, 0.37, 0.42, 0.58, 0.63), // layers
        band(p, 0.65, 0.7, 0.8, 0.85), // live
        band(p, 0.87, 0.92, 1.01, 1.02), // together
      ]
      beats.forEach((o, i) => {
        const el = beatRefs.current[i]
        if (!el) return
        el.style.opacity = o
        el.style.transform = `translateY(${(1 - o) * 26}px)`
        el.style.pointerEvents = o > 0.5 ? 'auto' : 'none'
        el.style.visibility = o > 0.001 ? 'visible' : 'hidden'
      })
      railRef.current.forEach((el, i) => {
        if (!el) return
        const stops = [0, 0.2, 0.42, 0.7, 0.92]
        const active = p >= stops[i] - 0.02 && (i === stops.length - 1 || p < stops[i + 1] - 0.02)
        el.style.opacity = active ? 1 : 0.35
        el.style.width = active ? '26px' : '12px'
      })

      // layer labels follow the slabs
      const lo = state ? clamp01((state.explode - 0.55) / 0.35) * beats[1] : 0
      if (listRef.current) listRef.current.style.opacity = mobile ? lo : 0
      LAYERS.forEach((_, i) => {
        const lab = labelRefs.current[i]
        const line = lineRefs.current[i]
        const dot = dotRefs.current[i]
        const a = state?.anchors?.[i]
        if (!a) {
          if (lab) lab.style.opacity = 0
          if (line) line.style.opacity = 0
          if (dot) dot.style.opacity = 0
          return
        }
        if (dot) {
          dot.style.opacity = lo
          dot.style.transform = `translate(${a.x - 11}px, ${a.y - 11}px)`
        }
        if (mobile) {
          if (lab) lab.style.opacity = 0
          if (line) line.style.opacity = 0
          return
        }
        const W = sticky.clientWidth
        const colW = Math.min(300, W * 0.24)
        const pad = Math.max(28, (W - 1180) / 2 + 28)
        const left = a.side < 0
        const lx = left ? pad : W - pad - colW
        if (lab) {
          lab.style.opacity = lo
          lab.style.transform = `translate(${lx}px, ${a.y - 26}px)`
          lab.style.width = `${colW}px`
          lab.style.textAlign = left ? 'right' : 'left'
        }
        if (line) {
          const x1 = left ? lx + colW + 14 : lx - 14
          line.setAttribute('x1', x1)
          line.setAttribute('y1', a.y)
          line.setAttribute('x2', a.x)
          line.setAttribute('y2', a.y)
          line.style.opacity = lo * 0.6
        }
      })
    }

    const resize = () => {
      if (engine) engine.resize(sticky.clientWidth, sticky.clientHeight)
    }

    const tick = (now) => {
      raf = requestAnimationFrame(tick)
      if (!visible) return
      const dt = (now - last) / 1000
      last = now
      const p = progress()
      let state = null
      holdV = Math.max(0, Math.min(1, holdV + Math.min(dt, 0.05) * (holding ? 1.25 : -1.6)))
      const ring = ringRef.current
      if (ring) {
        ring.style.opacity = holding ? 1 : 0
        ring.style.transform = `translate(${holdX - 34}px, ${holdY - 34}px)`
        const c = ring.querySelector('circle[data-p]')
        if (c) c.style.strokeDashoffset = String(188.5 * (1 - holdV))
      }
      if (engine) {
        engine.setHold(1 - Math.pow(1 - holdV, 3))
        state = engine.update(p, dt)
        engine.render()
      }
      applyOverlay(p, state)
    }

    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting
        last = performance.now()
      },
      { rootMargin: '100px' }
    )
    io.observe(section)

    const onMove = (e) => {
      if (!engine) return
      const nx = (e.clientX / window.innerWidth) * 2 - 1
      const ny = (e.clientY / window.innerHeight) * 2 - 1
      engine.setPointer(nx, ny)
    }
    let dragX = null
    const onDown = (e) => {
      if (e.target.closest && e.target.closest('a,button,input,label')) return
      dragX = e.clientX
      downX = e.clientX
      downY = e.clientY
      const r = sticky.getBoundingClientRect()
      holdX = e.clientX - r.left
      holdY = e.clientY - r.top
      holding = true
      if (soundRef.current) unlockSound()
    }
    const onDrag = (e) => {
      if (dragX == null || !engine) return
      if (holding && Math.hypot(e.clientX - downX, e.clientY - downY) > 12) holding = false
      if (!holding) engine.nudge((e.clientX - dragX) * 0.05)
      dragX = e.clientX
    }
    const onUp = () => {
      dragX = null
      holding = false
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    sticky.addEventListener('pointerdown', onDown)
    window.addEventListener('pointermove', onDrag, { passive: true })
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    window.addEventListener('resize', resize)

    // three.js loads after the page, so the hero text shows instantly
    import('./engine.js')
      .then(async ({ createStoneEngine, webglAvailable }) => {
        if (disposed) return
        if (!webglAvailable()) throw new Error('no webgl')
        engine = createStoneEngine(canvas, { mobile, reduced, onSlab })
        engineRef.current = engine
        resize()
        engine.update(progress(), 1)
        await engine.warm()
        if (disposed) return
        engine.render()
        setReady(true)
      })
      .catch(() => {
        if (!disposed) setFailed(true)
      })

    raf = requestAnimationFrame(tick)
    return () => {
      disposed = true
      cancelAnimationFrame(raf)
      io.disconnect()
      window.removeEventListener('pointermove', onMove)
      sticky.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointermove', onDrag)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
      window.removeEventListener('resize', resize)
      if (engine) engine.dispose()
      engineRef.current = null
    }
  }, [mobile, reduced])

  // Phones: when a swipe settles inside the stone story, glide to the next
  // stage in the direction of travel so each stage locks into place.
  useEffect(() => {
    if (!mobile || reduced) return
    const section = sectionRef.current
    let lastY = window.scrollY
    let dir = 0
    let touching = false
    let timer = 0
    let auto = false
    const points = () => {
      const top = section.getBoundingClientRect().top + window.scrollY
      const range = section.offsetHeight - window.innerHeight
      return SNAP_POINTS.map((sp) => Math.round(top + sp * range))
    }
    const settle = () => {
      if (touching) return
      const y = window.scrollY
      const pts = points()
      const first = pts[0]
      const last = pts[pts.length - 1]
      if (y <= first + 2 || y >= last - 2) return // outside the story: scroll freely
      let target
      if (dir > 0) target = pts.find((v) => v > y + 6)
      else if (dir < 0) target = [...pts].reverse().find((v) => v < y - 6)
      if (target == null) target = pts.reduce((a, v) => (Math.abs(v - y) < Math.abs(a - y) ? v : a), pts[0])
      if (Math.abs(target - y) < 4) return
      auto = true
      window.scrollTo({ top: target, behavior: 'smooth' })
    }
    const onScroll = () => {
      const y = window.scrollY
      if (!auto && Math.abs(y - lastY) > 1) dir = Math.sign(y - lastY)
      lastY = y
      clearTimeout(timer)
      timer = setTimeout(() => {
        if (auto) {
          auto = false
          return
        }
        settle()
      }, 140)
    }
    const onStart = () => {
      touching = true
      auto = false
      clearTimeout(timer)
    }
    const onEnd = () => {
      touching = false
      clearTimeout(timer)
      timer = setTimeout(settle, 160)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('touchstart', onStart, { passive: true })
    window.addEventListener('touchend', onEnd, { passive: true })
    window.addEventListener('touchcancel', onEnd, { passive: true })
    return () => {
      clearTimeout(timer)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('touchstart', onStart)
      window.removeEventListener('touchend', onEnd)
      window.removeEventListener('touchcancel', onEnd)
    }
  }, [mobile, reduced])

  useEffect(() => {
    engineRef.current?.setBlueprint(blueprint)
  }, [blueprint, ready])

  if (failed && Fallback) return <Fallback />

  const kicker = {
    fontSize: 11.5,
    letterSpacing: '0.24em',
    textTransform: 'uppercase',
    color: C.faint,
    fontWeight: 600,
    marginBottom: 18,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  }
  const rule = { width: 34, height: 1, background: 'rgba(255,255,255,0.5)', display: 'inline-block' }
  const h2 = {
    fontSize: mobile ? 'clamp(30px, 8.4vw, 40px)' : 'clamp(36px, 3.8vw, 54px)',
    fontWeight: 720,
    letterSpacing: '-0.04em',
    lineHeight: 1.04,
    color: C.text,
    margin: 0,
  }
  const body = {
    fontSize: mobile ? 15.5 : 17.5,
    lineHeight: 1.6,
    color: C.muted,
    marginTop: 18,
    maxWidth: 460,
  }
  const beatBase = {
    position: 'absolute',
    zIndex: 3,
    opacity: 0,
    visibility: 'hidden',
    transition: 'none',
    ...(mobile
      ? { left: 22, right: 22, bottom: 'max(34px, env(safe-area-inset-bottom))' }
      : {}),
  }
  const pill = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 10,
    fontSize: 15,
    fontWeight: 650,
    padding: '15px 28px',
    borderRadius: 999,
    letterSpacing: '-0.01em',
    cursor: 'pointer',
    border: 'none',
    fontFamily: FONT,
  }
  const container = mobile
    ? { left: 22, right: 22 }
    : { left: 'max(28px, calc((100vw - 1180px) / 2 + 28px))' }

  return (
    <section
      id="hero"
      ref={sectionRef}
      style={{ position: 'relative', height: mobile ? '520svh' : '560vh' }}
      aria-label="Lithos Labs: we build the foundation your business runs on"
    >
      <div
        ref={stickyRef}
        style={{
          position: 'sticky',
          top: 0,
          height: '100svh',
          overflow: 'hidden',
          background:
            'radial-gradient(ellipse 60% 55% at 50% 50%, #141414 0%, #000000 75%)',
          touchAction: 'pan-y',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          WebkitTouchCallout: 'none',
          zIndex: 1,
        }}
      >
        <canvas
          ref={canvasRef}
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            display: 'block',
            opacity: ready ? 1 : 0,
            transition: 'opacity 1.2s ease',
          }}
        />

        {/* hold-to-split progress ring */}
        <svg
          ref={ringRef}
          aria-hidden
          width="68"
          height="68"
          viewBox="0 0 68 68"
          style={{ position: 'absolute', left: 0, top: 0, zIndex: 4, opacity: 0, pointerEvents: 'none', transition: 'opacity .2s' }}
        >
          <circle cx="34" cy="34" r="30" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />
          <circle
            data-p
            cx="34"
            cy="34"
            r="30"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="188.5"
            strokeDashoffset="188.5"
            transform="rotate(-90 34 34)"
          />
        </svg>
        <div
          ref={hintRef}
          aria-hidden
          style={{
            position: 'absolute',
            zIndex: 3,
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: 11,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: C.faint,
            fontWeight: 600,
            transform: 'translateX(-50%)',
            whiteSpace: 'nowrap',
            left: '50%',
            bottom: 'max(28px, env(safe-area-inset-bottom))',
          }}
        >
          <span className="lithos-hold-dot" />
          {mobile ? 'Press and hold the stone' : 'Press and hold the stone · drag to spin'}
        </div>

        {/* sound is off until the visitor turns it on */}
        <button
          ref={soundBtnRef}
          type="button"
          aria-pressed={soundOn}
          aria-label={soundOn ? 'Turn stone sounds off' : 'Turn stone sounds on'}
          onClick={() => {
            const next = !soundRef.current
            soundRef.current = next
            setSoundOn(next)
            if (next) {
              unlockSound()
              tap(1.1)
            }
          }}
          style={{
            position: 'absolute',
            zIndex: 4,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 12px',
            borderRadius: 999,
            border: `1px solid ${C.border}`,
            background: 'rgba(0,0,0,0.55)',
            color: C.muted,
            fontSize: 12,
            fontWeight: 600,
            fontFamily: FONT,
            cursor: 'pointer',
            ...(mobile ? { right: 16, top: 'max(84px, calc(env(safe-area-inset-top) + 72px))' } : { left: 28, bottom: 24 }),
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M11 5 6 9H3v6h3l5 4V5z" />
            {soundOn ? <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" /> : <path d="m16 9 5 6m0-6-5 6" />}
          </svg>
          {soundOn ? 'Sound on' : 'Sound off'}
        </button>

        {/* readability veil on phones, text sits at the bottom */}
        {mobile && (
          <div
            aria-hidden
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              height: '62%',
              background: 'linear-gradient(180deg, transparent, rgba(0,0,0,0.88) 48%)',
              pointerEvents: 'none',
              zIndex: 2,
            }}
          />
        )}

        {/* layer labels + leader lines */}
        <svg
          aria-hidden
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 2 }}
        >
          {LAYERS.map((l, i) => (
            <line
              key={l.t}
              ref={(el) => (lineRefs.current[i] = el)}
              stroke="#FFFFFF"
              strokeWidth="1"
              strokeDasharray="3 4"
              style={{ opacity: 0 }}
            />
          ))}
        </svg>
        {LAYERS.map((l, i) => (
          <div
            key={l.t}
            ref={(el) => (labelRefs.current[i] = el)}
            style={{ position: 'absolute', left: 0, top: 0, opacity: 0, zIndex: 3, pointerEvents: 'none' }}
          >
            <div style={{ fontSize: 11, letterSpacing: '0.22em', color: C.faint, fontWeight: 600 }}>
              LAYER {l.n}
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', color: C.text, marginTop: 4 }}>
              {l.t}
            </div>
            <div style={{ fontSize: 14, color: C.muted, lineHeight: 1.5, marginTop: 4 }}>{l.d}</div>
          </div>
        ))}
        {LAYERS.map((l, i) => (
          <div
            key={`dot-${l.t}`}
            ref={(el) => (dotRefs.current[i] = el)}
            aria-hidden
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: 22,
              height: 22,
              borderRadius: 999,
              border: '1px solid rgba(255,255,255,0.7)',
              background: 'rgba(0,0,0,0.6)',
              color: '#FFFFFF',
              fontSize: 10,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0,
              zIndex: 3,
              pointerEvents: 'none',
            }}
          >
            {i + 1}
          </div>
        ))}

        {/* HERO: centred over the stone; the words explode apart on scroll */}
        <div
          ref={heroRef}
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: mobile ? '70px 20px 40px' : '90px 28px 60px',
            pointerEvents: 'none',
          }}
        >
          <h1
            className="lithos-hero-title"
            aria-label="We build the foundation your business runs on."
            style={{
              fontSize: mobile ? 'clamp(44px, 12.6vw, 62px)' : 'clamp(58px, 7.4vw, 120px)',
              fontWeight: 650,
              color: C.text,
              letterSpacing: '-0.05em',
              lineHeight: 0.95,
              margin: 0,
              maxWidth: mobile ? 420 : 1100,
              textShadow: '0 6px 50px rgba(0,0,0,0.55)',
              pointerEvents: 'auto',
            }}
          >
            {HERO_WORDS.map((w, i) => (
              <span key={w + i} aria-hidden style={{ display: 'inline-block', whiteSpace: 'pre' }}>
                <span
                  ref={(el) => (wordRefs.current[i] = el)}
                  className={w === 'foundation' ? 'lithos-serif' : undefined}
                  style={{ display: 'inline-block', willChange: 'transform, opacity, filter' }}
                >
                  {w}
                </span>
                {i < HERO_WORDS.length - 1 ? ' ' : ''}
              </span>
            ))}
          </h1>
          <div ref={restRef} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pointerEvents: 'auto' }}>
            <p
              style={{
                fontSize: mobile ? 16 : 19,
                color: 'rgba(255,255,255,0.72)',
                lineHeight: 1.6,
                maxWidth: 520,
                margin: mobile ? '20px 0 26px' : '28px 0 36px',
                textShadow: '0 2px 20px rgba(0,0,0,0.6)',
              }}
            >
              Websites, CRM, automation and marketing, built as one system that brings in customers.
            </p>
            <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' }}>
              <a href="#contact-form-anchor" onClick={onBook} style={{ textDecoration: 'none' }}>
                <span style={{ ...pill, background: C.accent, color: C.bg, boxShadow: '0 12px 30px rgba(255,255,255,0.18)' }}>
                  Book a Strategy Call <span aria-hidden>→</span>
                </span>
              </a>
              <a href="#our-work" className="lithos-textlink" style={{ alignSelf: 'center', fontSize: 15, fontWeight: 600, color: C.text, padding: '12px 6px' }}>
                See our work <span aria-hidden>→</span>
              </a>
            </div>
          </div>
        </div>

        {/* BEAT 1: close up */}
        <div
          ref={(el) => (beatRefs.current[0] = el)}
          style={{
            ...beatBase,
            ...(mobile ? {} : { right: 'max(28px, calc((100vw - 1180px) / 2 + 28px))', top: '50%', marginTop: -120, width: 440 }),
          }}
        >
          <div style={kicker}>
            <span style={rule} /> The problem
          </div>
          <h2 style={h2}>Most businesses run on a pile of loose tools.</h2>
          <p style={body}>
            A website here, a spreadsheet there, leads lost in DMs. We replace the pile with one solid
            system you can build on.
          </p>
        </div>

        {/* BEAT 2: layers */}
        <div
          ref={(el) => (beatRefs.current[1] = el)}
          style={{
            ...beatBase,
            ...(mobile
              ? { top: 'max(84px, calc(env(safe-area-inset-top) + 70px))', bottom: 'auto', textAlign: 'center' }
              : { left: 0, right: 0, top: 104, textAlign: 'center' }),
          }}
        >
          <div style={{ ...kicker, justifyContent: 'center', marginBottom: 10 }}>
            <span style={rule} /> What we build <span style={rule} />
          </div>
          <h2 style={{ ...h2, fontSize: mobile ? 28 : 'clamp(30px, 3vw, 42px)' }}>Four layers. One system.</h2>
        </div>
        <div
          ref={listRef}
          style={{
            position: 'absolute',
            left: 22,
            right: 22,
            bottom: 'max(30px, env(safe-area-inset-bottom))',
            zIndex: 3,
            opacity: 0,
            display: mobile ? 'grid' : 'none',
            gap: 12,
            pointerEvents: 'none',
          }}
        >
          {LAYERS.map((l, i) => (
            <div key={l.t} style={{ display: 'flex', gap: 12, alignItems: 'baseline' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: C.faint, minWidth: 14 }}>{i + 1}</span>
              <span>
                <span style={{ fontSize: 16, fontWeight: 700, color: C.text }}>{l.t}</span>{' '}
                <span style={{ fontSize: 13.5, color: C.muted }}>{l.d}</span>
              </span>
            </div>
          ))}
        </div>

        {/* BEAT 3: live */}
        <div
          ref={(el) => (beatRefs.current[2] = el)}
          style={{
            ...beatBase,
            ...(mobile ? {} : { ...container, top: '50%', marginTop: -150, width: 430 }),
          }}
        >
          <div style={kicker}>
            <span style={rule} /> Interactive by design
          </div>
          <h2 style={h2}>This stone isn&apos;t a video.</h2>
          <p style={body}>
            It&apos;s built in code and rendered live on your device. Move your mouse or drag it. This is the
            kind of interactive experience we build for brands that want to stand out.
          </p>
          <button
            type="button"
            onClick={() => setBlueprint((b) => !b)}
            style={{
              ...pill,
              marginTop: 24,
              padding: '12px 22px',
              fontSize: 14,
              background: blueprint ? C.accent : 'rgba(255,255,255,0.04)',
              color: blueprint ? C.bg : C.accent,
              border: `1px solid ${C.borderStrong}`,
            }}
          >
            {blueprint ? 'Show the finish' : 'Show the blueprint'}
          </button>
        </div>

        {/* BEAT 4: together */}
        <div
          ref={(el) => (beatRefs.current[3] = el)}
          style={{
            ...beatBase,
            ...(mobile ? {} : { left: 0, right: 0, bottom: 64, textAlign: 'center' }),
          }}
        >
          <div style={{ ...kicker, justifyContent: mobile ? 'flex-start' : 'center' }}>
            <span style={rule} /> Built as one
          </div>
          <h2 style={{ ...h2, maxWidth: 760, margin: mobile ? 0 : '0 auto' }}>
            Locked together, everything just works.
          </h2>
          <p style={{ ...body, maxWidth: 560, margin: mobile ? '16px 0 0' : '16px auto 0' }}>
            When every layer talks to the others, you spend less time on admin and more time with customers.
          </p>
          <div style={{ marginTop: 26 }}>
            <a href="#contact-form-anchor" onClick={onBook} style={{ textDecoration: 'none' }}>
              <span style={{ ...pill, background: C.accent, color: C.bg }}>
                Start your foundation <span aria-hidden>→</span>
              </span>
            </a>
          </div>
        </div>

        {/* scroll rail */}
        {!mobile && (
          <div
            aria-hidden
            style={{
              position: 'absolute',
              right: 28,
              top: '50%',
              transform: 'translateY(-50%)',
              display: 'grid',
              gap: 12,
              justifyItems: 'end',
              zIndex: 3,
            }}
          >
            {['Intro', 'Problem', 'Layers', 'Live', 'Together'].map((n, i) => (
              <span
                key={n}
                ref={(el) => (railRef.current[i] = el)}
                title={n}
                style={{ height: 1, width: 12, background: '#FFFFFF', opacity: 0.35, transition: 'all .3s' }}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
