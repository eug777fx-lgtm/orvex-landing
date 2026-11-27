import { useState, useRef, useEffect } from 'react'
import { motion, useInView, AnimatePresence, useScroll, useSpring, useMotionValue } from 'framer-motion'
import FoundationHero from './stone/FoundationHero.jsx'
import { Tilt, ScrubText, useScrollProgress, useFinePointer } from './fx.jsx'

/* ============================================================
   RESPONSIVE HOOK
   ============================================================ */
function useIsMobile(breakpoint = 860) {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth <= breakpoint : false
  )
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= breakpoint)
    window.addEventListener('resize', onResize)
    onResize()
    return () => window.removeEventListener('resize', onResize)
  }, [breakpoint])
  return isMobile
}

/* ============================================================
   LITHOS LABS — DESIGN SYSTEM (Elevated Monochrome)
   ============================================================ */
const C = {
  bg: '#000000',
  accent: '#FFFFFF',
  text: '#FFFFFF',
  muted: 'rgba(255,255,255,0.55)',
  faint: 'rgba(255,255,255,0.32)',
  border: 'rgba(255,255,255,0.12)',
  borderStrong: 'rgba(255,255,255,0.28)',
  card: 'rgba(10,10,10,0.72)',
  cardSolid: '#0B0B0B',
}

const FONT =
  "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"

const MAXW = 1180
const PAD = 110

/* ============================================================
   PARTICLE NETWORK — full-page animated background
   ============================================================ */
