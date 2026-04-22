import { useEffect, useRef, useState } from 'react'
import {
  AnimatePresence,
  motion,
  useInView,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion'
import Lenis from '@studio-freight/lenis'
import {
  Globe,
  AlertCircle,
  TrendingDown,
  Check,
  ArrowRight,
  ChevronDown,
  MessageCircle,
  Plus,
  Minus,
  Quote,
} from 'lucide-react'

const colors = {
  bg: '#0c0c0e',
  bgAlt: '#111114',
  card: 'rgba(17,17,20,0.8)',
  border: 'rgba(255,255,255,0.08)',
  borderBright: 'rgba(255,255,255,0.18)',
  text: '#ffffff',
  muted: 'rgba(255,255,255,0.55)',
  faint: 'rgba(255,255,255,0.4)',
}

const glassCard = {
  background: colors.card,
  border: `0.5px solid ${colors.border}`,
  borderRadius: 16,
  padding: '2rem',
  backdropFilter: 'blur(12px) saturate(160%)',
  WebkitBackdropFilter: 'blur(12px) saturate(160%)',
}

const EASE = [0.16, 1, 0.3, 1]
const WHATSAPP_NUMBER = '+2971234567'

/* ---------------- Background ---------------- */

function Background() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse 80% 50% at 20% 10%, rgba(99,102,241,0.07) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 80% 90%, rgba(45,90,180,0.05) 0%, transparent 55%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '-15%',
          left: '-10%',
          width: 700,
          height: 700,
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(79,70,229,0.14) 0%, rgba(79,70,229,0.04) 40%, transparent 70%)',
          filter: 'blur(80px)',
          animation: 'orbFloat1 18s ease-in-out infinite',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-20%',
          right: '-15%',
          width: 800,
          height: 800,
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(37,99,235,0.12) 0%, rgba(37,99,235,0.04) 40%, transparent 70%)',
          filter: 'blur(90px)',
          animation: 'orbFloat2 22s ease-in-out infinite',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '40%',
          left: '45%',
          width: 500,
          height: 500,
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(130,110,200,0.06) 0%, transparent 75%)',
          filter: 'blur(100px)',
          animation: 'orbFloat3 26s ease-in-out infinite',
        }}
      />
    </div>
  )
}

/* ---------------- Custom Cursor ---------------- */

function CustomCursor() {
  const [supportsHover, setSupportsHover] = useState(false)
  const [hovering, setHovering] = useState(false)
  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const springX = useSpring(x, { stiffness: 150, damping: 15, mass: 0.3 })
  const springY = useSpring(y, { stiffness: 150, damping: 15, mass: 0.3 })

  useEffect(() => {
    const media = window.matchMedia('(hover: hover) and (pointer: fine)')
    const update = () => setSupportsHover(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    if (!supportsHover) return
    document.documentElement.classList.add('cos-cursor-none')

    function onMove(e) {
      x.set(e.clientX)
      y.set(e.clientY)
    }
    function onOver(e) {
      const el = e.target
      if (!(el instanceof Element)) return
      if (el.closest('button, a, label, [role="button"], input, select, textarea')) {
        setHovering(true)
      } else {
        setHovering(false)
      }
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseover', onOver)
    return () => {
      document.documentElement.classList.remove('cos-cursor-none')
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseover', onOver)
    }
  }, [supportsHover, x, y])

  if (!supportsHover) return null

  return (
    <>
      <motion.div
        className="cos-custom-cursor"
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          x,
          y,
          translateX: '-50%',
          translateY: '-50%',
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: '#ffffff',
          pointerEvents: 'none',
          zIndex: 10000,
          mixBlendMode: 'difference',
        }}
      />
      <motion.div
        className="cos-custom-cursor"
        animate={{
          width: hovering ? 48 : 32,
          height: hovering ? 48 : 32,
          background: hovering ? 'transparent' : 'rgba(255,255,255,0.08)',
          borderColor: hovering ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.12)',
        }}
        transition={{ duration: 0.2, ease: EASE }}
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          x: springX,
          y: springY,
          translateX: '-50%',
          translateY: '-50%',
          borderRadius: '50%',
          border: '1px solid rgba(255,255,255,0.12)',
          pointerEvents: 'none',
          zIndex: 9999,
          backdropFilter: 'blur(2px)',
        }}
      />
    </>
  )
}

/* ---------------- Navbar ---------------- */

function Navbar({ onBook }) {
  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: EASE }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 60,
        background: 'rgba(8,8,8,0.75)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        borderBottom: `0.5px solid rgba(255,255,255,0.06)`,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <div
        className="cos-container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontWeight: 700, fontSize: 18, color: '#fff', letterSpacing: '-0.02em' }}>
            COS
          </span>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, letterSpacing: '0.08em', fontWeight: 500 }}>
            STUDIOS
          </span>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onBook}
          style={{
            background: '#ffffff',
            color: '#000000',
            borderRadius: 999,
            padding: '8px 20px',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Book a Call
        </motion.button>
      </div>
    </motion.header>
  )
}

/* ---------------- AnimatedSection wrapper ---------------- */

