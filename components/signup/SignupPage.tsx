'use client'
import { useState, useRef, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import styles from './signup.module.css'

const KatoriScene = dynamic(() => import('@/components/login/KatoriScene'), { ssr: false })

export default function SignupPage() {
  const [form, setForm] = useState({
    name: '', email: '', password: '',
    age: '', gender: 'Male', weight_kg: '', height_cm: '',
    daily_calorie_goal: '2000', daily_protein_goal: '100',
    daily_carbs_goal: '250', daily_fat_goal: '65',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const cursorRingRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLButtonElement>(null)
  const router = useRouter()
  const supabase = createClient()

  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })) }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const { data, error: authError } = await supabase.auth.signUp({
      email: form.email, password: form.password,
    })
    if (authError) { setError(authError.message); setLoading(false); return }

    const userId = data.user?.id
    if (userId) {
      const { error: profileError } = await supabase.from('users').insert({
        auth_user_id: userId,
        name: form.name,
        age: form.age ? parseInt(form.age) : null,
        gender: form.gender,
        weight_kg: form.weight_kg ? parseFloat(form.weight_kg) : null,
        height_cm: form.height_cm ? parseFloat(form.height_cm) : null,
        daily_calorie_goal: parseFloat(form.daily_calorie_goal),
        daily_protein_goal: parseFloat(form.daily_protein_goal),
        daily_carbs_goal: parseFloat(form.daily_carbs_goal),
        daily_fat_goal: parseFloat(form.daily_fat_goal),
      })
      if (profileError) { setError(profileError.message); setLoading(false); return }
    }
    router.push('/dashboard')
    router.refresh()
  }

  // magnetic cursor ring
  useEffect(() => {
    if (!cursorRingRef.current) return
    const ring = cursorRingRef.current
    let rx = window.innerWidth / 2, ry = window.innerHeight / 2
    let tx = rx, ty = ry
    let raf: number

    function onMove(e: MouseEvent) { tx = e.clientX; ty = e.clientY; ring.style.opacity = '1' }
    function onLeave() { ring.style.opacity = '0' }
    function onOver(e: MouseEvent) {
      if ((e.target as Element).closest?.('button, a, input, select')) {
        ring.style.width = '46px'; ring.style.height = '46px'
        ring.style.borderColor = 'rgba(240,170,40,0.9)'
      }
    }
    function onOut(e: MouseEvent) {
      if ((e.target as Element).closest?.('button, a, input, select')) {
        ring.style.width = '32px'; ring.style.height = '32px'
        ring.style.borderColor = 'rgba(34,197,94,0.5)'
      }
    }
    function tick() {
      rx += (tx - rx) * 0.18; ry += (ty - ry) * 0.18
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%)`
      raf = requestAnimationFrame(tick)
    }
    tick()
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseleave', onLeave)
    document.addEventListener('mouseover', onOver)
    document.addEventListener('mouseout', onOut)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseleave', onLeave)
      document.removeEventListener('mouseover', onOver)
      document.removeEventListener('mouseout', onOut)
    }
  }, [])

  // magnetic CTA pull
  useEffect(() => {
    if (!ctaRef.current) return
    const cta = ctaRef.current
    function onMove(e: MouseEvent) {
      const r = cta.getBoundingClientRect()
      const dx = e.clientX - (r.left + r.width / 2)
      const dy = e.clientY - (r.top + r.height / 2)
      cta.style.transform = `translate(${dx * 0.18}px, ${dy * 0.25}px)`
    }
    function onLeave() { cta.style.transform = '' }
    cta.addEventListener('mousemove', onMove)
    cta.addEventListener('mouseleave', onLeave)
    return () => {
      cta.removeEventListener('mousemove', onMove)
      cta.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  return (
    <div className={styles.page}>
      <div className={styles.grain} />
      <div className={styles.pageBg} />
      <div className={styles.watermark}>भोजन</div>
      <div className={styles.decoCircle} />
      <div className={`${styles.decoCircle} ${styles.decoCircleInner}`} />
      <div className={styles.cursorRing} ref={cursorRingRef} />

      <nav className={styles.nav}>
        <div className={styles.navInner}>
          <Link href="/" className={styles.navLogo}>
            <span className={styles.leaf}>N</span>
            NutriLog
          </Link>
          <Link href="/login" className={styles.navBack}>
            <span className={styles.navBackArrow}>←</span>
            Sign in instead
          </Link>
        </div>
      </nav>

      <main className={styles.stage}>
        {/* ── form pane ── */}
        <section className={styles.leftPane}>
          <div className={styles.eyebrow}>New account</div>
          <h1 className={styles.title}>
            Start your<br />
            <span className={styles.italic}>journey here.</span>
          </h1>
          <p className={styles.sub}>
            Tell us a little about yourself — we&apos;ll personalise your nutrition goals right from day one.
          </p>

          <form className={styles.form} onSubmit={handleSignup} autoComplete="on" noValidate>

            {/* full name */}
            <div className={styles.field}>
              <label htmlFor="su-name">Full Name</label>
              <input
                id="su-name"
                name="name"
                type="text"
                placeholder="Arjun Sharma"
                required
                value={form.name}
                onChange={e => set('name', e.target.value)}
              />
            </div>

            {/* email */}
            <div className={styles.field}>
              <label htmlFor="su-email">Email</label>
              <input
                id="su-email"
                name="email"
                type="email"
                placeholder="you@kitchen.in"
                required
                value={form.email}
                onChange={e => set('email', e.target.value)}
              />
            </div>

            {/* password */}
            <div className={styles.field}>
              <label htmlFor="su-password">Password</label>
              <input
                id="su-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                required
                minLength={6}
                value={form.password}
                onChange={e => set('password', e.target.value)}
              />
              <button
                type="button"
                className={styles.toggle}
                onClick={() => setShowPassword(v => !v)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? 'HIDE' : 'SHOW'}
              </button>
            </div>

            {/* age + gender */}
            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label htmlFor="su-age">Age</label>
                <input
                  id="su-age"
                  type="number"
                  placeholder="22"
                  value={form.age}
                  onChange={e => set('age', e.target.value)}
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="su-gender">Gender</label>
                <select
                  id="su-gender"
                  value={form.gender}
                  onChange={e => set('gender', e.target.value)}
                >
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
            </div>

            {/* weight + height */}
            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label htmlFor="su-weight">Weight (kg)</label>
                <input
                  id="su-weight"
                  type="number"
                  step="0.1"
                  placeholder="70.0"
                  value={form.weight_kg}
                  onChange={e => set('weight_kg', e.target.value)}
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="su-height">Height (cm)</label>
                <input
                  id="su-height"
                  type="number"
                  step="0.1"
                  placeholder="175.0"
                  value={form.height_cm}
                  onChange={e => set('height_cm', e.target.value)}
                />
              </div>
            </div>

            {/* nutrition goals */}
            <div className={styles.sectionLabel}>Daily nutrition goals</div>

            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label htmlFor="su-cal">Calories (kcal)</label>
                <input id="su-cal" type="number" value={form.daily_calorie_goal}
                  onChange={e => set('daily_calorie_goal', e.target.value)} />
              </div>
              <div className={styles.field}>
                <label htmlFor="su-pro">Protein (g)</label>
                <input id="su-pro" type="number" value={form.daily_protein_goal}
                  onChange={e => set('daily_protein_goal', e.target.value)} />
              </div>
            </div>

            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label htmlFor="su-carbs">Carbs (g)</label>
                <input id="su-carbs" type="number" value={form.daily_carbs_goal}
                  onChange={e => set('daily_carbs_goal', e.target.value)} />
              </div>
              <div className={styles.field}>
                <label htmlFor="su-fat">Fat (g)</label>
                <input id="su-fat" type="number" value={form.daily_fat_goal}
                  onChange={e => set('daily_fat_goal', e.target.value)} />
              </div>
            </div>

            {error && <div className={styles.errorBox}>{error}</div>}

            <button
              type="submit"
              className={styles.ctaPrimary}
              ref={ctaRef}
              disabled={loading}
            >
              {loading ? 'Creating account…' : (
                <>
                  Create my NutriLog account
                  <span className={styles.ctaArrow}>→</span>
                </>
              )}
            </button>
          </form>

          <p className={styles.signinLine}>
            Already have an account?{' '}
            <Link href="/login">Sign in →</Link>
          </p>
        </section>

        {/* ── 3-D katori scene ── */}
        <section className={styles.rightPane}>
          <div className={styles.sceneFrame}>
            <KatoriScene />

            <div className={`${styles.chip} ${styles.chip1}`}>
              <span className={styles.chipDot} style={{ background: '#3b82f6', boxShadow: '0 0 10px #3b82f6' }} />
              <span className={styles.chipNum}>120g</span>
              <span>Protein</span>
            </div>
            <div className={`${styles.chip} ${styles.chip2}`}>
              <span className={styles.chipDot} style={{ background: '#f59e0b', boxShadow: '0 0 10px #f59e0b' }} />
              <span className={styles.chipNum}>280g</span>
              <span>Carbs</span>
            </div>
            <div className={`${styles.chip} ${styles.chip3}`}>
              <span className={styles.chipDot} style={{ background: '#f43f5e', boxShadow: '0 0 10px #f43f5e' }} />
              <span className={styles.chipNum}>65g</span>
              <span>Fat</span>
            </div>
            <div className={`${styles.chip} ${styles.chip4}`}>
              <span className={styles.chipDot} style={{ background: '#22c55e', boxShadow: '0 0 10px #22c55e' }} />
              <span className={styles.chipNum}>2,200</span>
              <span>kcal</span>
            </div>
          </div>
        </section>
      </main>

      <div className={styles.footerLine}>
        <span className={styles.footerPulse} />
        Secured · End-to-end · v2.4
      </div>
      <div className={styles.rightSideLine}>© NutriLog · Made for Indian kitchens</div>
    </div>
  )
}