function ParticleNetwork() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const coarse = window.matchMedia('(pointer: coarse)').matches

    let W = 0
    let H = 0
    let particles = []
    let raf = null
    let running = true
    const mouse = { x: null, y: null }

    const LINK = 140
    const MOUSE_LINK = 200

    function build() {
      W = window.innerWidth
      H = window.innerHeight
      canvas.width = W * dpr
      canvas.height = H * dpr
      canvas.style.width = `${W}px`
      canvas.style.height = `${H}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const density = coarse ? 26000 : 16000
      const count = Math.min(Math.floor((W * H) / density), 120)
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.32,
        vy: (Math.random() - 0.5) * 0.32,
        r: Math.random() * 1.3 + 0.6,
      }))
    }

    function draw(animate = true) {
      ctx.clearRect(0, 0, W, H)

      for (const p of particles) {
        if (animate) {
          p.x += p.vx
          p.y += p.vy
          if (p.x < -24) p.x = W + 24
          if (p.x > W + 24) p.x = -24
          if (p.y < -24) p.y = H + 24
          if (p.y > H + 24) p.y = -24
        }
      }

      ctx.lineWidth = 1
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i]
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const d2 = dx * dx + dy * dy
          if (d2 < LINK * LINK) {
            const alpha = (1 - Math.sqrt(d2) / LINK) * 0.13
            ctx.strokeStyle = `rgba(255,255,255,${alpha.toFixed(3)})`
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.stroke()
          }
        }

        if (mouse.x !== null) {
          const dx = a.x - mouse.x
          const dy = a.y - mouse.y
          const d2 = dx * dx + dy * dy
          if (d2 < MOUSE_LINK * MOUSE_LINK) {
            const alpha = (1 - Math.sqrt(d2) / MOUSE_LINK) * 0.22
            ctx.strokeStyle = `rgba(255,255,255,${alpha.toFixed(3)})`
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(mouse.x, mouse.y)
            ctx.stroke()
          }
        }

        ctx.fillStyle = 'rgba(255,255,255,0.45)'
        ctx.beginPath()
        ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    function loop() {
      if (!running) return
      draw(true)
      raf = requestAnimationFrame(loop)
    }

    function onResize() {
      build()
      if (reduced) draw(false)
    }

    function onMove(e) {
      mouse.x = e.clientX
      mouse.y = e.clientY
    }
    function onLeave() {
      mouse.x = null
      mouse.y = null
    }
    function onVisibility() {
      if (document.hidden) {
        running = false
        if (raf) cancelAnimationFrame(raf)
      } else if (!reduced) {
        running = true
        loop()
      }
    }

    build()
    if (reduced) {
      draw(false)
    } else {
      loop()
      if (!coarse) {
        window.addEventListener('mousemove', onMove)
        window.addEventListener('mouseout', onLeave)
      }
      document.addEventListener('visibilitychange', onVisibility)
    }
    window.addEventListener('resize', onResize)

    return () => {
      running = false
      if (raf) cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseout', onLeave)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  )
}

/* ============================================================
   SCROLL PROGRESS — thin white line at very top
   ============================================================ */
function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 26, mass: 0.4 })
  return (
    <motion.div
      aria-hidden
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 2,
        background: C.accent,
        transformOrigin: '0% 50%',
        scaleX,
        zIndex: 200,
      }}
    />
  )
}

/* ============================================================
   REVEAL — scroll-in animation wrapper
   ============================================================ */
function Reveal({ children, delay = 0, y = 34, style }) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      style={style}
    >
      {children}
    </motion.div>
  )
}

/* ============================================================
   PRESS BUTTON — hover + tap spring feedback
   ============================================================ */
function PressButton({ children, style, ...rest }) {
  // magnetic: the button leans toward the cursor on desktop
  const fine = useFinePointer()
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const x = useSpring(mx, { stiffness: 220, damping: 16, mass: 0.4 })
  const y = useSpring(my, { stiffness: 220, damping: 16, mass: 0.4 })
  const onMove = (e) => {
    if (!fine) return
    const r = e.currentTarget.getBoundingClientRect()
    mx.set((e.clientX - (r.left + r.width / 2)) * 0.22)
    my.set((e.clientY - (r.top + r.height / 2)) * 0.32)
  }
  const onLeave = () => {
    mx.set(0)
    my.set(0)
  }
  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      style={{ ...style, x, y }}
      {...rest}
    >
      {children}
    </motion.button>
  )
}

/* ============================================================
   COUNT UP — animates a number into view
   ============================================================ */
function CountUp({ value }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })

  const match = String(value).match(/^(\d+)(.*)$/)
  const isNumeric = match !== null
  const target = isNumeric ? parseInt(match[1], 10) : 0
  const suffix = isNumeric ? match[2] : ''

  const [n, setN] = useState(0)

  useEffect(() => {
    if (!inView || !isNumeric || target <= 0) return

    const duration = 1500
    const stepMs = 30
    const steps = Math.max(1, Math.ceil(duration / stepMs))
    const inc = target / steps
    let current = 0
    let id = null

    id = setInterval(() => {
      current += inc
      if (current >= target) {
        setN(target)
        if (id !== null) {
          clearInterval(id)
          id = null
        }
      } else {
        setN(Math.floor(current))
      }
    }, stepMs)

    return () => {
      if (id !== null) {
        clearInterval(id)
        id = null
      }
    }
  }, [inView, isNumeric, target])

  return <span ref={ref}>{isNumeric ? `${n}${suffix}` : value}</span>
}

/* ============================================================
   ICONS — minimal line glyphs (inherit color)
   ============================================================ */
function Icon({ name, size = 22 }) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.6,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  }
  switch (name) {
    case 'crm':
      return (
        <svg {...common}>
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </svg>
      )
    case 'ai':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v4M12 18v4M2 12h4M18 12h4M4.9 4.9l2.9 2.9M16.2 16.2l2.9 2.9M19.1 4.9l-2.9 2.9M7.8 16.2l-2.9 2.9" />
        </svg>
      )
    case 'web':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3c2.5 2.6 3.9 5.7 3.9 9S14.5 18.4 12 21M12 3c-2.5 2.6-3.9 5.7-3.9 9s1.4 6.4 3.9 9" />
        </svg>
      )
    case 'growth':
      return (
        <svg {...common}>
          <path d="M3 17l6-6 4 4 8-8" />
          <path d="M15 7h6v6" />
        </svg>
      )
    case 'arrow':
      return (
        <svg {...common} width={16} height={16}>
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      )
    default:
      return null
  }
}

/* ============================================================
   NAV
   ============================================================ */
const NAV_LINKS = [
  { label: 'Services', href: '#services' },
  { label: 'Work', href: '#our-work' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'About', href: '#how-it-works' },
]

// "Book a call" buttons scroll to the on-page contact form (no external booking tool).
function goToContact(e) {
  e?.preventDefault?.()
  // Let the mobile menu close before scrolling.
  setTimeout(() => {
    const el = document.getElementById('contact-form-anchor')
    if (!el) return
    // Offset for the fixed nav so the first form fields aren't hidden.
    const y = el.getBoundingClientRect().top + window.scrollY - 96
    window.scrollTo({ top: y, behavior: 'smooth' })
  }, 60)
}

function Nav() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        background: scrolled ? 'rgba(0,0,0,0.72)' : 'rgba(0,0,0,0.25)',
        borderBottom: `1px solid ${scrolled ? C.border : 'transparent'}`,
        transition: 'background 0.35s ease, border-color 0.35s ease',
      }}
    >
      <nav
        style={{
          maxWidth: MAXW,
          margin: '0 auto',
          padding: '0 28px',
          height: 72,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <a href="#hero" aria-label="Lithos Labs home">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img
              src="/lithos-mark-white.png"
              alt="Lithos Labs"
              width="34"
              height="32"
              style={{ width: 34, height: 32, objectFit: 'contain', display: 'block' }}
              onError={(e) => (e.target.style.display = 'none')}
            />
            <span
              style={{
                fontWeight: 700,
                fontSize: 16.5,
                color: '#FFFFFF',
                letterSpacing: '-0.4px',
              }}
            >
              Lithos
            </span>
            <span
              style={{
                fontWeight: 300,
                fontSize: 16.5,
                color: 'rgba(255,255,255,0.6)',
                letterSpacing: '-0.4px',
              }}
            >
              Labs
            </span>
          </div>
        </a>

        {/* Desktop links */}
        <div
          className="lithos-desktop-nav"
          style={{ display: 'flex', alignItems: 'center', gap: 36 }}
        >
          {NAV_LINKS.map((l) => (
            <a
              key={l.label}
              href={l.href}
              style={{
                fontSize: 14,
                color: C.muted,
                fontWeight: 500,
                letterSpacing: '0.01em',
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = C.text)}
              onMouseLeave={(e) => (e.currentTarget.style.color = C.muted)}
            >
              {l.label}
            </a>
          ))}
          <a href="#contact-form-anchor" onClick={goToContact}>
            <PressButton
              style={{
                background: C.accent,
                color: C.bg,
                fontSize: 14,
                fontWeight: 650,
                padding: '11px 22px',
                borderRadius: 999,
                letterSpacing: '-0.01em',
              }}
            >
              Book a Call
            </PressButton>
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          className="lithos-hamburger"
          aria-label="Menu"
          onClick={() => setOpen((v) => !v)}
          style={{
            display: 'none',
            width: 30,
            height: 30,
            flexDirection: 'column',
            justifyContent: 'center',
            gap: 5,
          }}
        >
          <span
            style={{
              display: 'block',
              height: 1.6,
              width: 22,
              background: C.text,
              transition: 'transform 0.25s ease',
              transform: open ? 'rotate(45deg) translate(4px,5px)' : 'none',
            }}
          />
          <span
            style={{
              display: 'block',
              height: 1.6,
              width: 22,
              background: C.text,
              opacity: open ? 0 : 1,
              transition: 'opacity 0.2s ease',
            }}
          />
          <span
            style={{
              display: 'block',
              height: 1.6,
              width: 22,
              background: C.text,
              transition: 'transform 0.25s ease',
              transform: open ? 'rotate(-45deg) translate(4px,-5px)' : 'none',
            }}
          />
        </button>
      </nav>

      {/* Mobile dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              overflow: 'hidden',
              borderBottom: `1px solid ${C.border}`,
              background: 'rgba(0,0,0,0.95)',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                padding: '14px 28px 24px',
                gap: 4,
              }}
            >
              {NAV_LINKS.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  style={{
                    fontSize: 16,
                    color: C.text,
                    padding: '12px 0',
                    borderBottom: `1px solid ${C.border}`,
                  }}
                >
                  {l.label}
                </a>
              ))}
              <a
                href="#contact-form-anchor"
                onClick={(e) => {
                  setOpen(false)
                  goToContact(e)
                }}
              >
                <PressButton
                  style={{
                    marginTop: 14,
                    width: '100%',
                    background: C.accent,
                    color: C.bg,
                    fontSize: 15,
                    fontWeight: 600,
                    padding: '13px 0',
                    borderRadius: 999,
                  }}
                >
                  Book a Call
                </PressButton>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

/* ============================================================
   HERO
   ============================================================ */
const HERO_VIDEO =
  'https://d2ol7oe51mr4n9.cloudfront.net/user_3Dcp6zrGATlFYi9kI5hXvlA6IWT/f1298398-bb04-45b1-b5e9-384d28fe6725.mp4'

function Hero() {
  return <FoundationHero C={C} FONT={FONT} onBook={goToContact} Fallback={HeroVideo} />
}

// Previous video hero, kept as the fallback when WebGL isn't available.
function HeroVideo() {
  const isMobile = useIsMobile()

  // iOS/low-power mode can block autoplay and show a pause overlay.
  // Kick playback on mount and again on the first touch/click.
  useEffect(() => {
    const kick = () => {
      const v = document.querySelector('#hero video')
      if (v && v.paused) {
        v.muted = true
        const p = v.play()
        if (p && p.catch) p.catch(() => {})
      }
    }
    kick()
    window.addEventListener('touchstart', kick, { passive: true })
    window.addEventListener('click', kick)
    return () => {
      window.removeEventListener('touchstart', kick)
      window.removeEventListener('click', kick)
    }
  }, [])

  const line1 = 'Building the Foundation'
  const line2 = 'Behind Scalable Brands'

  const word = (w, i, base = 0) => (
    <motion.span
      key={`${w}-${i}`}
      initial={{ opacity: 0, y: 50, filter: 'blur(10px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{
        delay: base + i * 0.09,
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1],
      }}
      style={{ display: 'inline-block', marginRight: '0.28em' }}
    >
      {w}
    </motion.span>
  )

  return (
    <section
      id="hero"
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '140px 28px 90px',
        overflow: 'hidden',
      }}
    >
      {/* Cinematic obsidian stone video backdrop */}
      <video
        aria-hidden
        autoPlay
        muted
        loop
        playsInline
        controls={false}
        disablePictureInPicture
        preload="auto"
        // React doesn't always render the muted attribute — set it imperatively
        // so iOS treats this as a muted video and allows autoplay
        ref={(el) => {
          if (el) {
            el.muted = true
            el.defaultMuted = true
            el.setAttribute('webkit-playsinline', '')
          }
        }}
        src={HERO_VIDEO}
        onError={(e) => (e.currentTarget.style.display = 'none')}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          // On portrait phones a 16:9 'cover' crop blows the stone up huge —
          // 'contain' keeps it smaller and centered (letterbox is invisible on black)
          objectFit: isMobile ? 'contain' : 'cover',
          transform: isMobile ? 'scale(2.2) translateX(5%)' : 'none',
          opacity: isMobile ? 0.5 : 0.55,
          filter: 'grayscale(1) brightness(1.15)',
          pointerEvents: 'none',
        }}
      />
      {/* Dark veil so the headline stays readable over the video */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background:
            'radial-gradient(ellipse 70% 70% at 50% 45%, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.82) 100%)',
        }}
      />
      {/* Radial glow, top center */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background:
            'radial-gradient(ellipse 85% 65% at 50% -12%, rgba(255,255,255,0.09) 0%, transparent 62%)',
        }}
      />
      {/* Bottom fade to anchor content */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: 220,
          pointerEvents: 'none',
          background: 'linear-gradient(180deg, transparent, rgba(0,0,0,0.85))',
        }}
      />

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: 980,
          margin: '0 auto',
          width: '100%',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 9,
            padding: '8px 18px',
            borderRadius: 999,
            border: `1px solid ${C.borderStrong}`,
            background: 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            fontSize: 12,
            color: C.accent,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            fontWeight: 600,
            marginBottom: 40,
          }}
        >
          <motion.span
            animate={{ opacity: [1, 0.25, 1] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: C.accent,
            }}
          />
          Systems-first growth agency
        </motion.div>

        <h1
          className="lithos-hero-title"
          style={{
            fontSize: isMobile ? 'clamp(38px, 11vw, 52px)' : 'clamp(48px, 5.6vw, 78px)',
            fontWeight: 750,
            color: C.text,
            letterSpacing: '-0.045em',
            lineHeight: 1.02,
            marginBottom: 30,
          }}
        >
          <span style={{ display: 'block' }}>
            {line1.split(' ').map((w, i) => word(w, i, 0.05))}
          </span>
          <span style={{ display: 'block' }}>
            {line2.split(' ').map((w, i) =>
              w === 'Scalable' ? (
                <motion.span
                  key={`${w}-${i}`}
                  initial={{ opacity: 0, y: 50, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{
                    delay: 0.32 + i * 0.09,
                    duration: 0.8,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  style={{
                    display: 'inline-block',
                    marginRight: '0.28em',
                    color: 'transparent',
                    WebkitTextStroke: '1.5px rgba(255,255,255,0.85)',
                  }}
                >
                  {w}
                </motion.span>
              ) : (
                word(w, i, 0.32)
              )
            )}
          </span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.55 }}
          style={{
            fontSize: isMobile ? 17 : 20,
            color: C.muted,
            lineHeight: 1.65,
            maxWidth: 640,
            margin: '0 auto 44px',
          }}
        >
          We build CRM systems, AI automation, and content infrastructure for
          businesses ready to scale.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.7 }}
          style={{
            display: 'flex',
            gap: 14,
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginBottom: 52,
          }}
        >
          <a href="#contact-form-anchor" onClick={goToContact}>
            <PressButton
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                background: C.accent,
                color: C.bg,
                fontSize: 15.5,
                fontWeight: 650,
                padding: '16px 32px',
                borderRadius: 999,
                letterSpacing: '-0.01em',
                boxShadow: '0 0 42px rgba(255,255,255,0.18)',
              }}
            >
              Book Strategy Call <Icon name="arrow" />
            </PressButton>
          </a>
          <a href="#our-work">
            <PressButton
              style={{
                background: 'rgba(255,255,255,0.03)',
                color: C.accent,
                fontSize: 15.5,
                fontWeight: 600,
                padding: '16px 32px',
                borderRadius: 999,
                border: `1px solid ${C.borderStrong}`,
                letterSpacing: '-0.01em',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
              }}
            >
              See Our Work
            </PressButton>
          </a>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 1 }}
          style={{
            marginTop: 48,
            fontSize: 12.5,
            color: C.faint,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
          }}
        >
          Trusted by growing brands in Aruba and beyond
        </motion.p>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        style={{
          position: 'absolute',
          bottom: 30,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
          zIndex: 1,
        }}
      >
        <span style={{ fontSize: 10.5, color: C.faint, letterSpacing: '0.22em' }}>
          SCROLL
        </span>
        <motion.div
          animate={{ y: [0, 7, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            width: 1,
            height: 36,
            background: `linear-gradient(${C.accent}, transparent)`,
          }}
        />
      </motion.div>
    </section>
  )
}

/* ============================================================
   BRAND MARQUEE — rolling banner of client logos
   ============================================================ */
const BRANDS = [
  { name: 'Island Fades', src: '/clients/island-fades.png', h: 64 },
  { name: 'AWATEC', src: '/clients/awatec.png', h: 36 },
  { name: 'LIMITLESS', src: '/clients/limitless.png', h: 54 },
]

function Marquee() {
  // Repeat the brand set so the strip stays dense
  const items = [...BRANDS, ...BRANDS, ...BRANDS]
  const row = items.map((b, i) => (
    <span
      key={`${b.name}-${i}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 260,
        height: 80,
        flex: 'none',
      }}
    >
      <img
        src={b.src}
        alt={b.name}
        loading="lazy"
        style={{
          height: b.h,
          width: 'auto',
          maxWidth: 200,
          objectFit: 'contain',
        }}
      />
    </span>
  ))

  return (
    <div
      style={{
        position: 'relative',
        background: '#0B0B0B',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        zIndex: 1,
      }}
    >
      <div
        style={{
          textAlign: 'center',
          paddingTop: 26,
          fontSize: 11,
          letterSpacing: '0.26em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.45)',
          fontWeight: 650,
        }}
      >
        Businesses we&rsquo;ve built
      </div>
      <div
        aria-hidden
        style={{
          position: 'relative',
          overflow: 'hidden',
          padding: '24px 0 28px',
        }}
      >
        <div className="lithos-marquee-track" style={{ alignItems: 'center' }}>
          {row}
          {row}
        </div>
        {/* Edge fades */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background:
              'linear-gradient(90deg, #0B0B0B 0%, transparent 12%, transparent 88%, #0B0B0B 100%)',
          }}
        />
      </div>
    </div>
  )
}