function AnimatedSection({ children, amount = 0.15 }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40, filter: 'blur(8px)' }}
      animate={
        inView
          ? { opacity: 1, y: 0, filter: 'blur(0px)' }
          : { opacity: 0, y: 40, filter: 'blur(8px)' }
      }
      transition={{ duration: 0.8, ease: EASE }}
    >
      {children}
    </motion.div>
  )
}

function Section({ children, style, bg }) {
  return (
    <section
      className="cos-section"
      style={{
        padding: '100px 0',
        position: 'relative',
        zIndex: 1,
        background: bg || 'transparent',
        ...style,
      }}
    >
      <AnimatedSection>{children}</AnimatedSection>
    </section>
  )
}

/* ---------------- Shared pieces ---------------- */

function SectionLabel({ children }) {
  return (
    <div
      style={{
        fontSize: 11,
        letterSpacing: '0.15em',
        color: 'rgba(255,255,255,0.3)',
        fontWeight: 600,
        textTransform: 'uppercase',
        marginBottom: 18,
      }}
    >
      {children}
    </div>
  )
}

function SectionHeadline({ children, max = 640 }) {
  return (
    <h2
      style={{
        fontSize: 'clamp(28px, 4.5vw, 44px)',
        fontWeight: 700,
        letterSpacing: '-0.02em',
        lineHeight: 1.15,
        color: '#fff',
        maxWidth: max,
      }}
    >
      {children}
    </h2>
  )
}

function SectionSub({ children, max = 560 }) {
  return (
    <p
      style={{
        color: colors.muted,
        fontSize: 16,
        lineHeight: 1.6,
        marginTop: 14,
        maxWidth: max,
      }}
    >
      {children}
    </p>
  )
}

const primaryBtn = {
  background: '#ffffff',
  color: '#000000',
  borderRadius: 999,
  padding: '14px 32px',
  fontSize: 16,
  fontWeight: 600,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
}

const ghostBtn = {
  background: 'transparent',
  color: '#ffffff',
  border: `1px solid rgba(255,255,255,0.2)`,
  borderRadius: 999,
  padding: '14px 32px',
  fontSize: 16,
  fontWeight: 500,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
}

const smallGhostBtn = {
  background: 'transparent',
  color: '#ffffff',
  border: `1px solid rgba(255,255,255,0.2)`,
  borderRadius: 999,
  padding: '10px 20px',
  fontSize: 14,
  fontWeight: 500,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
}

/* ---------------- Dashboard Mockup ---------------- */

