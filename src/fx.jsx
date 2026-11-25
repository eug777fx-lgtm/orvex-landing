import { useEffect, useRef, useState } from 'react'

/*
 * Small interaction kit used across the site.
 * Everything is driven by refs (no React re-render per frame) and switches
 * itself off for touch screens and for people who prefer reduced motion.
 */

// eslint-disable-next-line react-refresh/only-export-components
export function useFinePointer() {
  const [fine, setFine] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)')
    const rm = window.matchMedia('(prefers-reduced-motion: reduce)')
    const on = () => setFine(mq.matches && !rm.matches)
    on()
    mq.addEventListener('change', on)
    rm.addEventListener('change', on)
    return () => {
      mq.removeEventListener('change', on)
      rm.removeEventListener('change', on)
    }
  }, [])
  return fine
}

/* 3D tilt with a light glare that follows the cursor. */
export function Tilt({ children, max = 7, glare = true, style, radius = 20 }) {
  const ref = useRef(null)
  const glareRef = useRef(null)
  const fine = useFinePointer()

  useEffect(() => {
    const el = ref.current
    if (!el || !fine) return
    let raf = 0
    let tx = 0
    let ty = 0
    let cx = 0
    let cy = 0
    let gx = 50
    let gy = 50
    let inside = false
    const loop = () => {
      cx += (tx - cx) * 0.14
      cy += (ty - cy) * 0.14
      el.style.transform = `perspective(900px) rotateX(${cy}deg) rotateY(${cx}deg)`
      if (glareRef.current) {
        glareRef.current.style.opacity = inside ? 1 : 0
        glareRef.current.style.background = `radial-gradient(420px circle at ${gx}% ${gy}%, rgba(255,255,255,0.13), transparent 45%)`
      }
      if (Math.abs(tx - cx) > 0.01 || Math.abs(ty - cy) > 0.01 || inside) raf = requestAnimationFrame(loop)
      else raf = 0
    }
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(loop)
    }
    const move = (e) => {
      const r = el.getBoundingClientRect()
      const px = (e.clientX - r.left) / r.width
      const py = (e.clientY - r.top) / r.height
      tx = (px - 0.5) * 2 * max
      ty = (0.5 - py) * 2 * max
      gx = px * 100
      gy = py * 100
      inside = true
      kick()
    }
    const leave = () => {
      tx = 0
      ty = 0
      inside = false
      kick()
    }
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerleave', leave)
    return () => {
      cancelAnimationFrame(raf)
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerleave', leave)
      el.style.transform = ''
    }
  }, [fine, max])

  return (
    <div
      ref={ref}
      style={{ position: 'relative', height: '100%', transformStyle: 'preserve-3d', willChange: fine ? 'transform' : undefined, ...style }}
    >
      {children}
      {glare && fine && (
        <div
          ref={glareRef}
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: radius,
            pointerEvents: 'none',
            opacity: 0,
            transition: 'opacity .3s ease',
            mixBlendMode: 'difference',
            zIndex: 5,
          }}
        />
      )}
    </div>
  )
}

/*
 * Headline that "reads itself" as you scroll: each word lights up from faint
 * to full white, scrubbed by scroll position (not an observer, so it never
 * skips a beat on a busy frame).
 */
// eslint-disable-next-line no-unused-vars
export function ScrubText({ text, style, as: Tag = 'h2' }) {
  const ref = useRef(null)
  const words = String(text).split(' ')
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const spans = Array.from(el.querySelectorAll('[data-w]'))
    if (reduced) {
      spans.forEach((s) => (s.style.opacity = 1))
      return
    }
    let raf = 0
    const update = () => {
      raf = 0
      const r = el.getBoundingClientRect()
      const vh = window.innerHeight
      // 0 when the heading enters at 92% of the screen, 1 by 45%
      const p = Math.max(0, Math.min(1, (vh * 0.92 - r.top) / (vh * 0.47)))
      const n = spans.length
      spans.forEach((s, i) => {
        const t = Math.max(0, Math.min(1, p * (n + 2) - i))
        s.style.opacity = 0.16 + 0.84 * t
      })
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [text])
  return (
    <Tag ref={ref} style={style} aria-label={text}>
      {words.map((w, i) => (
        <span key={i} data-w aria-hidden style={{ opacity: 0.16, transition: 'opacity .12s linear' }}>
          {w}
          {i < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </Tag>
  )
}

/* 0..1 progress of an element passing through the viewport, for scrubbed effects. */
// eslint-disable-next-line react-refresh/only-export-components
export function useScrollProgress(ref, { start = 0.85, end = 0.35 } = {}) {
  const [p, setP] = useState(0)
  useEffect(() => {
    let raf = 0
    const update = () => {
      raf = 0
      const el = ref.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const vh = window.innerHeight
      const v = (vh * start - r.top) / (vh * (start - end) + r.height * 0.5)
      setP(Math.max(0, Math.min(1, v)))
    }
    const on = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', on, { passive: true })
    window.addEventListener('resize', on)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', on)
      window.removeEventListener('resize', on)
    }
  }, [ref, start, end])
  return p
}