/* ============================================================
   SHARED — Section header
   ============================================================ */
function SectionHeader({ kicker, title, sub, center = true, num }) {
  return (
    <div
      style={{
        textAlign: center ? 'center' : 'left',
        maxWidth: center ? 720 : 'none',
        margin: center ? '0 auto' : 0,
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 14,
          marginBottom: 22,
        }}
      >
        <span
          aria-hidden
          style={{
            width: 34,
            height: 1,
            background: 'rgba(255,255,255,0.4)',
          }}
        />
        <span
          style={{
            fontSize: 12,
            color: C.accent,
            letterSpacing: '0.24em',
            textTransform: 'uppercase',
            fontWeight: 650,
          }}
        >
          {num ? `${num} · ${kicker}` : kicker}
        </span>
        <span
          aria-hidden
          style={{
            width: 34,
            height: 1,
            background: 'rgba(255,255,255,0.4)',
          }}
        />
      </div>
      <ScrubText
        text={title}
        style={{
          fontSize: 'clamp(34px, 4.6vw, 54px)',
          fontWeight: 730,
          color: C.text,
          letterSpacing: '-0.035em',
          lineHeight: 1.08,
          marginBottom: sub ? 20 : 0,
          textWrap: 'balance',
        }}
      />
      {sub && (
        <p style={{ fontSize: 17.5, color: C.muted, lineHeight: 1.65 }}>{sub}</p>
      )}
    </div>
  )
}

/* ============================================================
   SERVICES: the four layers of the stone, as an editorial list
   ============================================================ */
const SERVICES = [
  {
    layer: 'Website',
    title: 'Websites',
    desc: 'Professional websites built from scratch: landing pages, business websites, and premium custom builds. Fast delivery, mobile responsive, SEO ready.',
  },
  {
    layer: 'CRM',
    title: 'CRM Systems',
    desc: 'GoHighLevel setup, pipeline systems, lead tracking, and automations that never let an opportunity slip.',
  },
  {
    layer: 'Automation',
    title: 'Growth Automation',
    desc: 'Funnels, email systems, appointment booking, and integrations wired into one growth engine.',
  },
  {
    layer: 'Marketing',
    title: 'AI Marketing',
    desc: 'Content generation, scheduling, brand voice AI, and 24/7 automation that markets while you sleep.',
  },
]

// The stone in four slabs, with one slab lifted: the same object as the hero.
function LayerGlyph({ index, active }) {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" aria-hidden style={{ flex: 'none' }}>
      {[0, 1, 2, 3].map((i) => {
        const lift = i === index ? (active ? -7 : -3) : 0
        const y = 16 + i * 10 + lift
        const rx = [17, 22, 22, 17][i]
        return (
          <ellipse
            key={i}
            cx="32"
            cy={y}
            rx={rx}
            ry="5"
            fill={i === index ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="1.2"
            opacity={i === index ? 1 : 0.35}
            style={{ transition: 'cy .35s cubic-bezier(.2,.8,.2,1)' }}
          />
        )
      })}
    </svg>
  )
}

function ServiceRow({ s, index }) {
  const [hover, setHover] = useState(false)
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="lithos-service-row"
      style={{
        display: 'grid',
        gridTemplateColumns: '64px 1fr',
        gap: 28,
        alignItems: 'start',
        padding: '30px 0',
        borderTop: `1px solid ${C.border}`,
        color: C.text,
      }}
    >
      <LayerGlyph index={index} active={hover} />
      <div style={{ minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, fontWeight: 650, letterSpacing: '0.2em', color: C.faint }}>
            LAYER 0{index + 1}
          </span>
          <h3
            style={{
              fontSize: 'clamp(26px, 3vw, 38px)',
              fontWeight: 600,
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
              transform: hover ? 'translateX(8px)' : 'none',
              transition: 'transform .35s cubic-bezier(.2,.8,.2,1)',
            }}
          >
            {s.title}
          </h3>
        </div>
        <p style={{ fontSize: 16, color: C.muted, lineHeight: 1.65, marginTop: 10, maxWidth: 560 }}>{s.desc}</p>
      </div>
    </div>
  )
}