function DashboardMockup({ scrollY }) {
  const rotateX = useTransform(scrollY, [0, 400], [8, 0])
  const scale = useTransform(scrollY, [0, 400], [1, 0.98])

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.9, delay: 1.4, ease: EASE }}
      style={{
        position: 'relative',
        maxWidth: 900,
        width: '100%',
        margin: '70px auto 0',
        perspective: 1200,
      }}
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          borderRadius: 20,
          background: 'rgba(255,255,255,0.04)',
          border: '0.5px solid rgba(255,255,255,0.12)',
          boxShadow:
            '0 40px 80px rgba(99,102,241,0.18), 0 0 0 0.5px rgba(255,255,255,0.05), 0 20px 60px rgba(0,0,0,0.6)',
          backdropFilter: 'blur(20px) saturate(160%)',
          WebkitBackdropFilter: 'blur(20px) saturate(160%)',
          overflow: 'hidden',
          transformStyle: 'preserve-3d',
          rotateX,
          scale,
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '160px 1fr',
            minHeight: 380,
          }}
        >
          <div
            style={{
              borderRight: '0.5px solid rgba(255,255,255,0.06)',
              padding: '20px 14px',
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 14,
                paddingLeft: 4,
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: '-0.01em',
                  color: '#fff',
                }}
              >
                COS
              </span>
              <span
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: '50%',
                  background: '#6378ff',
                  boxShadow: '0 0 8px rgba(99,120,255,0.6)',
                }}
              />
            </div>
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '8px 10px',
                  borderRadius: 8,
                  background: i === 0 ? 'rgba(255,255,255,0.06)' : 'transparent',
                }}
              >
                <span
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: 4,
                    background: 'rgba(255,255,255,0.12)',
                  }}
                />
                <span
                  style={{
                    height: 8,
                    flex: 1,
                    borderRadius: 4,
                    background: i === 0 ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.08)',
                  }}
                />
              </div>
            ))}
          </div>
          <div style={{ padding: 22 }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 12,
                marginBottom: 20,
              }}
            >
              {[
                { label: 'LEADS', value: '24' },
                { label: 'PIPELINE', value: '$4,200' },
                { label: 'TASKS', value: '8' },
                { label: 'WIN RATE', value: '67%' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  style={{
                    background: 'rgba(17,17,20,0.6)',
                    border: '0.5px solid rgba(255,255,255,0.08)',
                    borderRadius: 10,
                    padding: '12px 14px',
                  }}
                >
                  <div
                    style={{
                      fontSize: 9,
                      letterSpacing: '0.08em',
                      color: 'rgba(255,255,255,0.4)',
                      textTransform: 'uppercase',
                      fontWeight: 600,
                    }}
                  >
                    {stat.label}
                  </div>
                  <div
                    style={{
                      fontSize: 20,
                      fontWeight: 700,
                      color: '#fff',
                      letterSpacing: '-0.02em',
                      marginTop: 6,
                    }}
                  >
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>
            <div
              style={{
                background: 'rgba(17,17,20,0.6)',
                border: '0.5px solid rgba(255,255,255,0.08)',
                borderRadius: 12,
                padding: 20,
                height: 200,
                display: 'flex',
                alignItems: 'flex-end',
                gap: 10,
              }}
            >
              {[55, 72, 48, 80, 64, 92, 70, 58, 84, 72, 96, 68].map((h, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  transition={{
                    duration: 0.8,
                    delay: 1.8 + i * 0.05,
                    ease: EASE,
                  }}
                  style={{
                    flex: 1,
                    background:
                      'linear-gradient(180deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.15) 100%)',
                    borderRadius: 3,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ---------------- Hero ---------------- */

function Hero({ onBook, onServices }) {
  const { scrollY } = useScroll()
  const words = [
    'Your',
    'Business',
    'Deserves',
    'More',
    'Than',
    'a',
    'Phone',
    'Number.',
  ]
  return (
    <section
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        zIndex: 1,
        padding: '120px 24px 80px',
        overflow: 'hidden',
      }}
    >
      <div
        aria-hidden="true"
        className="cos-grid-bg"
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      <div style={{ textAlign: 'center', maxWidth: 960, position: 'relative', zIndex: 1, width: '100%' }}>
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: EASE }}
          style={{
            fontSize: 12,
            letterSpacing: '0.2em',
            color: 'rgba(255,255,255,0.4)',
            fontWeight: 600,
            textTransform: 'uppercase',
            marginBottom: 26,
          }}
        >
          More clients. Less chaos.
        </motion.div>
        <h1
          style={{
            fontSize: 'clamp(36px, 8vw, 80px)',
            fontWeight: 700,
            letterSpacing: '-0.035em',
            lineHeight: 1.02,
            color: '#ffffff',
          }}
        >
          {words.map((w, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, filter: 'blur(12px)', y: 20 }}
              animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
              transition={{
                duration: 0.7,
                delay: 0.3 + i * 0.08,
                ease: EASE,
              }}
              style={{ display: 'inline-block', marginRight: '0.28em' }}
            >
              {w}
            </motion.span>
          ))}
        </h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85, duration: 0.6, ease: EASE }}
          style={{
            color: colors.muted,
            fontSize: 'clamp(16px, 2.2vw, 20px)',
            maxWidth: 620,
            margin: '28px auto 0',
            lineHeight: 1.55,
          }}
        >
          We build professional websites and custom management systems for small businesses in Aruba and the Caribbean. Get more clients, stay organized, grow faster.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6, ease: EASE }}
          style={{
            display: 'flex',
            gap: 12,
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginTop: 36,
          }}
        >
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onBook}
            style={primaryBtn}
          >
            Book a Free Call
            <ArrowRight size={17} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onServices}
            style={ghostBtn}
          >
            See Our Services →
          </motion.button>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          style={{
            display: 'flex',
            gap: 20,
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginTop: 28,
            fontSize: 13,
            color: 'rgba(255,255,255,0.4)',
          }}
        >
          <span>✓ No contracts</span>
          <span>✓ Delivered in 2 weeks</span>
          <span>✓ Built for your business</span>
        </motion.div>
        <DashboardMockup scrollY={scrollY} />
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          color: 'rgba(255,255,255,0.35)',
          animation: 'arrowBounce 2s ease-in-out infinite',
          zIndex: 2,
        }}
      >
        <ChevronDown size={20} />
      </div>
    </section>
  )
}

/* ---------------- Marquee ---------------- */

function Marquee() {
  const items = [
    'Plumbers',
    'Electricians',
    'Restaurants',
    'Salons',
    'HVAC',
    'Pest Control',
    'Cleaning',
    'Barbershops',
    'Gyms',
    'Food Trucks',
    'Landscaping',
    'Clothing Stores',
  ]
  const line = items.join(' · ') + ' · '
  return (
    <div
      style={{
        width: '100%',
        height: 44,
        background: 'rgba(255,255,255,0.03)',
        borderTop: '0.5px solid rgba(255,255,255,0.06)',
        borderBottom: '0.5px solid rgba(255,255,255,0.06)',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        zIndex: 1,
      }}
    >
      <div className="cos-marquee-track">
        {[0, 1].map((k) => (
          <span
            key={k}
            style={{
              display: 'inline-block',
              padding: '0 24px',
              fontSize: 13,
              color: 'rgba(255,255,255,0.4)',
              letterSpacing: '0.05em',
              whiteSpace: 'nowrap',
            }}
          >
            {line}
            {line}
            {line}
            {line}
          </span>
        ))}
      </div>
    </div>
  )
}

/* ---------------- Problem ---------------- */

