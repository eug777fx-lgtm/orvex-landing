import { useState, useRef, useEffect } from 'react'
import { motion, useInView, AnimatePresence, useScroll, useSpring } from 'framer-motion'

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
  "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"

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
  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      style={style}
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
              src="/lithos-logo.png"
              alt="Lithos Labs"
              loading="lazy"
              style={{ width: 26, height: 26, objectFit: 'contain' }}
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
          <a
            href="https://calendly.com/lithoslabs"
            target="_blank"
            rel="noopener noreferrer"
          >
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
                href="https://calendly.com/lithoslabs"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
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
  const isMobile = useIsMobile()

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
        preload="auto"
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
          <a
            href="https://calendly.com/lithoslabs"
            target="_blank"
            rel="noopener noreferrer"
          >
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
  { name: 'Island Fades', src: '/clients/island-fades.png', h: 58 },
  { name: 'AWATEC', src: '/clients/awatec.png', h: 30 },
  { name: 'LIMITLESS', src: '/clients/limitless.png', h: 52 },
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
        gap: 64,
        marginRight: 64,
      }}
    >
      <img
        src={b.src}
        alt={b.name}
        loading="lazy"
        style={{
          height: b.h,
          width: 'auto',
          opacity: 0.85,
          objectFit: 'contain',
        }}
      />
      <span
        aria-hidden
        style={{
          width: 5,
          height: 5,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.3)',
          flexShrink: 0,
        }}
      />
    </span>
  ))

  return (
    <div
      style={{
        position: 'relative',
        borderTop: `1px solid ${C.border}`,
        borderBottom: `1px solid ${C.border}`,
        background: 'rgba(255,255,255,0.015)',
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
          color: C.faint,
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
              'linear-gradient(90deg, #000 0%, transparent 12%, transparent 88%, #000 100%)',
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
          {num ? `${num} — ${kicker}` : kicker}
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
      <h2
        style={{
          fontSize: 'clamp(34px, 4.6vw, 54px)',
          fontWeight: 730,
          color: C.text,
          letterSpacing: '-0.035em',
          lineHeight: 1.08,
          marginBottom: sub ? 20 : 0,
        }}
      >
        {title}
      </h2>
      {sub && (
        <p style={{ fontSize: 17.5, color: C.muted, lineHeight: 1.65 }}>{sub}</p>
      )}
    </div>
  )
}

/* ============================================================
   SERVICES — numbered cards with white hover-invert
   ============================================================ */
const SERVICES = [
  {
    icon: 'crm',
    title: 'CRM Systems',
    desc: 'GoHighLevel setup, pipeline systems, lead tracking, and automations that never let an opportunity slip.',
  },
  {
    icon: 'ai',
    title: 'AI Marketing',
    desc: 'Content generation, scheduling, brand-voice AI, and 24/7 automation that markets while you sleep.',
  },
  {
    icon: 'web',
    title: 'Website Development',
    desc: 'Professional websites built from scratch — landing pages, business websites, and premium custom builds. Fast delivery, mobile responsive, SEO ready.',
  },
  {
    icon: 'growth',
    title: 'Growth Automation',
    desc: 'Funnels, email systems, appointment booking, and integrations wired into one growth engine.',
  },
]

function ServiceCard({ s, index }) {
  const [hover, setHover] = useState(false)
  const fg = hover ? '#000000' : C.text
  const fgMuted = hover ? 'rgba(0,0,0,0.6)' : C.muted

  return (
    <motion.div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      animate={{ y: hover ? -8 : 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      style={{
        position: 'relative',
        background: hover ? '#FFFFFF' : C.card,
        border: `1px solid ${hover ? '#FFFFFF' : C.border}`,
        borderRadius: 20,
        padding: '38px 34px',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 250,
        height: '100%',
        overflow: 'hidden',
        transition: 'background 0.35s ease, border-color 0.35s ease',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        boxShadow: hover ? '0 24px 60px rgba(255,255,255,0.12)' : 'none',
        cursor: 'default',
      }}
    >
      {/* Ghost index number */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: 14,
          right: 22,
          fontSize: 84,
          fontWeight: 800,
          letterSpacing: '-0.05em',
          lineHeight: 1,
          color: hover ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.05)',
          transition: 'color 0.35s ease',
          userSelect: 'none',
        }}
      >
        0{index + 1}
      </div>

      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 14,
          background: hover ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.07)',
          border: `1px solid ${hover ? 'rgba(0,0,0,0.14)' : C.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 24,
          color: fg,
          transition: 'all 0.35s ease',
        }}
      >
        <Icon name={s.icon} />
      </div>
      <h3
        style={{
          fontSize: 21,
          fontWeight: 680,
          color: fg,
          marginBottom: 11,
          letterSpacing: '-0.02em',
          transition: 'color 0.35s ease',
        }}
      >
        {s.title}
      </h3>
      <p
        style={{
          fontSize: 15,
          color: fgMuted,
          lineHeight: 1.65,
          flex: 1,
          transition: 'color 0.35s ease',
        }}
      >
        {s.desc}
      </p>
      <div
        style={{
          marginTop: 24,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          color: fg,
          transform: hover ? 'translateX(6px)' : 'translateX(0)',
          opacity: hover ? 1 : 0.5,
          transition: 'all 0.3s ease',
        }}
      >
        <Icon name="arrow" />
      </div>
    </motion.div>
  )
}

function Services() {
  return (
    <section
      id="services"
      className="lithos-section"
      style={{ position: 'relative', padding: `${PAD}px 28px`, zIndex: 1 }}
    >
      <div style={{ maxWidth: MAXW, margin: '0 auto' }}>
        <Reveal>
          <SectionHeader
            num="01"
            kicker="What We Build"
            title="Infrastructure, not band-aids"
            sub="Four pillars that turn a scattered operation into a system that scales without you."
          />
        </Reveal>
        <div
          className="lithos-services-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 22,
            marginTop: 64,
          }}
        >
          {SERVICES.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.55 }}
              viewport={{ once: true }}
              style={{ height: '100%' }}
            >
              <ServiceCard s={s} index={i} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
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
    per: 'one-time',
    support: '+ Afl. 150/month support plan after launch',
    best: 'A professional website that converts visitors into customers',
    features: [
      'Custom 4–5 page website',
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
    per: 'one-time',
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
    best: 'AI-powered content that markets your brand 24/7',
    features: [
      'AI content generation',
      'Social media scheduling',
      'Brand-voice AI',
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
    best: 'Everything automated — all included, end to end',
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
    best: 'Website, CRM, AI marketing and automations — the whole system',
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
          color: dark ? '#000' : C.text,
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
            color: dark ? '#000' : C.accent,
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
            sub="Pick a system — the cards keep rolling, hover to pause. All prices in Aruban florin."
          />
        </Reveal>
      </div>
      <Reveal>
        <div
          className="lithos-pricing-marquee"
          style={{
            position: 'relative',
            overflow: 'hidden',
            marginTop: 64,
            padding: '24px 0 12px',
          }}
        >
          <div className="lithos-pricing-track">
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
                'linear-gradient(90deg, #000 0%, transparent 6%, transparent 94%, #000 100%)',
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
    desc: 'We build your CRM and automation infrastructure — the operational backbone your brand runs on.',
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
          <motion.div
            aria-hidden
            className="lithos-steps-line"
            initial={{ scaleX: 0 }}
            animate={inView ? { scaleX: 1 } : {}}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
            style={{
              position: 'absolute',
              top: 30,
              left: '16%',
              right: '16%',
              height: 1,
              transformOrigin: '0% 50%',
              background: `linear-gradient(90deg, transparent, ${C.accent}, transparent)`,
              opacity: 0.45,
            }}
          />
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
                  background: C.bg,
                  border: `1px solid ${C.accent}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: C.accent,
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
  'We build what most agencies won’t — full operational infrastructure.',
  'AI-powered content that runs 24/7 without a team.',
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
              04 — Why Lithos
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
              Most businesses fail not because of bad products — but because of{' '}
              <span
                style={{
                  color: 'transparent',
                  WebkitTextStroke: '1px rgba(255,255,255,0.9)',
                }}
              >
                bad systems.
              </span>
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
    industry: 'Barbershop — Aruba',
    name: 'Island Fades Elite',
    desc: 'Full booking website for Aruba’s Island Fades barbershop — services, barbers, and online appointments.',
    href: 'https://islandfadeselite.com/',
  },
  {
    industry: 'Leak Detection & Plumbing — Aruba',
    name: 'AWATEC',
    desc: 'Service booking platform for AWATEC’s leak detection and plumbing operation, wired into their CRM and automations.',
    href: 'https://awatec-hq.vercel.app/',
  },
  {
    industry: 'Trading SaaS',
    name: 'LIMITLESS Journal',
    desc: 'A full trading journal platform — analytics dashboards, trade logging, and a social layer for traders.',
    href: 'https://www.limitless-journal.com/',
  },
]