function Services() {
  return (
    <section
      id="services"
      className="lithos-section"
      style={{ position: 'relative', padding: `${PAD}px 28px`, zIndex: 1 }}
    >
      <div
        className="lithos-services-split"
        style={{ maxWidth: MAXW, margin: '0 auto', display: 'grid', gridTemplateColumns: '0.85fr 1.15fr', gap: 72, alignItems: 'start' }}
      >
        <div className="lithos-services-intro" style={{ position: 'sticky', top: 120 }}>
          <Reveal>
            <SectionHeader
              num="01"
              kicker="What we build"
              title="Every layer of the business, built to fit together"
              sub="Each layer works on its own. Stacked together they become one system that brings in customers and keeps you organized."
              center={false}
            />
            <a
              href="#contact-form-anchor"
              onClick={goToContact}
              className="lithos-textlink"
              style={{ display: 'inline-block', marginTop: 28, fontSize: 15.5, fontWeight: 650, color: C.text, padding: '6px 0' }}
            >
              Plan your system with us <span aria-hidden>→</span>
            </a>
          </Reveal>
        </div>
        <div style={{ borderBottom: `1px solid ${C.border}` }}>
          {SERVICES.map((sv, i) => (
            <motion.div
              key={sv.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.55 }}
              viewport={{ once: true, margin: '-60px' }}
            >
              <ServiceRow s={sv} index={i} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function LiveHeader(props) {
  return (
    <Reveal>
      <SectionHeader {...props} />
    </Reveal>
  )
}

/* ============================================================
   PRICING — popular plan inverted to white
   ============================================================ */
function CheckIcon({ dark }) {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke={dark ? '#000000' : C.accent}
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0, marginTop: 3 }}
      aria-hidden
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  )
}

const PLANS = [
  {
    name: 'Landing Page',
    price: 'Afl. 1,500',
    per: 'one time',
    support: '+ Afl. 150/month support plan after launch',
    best: 'A professional website that converts visitors into customers',
    features: [
      'Custom 4 to 5 page website',
      'Mobile responsive + SEO ready',
      'WhatsApp, Maps & contact forms',
      'Domain, hosting & SSL (first year)',
      '30 days of support included',
    ],
    cta: 'Get Started',
    popular: false,
  },
  {
    name: 'Landing Page + CRM',
    price: 'Afl. 3,500',
    per: 'one time',
    support: '+ Afl. 150/month support plan after launch',
    best: 'Your website plus the system that runs your business',
    features: [
      'Everything in Landing Page',
      'Booking / CRM system',
      'Owner admin dashboard',
      'Automated email flows',
      'Lead capture pipeline',
    ],
    cta: 'Get Started',
    popular: true,
  },
  {
    name: 'AI Marketing',
    price: 'Afl. 450',
    per: '/month',
    best: 'AI content that markets your brand 24/7',
    features: [
      'AI content generation',
      'Social media scheduling',
      'Brand voice AI',
      'Monthly content calendar',
      'Performance reports',
    ],
    cta: 'Get Started',
    popular: false,
  },
  {
    name: 'Automation Systems',
    price: 'Afl. 700',
    per: '/month',
    best: 'Everything automated, all included, end to end',
    features: [
      'Funnels & email systems',
      'Appointment booking automations',
      'Integrations wired together',
      'Site care: hosting, SSL, backups',
      'Priority support',
    ],
    cta: 'Get Started',
    popular: false,
  },
  {
    name: 'Full Package',
    price: 'Custom',
    per: 'tailored to you',
    best: 'Website, CRM, AI marketing and automations: the whole system',
    features: [
      'Everything Lithos Labs builds',
      'Full automation stack',
      'Dedicated management',
      'Quarterly strategy calls',
      'Built around your business',
    ],
    cta: 'Contact for a Quote',
    popular: false,
    quote: true,
  },
]

function PricingCard({ p, onCta }) {
  const dark = p.popular
  return (
    <motion.div
      className="lithos-pricing-card"
      whileHover={{ y: -10, rotate: -1.2, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      style={{
        position: 'relative',
        width: 330,
        flexShrink: 0,
        marginRight: 22,
        background: dark ? '#FFFFFF' : C.card,
        border: dark ? '1px solid #FFFFFF' : `1px solid ${C.border}`,
        borderRadius: 20,
        padding: 32,
        display: 'flex',
        flexDirection: 'column',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        boxShadow: dark ? '0 24px 80px rgba(255,255,255,0.14)' : 'none',
      }}
    >
      {p.popular && (
        <div
          style={{
            position: 'absolute',
            top: -13,
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#000000',
            color: '#FFFFFF',
            border: '1px solid rgba(255,255,255,0.3)',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            padding: '6px 16px',
            borderRadius: 999,
            whiteSpace: 'nowrap',
          }}
        >
          Most Popular
        </div>
      )}
      <h3
        style={{
          fontSize: 18.5,
          fontWeight: 650,
          color: dark ? '#000000' : C.text,
          letterSpacing: '-0.02em',
          marginBottom: 12,
        }}
      >
        {p.name}
      </h3>
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: 8,
          marginBottom: 7,
        }}
      >
        <span
          style={{
            fontSize: 28,
            fontWeight: 750,
            color: dark ? '#000000' : C.accent,
            letterSpacing: '-0.035em',
          }}
        >
          {p.quote ? p.price : `From ${p.price}`}
        </span>
        <span
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: dark ? 'rgba(0,0,0,0.55)' : C.muted,
            whiteSpace: 'nowrap',
          }}
        >
          {p.per}
        </span>
      </div>
      {p.support && (
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: dark ? 'rgba(0,0,0,0.55)' : C.muted,
            border: `1px solid ${dark ? 'rgba(0,0,0,0.15)' : C.border}`,
            borderRadius: 999,
            padding: '5px 12px',
            display: 'inline-block',
            alignSelf: 'flex-start',
            marginBottom: 12,
          }}
        >
          {p.support}
        </div>
      )}
      <p
        style={{
          fontSize: 14,
          color: dark ? 'rgba(0,0,0,0.6)' : C.muted,
          lineHeight: 1.5,
          marginBottom: 24,
        }}
      >
        {p.best}
      </p>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          marginBottom: 28,
          flex: 1,
        }}
      >
        {p.features.map((f) => (
          <div
            key={f}
            style={{ display: 'flex', alignItems: 'flex-start', gap: 11 }}
          >
            <CheckIcon dark={dark} />
            <span
              style={{
                fontSize: 14,
                color: dark ? 'rgba(0,0,0,0.82)' : C.text,
                opacity: dark ? 1 : 0.82,
                lineHeight: 1.45,
              }}
            >
              {f}
            </span>
          </div>
        ))}
      </div>
      <PressButton
        onClick={onCta}
        style={{
          width: '100%',
          background: dark ? '#000000' : 'transparent',
          color: dark ? '#FFFFFF' : C.accent,
          border: dark ? 'none' : `1px solid ${C.borderStrong}`,
          fontSize: 14.5,
          fontWeight: 650,
          padding: '14px 0',
          borderRadius: 999,
          letterSpacing: '-0.01em',
        }}
      >
        {p.cta}
      </PressButton>
    </motion.div>
  )
}

function Pricing() {
  const scrollToContact = () =>
    document
      .getElementById('contact-form-anchor')
      ?.scrollIntoView({ behavior: 'smooth' })

  const trackRef = useRef(null)
  const s = useRef({
    x: 0,
    setW: 0,
    hovered: false,
    dragging: false,
    lastT: 0,
    lastPX: 0,
    moved: 0,
  })

  // Auto-slide loop driven by rAF so touch/drag can take over at any time
  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    const st = s.current
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const SPEED = 42 // px per second

    const measure = () => {
      st.setW = track.scrollWidth / 2
    }
    measure()
    window.addEventListener('resize', measure)

    let raf
    const step = (t) => {
      if (!st.lastT) st.lastT = t
      const dt = Math.min((t - st.lastT) / 1000, 0.05)
      st.lastT = t
      if (!st.dragging && !st.hovered && !reduced) {
        st.x -= SPEED * dt
      }
      if (st.setW > 0) {
        while (st.x <= -st.setW) st.x += st.setW
        while (st.x > 0) st.x -= st.setW
      }
      track.style.transform = `translate3d(${st.x}px, 0, 0)`
      raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', measure)
    }
  }, [])

  const onPointerDown = (e) => {
    const st = s.current
    st.dragging = true
    st.moved = 0
    st.lastPX = e.clientX
    e.currentTarget.setPointerCapture?.(e.pointerId)
  }
  const onPointerMove = (e) => {
    const st = s.current
    if (!st.dragging) return
    const dx = e.clientX - st.lastPX
    st.x += dx
    st.moved += Math.abs(dx)
    st.lastPX = e.clientX
  }
  const endDrag = () => {
    s.current.dragging = false
  }
  const onClickCapture = (e) => {
    // If the user was dragging, don't fire button clicks on release
    if (s.current.moved > 8) {
      e.preventDefault()
      e.stopPropagation()
    }
  }

  const renderSet = (suffix, hidden) => (
    <div
      aria-hidden={hidden || undefined}
      style={{ display: 'flex', alignItems: 'stretch' }}
    >
      {PLANS.map((p) => (
        <PricingCard key={`${p.name}-${suffix}`} p={p} onCta={scrollToContact} />
      ))}
    </div>
  )

  return (
    <section
      id="pricing"
      className="lithos-section"
      style={{ position: 'relative', padding: `${PAD}px 0`, zIndex: 1 }}
    >
      <div style={{ maxWidth: MAXW, margin: '0 auto', padding: '0 28px' }}>
        <Reveal>
          <SectionHeader
            num="02"
            kicker="Pricing"
            title="Simple, transparent pricing"
            sub="Pick a system. Grab the cards to slide through them. All prices in Aruban florin."
          />
        </Reveal>
      </div>
      <Reveal>
        <div
          className="lithos-pricing-marquee"
          onMouseEnter={() => (s.current.hovered = true)}
          onMouseLeave={() => {
            s.current.hovered = false
            endDrag()
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onClickCapture={onClickCapture}
          style={{
            position: 'relative',
            overflow: 'hidden',
            marginTop: 64,
            padding: '24px 0 12px',
            touchAction: 'pan-y',
            cursor: 'grab',
          }}
        >
          <div
            ref={trackRef}
            className="lithos-pricing-track"
            style={{ display: 'inline-flex', willChange: 'transform' }}
          >
            {renderSet('a', false)}
            {renderSet('b', true)}
          </div>
          {/* Edge fades */}
          <div
            aria-hidden
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              background:
                'linear-gradient(90deg, #000000 0%, transparent 6%, transparent 94%, #000000 100%)',
            }}
          />
        </div>
      </Reveal>
    </section>
  )
}

/* ============================================================
   HOW IT WORKS — The Lithos Framework
   ============================================================ */