function ProblemCard({ icon: Icon, title, text, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 60, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      whileHover={{ y: -6, borderColor: 'rgba(255,255,255,0.2)' }}
      transition={{ duration: 0.6, delay: index * 0.15, ease: EASE }}
      style={glassCard}
    >
      <motion.div
        whileHover={{ rotate: 5, scale: 1.1 }}
        transition={{ duration: 0.3, ease: EASE }}
        style={{
          width: 42,
          height: 42,
          borderRadius: 12,
          background: 'rgba(255,255,255,0.04)',
          border: `0.5px solid ${colors.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 16,
        }}
      >
        <Icon size={18} color="#fff" strokeWidth={1.8} />
      </motion.div>
      <h3 style={{ fontSize: 18, fontWeight: 700, color: '#fff', letterSpacing: '-0.01em' }}>
        {title}
      </h3>
      <p style={{ color: colors.muted, fontSize: 14, lineHeight: 1.6, marginTop: 8 }}>
        {text}
      </p>
    </motion.div>
  )
}

function ProblemSection() {
  return (
    <Section bg={colors.bgAlt}>
      <div className="cos-container">
        <SectionLabel>The Problem</SectionLabel>
        <SectionHeadline max={720}>
          Most small businesses are invisible online — and losing clients because of it.
        </SectionHeadline>
        <SectionSub max={620}>
          If someone searches for your service right now, can they find you? If not, you're losing jobs to competitors every single day.
        </SectionSub>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 16,
            marginTop: 48,
          }}
        >
          <ProblemCard
            index={0}
            icon={Globe}
            title="No Website"
            text="Customers can't find you online. Your competitors are getting the jobs you should be getting."
          />
          <ProblemCard
            index={1}
            icon={AlertCircle}
            title="No System"
            text="Tracking customers in your head or on paper means lost follow-ups, forgotten jobs, and missed revenue."
          />
          <ProblemCard
            index={2}
            icon={TrendingDown}
            title="No Growth"
            text="Without the right tools, you're stuck doing everything manually instead of focusing on what matters."
          />
        </div>
      </div>
    </Section>
  )
}

/* ---------------- Stats Bar ---------------- */

function StatNumber({ target, prefix = '', suffix = '', isNumeric = true }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.5 })
  const [value, setValue] = useState(isNumeric ? 0 : target)

  useEffect(() => {
    if (!isNumeric || !inView) return
    const duration = 1500
    const start = performance.now()
    let raf
    const step = (now) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      setValue(Math.floor(eased * Number(target)))
      if (t < 1) raf = requestAnimationFrame(step)
      else setValue(Number(target))
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [inView, target, isNumeric])

  return (
    <span ref={ref}>
      {prefix}
      {value}
      {suffix}
    </span>
  )
}

function StatsBar() {
  const stats = [
    { value: <><StatNumber target={2} /> Week</>, label: 'Average Delivery' },
    { value: <><StatNumber target={100} suffix="%" /></>, label: 'Custom Built' },
    { value: 'Caribbean', label: 'Based & Serving' },
    { value: '$0', label: 'Hidden Fees' },
  ]
  return (
    <section
      className="cos-section"
      style={{ padding: '40px 0', position: 'relative', zIndex: 1 }}
    >
      <div className="cos-container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: EASE }}
          style={{
            ...glassCard,
            padding: '28px 24px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 0,
          }}
        >
          {stats.map((s, i) => (
            <div
              key={i}
              style={{
                padding: '0 20px',
                borderLeft: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.08)',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontSize: 'clamp(22px, 3vw, 30px)',
                  fontWeight: 700,
                  color: '#fff',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.1,
                }}
              >
                {s.value}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: 'rgba(255,255,255,0.45)',
                  marginTop: 6,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  fontWeight: 500,
                }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

/* ---------------- Services ---------------- */

function ServiceCard({ badge, title, description, items, price, cta, onClick, delay }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.2 })

  function onMove(e) {
    const el = e.currentTarget
    const rect = el.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    el.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.06), rgba(17,17,20,0.8) 60%)`
  }
  function onLeave(e) {
    e.currentTarget.style.background = 'rgba(17,17,20,0.8)'
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{ duration: 0.6, delay, ease: EASE }}
      whileHover={{ rotateY: 2, rotateX: -1, scale: 1.01 }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{
        ...glassCard,
        padding: '2.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: 18,
        position: 'relative',
        transformPerspective: 1000,
        transformStyle: 'preserve-3d',
        transition: 'background 0.3s ease, border-color 0.2s ease',
      }}
    >
      {badge && (
        <span
          style={{
            display: 'inline-flex',
            alignSelf: 'flex-start',
            padding: '4px 12px',
            borderRadius: 999,
            background: 'rgba(255,255,255,0.08)',
            color: '#fff',
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.02em',
          }}
        >
          {badge}
        </span>
      )}
      <div>
        <h3 style={{ fontSize: 'clamp(22px, 3vw, 26px)', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>
          {title}
        </h3>
        <p style={{ color: colors.muted, fontSize: 15, marginTop: 10, lineHeight: 1.6 }}>
          {description}
        </p>
      </div>
      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {items.map((item, i) => (
          <li
            key={i}
            style={{
              display: 'flex',
              gap: 10,
              fontSize: 14,
              color: 'rgba(255,255,255,0.75)',
            }}
          >
            <span
              style={{
                width: 18,
                height: 18,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.08)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                marginTop: 2,
              }}
            >
              <Check size={11} color="#fff" strokeWidth={3} />
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
      <div
        style={{
          fontSize: 22,
          fontWeight: 700,
          color: '#fff',
          letterSpacing: '-0.02em',
          marginTop: 6,
        }}
      >
        {price}
      </div>
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={onClick}
        style={{ ...smallGhostBtn, alignSelf: 'flex-start', padding: '12px 24px', fontSize: 14 }}
      >
        {cta} <ArrowRight size={14} />
      </motion.button>
    </motion.div>
  )
}

function ServicesSection({ onBook }) {
  return (
    <Section>
      <div className="cos-container">
        <SectionLabel>What We Build</SectionLabel>
        <SectionHeadline max={720}>Two products. One goal: grow your business.</SectionHeadline>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 20,
            marginTop: 48,
          }}
        >
          <ServiceCard
            badge="Most Popular"
            title="Professional Website"
            description="A fast, modern website that shows up on Google and turns visitors into customers. Built specifically for your business and your industry."
            items={[
              'Custom design for your business',
              'Mobile-friendly and fast',
              'Shows up on Google searches',
              'Contact form and booking ready',
              'Delivered in 10–14 days',
            ]}
            price="Starting at $500"
            cta="Get a Website"
            onClick={onBook}
            delay={0}
          />
          <ServiceCard
            title="Business Management System"
            description="A custom system to manage your customers, jobs, invoices, and follow-ups — all in one place. Built for how your business actually works."
            items={[
              'Customer database',
              'Job and ticket tracking',
              'Invoice management',
              'Follow-up reminders',
              'Dashboard with stats',
            ]}
            price="Starting at $1,000"
            cta="Get a System"
            onClick={onBook}
            delay={0.1}
          />
        </div>
        <div
          style={{
            marginTop: 28,
            textAlign: 'center',
            color: colors.muted,
            fontSize: 14,
          }}
        >
          Need both? Ask about our Full System bundle — Website + CRM from $2,000.{' '}
          <button
            type="button"
            onClick={onBook}
            style={{ color: '#fff', fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: 3 }}
          >
            → Get the bundle
          </button>
        </div>
      </div>
    </Section>
  )
}

/* ---------------- Process ---------------- */

function ProcessStep({ number, title, text, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, delay, ease: EASE }}
      style={{ ...glassCard, padding: '2rem', position: 'relative' }}
    >
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: delay + 0.1 }}
        style={{
          fontSize: 42,
          fontWeight: 800,
          color: 'rgba(255,255,255,0.12)',
          letterSpacing: '-0.04em',
          lineHeight: 1,
          display: 'inline-block',
        }}
      >
        {number}
      </motion.div>
      <h3
        style={{
          fontSize: 18,
          fontWeight: 700,
          color: '#fff',
          letterSpacing: '-0.01em',
          marginTop: 14,
        }}
      >
        {title}
      </h3>
      <p style={{ color: colors.muted, fontSize: 14, marginTop: 8, lineHeight: 1.6 }}>
        {text}
      </p>
    </motion.div>
  )
}

