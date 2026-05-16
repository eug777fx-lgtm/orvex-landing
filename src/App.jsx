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
  bg: '#0B0B0D',
  accent: '#C2B59B',
  text: '#F5F5F2',
  muted: 'rgba(242,237,228,0.45)',
  border: 'rgba(194,181,155,0.1)',
  card: 'rgba(194,181,155,0.03)',
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
   ICONS — minimal line glyphs (beige)
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
    case 'brand':
      return (
        <svg {...common}>
          <path d="M12 3l2.5 5.5L20 9l-4 4 1 6-5-3-5 3 1-6-4-4 5.5-.5z" />
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
        background: 'rgba(11,11,13,0.65)',
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
              style={{ width: 28, height: 28, objectFit: 'contain' }}
            />
            <div
              style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}
            >
              <span
                style={{
                  fontWeight: 700,
                  fontSize: 16,
                  color: '#F5F5F2',
                  letterSpacing: '-0.5px',
                }}
              >
                Lithos
              </span>
              <span
                style={{
                  fontWeight: 300,
                  fontSize: 16,
                  color: 'rgba(194,181,155,0.6)',
                  letterSpacing: '-0.5px',
                }}
              >
                Labs
              </span>
            </div>
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
          <a href="#contact">
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
              background: 'rgba(11,11,13,0.95)',
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
              <a href="#contact" onClick={() => setOpen(false)}>
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
        background: '#0B0B0D',
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
            'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(194,181,155,0.07) 0%, transparent 60%)',
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
            'radial-gradient(ellipse 50% 40% at -10% 100%, rgba(194,181,155,0.04) 0%, transparent 50%)',
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
            'radial-gradient(circle, rgba(194,181,155,0.15) 1px, transparent 1px)',
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
            { icon: '🤖', label: 'AI Agents', value: '24/7 Active' },
            { icon: '⚡', label: 'Setup Time', value: '5 Days Avg' },
            { icon: '📈', label: 'Brands Served', value: 'Growing' },
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
                background: 'rgba(194,181,155,0.06)',
                border: '0.5px solid rgba(194,181,155,0.15)',
                borderRadius: 12,
                padding: '12px 20px',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <span style={{ fontSize: 20, lineHeight: 1 }}>{m.icon}</span>
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
          <a href="#contact">
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
    icon: 'brand',
    title: 'Brand Identity',
    desc: 'Logos, websites, visual systems, and brand strategy that make you look as serious as you are.',
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
        border: `1px solid ${hover ? 'rgba(194,181,155,0.25)' : C.border}`,
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
          background: 'rgba(194,181,155,0.08)',
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
   CONTENT SHOWCASE — What We Create
   ============================================================ */
function Pill({ children, bg, color }) {
  return (
    <span
      style={{
        display: 'inline-block',
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.02em',
        padding: '4px 10px',
        borderRadius: 999,
        background: bg,
        color,
      }}
    >
      {children}
    </span>
  )
}

const SHOWCASE_CARD = {
  background: '#0B0B0D',
  border: '0.5px solid rgba(194,181,155,0.2)',
  borderRadius: 16,
  padding: 20,
  breakInside: 'avoid',
  WebkitColumnBreakInside: 'avoid',
  marginBottom: 20,
  width: '100%',
  display: 'inline-block',
}

function HookCard({ platform, pillBg, pillColor, hook, caption, brand }) {
  return (
    <div style={SHOWCASE_CARD}>
      <Pill bg={pillBg} color={pillColor}>
        {platform}
      </Pill>
      <p
        style={{
          fontSize: 21,
          fontWeight: 700,
          color: '#F5F5F2',
          lineHeight: 1.3,
          letterSpacing: '-0.02em',
          margin: '16px 0 12px',
        }}
      >
        {hook}
      </p>
      <p
        style={{
          fontSize: 13.5,
          color: C.muted,
          lineHeight: 1.55,
          marginBottom: 18,
        }}
      >
        {caption}
      </p>
      <div
        style={{
          paddingTop: 14,
          borderTop: `1px solid ${C.border}`,
          fontSize: 11.5,
          color: C.accent,
          letterSpacing: '0.04em',
        }}
      >
        {brand}
      </div>
    </div>
  )
}