const STEPS = [
  {
    n: '01',
    title: 'Audit',
    desc: 'We analyze your current systems and identify exactly where leads, time, and revenue are leaking.',
  },
  {
    n: '02',
    title: 'Structure',
    desc: 'We build your CRM and automation infrastructure, the operational backbone your brand runs on.',
  },
  {
    n: '03',
    title: 'Scale',
    desc: 'We launch growth systems and continuously optimize performance against real outcomes.',
  },
]

function HowItWorks() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  // the line fills and each step lights up as you scroll through the section
  const prog = useScrollProgress(ref, { start: 0.8, end: 0.35 })

  return (
    <section
      id="how-it-works"
      className="lithos-section"
      style={{
        position: 'relative',
        padding: `${PAD}px 28px`,
        background: 'rgba(255,255,255,0.02)',
        borderTop: `1px solid ${C.border}`,
        borderBottom: `1px solid ${C.border}`,
        zIndex: 1,
      }}
    >
      <div style={{ maxWidth: MAXW, margin: '0 auto' }}>
        <Reveal>
          <SectionHeader
            num="03"
            kicker="The Lithos Framework"
            title="Three steps to a system that scales"
            sub="No guesswork. A repeatable path from chaos to compounding growth."
          />
        </Reveal>

        <div
          ref={ref}
          className="lithos-steps"
          style={{
            position: 'relative',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 28,
            marginTop: 80,
          }}
        >
          {/* Connecting line */}
          <div
            aria-hidden
            className="lithos-steps-line"
            style={{
              position: 'absolute',
              top: 30,
              left: '16%',
              right: '16%',
              height: 1,
              background: 'rgba(255,255,255,0.12)',
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                transformOrigin: '0% 50%',
                transform: `scaleX(${prog})`,
                background: C.accent,
                boxShadow: 'none',
              }}
            />
          </div>
          {STEPS.map((step, i) => (
            <motion.div
              key={step.n}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.18 }}
              style={{
                position: 'relative',
                textAlign: 'center',
                padding: '0 12px',
              }}
            >
              {/* Ghost number behind */}
              <div
                aria-hidden
                style={{
                  position: 'absolute',
                  top: -34,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: 130,
                  fontWeight: 800,
                  color: 'rgba(255,255,255,0.035)',
                  letterSpacing: '-0.06em',
                  lineHeight: 1,
                  userSelect: 'none',
                  pointerEvents: 'none',
                }}
              >
                {step.n}
              </div>
              <div
                style={{
                  position: 'relative',
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  margin: '0 auto 26px',
                  background: prog >= i / (STEPS.length - 1) - 0.02 ? C.accent : C.bg,
                  border: `1px solid ${C.accent}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: prog >= i / (STEPS.length - 1) - 0.02 ? C.bg : C.accent,
                  transition: 'background .35s ease, color .35s ease, transform .35s ease',
                  transform: prog >= i / (STEPS.length - 1) - 0.02 ? 'scale(1.08)' : 'scale(1)',
                  fontSize: 16,
                  fontWeight: 700,
                  letterSpacing: '0.02em',
                  boxShadow: '0 0 34px rgba(255,255,255,0.12)',
                }}
              >
                {step.n}
              </div>
              <h3
                style={{
                  fontSize: 23,
                  fontWeight: 680,
                  color: C.text,
                  marginBottom: 12,
                  letterSpacing: '-0.02em',
                }}
              >
                {step.title}
              </h3>
              <p
                style={{
                  fontSize: 15,
                  color: C.muted,
                  lineHeight: 1.65,
                  maxWidth: 290,
                  margin: '0 auto',
                }}
              >
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ============================================================
   WHY LITHOS — Systems Over Chaos
   ============================================================ */
const BULLETS = [
  'We build what most agencies won’t: full operational infrastructure.',
  'AI content that runs 24/7 without a team.',
  'CRM systems that capture every lead automatically.',
  'Measurable results, not vanity metrics.',
]

function WhyLithos() {
  return (
    <section
      id="why-lithos"
      className="lithos-section"
      style={{ position: 'relative', padding: `${PAD}px 28px`, zIndex: 1 }}
    >
      <div style={{ maxWidth: MAXW, margin: '0 auto' }}>
        <Reveal>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 14,
              marginBottom: 22,
            }}
          >
            <span
              aria-hidden
              style={{ width: 34, height: 1, background: 'rgba(255,255,255,0.4)' }}
            />
            <span
              style={{
                fontSize: 12,
                color: C.accent,
                letterSpacing: '0.24em',
                textTransform: 'uppercase',
                fontWeight: 650,
              }}
            >
              04 · Why Lithos
            </span>
          </div>
          <h2
            style={{
              fontSize: 'clamp(34px, 4.6vw, 54px)',
              fontWeight: 730,
              color: C.text,
              letterSpacing: '-0.035em',
              lineHeight: 1.08,
            }}
          >
            Systems over chaos
          </h2>
        </Reveal>
        <div
          className="lithos-why-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: '1.1fr 1fr',
            gap: 64,
            marginTop: 60,
            alignItems: 'center',
          }}
        >
          <Reveal>
            <blockquote
              style={{
                position: 'relative',
                fontSize: 'clamp(26px, 3vw, 38px)',
                fontWeight: 620,
                color: C.text,
                lineHeight: 1.3,
                letterSpacing: '-0.025em',
                margin: 0,
                paddingLeft: 28,
                borderLeft: `2px solid ${C.accent}`,
              }}
            >
              Most businesses fail not because of bad products, but because of{' '}
              <span className="lithos-serif">bad systems.</span>
            </blockquote>
          </Reveal>

          <Reveal delay={0.1}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {BULLETS.map((b, i) => (
                <div
                  key={b}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 16,
                    padding: '16px 0',
                    borderBottom:
                      i < BULLETS.length - 1 ? `1px solid ${C.border}` : 'none',
                  }}
                >
                  <span
                    style={{
                      flexShrink: 0,
                      fontSize: 12.5,
                      fontWeight: 700,
                      color: C.faint,
                      letterSpacing: '0.06em',
                      marginTop: 4,
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    0{i + 1}
                  </span>
                  <span
                    style={{
                      fontSize: 16.5,
                      color: C.text,
                      lineHeight: 1.55,
                      opacity: 0.85,
                    }}
                  >
                    {b}
                  </span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

/* ============================================================
   OUR WORK — live demo portfolio
   ============================================================ */
const WORK_ITEMS = [
  {
    industry: 'Barbershop · Aruba',
    name: 'Island Fades Elite',
    desc: 'Full booking website for Aruba’s Island Fades barbershop: services, barbers, and online appointments.',
    href: 'https://islandfadeselite.com/',
    logo: '/clients/island-fades.png',
    shot: '/work/island-fades.jpg',
    domain: 'islandfadeselite.com',
    logoH: 92,
  },
  {
    industry: 'Leak Detection & Plumbing · Aruba',
    name: 'AWATEC',
    desc: 'Service booking platform for AWATEC’s leak detection and plumbing operation, wired into their CRM and automations.',
    href: 'https://www.awatecaruba.com/',
    logo: '/clients/awatec.png',
    shot: '/work/awatec.jpg',
    domain: 'awatecaruba.com',
    logoH: 46,
  },
  {
    industry: 'Trading SaaS',
    name: 'LIMITLESS Journal',
    desc: 'A full trading journal platform: analytics dashboards, trade logging, and a social layer for traders.',
    href: 'https://www.limitless-journal.com/',
    logo: '/clients/limitless.png',
    shot: '/work/limitless.jpg',
    domain: 'limitless-journal.com',
    logoH: 78,
  },
]

function WorkCard({ w }) {
  const [hover, setHover] = useState(false)
  const fg = hover ? '#000000' : C.text
  return (
    <motion.a
      href={w.href}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      animate={{ y: hover ? -8 : 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        background: hover ? '#FFFFFF' : C.card,
        border: `1px solid ${hover ? '#FFFFFF' : C.border}`,
        borderRadius: 20,
        padding: '38px 34px',
        transition: 'background 0.35s ease, border-color 0.35s ease',
        height: '100%',
        textDecoration: 'none',
        overflow: 'hidden',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        boxShadow: hover ? '0 24px 60px rgba(255,255,255,0.12)' : 'none',
      }}
    >
      <div
        style={{
          margin: '-20px -16px 28px',
          borderRadius: 14,
          background: '#0d0d0d',
          border: `1px solid ${hover ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.08)'}`,
          overflow: 'hidden',
          transition: 'border-color 0.35s ease',
        }}
      >
        {/* browser chrome so the preview reads as a live website */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '9px 12px',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
            background: '#151515',
          }}
        >
          {[0, 1, 2].map((d) => (
            <span key={d} style={{ width: 7, height: 7, borderRadius: 99, background: 'rgba(255,255,255,0.16)' }} />
          ))}
          <span
            style={{
              marginLeft: 8,
              fontSize: 11,
              color: 'rgba(255,255,255,0.45)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {w.domain}
          </span>
        </div>
        <div style={{ position: 'relative', aspectRatio: '16 / 9', overflow: 'hidden' }}>
          <img
            src={w.shot}
            alt={`${w.name} website homepage`}
            loading="lazy"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'top center',
              transform: hover ? 'scale(1.05)' : 'scale(1)',
              transition: 'transform .7s cubic-bezier(.2,.8,.2,1)',
            }}
          />
          <span
            style={{
              position: 'absolute',
              left: 10,
              bottom: 10,
              height: 34,
              padding: '0 10px',
              display: 'flex',
              alignItems: 'center',
              borderRadius: 10,
              background: 'rgba(0,0,0,0.6)',
              border: '1px solid rgba(255,255,255,0.1)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            }}
          >
            <img src={w.logo} alt={`${w.name} logo`} loading="lazy" style={{ height: 22, width: 'auto', maxWidth: 90, objectFit: 'contain' }} />
          </span>
        </div>
      </div>
      <div
        style={{
          fontSize: 11.5,
          color: hover ? 'rgba(0,0,0,0.55)' : C.muted,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          fontWeight: 650,
          marginBottom: 16,
          transition: 'color 0.35s ease',
        }}
      >
        {w.industry}
      </div>
      <h3
        style={{
          fontSize: 23,
          fontWeight: 680,
          color: fg,
          letterSpacing: '-0.02em',
          marginBottom: 10,
          transition: 'color 0.35s ease',
        }}
      >
        {w.name}
      </h3>
      <p
        style={{
          fontSize: 15,
          color: hover ? 'rgba(0,0,0,0.6)' : C.muted,
          lineHeight: 1.65,
          flex: 1,
          marginBottom: 26,
          transition: 'color 0.35s ease',
        }}
      >
        {w.desc}
      </p>
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 9,
          fontSize: 14.5,
          fontWeight: 650,
          color: fg,
          transform: hover ? 'translateX(6px)' : 'translateX(0)',
          transition: 'transform 0.3s ease, color 0.35s ease',
        }}
      >
        Visit Live Site <Icon name="arrow" />
      </div>
    </motion.a>
  )
}

