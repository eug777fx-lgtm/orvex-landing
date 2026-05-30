import { useState, useRef, useEffect } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'

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
   LITHOS LABS — DESIGN SYSTEM
   ============================================================ */
const C = {
  bg: '#000000',
  accent: '#FFFFFF',
  text: '#FFFFFF',
  muted: 'rgba(255,255,255,0.55)',
  border: '#2A2A2A',
  card: '#111111',
}

const FONT =
  "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"

const MAXW = 1180
const PAD = 80

/* ============================================================
   REVEAL — scroll-in animation wrapper
   ============================================================ */
function Reveal({ children, delay = 0, y = 30, style }) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
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
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
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

  // Parse once into stable primitives (avoid putting the regex match
  // object in the effect deps — it would re-run on every render).
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
   ICONS — minimal line glyphs (white)
   ============================================================ */
function Icon({ name }) {
  const common = {
    width: 22,
    height: 22,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: C.accent,
    strokeWidth: 1.6,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  }
  switch (name) {
    case 'crm':
      return (
        <svg {...common}>
          <path d="M3 7h18M3 12h18M3 17h10" />
          <circle cx="18" cy="17" r="2.5" />
        </svg>
      )
    case 'ai':
      return (
        <svg {...common}>
          <rect x="4" y="4" width="16" height="16" rx="3" />
          <path d="M9 9h6M9 13h6M9 17h3" />
          <circle cx="12" cy="2.5" r="0.6" fill={C.accent} />
        </svg>
      )
    case 'web':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18" />
          <path d="M12 3a14 14 0 010 18" />
          <path d="M12 3a14 14 0 000 18" />
        </svg>
      )
    case 'growth':
      return (
        <svg {...common}>
          <path d="M3 17l5-5 4 4 8-9" />
          <path d="M16 7h4v4" />
        </svg>
      )
    case 'arrow':
      return (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke={C.accent}
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      )
    default:
      return null
  }
}

/* ============================================================
   METRIC ICONS — clean line glyphs (inherit color)
   ============================================================ */