function WorkCard({ w, index }) {
  const [hover, setHover] = useState(false)
  const fg = hover ? '#000' : C.text
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
        aria-hidden
        style={{
          position: 'absolute',
          top: 14,
          right: 22,
          fontSize: 84,
          fontWeight: 800,
          letterSpacing: '-0.05em',
          lineHeight: 1,
          color: hover ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.05)',
          transition: 'color 0.35s ease',
          userSelect: 'none',
        }}
      >
        0{index + 1}
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
            sub="Real systems, live in production — built by Lithos Labs."
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
              <WorkCard w={w} index={i} />
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
      'Our booking system and automated follow-ups now run while we sleep. Best investment we made this year.',
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

function ContactForm() {
  const [sent, setSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    business_name: '',
    email: '',
    service_needed: '',
    message: '',
  })

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
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('https://formspree.io/f/xqapwgqo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(formData),
      })
      if (res.ok) {
        setSent(true)
      } else {
        setError('Something went wrong — email us at hello@lithoslabs.com')
      }
    } catch {
      setError('Something went wrong')
    }
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
          Message sent — we’ll be in touch within 24 hours
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
      <select
        style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}
        name="service_needed"
        value={formData.service_needed}
        onChange={update('service_needed')}
        required
      >
        <option value="" disabled style={{ background: '#000' }}>
          What do you need?
        </option>
        {SERVICE_OPTIONS.map((o) => (
          <option key={o} value={o} style={{ background: '#000' }}>
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
            <span
              style={{
                color: 'transparent',
                WebkitTextStroke: '1.4px rgba(255,255,255,0.9)',
              }}
            >
              solid systems?
            </span>
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
                src="/lithos-logo.png"
                alt="Lithos Labs"
                loading="lazy"
                style={{ width: 26, height: 26, objectFit: 'contain' }}
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
  return (
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
        color: '#fff',
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
  )
}

/* ============================================================
   LOADING SCREEN — cinematic intro
   Stone draws in → spins up to a blur → collapses into a point
   → white shockwave → site snaps in
   ============================================================ */
function LoadingScreen({ onReveal }) {
  const [show, setShow] = useState(true)

  useEffect(() => {
    const reveal = setTimeout(() => onReveal && onReveal(), 1850)
    const kill = setTimeout(() => setShow(false), 2150)
    return () => {
      clearTimeout(reveal)
      clearTimeout(kill)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: C.bg,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 26,
            overflow: 'hidden',
          }}
        >
          {/* Spinning stone — draw, spin up violently, collapse */}
          <motion.div
            animate={{
              rotate: [0, 40, 360, 2520],
              scale: [0.85, 1, 1.12, 0.01],
              opacity: [1, 1, 1, 0],
            }}
            transition={{
              duration: 1.85,
              times: [0, 0.3, 0.62, 1],
              ease: ['easeOut', 'easeInOut', 'easeIn'],
            }}
            style={{ display: 'flex' }}
          >
            <svg
              width="86"
              height="86"
              viewBox="0 0 100 100"
              fill="none"
              stroke={C.accent}
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <motion.path
                d="M28 22 C42 12, 66 14, 78 30 C88 44, 86 66, 70 78 C54 90, 30 86, 19 70 C9 55, 14 32, 28 22 Z"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.65, ease: 'easeInOut' }}
              />
            </svg>
          </motion.div>

          {/* Spin ghost ring — motion blur illusion while spinning fast */}
          <motion.div
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0, 0.5, 0], scale: [1, 1, 1.25, 0.01] }}
            transition={{ duration: 1.85, times: [0, 0.55, 0.8, 1], ease: 'easeIn' }}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: 110,
              height: 110,
              marginTop: -68,
              marginLeft: -55,
              borderRadius: '50%',
              border: '2.5px solid rgba(255,255,255,0.5)',
              borderTopColor: 'transparent',
              borderBottomColor: 'transparent',
              filter: 'blur(2px)',
            }}
          />

          {/* Shockwave ring — fires as the stone collapses */}
          <motion.div
            aria-hidden
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 0, 26], opacity: [0, 0.9, 0] }}
            transition={{ duration: 2.05, times: [0, 0.87, 1], ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: 120,
              height: 120,
              marginTop: -73,
              marginLeft: -60,
              borderRadius: '50%',
              border: '2px solid #FFFFFF',
              boxShadow: '0 0 60px rgba(255,255,255,0.5), inset 0 0 40px rgba(255,255,255,0.25)',
            }}
          />

          {/* Second, thinner shockwave slightly behind */}
          <motion.div
            aria-hidden
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 0, 18], opacity: [0, 0.5, 0] }}
            transition={{ duration: 2.15, times: [0, 0.9, 1], ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: 120,
              height: 120,
              marginTop: -73,
              marginLeft: -60,
              borderRadius: '50%',
              border: '1px solid rgba(255,255,255,0.8)',
            }}
          />

          {/* White flash at the moment of collapse */}
          <motion.div
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0, 0.85, 0] }}
            transition={{ duration: 2.05, times: [0, 0.86, 0.9, 1], ease: 'easeOut' }}
            style={{ position: 'absolute', inset: 0, background: '#FFFFFF' }}
          />

          {/* Wordmark — letterspacing stretches, then gets sucked away */}
          <motion.div
            initial={{ opacity: 0, letterSpacing: '0.2em' }}
            animate={{
              opacity: [0, 1, 1, 0],
              letterSpacing: ['0.2em', '0.4em', '0.55em', '1.2em'],
              scale: [1, 1, 1, 0.6],
            }}
            transition={{ duration: 1.85, times: [0, 0.25, 0.62, 1], ease: 'easeIn' }}
            style={{
              fontSize: 13,
              textTransform: 'uppercase',
              color: C.muted,
              fontWeight: 600,
              paddingLeft: '0.4em',
              whiteSpace: 'nowrap',
            }}
          >
            Lithos Labs
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ============================================================
   COOKIE NOTICE
   ============================================================ */
