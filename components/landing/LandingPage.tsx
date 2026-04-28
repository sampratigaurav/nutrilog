'use client'
import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import styles from './landing.module.css'

const PlateScene = dynamic(() => import('./PlateScene'), { ssr: false })

/* ── Calorie counter ──────────────────────────────────────────── */
function CalorieCounter({ active }: { active: boolean }) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!active) { setVal(0); return }
    const dur = 1500
    const t0 = performance.now()
    let raf: number
    function step(t: number) {
      const k = Math.min(1, (t - t0) / dur)
      const eased = 1 - Math.pow(1 - k, 3)
      setVal(Math.round(eased * 2200))
      if (k < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [active])

  return (
    <div className={`${styles.calCounter} ${active ? styles.calCounterShow : ''}`}>
      <div className={styles.calNum}>{val.toLocaleString()}</div>
      <div className={styles.calLbl}>KCAL · TODAY</div>
    </div>
  )
}

/* ── Nav ──────────────────────────────────────────────────────── */
function Nav() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <header className={`${styles.nav} ${scrolled ? styles.navScrolled : ''}`}>
      <div className={styles.navInner}>
        <Link href="/" className={styles.navLogo}>
          <span>🥗</span> NutriLog
        </Link>
        <nav className={styles.navLinks}>
          <a href="#how">Features</a>
          <a href="#how">How it works</a>
          <a href="#tryit">Try it</a>
          <Link className={styles.navCta} href="/login">Get Started</Link>
        </nav>
      </div>
    </header>
  )
}

/* ── Hero ─────────────────────────────────────────────────────── */
function Hero({ scrollPct }: { scrollPct: number }) {
  const arc = scrollPct > 0.05
  const showLabels = scrollPct > 0.18
  const showCal    = scrollPct > 0.30

  const foods = [
    { cls: styles.food1, arcCls: styles.food1Arc, emoji: '🍛' },
    { cls: styles.food2, arcCls: styles.food2Arc, emoji: '🍚' },
    { cls: styles.food3, arcCls: styles.food3Arc, emoji: '🧀' },
    { cls: styles.food4, arcCls: styles.food4Arc, emoji: '🥬' },
    { cls: styles.food5, arcCls: styles.food5Arc, emoji: '🍗' },
    { cls: styles.food6, arcCls: styles.food6Arc, emoji: '🥚' },
  ]

  return (
    <section className={styles.hero}>
      <div className={styles.watermark} aria-hidden="true">स्वाद</div>
      <div className={styles.decoCircle} />
      <div className={`${styles.decoCircle} ${styles.decoCircleInner}`} />

      <div className={styles.heroCopy}>
        <div className={styles.eyebrow}>NUTRITION TRACKING</div>
        <h1 className={styles.heroTitle}>
          Eat Well,<br />
          Live <span className={styles.heroTitleItalic}>Better.</span>
        </h1>
        <p className={styles.heroSub}>
          Track every bite. Know every macro. Built for Indian kitchens,
          from dal-chawal to a late-night biscuit.
        </p>
        <div className={styles.ctaRow}>
          <Link className={styles.ctaPrimary} href="/signup">
            Start Tracking Free <span>→</span>
          </Link>
          <a className={styles.ctaGhost} href="#how">
            See how it works <span className={styles.ctaArr}>↓</span>
          </a>
        </div>
      </div>

      <div className={styles.heroStage}>
        {foods.map((f, i) => (
          <div
            key={i}
            className={`${styles.food} ${f.cls} ${arc ? `${styles.foodArc} ${f.arcCls}` : ''}`}
          >
            <span className={styles.foodBob}>{f.emoji}</span>
          </div>
        ))}

        <div className={`${styles.macroLabel} ${styles.macroProtein} ${showLabels ? styles.macroLabelShow : ''}`}>
          <span className={styles.macroLabelDot} style={{ background: '#3b82f6' }} />
          120g Protein
        </div>
        <div className={`${styles.macroLabel} ${styles.macroCarbs} ${showLabels ? styles.macroLabelShow : ''}`}>
          <span className={styles.macroLabelDot} style={{ background: '#f59e0b' }} />
          280g Carbs
        </div>
        <div className={`${styles.macroLabel} ${styles.macroFat} ${showLabels ? styles.macroLabelShow : ''}`}>
          <span className={styles.macroLabelDot} style={{ background: '#f43f5e' }} />
          65g Fat
        </div>

        <CalorieCounter active={showCal} />
      </div>
    </section>
  )
}

