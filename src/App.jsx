import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import {
  Globe,
  AlertCircle,
  TrendingDown,
  Check,
  ArrowRight,
  ChevronDown,
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

function Navbar({ onBook }) {
  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 60,
        background: 'rgba(8,8,8,0.8)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: `0.5px solid rgba(255,255,255,0.06)`,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <div
        className="orvex-container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontWeight: 700, fontSize: 18, color: '#fff', letterSpacing: '-0.02em' }}>
            ORVEX
          </span>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, letterSpacing: '0.08em', fontWeight: 500 }}>
            SYSTEMS
          </span>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
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
    </header>
  )
}

function Section({ children, style, bg }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.15 })
  return (
    <section
      ref={ref}
      className="orvex-section"
      style={{
        padding: '100px 0',
        position: 'relative',
        zIndex: 1,
        background: bg || 'transparent',
        ...style,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.div>
    </section>
  )
}

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

function Hero({ onBook, onServices }) {
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
      }}
    >
      <div style={{ textAlign: 'center', maxWidth: 900 }}>
        <motion.h1
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
              initial={{ opacity: 0, y: 24, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{
                duration: 0.6,
                delay: 0.15 + i * 0.06,
                ease: [0.16, 1, 0.3, 1],
              }}
              style={{ display: 'inline-block', marginRight: '0.28em' }}
            >
              {w}
            </motion.span>
          ))}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
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
          transition={{ delay: 1, duration: 0.6 }}
          style={{
            display: 'flex',
            gap: 12,
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginTop: 36,
          }}
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={onBook}
            style={primaryBtn}
          >
            Book a Free Call
            <ArrowRight size={17} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
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
          transition={{ delay: 1.3, duration: 0.6 }}
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
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: 36,
          left: '50%',
          transform: 'translateX(-50%)',
          color: 'rgba(255,255,255,0.35)',
          animation: 'arrowBounce 2s ease-in-out infinite',
        }}
      >
        <ChevronDown size={20} />
      </div>
    </section>
  )
}

function ProblemCard({ icon: Icon, title, text, delay }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.3 })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ borderColor: colors.borderBright, scale: 1.01 }}
      style={glassCard}
    >
      <div
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
      </div>
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
      <div className="orvex-container">
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
            icon={Globe}
            title="No Website"
            text="Customers can't find you online. Your competitors are getting the jobs you should be getting."
            delay={0}
          />
          <ProblemCard
            icon={AlertCircle}
            title="No System"
            text="Tracking customers in your head or on paper means lost follow-ups, forgotten jobs, and missed revenue."
            delay={0.1}
          />
          <ProblemCard
            icon={TrendingDown}
            title="No Growth"
            text="Without the right tools, you're stuck doing everything manually instead of focusing on what matters."
            delay={0.2}
          />
        </div>
      </div>
    </Section>
  )
}

function ServiceCard({ badge, title, description, items, price, cta, onClick, delay }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.2 })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ borderColor: colors.borderBright }}
      style={{
        ...glassCard,
        padding: '2.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: 18,
        position: 'relative',
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
        whileHover={{ scale: 1.02 }}
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
      <div className="orvex-container">
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

function ProcessStep({ number, title, text, delay }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.3 })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      style={{
        ...glassCard,
        padding: '2rem',
        position: 'relative',
      }}
    >
      <div
        style={{
          fontSize: 42,
          fontWeight: 800,
          color: 'rgba(255,255,255,0.12)',
          letterSpacing: '-0.04em',
          lineHeight: 1,
        }}
      >
        {number}
      </div>
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
      <p style={{ color: colors.muted, fontSize: 14, marginTop: 8, lineHeight: 1.6 }}>{text}</p>
    </motion.div>
  )
}

function ProcessSection() {
  return (
    <Section bg={colors.bgAlt}>
      <div className="orvex-container">
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
            delay={0.1}
          />
          <ProcessStep
            number="03"
            title="You Grow"
            text="Your new website or system goes live. You start getting more clients and running more efficiently."
            delay={0.2}
          />
        </div>
      </div>
    </Section>
  )
}

function BenefitCard({ title, text, delay }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.3 })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ borderColor: colors.borderBright }}
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
      <div className="orvex-container">
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
          <BenefitCard
            title="More Clients"
            text="Your website works 24/7 bringing in new customers even while you sleep."
            delay={0}
          />
          <BenefitCard
            title="Save Time"
            text="Stop managing everything in your head. Your system tracks it all automatically."
            delay={0.08}
          />
          <BenefitCard
            title="Look Professional"
            text="A modern website builds trust instantly. Customers choose you over competitors."
            delay={0.16}
          />
          <BenefitCard
            title="Stay Organized"
            text="Never lose a customer or forget a follow-up again. Everything is in one place."
            delay={0.24}
          />
        </div>
      </div>
    </Section>
  )
}

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
  const [state, setState] = useState('idle') // idle | submitting | success | error
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
        body: JSON.stringify({
          ...form,
          created_at: new Date().toISOString(),
        }),
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
          maxWidth: 600,
          margin: '48px auto 0',
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
          Talk soon, Eugene @ Orvex Systems
        </p>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        ...glassCard,
        maxWidth: 600,
        margin: '48px auto 0',
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
            href="https://wa.me/2971234567"
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

function BookingSection({ id }) {
  return (
    <Section bg={colors.bgAlt} style={{}}>
      <div className="orvex-container" id={id}>
        <SectionLabel>Get Started</SectionLabel>
        <SectionHeadline max={720}>Book your free 30-minute call.</SectionHeadline>
        <SectionSub max={620}>
          Tell us about your business and we'll show you exactly what we'd build for you — no commitment required.
        </SectionSub>
        <BookingForm />
      </div>
    </Section>
  )
}

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
        className="orvex-container"
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
            <span style={{ fontWeight: 700, fontSize: 18 }}>ORVEX</span>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, letterSpacing: '0.08em' }}>
              SYSTEMS
            </span>
          </div>
          <p style={{ color: colors.muted, fontSize: 13, marginTop: 8, maxWidth: 360 }}>
            Building websites and systems for small businesses.
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
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
        className="orvex-container"
        style={{
          color: 'rgba(255,255,255,0.3)',
          fontSize: 12,
          marginTop: 32,
          paddingTop: 24,
          borderTop: `0.5px solid ${colors.border}`,
        }}
      >
        © 2026 Orvex Systems. Aruba &amp; Caribbean.
      </div>
    </footer>
  )
}

export default function App() {
  const bookingRef = useRef(null)
  const servicesRef = useRef(null)

  function scrollToBooking() {
    bookingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
  function scrollToServices() {
    servicesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <>
      <Background />
      <Navbar onBook={scrollToBooking} />
      <Hero onBook={scrollToBooking} onServices={scrollToServices} />
      <ProblemSection />
      <div ref={servicesRef}>
        <ServicesSection onBook={scrollToBooking} />
      </div>
      <ProcessSection />
      <BenefitsSection />
      <div ref={bookingRef}>
        <BookingSection />
      </div>
      <Footer onBook={scrollToBooking} />
    </>
  )
}