function CookieNotice() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    let alreadyAccepted = false
    try {
      alreadyAccepted = localStorage.getItem('lithos_cookie_ok') === 'true'
    } catch {
      alreadyAccepted = false
    }
    if (alreadyAccepted) return
    const t = setTimeout(() => setVisible(true), 1600)
    return () => clearTimeout(t)
  }, [])

  function accept() {
    try {
      localStorage.setItem('lithos_cookie_ok', 'true')
    } catch {
      /* ignore */
    }
    setVisible(false)
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          transition={{ duration: 0.4 }}
          className="lithos-cookie"
          style={{
            position: 'fixed',
            bottom: 18,
            left: 18,
            zIndex: 95,
            maxWidth: 420,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            padding: '14px 18px',
            borderRadius: 14,
            background: 'rgba(14,14,14,0.9)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            border: `1px solid ${C.border}`,
          }}
        >
          <span
            style={{ fontSize: 13.5, color: C.muted, lineHeight: 1.5, flex: 1 }}
          >
            We use cookies to improve your experience.
          </span>
          <PressButton
            onClick={accept}
            style={{
              flexShrink: 0,
              background: C.accent,
              color: C.bg,
              fontSize: 13,
              fontWeight: 600,
              padding: '9px 18px',
              borderRadius: 999,
            }}
          >
            Accept
          </PressButton>
        </motion.div>
      )}
    </AnimatePresence>
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
          'radial-gradient(circle, rgba(255,255,255,0.055) 0%, transparent 70%)',
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
  const [revealed, setRevealed] = useState(false)

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
        section[id] { scroll-margin-top: 86px; }
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
        .lithos-pricing-track {
          display: inline-flex;
          animation: lithosMarquee 45s linear infinite;
          will-change: transform;
        }
        .lithos-pricing-marquee:hover .lithos-pricing-track {
          animation-play-state: paused;
        }
        @media (prefers-reduced-motion: reduce) {
          .lithos-pricing-track { animation: none !important; flex-wrap: wrap; justify-content: center; }
        }
        @media (max-width: 860px) {
          .lithos-pricing-card { width: 290px !important; padding: 26px !important; }
          .lithos-pricing-track { animation-duration: 35s; }
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
          .lithos-cookie { left: 12px; right: 12px; max-width: none; }
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
      <LoadingScreen onReveal={() => setRevealed(true)} />
      <CursorGlow />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: revealed ? 1 : 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <Nav />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, scale: 1.06, filter: 'blur(14px)' }}
        animate={
          revealed
            ? { opacity: 1, scale: 1, filter: 'blur(0px)' }
            : { opacity: 0, scale: 1.06, filter: 'blur(14px)' }
        }
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        style={{ transformOrigin: '50% 20%' }}
      >
        <main style={{ position: 'relative', zIndex: 1 }}>
          <Hero />
          <Marquee />
          <Services />
          <Pricing />
          <HowItWorks />
          <WhyLithos />
          <OurWork />
          <Stats />
          <Testimonials />
          <CTA />
        </main>
        <Footer />
      </motion.div>
      <WhatsApp />
      <CookieNotice />
    </div>
  )
}