function MetricIcon({ name }) {
  const common = {
    width: 16,
    height: 16,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.5,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  }
  switch (name) {
    case 'ai':
      return (
        <svg {...common}>
          <rect x="3" y="11" width="18" height="10" rx="2" />
          <path d="M12 11V7" />
          <circle cx="12" cy="5" r="2" />
          <path d="M8 11V9a4 4 0 018 0v2" />
        </svg>
      )
    case 'speed':
      return (
        <svg {...common}>
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
      )
    case 'growth':
      return (
        <svg {...common}>
          <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
          <polyline points="16 7 22 7 22 13" />
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
  { label: 'Work', href: '#why-lithos' },
  { label: 'About', href: '#how-it-works' },
]

function Nav() {
  const [open, setOpen] = useState(false)

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
        background: 'rgba(0, 0, 0,0.65)',
        borderBottom: `1px solid ${C.border}`,
      }}
    >
      <nav
        style={{
          maxWidth: MAXW,
          margin: '0 auto',
          padding: '0 28px',
          height: 70,
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
                color: 'rgba(255, 255, 255,0.6)',
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
                fontSize: 14.5,
                color: C.muted,
                fontWeight: 450,
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
                fontWeight: 600,
                padding: '10px 20px',
                borderRadius: 9,
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
              background: 'rgba(0, 0, 0,0.95)',
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
                    borderRadius: 9,
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
function Hero() {
  const isMobile = useIsMobile()
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
        padding: '120px 28px 80px',
        overflow: 'hidden',
        background: '#000000',
      }}
    >
      {/* Layer 2 — radial glow, top center */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 0,
          background:
            'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(255, 255, 255,0.07) 0%, transparent 60%)',
        }}
      />
      {/* Layer 3 — second glow, bottom left */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background:
            'radial-gradient(ellipse 50% 40% at -10% 100%, rgba(255, 255, 255,0.04) 0%, transparent 50%)',
        }}
      />
      {/* Layer 4 — animated dot grid */}
      <div
        aria-hidden
        className="lithos-hero-grid"
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'radial-gradient(circle, rgba(255, 255, 255,0.15) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          backgroundPosition: '0px 0px',
          maskImage:
            'radial-gradient(ellipse 78% 60% at 50% 42%, rgba(0,0,0,0.9), transparent 78%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 78% 60% at 50% 42%, rgba(0,0,0,0.9), transparent 78%)',
          pointerEvents: 'none',
        }}
      />
      {/* Layer 5 — noise texture overlay */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.4,
          pointerEvents: 'none',
          background:
            'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.03\'/%3E%3C/svg%3E")',
        }}
      />

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: 880,
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
            gap: 8,
            padding: '7px 15px',
            borderRadius: 999,
            border: `1px solid ${C.border}`,
            background: C.card,
            fontSize: 12.5,
            color: C.accent,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            marginBottom: 34,
          }}
        >
          <span
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
            fontSize: isMobile ? 36 : 64,
            fontWeight: 700,
            color: C.text,
            letterSpacing: '-0.035em',
            lineHeight: 1.1,
            marginBottom: 26,
          }}
        >
          {'Building the Foundation Behind Scalable Brands'
            .split(' ')
            .map((word, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 40, filter: 'blur(8px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{
                  delay: i * 0.1,
                  duration: 0.7,
                  ease: [0.16, 1, 0.3, 1],
                }}
                style={{ display: 'inline-block', marginRight: '0.3em' }}
              >
                {word}
              </motion.span>
            ))}
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          style={{
            fontSize: 20,
            color: C.muted,
            lineHeight: 1.6,
            maxWidth: 620,
            margin: '0 auto 40px',
          }}
        >
          We build CRM systems, AI automation, and content infrastructure for
          businesses ready to scale.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35 }}
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 14,
            justifyContent: 'center',
            marginBottom: 40,
          }}
        >
          {[
            { icon: 'ai', label: 'AI Agents', value: '24/7 Active' },
            { icon: 'speed', label: 'Setup Time', value: '5 Days Avg' },
            { icon: 'growth', label: 'Brands Served', value: 'Growing' },
          ].map((m, i) => (
            <motion.div
              key={m.label}
              animate={{ y: [0, -6, 0] }}
              transition={{
                duration: 3 + i,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.5,
              }}
              style={{
                background: 'rgba(255, 255, 255,0.06)',
                border: '0.5px solid rgba(255, 255, 255,0.15)',
                borderRadius: 12,
                padding: '12px 20px',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: C.accent,
                }}
              >
                <MetricIcon name={m.icon} />
              </span>
              <div style={{ textAlign: 'left' }}>
                <div
                  style={{
                    fontSize: 11,
                    color: C.muted,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                  }}
                >
                  {m.label}
                </div>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 650,
                    color: C.accent,
                    letterSpacing: '-0.01em',
                  }}
                >
                  {m.value}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          style={{
            display: 'flex',
            gap: 14,
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          <a
            href="https://calendly.com/lithoslabs"
            target="_blank"
            rel="noopener noreferrer"
          >
            <PressButton
              style={{
                background: C.accent,
                color: C.bg,
                fontSize: 15.5,
                fontWeight: 600,
                padding: '15px 30px',
                borderRadius: 11,
                letterSpacing: '-0.01em',
              }}
            >
              Book Strategy Call
            </PressButton>
          </a>
          <a href="#services">
            <PressButton
              style={{
                background: 'transparent',
                color: C.accent,
                fontSize: 15.5,
                fontWeight: 600,
                padding: '15px 30px',
                borderRadius: 11,
                border: `1px solid ${C.accent}`,
                letterSpacing: '-0.01em',
              }}
            >
              See Our Work
            </PressButton>
          </a>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          style={{
            marginTop: 46,
            fontSize: 13,
            color: C.muted,
            letterSpacing: '0.02em',
          }}
        >
          Trusted by growing brands in Aruba and beyond
        </motion.p>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.6 }}
        style={{
          position: 'absolute',
          bottom: 34,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <span style={{ fontSize: 11, color: C.muted, letterSpacing: '0.15em' }}>
          SCROLL
        </span>
        <motion.div
          animate={{ y: [0, 7, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            width: 1,
            height: 34,
            background: `linear-gradient(${C.accent}, transparent)`,
          }}
        />
      </motion.div>
    </section>
  )
}

/* ============================================================
   SHARED — Section header
   ============================================================ */
function SectionHeader({ kicker, title, sub, center = true }) {
  return (
    <div
      style={{
        textAlign: center ? 'center' : 'left',
        maxWidth: center ? 680 : 'none',
        margin: center ? '0 auto' : 0,
      }}
    >
      <div
        style={{
          fontSize: 12.5,
          color: C.accent,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          marginBottom: 18,
          fontWeight: 600,
        }}
      >
        {kicker}
      </div>
      <h2
        style={{
          fontSize: 42,
          fontWeight: 700,
          color: C.text,
          letterSpacing: '-0.03em',
          lineHeight: 1.12,
          marginBottom: sub ? 18 : 0,
        }}
      >
        {title}
      </h2>
      {sub && (
        <p style={{ fontSize: 17, color: C.muted, lineHeight: 1.6 }}>{sub}</p>
      )}
    </div>
  )
}

/* ============================================================
   SERVICES
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

function ServiceCard({ s }) {
  const [hover, setHover] = useState(false)
  return (
    <motion.div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      animate={{ y: hover ? -6 : 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      style={{
        background: C.card,
        border: `1px solid ${hover ? 'rgba(255, 255, 255,0.25)' : C.border}`,
        borderRadius: 18,
        padding: '34px 32px',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 220,
        transition: 'border-color 0.25s ease',
        height: '100%',
      }}
    >
      <div
        style={{
          width: 50,
          height: 50,
          borderRadius: 13,
          background: 'rgba(255, 255, 255,0.08)',
          border: `1px solid ${C.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 22,
        }}
      >
        <Icon name={s.icon} />
      </div>
      <h3
        style={{
          fontSize: 20,
          fontWeight: 650,
          color: C.text,
          marginBottom: 10,
          letterSpacing: '-0.02em',
        }}
      >
        {s.title}
      </h3>
      <p
        style={{
          fontSize: 15,
          color: C.muted,
          lineHeight: 1.62,
          flex: 1,
        }}
      >
        {s.desc}
      </p>
      <div
        style={{
          marginTop: 22,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          transform: hover ? 'translateX(5px)' : 'translateX(0)',
          opacity: hover ? 1 : 0.55,
          transition: 'all 0.25s ease',
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
      style={{ padding: `${PAD}px 28px` }}
    >
      <div style={{ maxWidth: MAXW, margin: '0 auto' }}>
        <Reveal>
          <SectionHeader
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
            gap: 20,
            marginTop: 60,
          }}
        >
          {SERVICES.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
              style={{ height: '100%' }}
            >
              <ServiceCard s={s} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ============================================================
   PRICING
   ============================================================ */
function CheckIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke={C.accent}
      strokeWidth="2.2"
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
    name: 'Starter',
    price: 'From $500',
    best: 'Small businesses getting started',
    features: [
      'CRM Setup',
      'Lead tracking pipeline',
      'Basic automations',
      '30-day support',
    ],
    cta: 'Get Started',
    popular: false,
  },
  {
    name: 'Growth',
    price: 'From $1,500',
    best: 'Growing businesses ready to scale',
    features: [
      'Everything in Starter',
      'AI Marketing System',
      'Content generation',
      'Social media automation',
      'Monthly strategy call',
    ],
    cta: 'Get Started',
    popular: true,
  },
  {
    name: 'Full System',
    price: 'From $3,000',
    best: 'Businesses ready for full transformation',
    features: [
      'Everything in Growth',
      'Custom website',
      'Lead generation system',
      'Brand identity',
      'Dedicated account manager',
      'Bi-weekly strategy calls',
    ],
    cta: 'Book a Call',
    popular: false,
  },
]