function ProcessSection() {
  return (
    <Section bg={colors.bgAlt}>
      <div className="cos-container">
        <SectionLabel>The Process</SectionLabel>
        <SectionHeadline max={720}>From first call to live system in under 30 days.</SectionHeadline>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 16,
            marginTop: 48,
            position: 'relative',
          }}
        >
          <ProcessStep
            number="01"
            title="Book a Free Call"
            text="We spend 30 minutes understanding your business, your problems, and what you actually need."
            delay={0}
          />
          <ProcessStep
            number="02"
            title="We Build It"
            text="We design and build your website or system — customized for your business, no templates."
            delay={0.2}
          />
          <ProcessStep
            number="03"
            title="You Grow"
            text="Your new website or system goes live. You start getting more clients and running more efficiently."
            delay={0.4}
          />
        </div>
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, delay: 0.3, ease: EASE }}
          style={{
            transformOrigin: 'left',
            height: 1,
            background:
              'linear-gradient(90deg, transparent, rgba(255,255,255,0.2) 20%, rgba(255,255,255,0.2) 80%, transparent)',
            marginTop: 40,
          }}
        />
      </div>
    </Section>
  )
}

/* ---------------- Benefits ---------------- */

function BenefitCard({ title, text, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      whileHover={{ borderColor: colors.borderBright, y: -4 }}
      transition={{ duration: 0.5, delay, ease: EASE }}
      style={{ ...glassCard, padding: '1.75rem' }}
    >
      <h3 style={{ fontSize: 18, fontWeight: 700, color: '#fff', letterSpacing: '-0.01em' }}>
        {title}
      </h3>
      <p style={{ color: colors.muted, fontSize: 14, marginTop: 8, lineHeight: 1.6 }}>{text}</p>
    </motion.div>
  )
}