function OurWork() {
  return (
    <section
      id="our-work"
      className="lithos-section"
      style={{ position: 'relative', padding: `${PAD}px 28px`, zIndex: 1 }}
    >
      <div style={{ maxWidth: MAXW, margin: '0 auto' }}>
        <Reveal>
          <SectionHeader
            num="05"
            kicker="Portfolio"
            title="Our work"
            sub="Real systems, live in production, built by Lithos Labs."
          />
        </Reveal>
        <div
          className="lithos-work-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 22,
            marginTop: 64,
          }}
        >
          {WORK_ITEMS.map((w, i) => (
            <motion.div
              key={w.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.55 }}
              viewport={{ once: true }}
              style={{ height: '100%' }}
            >
              <Tilt>
                <WorkCard w={w} />
              </Tilt>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ============================================================
   STATS — giant numbers with dividers
   ============================================================ */
const STATS = [
  { value: '24/7', label: 'AI agents working for your brand' },
  { value: '5 days', label: 'Average time to launch your CRM' },
  { value: '3x', label: 'Average lead capture improvement' },
  { value: '100%', label: 'Brand-isolated workflows' },
]

function Stats() {
  return (
    <section
      id="results"
      className="lithos-section"
      style={{ position: 'relative', padding: `${PAD}px 28px`, zIndex: 1 }}
    >
      <div style={{ maxWidth: MAXW, margin: '0 auto' }}>
        <Reveal>
          <div
            style={{
              position: 'relative',
              overflow: 'hidden',
              background:
                'linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.015))',
              border: `1px solid ${C.border}`,
              borderRadius: 26,
              padding: '70px 48px',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            }}
          >
            <div
              aria-hidden
              style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                background:
                  'radial-gradient(ellipse 60% 90% at 50% 0%, rgba(255,255,255,0.06), transparent 60%)',
              }}
            />
            <div
              className="lithos-stats-grid"
              style={{
                position: 'relative',
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 32,
              }}
            >
              {STATS.map((st, i) => (
                <Reveal key={st.value} delay={i * 0.08}>
                  <div
                    className="lithos-stat-cell"
                    style={{
                      textAlign: 'center',
                      borderLeft: i > 0 ? `1px solid ${C.border}` : 'none',
                      paddingLeft: i > 0 ? 20 : 0,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 'clamp(42px, 4.6vw, 60px)',
                        fontWeight: 760,
                        color: C.accent,
                        letterSpacing: '-0.04em',
                        lineHeight: 1,
                        marginBottom: 15,
                      }}
                    >
                      <CountUp value={st.value} />
                    </div>
                    <div
                      style={{
                        fontSize: 14.5,
                        color: C.text,
                        opacity: 0.68,
                        lineHeight: 1.5,
                        maxWidth: 180,
                        margin: '0 auto',
                      }}
                    >
                      {st.label}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/* ============================================================
   TESTIMONIALS — Social proof
   ============================================================ */
const TESTIMONIALS = [
  {
    quote:
      'Lithos Labs built our entire CRM system in less than a week. Our lead response time dropped from 3 days to 2 hours.',
    name: 'Local Business Owner, Aruba',
    result: '3x faster lead response',
  },
  {
    quote:
      'The AI marketing system generates content for us daily. We went from posting once a week to daily without extra effort.',
    name: 'Service Business, Aruba',
    result: '7x more content output',
  },
  {
    quote:
      'Our booking system and automated follow ups now run while we sleep. Best investment we made this year.',
    name: 'Restaurant Owner, Aruba',
    result: '40% more bookings',
  },
]

function Testimonials() {
  return (
    <section
      id="testimonials"
      className="lithos-section"
      style={{ position: 'relative', padding: `${PAD}px 28px`, zIndex: 1 }}
    >
      <div style={{ maxWidth: MAXW, margin: '0 auto' }}>
        <Reveal>
          <SectionHeader
            num="06"
            kicker="Social Proof"
            title="Built for businesses like yours"
            sub={null}
          />
        </Reveal>
        <div
          className="lithos-testimonials-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 22,
            marginTop: 64,
            alignItems: 'stretch',
          }}
        >
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.1} style={{ height: '100%' }}>
              <motion.div
                whileHover={{ y: -6 }}
                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                style={{
                  background: C.card,
                  border: `1px solid ${C.border}`,
                  borderRadius: 20,
                  padding: 34,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  backdropFilter: 'blur(6px)',
                  WebkitBackdropFilter: 'blur(6px)',
                }}
              >
                <div
                  aria-hidden
                  style={{
                    fontSize: 64,
                    lineHeight: 0.6,
                    fontWeight: 800,
                    color: 'rgba(255,255,255,0.14)',
                    marginBottom: 26,
                    userSelect: 'none',
                    fontFamily: 'Georgia, serif',
                  }}
                >
                  “
                </div>
                <p
                  style={{
                    fontSize: 16,
                    color: C.text,
                    lineHeight: 1.65,
                    flex: 1,
                    marginBottom: 26,
                    opacity: 0.92,
                  }}
                >
                  {t.quote}
                </p>
                <div
                  style={{
                    borderTop: `1px solid ${C.border}`,
                    paddingTop: 18,
                  }}
                >
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 650,
                      color: C.accent,
                      marginBottom: 8,
                    }}
                  >
                    {t.name}
                  </div>
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      fontSize: 12.5,
                      color: C.muted,
                      border: `1px solid ${C.border}`,
                      borderRadius: 999,
                      padding: '5px 12px',
                    }}
                  >
                    <span
                      aria-hidden
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: '50%',
                        background: C.accent,
                      }}
                    />
                    {t.result}
                  </div>
                </div>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ============================================================
   CTA + CONTACT FORM
   ============================================================ */
const SERVICE_OPTIONS = [
  'CRM Setup',
  'AI Marketing System',
  'Website Development',
  'Full Package',
  'Not sure',
]

const BOOKING_EMAIL = 'eug777fx@gmail.com'