function Pricing() {
  const scrollToContact = () =>
    document
      .getElementById('contact-form-anchor')
      ?.scrollIntoView({ behavior: 'smooth' })

  return (
    <section
      id="pricing"
      className="lithos-section"
      style={{ padding: `${PAD}px 28px` }}
    >
      <div style={{ maxWidth: MAXW, margin: '0 auto' }}>
        <Reveal>
          <SectionHeader
            kicker="Pricing"
            title="Simple, Transparent Pricing"
            sub="Choose the package that fits your business"
          />
        </Reveal>
        <div
          className="lithos-pricing-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 20,
            marginTop: 60,
            alignItems: 'stretch',
          }}
        >
          {PLANS.map((p, i) => (
            <Reveal key={p.name} delay={i * 0.1} style={{ height: '100%' }}>
              <div
                style={{
                  position: 'relative',
                  background: p.popular
                    ? 'rgba(255, 255, 255,0.03)'
                    : '#111111',
                  border: p.popular
                    ? '0.5px solid rgba(255, 255, 255,0.4)'
                    : '0.5px solid rgba(255,255,255,0.06)',
                  borderRadius: 16,
                  padding: 32,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {p.popular && (
                  <div
                    style={{
                      position: 'absolute',
                      top: -12,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: C.accent,
                      color: C.bg,
                      fontSize: 11.5,
                      fontWeight: 700,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                      padding: '5px 14px',
                      borderRadius: 999,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Most Popular
                  </div>
                )}
                <h3
                  style={{
                    fontSize: 20,
                    fontWeight: 650,
                    color: C.text,
                    letterSpacing: '-0.02em',
                    marginBottom: 10,
                  }}
                >
                  {p.name}
                </h3>
                <div
                  style={{
                    fontSize: 36,
                    fontWeight: 700,
                    color: C.accent,
                    letterSpacing: '-0.03em',
                    marginBottom: 6,
                  }}
                >
                  {p.price}
                </div>
                <p
                  style={{
                    fontSize: 14,
                    color: C.muted,
                    lineHeight: 1.5,
                    marginBottom: 26,
                  }}
                >
                  {p.best}
                </p>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 13,
                    marginBottom: 30,
                    flex: 1,
                  }}
                >
                  {p.features.map((f) => (
                    <div
                      key={f}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 11,
                      }}
                    >
                      <CheckIcon />
                      <span
                        style={{
                          fontSize: 14.5,
                          color: C.text,
                          opacity: 0.82,
                          lineHeight: 1.45,
                        }}
                      >
                        {f}
                      </span>
                    </div>
                  ))}
                </div>
                <PressButton
                  onClick={scrollToContact}
                  style={{
                    width: '100%',
                    background: p.popular ? C.accent : 'transparent',
                    color: p.popular ? C.bg : C.accent,
                    border: p.popular ? 'none' : `1px solid ${C.accent}`,
                    fontSize: 15,
                    fontWeight: 600,
                    padding: '14px 0',
                    borderRadius: 11,
                    letterSpacing: '-0.01em',
                  }}
                >
                  {p.cta}
                </PressButton>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
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
      style={{ padding: `${PAD}px 28px`, background: 'rgba(255, 255, 255,0.015)' }}
    >
      <div style={{ maxWidth: MAXW, margin: '0 auto' }}>
        <Reveal>
          <SectionHeader
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
            marginTop: 70,
          }}
        >
          {/* Connecting line */}
          <div
            aria-hidden
            className="lithos-steps-line"
            style={{
              position: 'absolute',
              top: 26,
              left: '16%',
              right: '16%',
              height: 1,
              background: `linear-gradient(90deg, transparent, ${C.accent}, transparent)`,
              opacity: 0.4,
            }}
          />
          {STEPS.map((step, i) => (
            <motion.div
              key={step.n}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              style={{
                position: 'relative',
                textAlign: 'center',
                padding: '0 12px',
              }}
            >
              <div
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: '50%',
                  margin: '0 auto 24px',
                  background: C.bg,
                  border: `1px solid ${C.accent}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: C.accent,
                  fontSize: 16,
                  fontWeight: 700,
                  letterSpacing: '0.02em',
                }}
              >
                {step.n}
              </div>
              <h3
                style={{
                  fontSize: 22,
                  fontWeight: 650,
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
                  lineHeight: 1.62,
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
      style={{ padding: `${PAD}px 28px` }}
    >
      <div style={{ maxWidth: MAXW, margin: '0 auto' }}>
        <Reveal>
          <SectionHeader
            kicker="Why Lithos"
            title="Systems over chaos"
            sub={null}
            center={false}
          />
        </Reveal>
        <div
          className="lithos-why-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: '1.1fr 1fr',
            gap: 64,
            marginTop: 56,
            alignItems: 'center',
          }}
        >
          <Reveal>
            <blockquote
              style={{
                fontSize: 34,
                fontWeight: 600,
                color: C.text,
                lineHeight: 1.28,
                letterSpacing: '-0.025em',
                margin: 0,
              }}
            >
              <span style={{ color: C.accent, fontSize: 44, lineHeight: 0 }}>
                “
              </span>
              Most businesses fail not because of bad products — but because of
              bad systems.
            </blockquote>
          </Reveal>

          <Reveal delay={0.1}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
              {BULLETS.map((b) => (
                <div
                  key={b}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 16,
                  }}
                >
                  <span
                    style={{
                      flexShrink: 0,
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: C.accent,
                      marginTop: 8,
                    }}
                  />
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
   STATS
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
      style={{ padding: `${PAD}px 28px` }}
    >
      <div style={{ maxWidth: MAXW, margin: '0 auto' }}>
        <Reveal>
          <div
            style={{
              background:
                'linear-gradient(180deg, rgba(255, 255, 255,0.05), rgba(255, 255, 255,0.02))',
              border: `1px solid ${C.border}`,
              borderRadius: 22,
              padding: '64px 48px',
            }}
          >
            <div
              className="lithos-stats-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 32,
              }}
            >
              {STATS.map((st, i) => (
                <Reveal key={st.value} delay={i * 0.08}>
                  <div style={{ textAlign: 'center' }}>
                    <div
                      style={{
                        fontSize: 52,
                        fontWeight: 700,
                        color: C.accent,
                        letterSpacing: '-0.03em',
                        lineHeight: 1,
                        marginBottom: 14,
                      }}
                    >
                      <CountUp value={st.value} />
                    </div>
                    <div
                      style={{
                        fontSize: 14.5,
                        color: C.text,
                        opacity: 0.7,
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
      style={{ padding: `${PAD}px 28px` }}
    >
      <div style={{ maxWidth: MAXW, margin: '0 auto' }}>
        <Reveal>
          <SectionHeader
            kicker="Social Proof"
            title="Built for Businesses Like Yours"
            sub={null}
          />
        </Reveal>
        <div
          className="lithos-testimonials-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 20,
            marginTop: 60,
            alignItems: 'stretch',
          }}
        >
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.1} style={{ height: '100%' }}>
              <div
                style={{
                  background: C.card,
                  border: `1px solid ${C.border}`,
                  borderRadius: 16,
                  padding: 32,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <svg
                  width="26"
                  height="26"
                  viewBox="0 0 24 24"
                  fill={C.accent}
                  style={{ opacity: 0.5, marginBottom: 18 }}
                  aria-hidden
                >
                  <path d="M9.5 7C6.46 7 4 9.46 4 12.5V18h6v-6H7c0-1.66 1.34-3 3-3h.5V7zm9 0c-3.04 0-5.5 2.46-5.5 5.5V18h6v-6h-3c0-1.66 1.34-3 3-3h.5V7z" />
                </svg>
                <p
                  style={{
                    fontSize: 16,
                    fontStyle: 'italic',
                    color: C.text,
                    lineHeight: 1.6,
                    flex: 1,
                    marginBottom: 24,
                  }}
                >
                  “{t.quote}”
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
                      fontWeight: 600,
                      color: C.accent,
                      marginBottom: 5,
                    }}
                  >
                    {t.name}
                  </div>
                  <div style={{ fontSize: 13, color: C.muted }}>
                    {t.result}
                  </div>
                </div>
              </div>
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
    background: C.card,
    border: `1px solid ${C.border}`,
    borderRadius: 11,
    padding: '14px 16px',
    color: C.text,
    fontSize: 15,
    outline: 'none',
    fontFamily: FONT,
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
          border: `1px solid rgba(255, 255, 255,0.25)`,
          borderRadius: 18,
          padding: '56px 40px',
          textAlign: 'center',
          maxWidth: 560,
          margin: '48px auto 0',
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255,0.12)',
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
        maxWidth: 620,
        margin: '52px auto 0',
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
        />
        <input
          style={inputStyle}
          name="business_name"
          placeholder="Business name"
          required
          autoComplete="organization"
          value={formData.business_name}
          onChange={update('business_name')}
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
      />
      <select
        style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}
        name="service_needed"
        value={formData.service_needed}
        onChange={update('service_needed')}
        required
      >
        <option value="" disabled style={{ background: C.bg }}>
          What do you need?
        </option>
        {SERVICE_OPTIONS.map((o) => (
          <option key={o} value={o} style={{ background: C.bg }}>
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
      />
      {error && <p style={{ fontSize: 13.5, color: '#FF4444' }}>{error}</p>}
      <PressButton
        type="submit"
        disabled={submitting}
        style={{
          background: C.accent,
          color: C.bg,
          fontSize: 15.5,
          fontWeight: 600,
          padding: '15px 0',
          borderRadius: 11,
          marginTop: 6,
          opacity: submitting ? 0.6 : 1,
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
        background: '#000000',
        borderTop: `1px solid ${C.border}`,
        borderBottom: `1px solid ${C.border}`,
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
            'radial-gradient(ellipse 60% 80% at 50% 50%, rgba(255, 255, 255,0.08) 0%, transparent 60%)',
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
          color: 'rgba(255, 255, 255,0.04)',
          letterSpacing: '-10px',
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
              fontSize: 46,
              fontWeight: 700,
              color: C.text,
              letterSpacing: '-0.03em',
              lineHeight: 1.12,
              marginBottom: 20,
            }}
          >
            Ready to build on solid systems?
          </h2>
          <p
            style={{
              fontSize: 18,
              color: C.muted,
              maxWidth: 560,
              margin: '0 auto 36px',
              lineHeight: 1.6,
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
              padding: '17px 38px',
              borderRadius: 12,
              letterSpacing: '-0.01em',
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
    <footer style={{ position: 'relative' }}>
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
          padding: '70px 28px 50px',
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
                  color: 'rgba(255, 255, 255,0.6)',
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
            <div style={{ display: 'flex', gap: 12 }}>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 9,
                  border: `1px solid ${C.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: C.muted,
                  transition: 'color 0.2s ease, border-color 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = C.accent
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255,0.4)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = C.muted
                  e.currentTarget.style.borderColor = C.border
                }}
              >
                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="0.9" fill="currentColor" />
                </svg>
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 9,
                  border: `1px solid ${C.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: C.muted,
                  transition: 'color 0.2s ease, border-color 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = C.accent
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255,0.4)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = C.muted
                  e.currentTarget.style.borderColor = C.border
                }}
              >
                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM10 9h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V21h-4v-5.4c0-1.3 0-2.95-1.8-2.95s-2.08 1.4-2.08 2.85V21h-4z" />
                </svg>
              </a>
            </div>
          </div>

        <div>
          <div
            style={{
              fontSize: 12.5,
              color: C.accent,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              marginBottom: 18,
              fontWeight: 600,
            }}
          >
            Services
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {SERVICES.map((s) => (
              <a
                key={s.title}
                href="#services"
                style={{ fontSize: 14.5, color: C.muted }}
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
              fontSize: 12.5,
              color: C.accent,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              marginBottom: 18,
              fontWeight: 600,
            }}
          >
            Contact
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <a
              href="mailto:hello@lithoslabs.com"
              style={{ fontSize: 14.5, color: C.muted }}
            >
              hello@lithoslabs.com
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              style={{ fontSize: 14.5, color: C.muted }}
            >
              Instagram
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
   LOADING SCREEN
   ============================================================ */
function LoadingScreen() {
  const [show, setShow] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setShow(false), 1200)
    return () => clearTimeout(t)
  }, [])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: C.bg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            {/* Organic stone shape */}
            <svg
              width="76"
              height="76"
              viewBox="0 0 100 100"
              fill="none"
              stroke={C.accent}
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M28 22 C42 12, 66 14, 78 30 C88 44, 86 66, 70 78 C54 90, 30 86, 19 70 C9 55, 14 32, 28 22 Z" />
            </svg>
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
            borderRadius: 12,
            background: 'rgba(20, 20, 20,0.92)',
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
              borderRadius: 8,
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
   SECTION DIVIDER — gradient fade
   ============================================================ */
function Divider() {
  return (
    <div
      aria-hidden
      style={{
        height: 1,
        width: '60%',
        margin: '0 auto',
        background:
          'linear-gradient(90deg, transparent, rgba(255, 255, 255,0.15), transparent)',
      }}
    />
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
        width: 300,
        height: 300,
        borderRadius: '50%',
        background:
          'radial-gradient(circle, rgba(255, 255, 255,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
        zIndex: 9999,
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
    <div style={{ background: C.bg, color: C.text, fontFamily: FONT }}>
      <style>{`
        .lithos-hero-grid {
          animation: lithosGridDrift 25s linear infinite;
        }
        @keyframes lithosGridDrift {
          from { background-position: 0px 0px; }
          to { background-position: 32px 32px; }
        }
        .lithos-whatsapp .lithos-wa-tip {
          position: absolute;
          right: 70px;
          background: ${C.text};
          color: ${C.bg};
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
        select option { color: ${C.text}; }
        section[id] { scroll-margin-top: 86px; }
        .lithos-cta-watermark { font-size: clamp(80px, 15vw, 180px); }
        .lithos-footer-line {
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255,0.45), transparent);
          background-size: 50% 100%;
          background-repeat: no-repeat;
          animation: lithosFooterLine 6s linear infinite;
        }
        @keyframes lithosFooterLine {
          0% { background-position: -50% 0; }
          100% { background-position: 150% 0; }
        }
        @media (hover: none), (pointer: coarse) {
          .lithos-cursor-glow { display: none !important; }
        }
        @media (max-width: 860px) {
          .lithos-desktop-nav { display: none !important; }
          .lithos-hamburger { display: flex !important; }
          .lithos-services-grid { grid-template-columns: 1fr !important; }
          .lithos-pricing-grid { grid-template-columns: 1fr !important; gap: 28px !important; }
          .lithos-testimonials-grid { grid-template-columns: 1fr !important; }
          .lithos-why-grid { grid-template-columns: 1fr !important; gap: 36px !important; }
          .lithos-steps { grid-template-columns: 1fr !important; gap: 40px !important; }
          .lithos-steps-line { display: none !important; }
          .lithos-stats-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 36px 20px !important; }
          .lithos-footer-grid { grid-template-columns: 1fr !important; gap: 36px !important; }
          .lithos-form-row { grid-template-columns: 1fr !important; }
          .lithos-section { padding-top: 40px !important; padding-bottom: 40px !important; }
          .lithos-cookie { left: 12px; right: 12px; max-width: none; }
        }
      `}</style>
      <LoadingScreen />
      <CursorGlow />
      <Nav />
      <main>
        <Hero />
        <Services />
        <Divider />
        <Pricing />
        <Divider />
        <HowItWorks />
        <Divider />
        <WhyLithos />
        <Divider />
        <Stats />
        <Divider />
        <Testimonials />
        <Divider />
        <CTA />
      </main>
      <Footer />
      <WhatsApp />
      <CookieNotice />
    </div>
  )
}