function BenefitsSection() {
  return (
    <Section>
      <div className="cos-container">
        <SectionLabel>The Results</SectionLabel>
        <SectionHeadline max={720}>What changes when you work with us.</SectionHeadline>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 16,
            marginTop: 48,
          }}
        >
          <BenefitCard title="More Clients" text="Your website works 24/7 bringing in new customers even while you sleep." delay={0} />
          <BenefitCard title="Save Time" text="Stop managing everything in your head. Your system tracks it all automatically." delay={0.08} />
          <BenefitCard title="Look Professional" text="A modern website builds trust instantly. Customers choose you over competitors." delay={0.16} />
          <BenefitCard title="Stay Organized" text="Never lose a customer or forget a follow-up again. Everything is in one place." delay={0.24} />
        </div>
      </div>
    </Section>
  )
}

/* ---------------- Testimonials ---------------- */

const testimonials = [
  {
    quote:
      'They built our website in 10 days. We started getting calls from new customers within the first week.',
    name: 'Carlos M.',
    business: 'Plumber, Oranjestad',
  },
  {
    quote:
      'The system they built replaced our notebooks completely. Now I can see all my jobs and customers in one place.',
    name: 'Maria R.',
    business: 'Cleaning Service, Noord',
  },
  {
    quote:
      'Professional, fast, and they actually understood what our business needed. Best investment we made.',
    name: 'Ricardo F.',
    business: 'Electrician, San Nicolas',
  },
]

function TestimonialCard({ t, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      whileHover={{ y: -6, borderColor: 'rgba(255,255,255,0.18)' }}
      transition={{ duration: 0.6, delay: index * 0.12, ease: EASE }}
      style={{ ...glassCard, padding: '2rem', position: 'relative', overflow: 'hidden' }}
    >
      <Quote
        size={72}
        strokeWidth={1}
        style={{
          position: 'absolute',
          top: -14,
          right: -10,
          color: 'rgba(255,255,255,0.05)',
          pointerEvents: 'none',
        }}
      />
      <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14, letterSpacing: '0.14em' }}>
        ★★★★★
      </div>
      <p
        style={{
          color: '#fff',
          fontSize: 15,
          lineHeight: 1.65,
          marginTop: 14,
          position: 'relative',
        }}
      >
        "{t.quote}"
      </p>
      <div style={{ marginTop: 20, borderTop: `0.5px solid ${colors.border}`, paddingTop: 14 }}>
        <div style={{ fontWeight: 700, color: '#fff', fontSize: 14 }}>{t.name}</div>
        <div style={{ color: colors.muted, fontSize: 12, marginTop: 2 }}>{t.business}</div>
      </div>
    </motion.div>
  )
}

function TestimonialsSection() {
  return (
    <Section bg={colors.bgAlt}>
      <div className="cos-container">
        <SectionLabel>What Clients Say</SectionLabel>
        <SectionHeadline max={720}>
          Real businesses. Real results.
        </SectionHeadline>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 16,
            marginTop: 48,
          }}
        >
          {testimonials.map((t, i) => (
            <TestimonialCard key={i} t={t} index={i} />
          ))}
        </div>
      </div>
    </Section>
  )
}

/* ---------------- FAQ ---------------- */

const faqs = [
  {
    q: 'How long does it take to build my website?',
    a: 'Most websites are delivered in 10–14 days. CRM systems take 2–3 weeks depending on complexity.',
  },
  {
    q: 'Do I need to be tech-savvy to use the system?',
    a: 'Not at all. We build everything to be simple and train you how to use it. If you can use WhatsApp, you can use our systems.',
  },
  {
    q: "What if I need changes after it's built?",
    a: 'Every project includes a revision round. After that, we offer affordable monthly maintenance packages.',
  },
  {
    q: 'Do you only work with businesses in Aruba?',
    a: "We're based in Aruba but work with businesses across the Caribbean.",
  },
  {
    q: 'How much does it cost?',
    a: 'Websites start at $500. CRM systems start at $1,000. We also offer bundle pricing if you need both.',
  },
]

function FAQItem({ q, a, isOpen, onToggle }) {
  return (
    <motion.div
      layout
      transition={{ layout: { duration: 0.4, ease: EASE } }}
      style={{
        ...glassCard,
        padding: 0,
        overflow: 'hidden',
      }}
    >
      <motion.button
        layout="position"
        type="button"
        onClick={onToggle}
        style={{
          width: '100%',
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          background: 'transparent',
          textAlign: 'left',
          cursor: 'pointer',
        }}
      >
        <span style={{ color: '#fff', fontSize: 15, fontWeight: 600, letterSpacing: '-0.01em' }}>
          {q}
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.25, ease: EASE }}
          style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.06)',
            border: '0.5px solid rgba(255,255,255,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Plus size={14} color="#fff" />
        </motion.span>
      </motion.button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="body"
            layout
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            style={{ overflow: 'hidden' }}
          >
            <div
              style={{
                padding: '0 24px 22px',
                color: colors.muted,
                fontSize: 14,
                lineHeight: 1.65,
              }}
            >
              {a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function FAQSection() {
  const [openIdx, setOpenIdx] = useState(0)
  return (
    <Section>
      <div className="cos-container" style={{ maxWidth: 760 }}>
        <SectionLabel>Questions</SectionLabel>
        <SectionHeadline max={720}>Everything you might be wondering.</SectionHeadline>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 40 }}>
          {faqs.map((f, i) => (
            <FAQItem
              key={i}
              q={f.q}
              a={f.a}
              isOpen={openIdx === i}
              onToggle={() => setOpenIdx(openIdx === i ? -1 : i)}
            />
          ))}
        </div>
      </div>
    </Section>
  )
}