function ContactForm() {
  const [sent, setSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    business_name: '',
    email: '',
    phone: '',
    service_needed: '',
    message: '',
  })
  const [honey, setHoney] = useState('')

  const update = (key) => (e) =>
    setFormData((prev) => ({ ...prev, [key]: e.target.value }))

  const inputStyle = {
    width: '100%',
    background: 'rgba(255,255,255,0.04)',
    border: `1px solid ${C.border}`,
    borderRadius: 13,
    padding: '15px 17px',
    color: C.text,
    fontSize: 15,
    outline: 'none',
    fontFamily: FONT,
    backdropFilter: 'blur(6px)',
    WebkitBackdropFilter: 'blur(6px)',
    transition: 'border-color 0.25s ease',
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (honey) return // bot filled the hidden field
    setSubmitting(true)
    setError('')
    const f = formData
    // 1) Email notification to Lithos Labs (FormSubmit, no API key needed).
    const emailReq = fetch(`https://formsubmit.co/ajax/${BOOKING_EMAIL}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        _subject: `New call booking: ${f.name} (${f.business_name})`,
        _template: 'table',
        _replyto: f.email,
        Name: f.name,
        Business: f.business_name,
        Email: f.email,
        Phone: f.phone,
        'Needs help with': f.service_needed,
        Message: f.message || '(none)',
        Source: 'lithoslabs.agency booking form',
      }),
    })
      .then(async (r) => {
        const d = await r.json().catch(() => ({}))
        return r.ok && (String(d.success) !== 'false' || /activat/i.test(d.message || ''))
      })
      .catch(() => false)
    // 2) Save the booking in the CRM (Leads → Booked Calls), best effort.
    const crmReq = fetch('https://app.lithoslabs.agency/api/workflow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'book_call',
        name: f.name,
        company: f.business_name,
        email: f.email,
        phone: f.phone,
        message: [f.service_needed && `Needs: ${f.service_needed}`, f.message].filter(Boolean).join('. '),
        scheduled_time: '',
      }),
    })
      .then(async (r) => r.ok && (await r.json().catch(() => ({}))).success !== false)
      .catch(() => false)
    const [emailed, saved] = await Promise.all([emailReq, crmReq])
    if (emailed || saved) setSent(true)
    else setError(`Something went wrong. Email us at ${BOOKING_EMAIL}`)
    setSubmitting(false)
  }

  if (sent) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        style={{
          background: C.card,
          border: `1px solid ${C.borderStrong}`,
          borderRadius: 20,
          padding: '56px 40px',
          textAlign: 'center',
          maxWidth: 560,
          margin: '48px auto 0',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.12)',
            border: `1px solid ${C.accent}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 22px',
          }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke={C.accent}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <h3
          style={{
            fontSize: 22,
            fontWeight: 650,
            color: C.text,
            marginBottom: 10,
            letterSpacing: '-0.02em',
          }}
        >
          Message sent. We’ll be in touch within 24 hours
        </h3>
        <p style={{ fontSize: 15, color: C.muted }}>
          Thanks for reaching out. Keep an eye on your inbox.
        </p>
      </motion.div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        maxWidth: 640,
        margin: '56px auto 0',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        textAlign: 'left',
      }}
    >
      <div
        className="lithos-form-row"
        style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}
      >
        <input
          style={inputStyle}
          name="name"
          placeholder="Your name"
          required
          autoComplete="name"
          value={formData.name}
          onChange={update('name')}
          onFocus={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.5)')}
          onBlur={(e) => (e.target.style.borderColor = C.border)}
        />
        <input
          style={inputStyle}
          name="business_name"
          placeholder="Business name"
          required
          autoComplete="organization"
          value={formData.business_name}
          onChange={update('business_name')}
          onFocus={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.5)')}
          onBlur={(e) => (e.target.style.borderColor = C.border)}
        />
      </div>
      <div
        className="lithos-form-row"
        style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}
      >
        <input
          style={inputStyle}
          name="email"
          type="email"
          placeholder="Email address"
          required
          autoComplete="email"
          value={formData.email}
          onChange={update('email')}
          onFocus={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.5)')}
          onBlur={(e) => (e.target.style.borderColor = C.border)}
        />
        <input
          style={inputStyle}
          name="phone"
          type="tel"
          placeholder="Phone / WhatsApp"
          required
          autoComplete="tel"
          value={formData.phone}
          onChange={update('phone')}
          onFocus={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.5)')}
          onBlur={(e) => (e.target.style.borderColor = C.border)}
        />
      </div>
      <input
        type="text"
        name="_honey"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        value={honey}
        onChange={(e) => setHoney(e.target.value)}
        style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }}
      />
      <select
        style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}
        name="service_needed"
        value={formData.service_needed}
        onChange={update('service_needed')}
        required
      >
        <option value="" disabled style={{ background: '#000000' }}>
          What do you need?
        </option>
        {SERVICE_OPTIONS.map((o) => (
          <option key={o} value={o} style={{ background: '#000000' }}>
            {o}
          </option>
        ))}
      </select>
      <textarea
        style={{ ...inputStyle, minHeight: 120, resize: 'vertical' }}
        name="message"
        placeholder="Tell us about your biggest bottleneck"
        rows={4}
        value={formData.message}
        onChange={update('message')}
        onFocus={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.5)')}
        onBlur={(e) => (e.target.style.borderColor = C.border)}
      />
      {error && <p style={{ fontSize: 13.5, color: '#FF4444' }}>{error}</p>}
      <PressButton
        type="submit"
        disabled={submitting}
        style={{
          background: C.accent,
          color: C.bg,
          fontSize: 15.5,
          fontWeight: 650,
          padding: '16px 0',
          borderRadius: 999,
          marginTop: 6,
          opacity: submitting ? 0.6 : 1,
          boxShadow: '0 0 34px rgba(255,255,255,0.12)',
        }}
      >
        {submitting ? 'Sending…' : 'Send Message'}
      </PressButton>
    </form>
  )
}

function CTA() {
  return (
    <section
      id="contact"
      className="lithos-section"
      style={{
        position: 'relative',
        overflow: 'hidden',
        padding: `${PAD}px 28px`,
        borderTop: `1px solid ${C.border}`,
        borderBottom: `1px solid ${C.border}`,
        zIndex: 1,
      }}
    >
      {/* Centered white glow */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background:
            'radial-gradient(ellipse 60% 80% at 50% 50%, rgba(255,255,255,0.09) 0%, transparent 60%)',
        }}
      />
      {/* Giant watermark */}
      <div
        aria-hidden
        className="lithos-cta-watermark"
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontWeight: 900,
          color: 'transparent',
          WebkitTextStroke: '1px rgba(255,255,255,0.05)',
          letterSpacing: '-8px',
          lineHeight: 1,
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        LITHOS
      </div>

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: MAXW,
          margin: '0 auto',
          textAlign: 'center',
        }}
      >
        <Reveal>
          <h2
            style={{
              fontSize: 'clamp(36px, 5.4vw, 62px)',
              fontWeight: 750,
              color: C.text,
              letterSpacing: '-0.04em',
              lineHeight: 1.08,
              marginBottom: 22,
            }}
          >
            Ready to build on{' '}
            <span className="lithos-serif">solid systems?</span>
          </h2>
          <p
            style={{
              fontSize: 18,
              color: C.muted,
              maxWidth: 560,
              margin: '0 auto 38px',
              lineHeight: 1.65,
            }}
          >
            Book a free strategy call and we’ll map out exactly what your
            business needs.
          </p>
          <PressButton
            onClick={() =>
              document
                .getElementById('contact-form-anchor')
                ?.scrollIntoView({ behavior: 'smooth' })
            }
            style={{
              background: C.accent,
              color: C.bg,
              fontSize: 16,
              fontWeight: 650,
              padding: '18px 42px',
              borderRadius: 999,
              letterSpacing: '-0.01em',
              boxShadow: '0 0 50px rgba(255,255,255,0.2)',
            }}
          >
            Book Strategy Call
          </PressButton>
          <p style={{ marginTop: 18, fontSize: 13, color: C.muted }}>
            No commitment. 30 minutes. Real recommendations.
          </p>
        </Reveal>

        <div id="contact-form-anchor" />
        <ContactForm />
      </div>
    </section>
  )
}

/* ============================================================
   FOOTER
   ============================================================ */
function Footer() {
  return (
    <footer style={{ position: 'relative', zIndex: 1, overflow: 'hidden' }}>
      {/* Animated gradient line at very top */}
      <div
        aria-hidden
        className="lithos-footer-line"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 1,
        }}
      />
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          padding: '76px 28px 40px',
          maxWidth: MAXW,
          margin: '0 auto',
        }}
      >
        <div
          className="lithos-footer-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: '1.4fr 1fr 1fr',
            gap: 40,
            paddingBottom: 48,
            borderBottom: `1px solid ${C.border}`,
          }}
        >
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                marginBottom: 14,
              }}
            >
              <img
                src="/lithos-mark-white.png"
                alt="Lithos Labs"
                loading="lazy"
                width="30"
                height="28"
                style={{ width: 30, height: 28, objectFit: 'contain' }}
                onError={(e) => (e.target.style.display = 'none')}
              />
              <span
                style={{
                  fontWeight: 700,
                  fontSize: 16,
                  color: '#FFFFFF',
                  letterSpacing: '-0.4px',
                }}
              >
                Lithos
              </span>
              <span
                style={{
                  fontWeight: 300,
                  fontSize: 16,
                  color: 'rgba(255,255,255,0.6)',
                  letterSpacing: '-0.4px',
                }}
              >
                Labs
              </span>
            </div>
            <p
              style={{
                fontSize: 14.5,
                color: C.muted,
                lineHeight: 1.6,
                maxWidth: 300,
                marginBottom: 20,
              }}
            >
              Building the foundation behind scalable brands.
            </p>
          </div>

          <div>
            <div
              style={{
                fontSize: 12,
                color: C.accent,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                marginBottom: 18,
                fontWeight: 650,
              }}
            >
              Services
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {SERVICES.map((s) => (
                <a
                  key={s.title}
                  href="#services"
                  style={{ fontSize: 14.5, color: C.muted, transition: 'color 0.2s ease' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = C.text)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = C.muted)}
                >
                  {s.title}
                </a>
              ))}
            </div>
          </div>

          <div>
            <div
              style={{
                fontSize: 12,
                color: C.accent,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                marginBottom: 18,
                fontWeight: 650,
              }}
            >
              Contact
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <a
                href="mailto:eug777fx@gmail.com"
                style={{ fontSize: 14.5, color: C.muted, transition: 'color 0.2s ease' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = C.text)}
                onMouseLeave={(e) => (e.currentTarget.style.color = C.muted)}
              >
                eug777fx@gmail.com
              </a>
              <span style={{ fontSize: 14.5, color: C.muted }}>Aruba</span>
            </div>
          </div>
        </div>

        <div
          style={{
            paddingTop: 28,
            fontSize: 13,
            color: C.muted,
            textAlign: 'center',
          }}
        >
          © 2026 Lithos Labs. All rights reserved.
        </div>

        {/* Giant outlined wordmark */}
        <div
          aria-hidden
          className="lithos-footer-wordmark"
          style={{
            marginTop: 34,
            textAlign: 'center',
            fontWeight: 900,
            lineHeight: 0.82,
            letterSpacing: '-0.03em',
            color: 'transparent',
            WebkitTextStroke: '1px rgba(255,255,255,0.08)',
            userSelect: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          LITHOS LABS
        </div>
      </div>
    </footer>
  )
}