function Showcase() {
  return (
    <section
      id="showcase"
      className="lithos-section"
      style={{ padding: `${PAD}px 28px` }}
    >
      <div style={{ maxWidth: MAXW, margin: '0 auto' }}>
        <Reveal>
          <SectionHeader
            kicker="What We Create"
            title="Content That Converts"
            sub="Real outputs from our AI marketing system."
          />
        </Reveal>

        <div
          className="lithos-showcase-grid"
          style={{ columnCount: 3, columnGap: 20, marginTop: 60 }}
        >
          {/* Card 1 — Hook (LIMITLESS) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0 * 0.08 }}
            viewport={{ once: true }}
          >
            <HookCard
              platform="Instagram"
              pillBg="rgba(139,92,246,0.16)"
              pillColor="#b89cf5"
              hook="I lost $800 because I didn't journal this trade."
              caption="Your NQ trades are telling you something — most traders never listen until it's too late."
              brand="LIMITLESS Trading Journal"
            />
          </motion.div>

          {/* Card 2 — Image (AWATEC) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 * 0.08 }}
            viewport={{ once: true }}
          >
            <div
              style={{
                ...SHOWCASE_CARD,
                border: '0.5px solid rgba(74,222,128,0.25)',
              }}
            >
              <Pill bg="rgba(59,130,246,0.16)" color="#7eb2ff">
                Facebook
              </Pill>
              <div
                style={{
                  marginTop: 16,
                  height: 110,
                  borderRadius: 10,
                  background:
                    'linear-gradient(135deg, rgba(74,222,128,0.12), rgba(194,181,155,0.06))',
                  border: '0.5px solid rgba(74,222,128,0.18)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 30,
                }}
              >
                💧
              </div>
              <p
                style={{
                  fontSize: 19,
                  fontWeight: 700,
                  color: '#F5F5F2',
                  lineHeight: 1.3,
                  letterSpacing: '-0.02em',
                  margin: '16px 0 10px',
                }}
              >
                Is your water meter spinning at night?
              </p>
              <p
                style={{
                  fontSize: 13.5,
                  color: C.muted,
                  lineHeight: 1.55,
                  marginBottom: 18,
                }}
              >
                Hidden leaks cost Aruba homeowners hundreds of florins every
                month — silently.
              </p>
              <div
                style={{
                  paddingTop: 14,
                  borderTop: `1px solid ${C.border}`,
                  fontSize: 11.5,
                  color: '#7ee0a8',
                  letterSpacing: '0.04em',
                }}
              >
                AWATEC Leak Detection
              </div>
            </div>
          </motion.div>

          {/* Card 3 — Video */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 2 * 0.08 }}
            viewport={{ once: true }}
          >
            <div style={SHOWCASE_CARD}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Pill bg="rgba(245,158,11,0.16)" color="#f5c46b">
                  AI Video
                </Pill>
                <span style={{ fontSize: 11.5, color: C.muted }}>
                  15 seconds
                </span>
              </div>
              <div
                style={{
                  marginTop: 16,
                  height: 140,
                  borderRadius: 10,
                  background:
                    'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(11,11,13,1))',
                  border: `0.5px solid ${C.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={C.accent}
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="M10 9l5 3-5 3V9z" />
                  <path d="M2 8h20M7 4v4M17 4v4" />
                </svg>
              </div>
              <p
                style={{
                  fontSize: 14.5,
                  color: '#F5F5F2',
                  fontWeight: 600,
                  margin: '16px 0 18px',
                  lineHeight: 1.5,
                }}
              >
                Motion graphic generated by Remotion
              </p>
              <div
                style={{
                  paddingTop: 14,
                  borderTop: `1px solid ${C.border}`,
                  fontSize: 11.5,
                  color: C.accent,
                  letterSpacing: '0.04em',
                }}
              >
                Lithos Labs
              </div>
            </div>
          </motion.div>

          {/* Card 4 — Analytics */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 3 * 0.08 }}
            viewport={{ once: true }}
          >
            <div style={SHOWCASE_CARD}>
              <div
                style={{
                  fontSize: 11,
                  color: C.accent,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                  marginBottom: 16,
                }}
              >
                Performance
              </div>
              {[
                ['Avg engagement score', '84/100'],
                ['Content generated', '127 pieces'],
                ['Brands managed', '3'],
              ].map(([k, v]) => (
                <div
                  key={k}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 13.5,
                    padding: '9px 0',
                    borderBottom: `1px solid ${C.border}`,
                  }}
                >
                  <span style={{ color: C.muted }}>{k}</span>
                  <span style={{ color: '#F5F5F2', fontWeight: 650 }}>{v}</span>
                </div>
              ))}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  gap: 8,
                  height: 72,
                  marginTop: 20,
                }}
              >
                {[42, 65, 50, 80, 60, 92, 74].map((h, idx) => (
                  <div
                    key={idx}
                    style={{
                      flex: 1,
                      height: `${h}%`,
                      borderRadius: 4,
                      background:
                        'linear-gradient(180deg, rgba(194,181,155,0.7), rgba(194,181,155,0.2))',
                    }}
                  />
                ))}
              </div>
            </div>
          </motion.div>

          {/* Card 5 — Hook variant */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 4 * 0.08 }}
            viewport={{ once: true }}
          >
            <HookCard
              platform="Instagram"
              pillBg="rgba(139,92,246,0.16)"
              pillColor="#b89cf5"
              hook="Most businesses fail not because of bad products. But because of bad systems."
              caption="The brands that win aren't louder — they're better organized."
              brand="Lithos Labs"
            />
          </motion.div>

          {/* Card 6 — Schedule */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 5 * 0.08 }}
            viewport={{ once: true }}
          >
            <div style={SHOWCASE_CARD}>
              <div
                style={{
                  fontSize: 11,
                  color: C.accent,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                  marginBottom: 18,
                }}
              >
                Content Calendar
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, 1fr)',
                  gap: 10,
                  textAlign: 'center',
                }}
              >
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, idx) => (
                  <div
                    key={idx}
                    style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}
                  >
                    {d}
                  </div>
                ))}
                {Array.from({ length: 28 }).map((_, idx) => {
                  const scheduled = [
                    0, 2, 4, 6, 9, 11, 13, 16, 18, 20, 23, 25, 27,
                  ].includes(idx)
                  return (
                    <div
                      key={idx}
                      style={{
                        height: 18,
                        borderRadius: 5,
                        background: scheduled
                          ? 'rgba(194,181,155,0.55)'
                          : 'rgba(194,181,155,0.08)',
                      }}
                    />
                  )
                })}
              </div>
              <div
                style={{
                  marginTop: 20,
                  paddingTop: 14,
                  borderTop: `1px solid ${C.border}`,
                  fontSize: 13,
                  color: '#F5F5F2',
                  fontWeight: 600,
                }}
              >
                31 posts scheduled this month
              </div>
            </div>
          </motion.div>
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
      style={{ padding: `${PAD}px 28px`, background: 'rgba(194,181,155,0.015)' }}
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
                'linear-gradient(180deg, rgba(194,181,155,0.05), rgba(194,181,155,0.02))',
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
   CTA + CONTACT FORM
   ============================================================ */
const SERVICE_OPTIONS = [
  'CRM Setup',
  'AI Marketing System',
  'Brand Identity',
  'Full Package',
  'Not sure',
]

function ContactForm() {
  const [sent, setSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

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
    const form = e.currentTarget
    const data = new FormData(form)
    try {
      const res = await fetch('https://formspree.io/f/REPLACE_WITH_YOUR_ID', {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
      })
      if (res.ok) {
        setSent(true)
        form.reset()
      } else {
        setError(
          'Something went wrong. Please try again or email us directly.'
        )
      }
    } catch {
      setError('Network error. Please try again or email us directly.')
    } finally {
      setSubmitting(false)
    }
  }

  if (sent) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        style={{
          background: C.card,
          border: `1px solid rgba(194,181,155,0.25)`,
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
            background: 'rgba(194,181,155,0.12)',
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
        />
        <input
          style={inputStyle}
          name="business_name"
          placeholder="Business name"
          required
          autoComplete="organization"
        />
      </div>
      <input
        style={inputStyle}
        name="email"
        type="email"
        placeholder="Email address"
        required
        autoComplete="email"
      />
      <select
        style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}
        name="service_needed"
        defaultValue=""
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
      />
      {error && <p style={{ fontSize: 13.5, color: '#e0a0a0' }}>{error}</p>}
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
        background: '#0B0B0D',
        borderTop: `1px solid ${C.border}`,
        borderBottom: `1px solid ${C.border}`,
      }}
    >
      {/* Centered beige glow */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background:
            'radial-gradient(ellipse 60% 80% at 50% 50%, rgba(194,181,155,0.08) 0%, transparent 60%)',
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
          color: 'rgba(194,181,155,0.04)',
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
                style={{ width: 30, height: 30, objectFit: 'contain' }}
              />
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: 18,
                    color: '#F5F5F2',
                    letterSpacing: '-0.5px',
                  }}
                >
                  Lithos
                </span>
                <span
                  style={{
                    fontWeight: 300,
                    fontSize: 18,
                    color: 'rgba(194,181,155,0.6)',
                    letterSpacing: '-0.5px',
                  }}
                >
                  Labs
                </span>
              </div>
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
                  e.currentTarget.style.borderColor = 'rgba(194,181,155,0.4)'
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
                  e.currentTarget.style.borderColor = 'rgba(194,181,155,0.4)'
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
      href="https://wa.me/297XXXXXXX"
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
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 8px 28px rgba(37,211,102,0.35)',
      }}
    >
      <span className="lithos-wa-tip">Chat on WhatsApp</span>
      <svg width="30" height="30" viewBox="0 0 32 32" fill="#fff">
        <path d="M16.003 3C9.38 3 4 8.38 4 15c0 2.34.68 4.52 1.85 6.36L4 29l7.83-1.78A11.9 11.9 0 0 0 16 27c6.62 0 12-5.38 12-12S22.62 3 16.003 3zm0 21.8c-1.9 0-3.66-.55-5.15-1.5l-.37-.23-4.65 1.06 1.07-4.53-.24-.38a9.74 9.74 0 0 1-1.5-5.2c0-5.4 4.4-9.8 9.83-9.8 2.62 0 5.08 1.02 6.93 2.88a9.73 9.73 0 0 1 2.87 6.92c0 5.42-4.4 9.8-9.79 9.78zm5.37-7.33c-.29-.15-1.74-.86-2.01-.96-.27-.1-.47-.15-.66.15-.2.29-.76.96-.93 1.16-.17.2-.34.22-.63.07-.29-.15-1.24-.46-2.36-1.46-.87-.78-1.46-1.74-1.63-2.03-.17-.29-.02-.45.13-.6.13-.13.29-.34.44-.51.15-.17.2-.29.29-.49.1-.2.05-.37-.02-.51-.07-.15-.66-1.59-.9-2.18-.24-.57-.48-.5-.66-.5h-.56c-.2 0-.51.07-.78.37-.27.29-1.02.99-1.02 2.43s1.05 2.82 1.2 3.02c.15.2 2.06 3.15 5 4.42.7.3 1.24.48 1.67.62.7.22 1.34.19 1.84.12.56-.08 1.74-.71 1.98-1.4.24-.69.24-1.28.17-1.4-.07-.12-.27-.2-.56-.34z" />
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
            background: 'rgba(20,20,22,0.92)',
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
          'linear-gradient(90deg, transparent, rgba(194,181,155,0.15), transparent)',
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
          'radial-gradient(circle, rgba(194,181,155,0.06) 0%, transparent 70%)',
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
        .lithos-cta-watermark { font-size: clamp(70px, 22vw, 200px); }
        .lithos-footer-line {
          background: linear-gradient(90deg, transparent, rgba(194,181,155,0.45), transparent);
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
        @media (max-width: 1024px) {
          .lithos-showcase-grid { column-count: 2 !important; }
        }
        @media (max-width: 860px) {
          .lithos-showcase-grid { column-count: 1 !important; }
          .lithos-desktop-nav { display: none !important; }
          .lithos-hamburger { display: flex !important; }
          .lithos-services-grid { grid-template-columns: 1fr !important; }
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
        <Showcase />
        <Divider />
        <HowItWorks />
        <Divider />
        <WhyLithos />
        <Divider />
        <Stats />
        <Divider />
        <CTA />
      </main>
      <Footer />
      <WhatsApp />
      <CookieNotice />
    </div>
  )
}