/* ---------------- Booking Form ---------------- */

const inputStyle = {
  width: '100%',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 10,
  color: '#fff',
  padding: '12px 16px',
  fontSize: 15,
  outline: 'none',
  fontFamily: 'inherit',
}

const selectStyle = {
  ...inputStyle,
  appearance: 'none',
  WebkitAppearance: 'none',
  backgroundImage:
    'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'rgba(255,255,255,0.5)\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'><polyline points=\'6 9 12 15 18 9\'></polyline></svg>")',
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 14px center',
  paddingRight: 36,
  cursor: 'pointer',
}

const fieldLabel = {
  fontSize: 12,
  color: 'rgba(255,255,255,0.55)',
  fontWeight: 500,
  marginBottom: 6,
  display: 'block',
}

function BookingForm() {
  const [form, setForm] = useState({
    name: '',
    business_name: '',
    phone: '',
    email: '',
    service_needed: 'Website',
    message: '',
  })
  const [state, setState] = useState('idle')
  const [errorMsg, setErrorMsg] = useState('')

  function update(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim() || !form.business_name.trim() || !form.phone.trim()) {
      setErrorMsg('Please fill in your name, business, and phone.')
      setState('error')
      return
    }
    setState('submitting')
    setErrorMsg('')
    try {
      const res = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, created_at: new Date().toISOString() }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Submission failed')
      }
      setState('success')
    } catch (err) {
      console.error(err)
      setErrorMsg(err?.message || 'Something went wrong.')
      setState('error')
    }
  }

  if (state === 'success') {
    return (
      <div
        style={{
          ...glassCard,
          padding: '3rem 2rem',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
          }}
        >
          <Check size={24} color="#fff" strokeWidth={2.5} />
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, color: '#fff' }}>
          We got your message!
        </div>
        <p style={{ color: colors.muted, marginTop: 10, fontSize: 15 }}>
          We'll reach out within 24 hours to confirm your call.
        </p>
        <p style={{ color: colors.faint, marginTop: 14, fontSize: 13 }}>
          Talk soon, Eugene @ COS Studios
        </p>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        ...glassCard,
        padding: '2.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
      }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
        <div>
          <label style={fieldLabel}>Full Name</label>
          <input
            style={inputStyle}
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            placeholder="John Smith"
            required
          />
        </div>
        <div>
          <label style={fieldLabel}>Business Name</label>
          <input
            style={inputStyle}
            value={form.business_name}
            onChange={(e) => update('business_name', e.target.value)}
            placeholder="Acme Plumbing"
            required
          />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
        <div>
          <label style={fieldLabel}>Phone Number</label>
          <input
            type="tel"
            style={inputStyle}
            value={form.phone}
            onChange={(e) => update('phone', e.target.value)}
            placeholder="+297 123 4567"
            required
          />
        </div>
        <div>
          <label style={fieldLabel}>Email</label>
          <input
            type="email"
            style={inputStyle}
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            placeholder="you@business.com"
          />
        </div>
      </div>
      <div>
        <label style={fieldLabel}>What do you need?</label>
        <select
          style={selectStyle}
          value={form.service_needed}
          onChange={(e) => update('service_needed', e.target.value)}
        >
          <option value="Website">Website</option>
          <option value="CRM System">CRM System</option>
          <option value="Both">Both</option>
          <option value="Not Sure">Not Sure</option>
        </select>
      </div>
      <div>
        <label style={fieldLabel}>Tell us about your business</label>
        <textarea
          rows={3}
          style={{ ...inputStyle, resize: 'vertical' }}
          value={form.message}
          onChange={(e) => update('message', e.target.value)}
          placeholder="What do you do, how many customers, what's the goal..."
        />
      </div>
      <motion.button
        type="submit"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        disabled={state === 'submitting'}
        style={{
          width: '100%',
          background: '#fff',
          color: '#000',
          borderRadius: 12,
          padding: 16,
          fontSize: 16,
          fontWeight: 600,
          cursor: state === 'submitting' ? 'not-allowed' : 'pointer',
          opacity: state === 'submitting' ? 0.6 : 1,
          marginTop: 4,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        }}
      >
        {state === 'submitting' ? 'Sending...' : 'Book My Free Call'}
        {state !== 'submitting' && <ArrowRight size={17} />}
      </motion.button>
      {state === 'error' && (
        <div
          style={{
            fontSize: 13,
            color: 'rgba(255,255,255,0.75)',
            background: 'rgba(255,80,80,0.08)',
            border: '0.5px solid rgba(255,80,80,0.3)',
            borderRadius: 10,
            padding: '10px 14px',
            textAlign: 'center',
          }}
        >
          {errorMsg || 'Something went wrong.'}{' '}
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, '')}`}
            target="_blank"
            rel="noreferrer"
            style={{ color: '#fff', textDecoration: 'underline' }}
          >
            Please WhatsApp us directly.
          </a>
        </div>
      )}
    </form>
  )
}

function BookingSection() {
  return (
    <Section bg={colors.bgAlt}>
      <div className="cos-container">
        <SectionLabel>Get Started</SectionLabel>
        <SectionHeadline max={720}>Book your free 30-minute call.</SectionHeadline>
        <SectionSub max={620}>
          Tell us about your business and we'll show you exactly what we'd build for you — no commitment required.
        </SectionSub>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 28,
            marginTop: 48,
            alignItems: 'start',
          }}
        >
          <div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                'We analyze your current situation',
                "We show you exactly what we'd build",
                'You get a custom quote — no pressure',
              ].map((item, i) => (
                <li key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <span
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      background: 'rgba(255,255,255,0.08)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: 1,
                    }}
                  >
                    <Check size={12} color="#fff" strokeWidth={3} />
                  </span>
                  <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 15 }}>{item}</span>
                </li>
              ))}
            </ul>
            <div
              style={{
                marginTop: 28,
                color: colors.muted,
                fontSize: 13,
              }}
            >
              We respond within 24 hours.
            </div>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, '')}`}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                marginTop: 14,
                color: '#fff',
                fontSize: 13,
                fontWeight: 600,
                textDecoration: 'underline',
                textUnderlineOffset: 3,
              }}
            >
              Prefer WhatsApp? Message us directly →
            </a>
          </div>
          <BookingForm />
        </div>
      </div>
    </Section>
  )
}