/* ============================================================
   WHATSAPP FLOATING BUTTON
   ============================================================ */
function WhatsApp() {
  // shows up once the visitor has scrolled past the stone story completely
  const [show, setShow] = useState(false)
  useEffect(() => {
    let raf = 0
    const check = () => {
      raf = 0
      const hero = document.getElementById('hero')
      setShow(hero ? hero.getBoundingClientRect().bottom <= 0 : true)
    }
    const on = () => {
      if (!raf) raf = requestAnimationFrame(check)
    }
    check()
    window.addEventListener('scroll', on, { passive: true })
    window.addEventListener('resize', on)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', on)
      window.removeEventListener('resize', on)
    }
  }, [])
  return (
    <div
      aria-hidden={!show}
      style={{
        opacity: show ? 1 : 0,
        visibility: show ? 'visible' : 'hidden',
        pointerEvents: show ? 'auto' : 'none',
        transition: 'opacity .4s ease, visibility .4s',
      }}
    >
    <motion.a
      href="https://wa.me/2977491888"
      target="_blank"
      rel="noreferrer"
      aria-label="Chat on WhatsApp"
      className="lithos-whatsapp"
      animate={{ y: [0, -10, 0] }}
      transition={{
        duration: 0.6,
        repeat: Infinity,
        repeatDelay: 4.4,
        ease: 'easeInOut',
      }}
      whileHover={{ scale: 1.08 }}
      style={{
        position: 'fixed',
        bottom: 26,
        right: 26,
        zIndex: 90,
        width: 58,
        height: 58,
        borderRadius: '50%',
        background: '#25D366',
        color: '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 8px 28px rgba(37,211,102,0.35)',
      }}
    >
      <span className="lithos-wa-tip">Chat on WhatsApp</span>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    </motion.a>
    </div>
  )
}


/* ============================================================
   CURSOR GLOW — follows the mouse
   ============================================================ */
function CursorGlow() {
  const [pos, setPos] = useState({ x: -400, y: -400 })

  useEffect(() => {
    if (window.matchMedia('(hover: none)').matches) return
    const onMove = (e) => setPos({ x: e.clientX, y: e.clientY })
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  return (
    <div
      aria-hidden
      className="lithos-cursor-glow"
      style={{
        position: 'fixed',
        left: pos.x,
        top: pos.y,
        width: 340,
        height: 340,
        borderRadius: '50%',
        background:
          'radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)',
        pointerEvents: 'none',
        zIndex: 9998,
        transform: 'translate(-50%, -50%)',
        transition: 'left 0.1s, top 0.1s',
      }}
    />
  )
}

/* ============================================================
   APP
   ============================================================ */
export default function App() {

  return (
    <div style={{ background: C.bg, color: C.text, fontFamily: FONT, position: 'relative' }}>
      <style>{`
        .lithos-whatsapp .lithos-wa-tip {
          position: absolute;
          right: 70px;
          background: #FFFFFF;
          color: #000000;
          font-size: 13px;
          font-weight: 600;
          padding: 8px 12px;
          border-radius: 8px;
          white-space: nowrap;
          opacity: 0;
          pointer-events: none;
          transform: translateX(8px);
          transition: opacity 0.2s ease, transform 0.2s ease;
        }
        .lithos-whatsapp:hover .lithos-wa-tip {
          opacity: 1;
          transform: translateX(0);
        }
        select option { color: #FFFFFF; }
        #hero video::-webkit-media-controls,
        #hero video::-webkit-media-controls-start-playback-button,
        #hero video::-webkit-media-controls-overlay-play-button {
          display: none !important;
          -webkit-appearance: none !important;
          opacity: 0 !important;
        }
        section[id] { scroll-margin-top: 86px; }
        .lithos-pulse { animation: lithosPulse 2.2s ease-in-out infinite; }
        .lithos-hold-dot { width: 14px; height: 14px; border-radius: 999px; border: 1px solid rgba(255,255,255,.6); position: relative; }
        .lithos-hold-dot::after { content: ''; position: absolute; inset: -6px; border-radius: 999px; border: 1px solid rgba(255,255,255,.35); animation: lithosHold 1.8s ease-out infinite; }
        @keyframes lithosHold { 0% { transform: scale(.6); opacity: 1 } 100% { transform: scale(1.5); opacity: 0 } }
        @media (max-width: 860px) {
          .lithos-flow-grid { grid-template-columns: 1fr !important; }
        }
        @keyframes lithosPulse { 0%,100% { opacity: 1 } 50% { opacity: .25 } }
        .lithos-cta-watermark { font-size: clamp(90px, 16vw, 200px); }
        .lithos-footer-wordmark { font-size: clamp(64px, 11.5vw, 168px); }
        .lithos-marquee-track {
          display: inline-flex;
          white-space: nowrap;
          animation: lithosMarquee 30s linear infinite;
          will-change: transform;
        }
        @keyframes lithosMarquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .lithos-pricing-marquee:active { cursor: grabbing; }
        .lithos-pricing-card { user-select: none; -webkit-user-select: none; }
        .lithos-pricing-card img { -webkit-user-drag: none; }
        @media (max-width: 860px) {
          .lithos-pricing-card { width: 290px !important; padding: 26px !important; }
        }
        .lithos-footer-line {
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent);
          background-size: 50% 100%;
          background-repeat: no-repeat;
          animation: lithosFooterLine 6s linear infinite;
        }
        @keyframes lithosFooterLine {
          0% { background-position: -50% 0; }
          100% { background-position: 150% 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .lithos-marquee-track, .lithos-footer-line { animation: none !important; }
        }
        @media (hover: none), (pointer: coarse) {
          .lithos-cursor-glow { display: none !important; }
        }
        @media (max-width: 860px) {
          .lithos-desktop-nav { display: none !important; }
          .lithos-hamburger { display: flex !important; }
          .lithos-services-grid { grid-template-columns: 1fr !important; }
          .lithos-services-split { grid-template-columns: 1fr !important; gap: 36px !important; }
          .lithos-services-intro { position: static !important; }
          .lithos-service-row { grid-template-columns: 48px 1fr !important; gap: 18px !important; }
          .lithos-testimonials-grid { grid-template-columns: 1fr !important; }
          .lithos-work-grid { grid-template-columns: 1fr !important; }
          .lithos-why-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
          .lithos-steps { grid-template-columns: 1fr !important; gap: 48px !important; }
          .lithos-steps-line { display: none !important; }
          .lithos-stats-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 38px 20px !important; }
          .lithos-stat-cell { border-left: none !important; padding-left: 0 !important; }
          .lithos-footer-grid { grid-template-columns: 1fr !important; gap: 36px !important; }
          .lithos-form-row { grid-template-columns: 1fr !important; }
          .lithos-section { padding-top: 64px !important; padding-bottom: 64px !important; }
        }
      `}</style>

      {/* Noise texture overlay — whole page */}
      <div
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 2,
          opacity: 0.35,
          pointerEvents: 'none',
          background:
            'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.03\'/%3E%3C/svg%3E")',
        }}
      />

      <ParticleNetwork />
      <ScrollProgress />
      <CursorGlow />
      <Nav />
      <div>
        <main style={{ position: 'relative', zIndex: 1 }}>
          <Hero />
          <Marquee />
          <Services />
          <Pricing />
          <HowItWorks />
          <WhyLithos />
          <OurWork />
          <Testimonials />
          <CTA />
        </main>
        <Footer />
      </div>
      <WhatsApp />
    </div>
  )
}
