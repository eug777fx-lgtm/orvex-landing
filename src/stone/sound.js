/*
 * Synthesized stone sounds with Web Audio. No audio files.
 * Browsers only allow sound after a gesture, so the context is created on
 * the first press and stays silent until then.
 */
let ctx = null
let noise = null

export function unlockSound() {
  try {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext
      if (!AC) return false
      ctx = new AC()
      const len = Math.floor(ctx.sampleRate * 0.25)
      noise = ctx.createBuffer(1, len, ctx.sampleRate)
      const d = noise.getChannelData(0)
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1
    }
    if (ctx.state === 'suspended') ctx.resume()
    return true
  } catch {
    return false
  }
}

// a short filtered noise tap: stone sliding off stone
export function tap(pitch = 1, gain = 0.16) {
  if (!ctx || ctx.state !== 'running') return
  const t = ctx.currentTime
  const src = ctx.createBufferSource()
  src.buffer = noise
  const bp = ctx.createBiquadFilter()
  bp.type = 'bandpass'
  bp.frequency.value = 1800 * pitch
  bp.Q.value = 2.2
  const g = ctx.createGain()
  g.gain.setValueAtTime(0, t)
  g.gain.linearRampToValueAtTime(gain, t + 0.004)
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.09)
  src.connect(bp).connect(g).connect(ctx.destination)
  src.start(t)
  src.stop(t + 0.12)
}

// a low knock: slabs locking back together
export function knock(gain = 0.22) {
  if (!ctx || ctx.state !== 'running') return
  const t = ctx.currentTime
  const o = ctx.createOscillator()
  o.type = 'sine'
  o.frequency.setValueAtTime(150, t)
  o.frequency.exponentialRampToValueAtTime(70, t + 0.12)
  const g = ctx.createGain()
  g.gain.setValueAtTime(0, t)
  g.gain.linearRampToValueAtTime(gain, t + 0.005)
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18)
  o.connect(g).connect(ctx.destination)
  o.start(t)
  o.stop(t + 0.2)
  tap(0.55, gain * 0.5)
}