/* ── Ticker ───────────────────────────────────────────────────── */
function Ticker() {
  const items = [
    '🥗 NutriLog', '✦', 'Indian Food Database', '✦', 'USDA Data', '✦',
    'AI-Powered Scanning', '✦', 'Macro Tracking', '✦', 'Barcode Support',
    '✦', 'Real-Time Goals', '✦', 'Free to Start',
  ]
  const row = (
    <>
      {items.map((t, i) => (
        <span key={i} className={t === '✦' ? styles.tickerAccent : ''}>{t}</span>
      ))}
    </>
  )
  return (
    <div className={styles.ticker}>
      <div className={styles.tickerTrack}>
        {row}{row}{row}
      </div>
    </div>
  )
}

/* ── Features ─────────────────────────────────────────────────── */
function Features() {
  const features = [
    { icon: '📷', bg: 'rgba(34,197,94,0.12)',  fg: '#16a34a', title: 'AI Photo Scan',   body: 'Point your camera. Get macros instantly.',       meta: '01 · Gemini-powered' },
    { icon: '🔍', bg: 'rgba(59,130,246,0.12)',  fg: '#2563eb', title: 'Barcode Scanner', body: 'Packaged foods decoded in seconds.',              meta: '02 · OFF + USDA' },
    { icon: '🎯', bg: 'rgba(245,158,11,0.14)',  fg: '#b45309', title: 'Smart Goals',     body: 'Weight loss, muscle gain, or maintenance.',      meta: '03 · Daily targets' },
    { icon: '📊', bg: 'rgba(244,63,94,0.12)',   fg: '#be123c', title: '7-Day Trends',    body: 'See your nutrition patterns at a glance.',       meta: '04 · Recharts' },
  ]
  const refs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          const el = e.target as HTMLElement
          const i = Number(el.getAttribute('data-i'))
          setTimeout(() => el.classList.add(styles.featCardIn), i * 110)
          io.unobserve(el)
        }
      })
    }, { threshold: 0.2 })
    refs.current.forEach((r) => r && io.observe(r))
    return () => io.disconnect()
  }, [])

  return (
    <section className={styles.features} id="how">
      <div className={styles.outlineBg} style={{ top: 40 }}>FEATURES</div>
      <div className={styles.featuresHead}>
        <div>
          <div className={styles.featuresEyebrow}>FEATURES</div>
          <h2 className={styles.featuresTitle}>
            Four ways to <em className={styles.featuresTitleEm}>log,</em> one place to know.
          </h2>
        </div>
        <p className={styles.featuresDesc}>
          Whether it&apos;s a snap of your thali or a barcode on a Parle-G packet,
          NutriLog turns it into protein, carbs, fat — and a calorie target you can hit.
        </p>
      </div>
      <div className={styles.featGrid}>
        {features.map((f, i) => (
          <div
            key={i}
            className={styles.featCard}
            data-i={i}
            ref={(el) => { refs.current[i] = el }}
          >
            <div className={styles.featIcon} style={{ background: f.bg, color: f.fg }}>{f.icon}</div>
            <h3>{f.title}</h3>
            <p>{f.body}</p>
            <div className={styles.featMeta}>{f.meta}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ── Dashboard Preview ────────────────────────────────────────── */
function DashboardPreview() {
  const [animate, setAnimate] = useState(false)
  const wrapRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) setAnimate(true) }),
      { threshold: 0.3 }
    )
    if (wrapRef.current) io.observe(wrapRef.current)
    return () => io.disconnect()
  }, [])

  const r = 54
  const circ = 2 * Math.PI * r
  const pct = animate ? 0.74 : 0

  const macros = [
    { l: 'Protein', v: 88,  g: 120, c: '#3b82f6' },
    { l: 'Carbs',   v: 212, g: 280, c: '#f59e0b' },
    { l: 'Fat',     v: 47,  g: 65,  c: '#f43f5e' },
  ]

  return (
    <section className={styles.preview} ref={wrapRef}>
      <div className={styles.previewCard}>
        <div className={styles.previewLeft}>
          <div className={styles.featuresEyebrow}>YOUR DAY, MEASURED</div>
          <h2>
            One <em>calorie ring,</em> three macro bars, every meal you ate.
          </h2>
          <p>
            The dashboard you&apos;ll open every morning. A green calorie ring that quietly
            fills as the day goes on, a 7-day line for the bigger picture, and your meals
            stacked exactly the way you logged them.
          </p>
          <div className={styles.checkRow}>
            <span className={styles.check}>🌅 Breakfast · ☀️ Lunch</span>
            <span className={styles.check}>🌙 Dinner · 🍎 Snack</span>
            <span className={styles.check}>🎯 Active goal aware</span>
          </div>
        </div>

        <div className={styles.dash}>
          <div className={styles.dashHead}>
            <div>
              <div className={styles.dashGreet}>Good morning, Samprati 👋</div>
              <div className={styles.dashDate}>MON · 27 APR 2026</div>
            </div>
            <div style={{
              background: '#dcfce7', color: '#15803d',
              padding: '4px 10px', borderRadius: 8, fontSize: 11,
              fontWeight: 600, fontFamily: 'var(--font-jetbrains-mono, monospace)',
            }}>+ LOG</div>
          </div>

          <div className={styles.dashRow}>
            <div className={styles.ringWrap}>
              <svg width="140" height="140" viewBox="0 0 160 160" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="80" cy="80" r={r} fill="none" stroke="#f0fdf4" strokeWidth="14" />
                <circle cx="80" cy="80" r={r} fill="none"
                  stroke="#22c55e" strokeWidth="14" strokeLinecap="round"
                  strokeDasharray={`${circ * pct} ${circ}`}
                  style={{ transition: 'stroke-dasharray 1.4s cubic-bezier(.2,.9,.3,1)' }}
                />
              </svg>
              <div className={styles.ringLabelNum}>
                <div className={styles.ringVal}>1,634</div>
                <div className={styles.ringSub}>/ 2,200</div>
              </div>
            </div>

            <div className={styles.macroStack}>
              {macros.map((m, i) => (
                <div key={i}>
                  <div className={styles.mbRow}>
                    <span>{m.l}</span>
                    <span className={styles.mbRowNum}>{m.v}g / {m.g}g</span>
                  </div>
                  <div className={styles.mbBar}>
                    <div
                      className={styles.mbFill}
                      style={{
                        width: animate ? `${(m.v / m.g) * 100}%` : '0%',
                        background: m.c,
                        transitionDelay: `${0.2 + i * 0.15}s`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.mealsRow}>
            {[
              { e: '🌅', k: '412 kcal', l: 'BREAKFAST' },
              { e: '☀️', k: '684 kcal', l: 'LUNCH' },
              { e: '🌙', k: '538 kcal', l: 'DINNER' },
            ].map((m, i) => (
              <div key={i} className={styles.mealChip}>
                <div className={styles.mealEmoji}>{m.e}</div>
                <div className={styles.mealKcal}>{m.k}</div>
                <div className={styles.mealLabel}>{m.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ── Type-to-log ─────────────────────────────────────────────── */
const FOOD_DB: Record<string, { kcal: number; p: number; c: number; f: number }> = {
  roti:    { kcal: 110, p: 3,   c: 22, f: 1.5 }, rotis:   { kcal: 110, p: 3,   c: 22, f: 1.5 },
  chapati: { kcal: 110, p: 3,   c: 22, f: 1.5 }, dal:     { kcal: 180, p: 12,  c: 24, f: 4   },
  rice:    { kcal: 200, p: 4,   c: 44, f: 0.4 }, paneer:  { kcal: 260, p: 18,  c: 6,  f: 20  },
  curd:    { kcal: 100, p: 8,   c: 6,  f: 5   }, idli:    { kcal: 50,  p: 1.5, c: 11, f: 0.3 },
  idlis:   { kcal: 50,  p: 1.5, c: 11, f: 0.3 }, dosa:    { kcal: 170, p: 4,   c: 25, f: 6   },
  samosa:  { kcal: 260, p: 5,   c: 30, f: 14  }, biryani: { kcal: 360, p: 14,  c: 40, f: 14  },
  chai:    { kcal: 90,  p: 3,   c: 12, f: 3   }, biscuit: { kcal: 50,  p: 1,   c: 7,  f: 2   },
  biscuits:{ kcal: 50,  p: 1,   c: 7,  f: 2   }, egg:     { kcal: 78,  p: 6,   c: 0.6,f: 5   },
  eggs:    { kcal: 78,  p: 6,   c: 0.6,f: 5   }, chicken: { kcal: 240, p: 27,  c: 0,  f: 14  },
  spinach: { kcal: 30,  p: 2,   c: 3,  f: 0.4 }, apple:   { kcal: 95,  p: 0.5, c: 25, f: 0.3 },
  banana:  { kcal: 105, p: 1.3, c: 27, f: 0.4 },
}
const NUM_WORDS: Record<string, number> = { a: 1, an: 1, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6 }

function parseFoods(text: string) {
  const tok = text.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter(Boolean)
  const items: Array<{ name: string; qty: number } & typeof FOOD_DB[string]> = []
  for (let i = 0; i < tok.length; i++) {
    if (FOOD_DB[tok[i]]) {
      let qty = 1
      const prev = tok[i - 1]
      if (prev) {
        const n = parseFloat(prev)
        if (!isNaN(n)) qty = n
        else if (NUM_WORDS[prev]) qty = NUM_WORDS[prev]
      }
      items.push({ name: tok[i], qty, ...FOOD_DB[tok[i]] })
    }
  }
  return items
}

function TryIt() {
  const [text, setText] = useState('2 rotis, dal and a bowl of rice')
  const items = parseFoods(text)
  const totals = items.reduce(
    (a, it) => ({ kcal: a.kcal + it.kcal * it.qty, p: a.p + it.p * it.qty, c: a.c + it.c * it.qty, f: a.f + it.f * it.qty }),
    { kcal: 0, p: 0, c: 0, f: 0 }
  )
  const goalP = 120, goalC = 280, goalF = 65
  const sugg = ['2 rotis, dal and rice', '1 dosa with chai', 'paneer 100g and 2 chapati', '3 idlis with curd']

  const macroBars = [
    { l: 'Protein', v: totals.p, g: goalP, c: '#3b82f6' },
    { l: 'Carbs',   v: totals.c, g: goalC, c: '#f0c040' },
    { l: 'Fat',     v: totals.f, g: goalF, c: '#e8528a' },
  ]

  return (
    <section className={styles.tryit} id="tryit" style={{ position: 'relative' }}>
      <div className={styles.outlineBg} style={{ top: -10 }}>TYPE</div>
      <div className={styles.featuresEyebrow}>TYPE A MEAL</div>
      <h2 className={styles.featuresTitle}>
        Type what you ate. <em className={styles.featuresTitleEm}>We&apos;ll do the math.</em>
      </h2>
      <p style={{ maxWidth: 540, color: '#5a5364', fontSize: 16, lineHeight: 1.6, margin: '12px 0 0' }}>
        Natural-language input wired to a database of Indian and global foods. Macros recompute live.
      </p>
      <div className={styles.tryitCard}>
        <div>
          <input
            className={styles.tryitInput}
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder='Try: "2 rotis and dal"'
          />
          <div className={styles.tryitHint}>↑ EDIT · QUANTITIES + FOOD NAMES PARSED LIVE</div>
          <div className={styles.tryitSuggestions}>
            {sugg.map((s, i) => (
              <button key={i} className={styles.chip} onClick={() => setText(s)}>{s}</button>
            ))}
          </div>
          <div className={styles.parsedList}>
            {items.length === 0 && (
              <div className={styles.noParsed}>No foods parsed — try a suggestion.</div>
            )}
            {items.map((it, i) => (
              <div className={styles.parsedItem} key={`${it.name}-${i}`}>
                <span className={styles.parsedName}>
                  {it.qty} × <span style={{ textTransform: 'capitalize' }}>{it.name}</span>
                </span>
                <span className={styles.parsedQty}>
                  {Math.round(it.kcal * it.qty)} kcal · {Math.round(it.p * it.qty)}P/{Math.round(it.c * it.qty)}C/{Math.round(it.f * it.qty)}F
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.macroReadout}>
          <div className={styles.macroReadoutLbl}>TOTAL</div>
          <h3 className={styles.macroTotal}>
            {Math.round(totals.kcal).toLocaleString()}
            <span className={styles.macroTotalUnit}>KCAL</span>
          </h3>
          <div className={styles.macroBars}>
            {macroBars.map((m, i) => (
              <div className={styles.macroBarRow} key={i}>
                <div className={styles.macroBarHead}>
                  <span className={styles.macroBarName}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: m.c, display: 'inline-block', boxShadow: `0 0 8px ${m.c}` }} />
                    {m.l}
                  </span>
                  <span className={styles.macroBarVal}>
                    {Math.round(m.v)}g <span style={{ color: '#6f6677' }}>/ {m.g}g</span>
                  </span>
                </div>
                <div className={styles.macroBar}>
                  <div
                    className={styles.macroBarFill}
                    style={{
                      width: `${Math.min(100, (m.v / m.g) * 100)}%`,
                      background: m.c,
                      boxShadow: `0 0 10px ${m.c}`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ── Footer ───────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.navLogo} style={{ fontSize: 18 }}><span>🥗</span> NutriLog</div>
      <div className={styles.footerSmall}>EAT WELL · LIVE BETTER · © 2026</div>
      <div className={styles.footerLinks}>
        <a href="#">Privacy</a>
        <a href="#">Terms</a>
        <a href="#">Support</a>
      </div>
    </footer>
  )
}

/* ── App / LandingPage ────────────────────────────────────────── */
export default function LandingPage() {
  const [scrollPct, setScrollPct] = useState(0)
  const cursorRingRef = useRef<HTMLDivElement>(null)

  // scroll tracking
  useEffect(() => {
    const onScroll = () => {
      const max = document.body.scrollHeight - window.innerHeight
      const p = max > 0 ? window.scrollY / max : 0
      ;(window as unknown as Record<string, number>).__scrollPct = p
      setScrollPct(p)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // cursor ring + mouse tracking + magnetic CTAs
  useEffect(() => {
    const ring = cursorRingRef.current
    let rx = window.innerWidth / 2, ry = window.innerHeight / 2
    let mx = rx, my = ry

    const onMove = (e: MouseEvent) => {
      mx = e.clientX; my = e.clientY
      ;(window as unknown as Record<string, number>).__mouseX = mx / window.innerWidth
      ;(window as unknown as Record<string, number>).__mouseY = my / window.innerHeight
      if (ring) ring.style.opacity = '1'
    }
    const onOver = (e: MouseEvent) => {
      if (!ring) return
      if ((e.target as Element).closest('a, button')) {
        ring.style.width = '50px'; ring.style.height = '50px'
        ring.style.borderColor = 'rgba(240,170,40,0.9)'
      }
    }
    const onOut = () => {
      if (!ring) return
      ring.style.width = '32px'; ring.style.height = '32px'
      ring.style.borderColor = 'rgba(34,197,94,0.5)'
    }

    let raf: number
    function ringTick() {
      rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18
      if (ring) { ring.style.left = rx + 'px'; ring.style.top = ry + 'px' }
      raf = requestAnimationFrame(ringTick)
    }
    ringTick()

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseover', onOver)
    window.addEventListener('mouseout', onOut)

    // magnetic pull on CTA buttons
    const els = document.querySelectorAll<HTMLElement>('a[href="/signup"], a[href="/login"]')
    const handlers: Array<{ el: HTMLElement; onM: (e: MouseEvent) => void; onL: () => void }> = []
    els.forEach((el) => {
      const onM = (e: MouseEvent) => {
        const r = el.getBoundingClientRect()
        const dx = e.clientX - (r.left + r.width / 2)
        const dy = e.clientY - (r.top + r.height / 2)
        const d = Math.hypot(dx, dy)
        if (d < 100) {
          const k = (1 - d / 100) * 0.25
          el.style.transform = `translate(${dx * k}px, ${dy * k}px)`
        }
      }
      const onL = () => { el.style.transform = '' }
      el.addEventListener('mousemove', onM)
      el.addEventListener('mouseleave', onL)
      handlers.push({ el, onM, onL })
    })

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseover', onOver)
      window.removeEventListener('mouseout', onOut)
      handlers.forEach(({ el, onM, onL }) => {
        el.removeEventListener('mousemove', onM)
        el.removeEventListener('mouseleave', onL)
      })
    }
  }, [])

  return (
    <div className={styles.landing}>
      <div className={styles.pageBg} />
      <div className={styles.grain} />
      <div className={styles.cursorRing} ref={cursorRingRef} />

      <Nav />

      <div className={styles.plateFixed}>
        <PlateScene />
      </div>

      <Hero scrollPct={scrollPct} />
      <Ticker />
      <TryIt />
      <Features />
      <DashboardPreview />
      <Footer />
    </div>
  )
}