/* ---------------- WhatsApp FAB ---------------- */

function WhatsAppFab() {
  const [tooltip, setTooltip] = useState(false)
  return (
    <motion.a
      href={`https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, '')}`}
      target="_blank"
      rel="noreferrer"
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 2, duration: 0.6, ease: EASE }}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.94 }}
      onMouseEnter={() => setTooltip(true)}
      onMouseLeave={() => setTooltip(false)}
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: '50%',
        background: '#25D366',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        zIndex: 200,
        animation: 'whatsappPulse 2.4s ease-out infinite',
      }}
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle size={24} strokeWidth={2} />
      <AnimatePresence>
        {tooltip && (
          <motion.span
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'absolute',
              right: 68,
              top: '50%',
              transform: 'translateY(-50%)',
              background: '#111',
              border: '0.5px solid rgba(255,255,255,0.1)',
              color: '#fff',
              padding: '6px 12px',
              borderRadius: 8,
              fontSize: 12,
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
            }}
          >
            Chat on WhatsApp
          </motion.span>
        )}
      </AnimatePresence>
    </motion.a>
  )
}

/* ---------------- Footer ---------------- */

function Footer({ onBook }) {
  return (
    <footer
      style={{
        padding: '60px 0 40px',
        borderTop: `0.5px solid ${colors.border}`,
        background: 'rgba(8,8,8,0.4)',
        position: 'relative',
        zIndex: 1,
      }}
    >
      <div
        className="cos-container"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 20,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontWeight: 700, fontSize: 18 }}>COS</span>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, letterSpacing: '0.08em' }}>
              STUDIOS
            </span>
          </div>
          <p style={{ color: colors.muted, fontSize: 13, marginTop: 8, maxWidth: 360 }}>
            More clients. Less chaos.
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onBook}
          style={{
            background: '#fff',
            color: '#000',
            padding: '10px 22px',
            borderRadius: 999,
            fontWeight: 600,
            fontSize: 13,
          }}
        >
          Book a Call
        </motion.button>
      </div>
      <div
        className="cos-container"
        style={{
          color: 'rgba(255,255,255,0.3)',
          fontSize: 12,
          marginTop: 32,
          paddingTop: 24,
          borderTop: `0.5px solid ${colors.border}`,
        }}
      >
        © 2026 COS Studios. Aruba &amp; Caribbean.
      </div>
    </footer>
  )
}

/* ---------------- App ---------------- */

export default function App() {
  const bookingRef = useRef(null)
  const servicesRef = useRef(null)

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    })
    let rafId
    function raf(time) {
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    }
    rafId = requestAnimationFrame(raf)
    return () => {
      cancelAnimationFrame(rafId)
      lenis.destroy()
    }
  }, [])

  function scrollToBooking() {
    bookingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
  function scrollToServices() {
    servicesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <>
      <CustomCursor />
      <Background />
      <Navbar onBook={scrollToBooking} />
      <Hero onBook={scrollToBooking} onServices={scrollToServices} />
      <Marquee />
      <ProblemSection />
      <StatsBar />
      <div ref={servicesRef}>
        <ServicesSection onBook={scrollToBooking} />
      </div>
      <ProcessSection />
      <BenefitsSection />
      <TestimonialsSection />
      <FAQSection />
      <div ref={bookingRef}>
        <BookingSection />
      </div>
      <Footer onBook={scrollToBooking} />
      <WhatsAppFab />
    </>
  )
}
