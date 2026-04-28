'use client'
import { useState, useRef, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import styles from './login.module.css'

const KatoriScene = dynamic(() => import('./KatoriScene'), { ssr: false })

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const cursorRingRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLButtonElement>(null)
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError) {
      setError(authError.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  // magnetic cursor ring
  useEffect(() => {
    if (!cursorRingRef.current) return
    const ring: HTMLDivElement = cursorRingRef.current
    let rx = window.innerWidth / 2, ry = window.innerHeight / 2
    let tx = rx, ty = ry
    let raf: number

    function onMove(e: MouseEvent) { tx = e.clientX; ty = e.clientY; ring.style.opacity = '1' }
    function onLeave() { ring.style.opacity = '0' }
    function onOver(e: MouseEvent) {
      if ((e.target as Element).closest?.('button, a, input')) {
        ring.style.width = '46px'; ring.style.height = '46px'
        ring.style.borderColor = 'rgba(240,170,40,0.9)'
      }
    }
    function onOut(e: MouseEvent) {
      if ((e.target as Element).closest?.('button, a, input')) {
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
    const cta: HTMLButtonElement = ctaRef.current
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
      <div className={styles.watermark}>स्वाद</div>
      <div className={styles.decoCircle} />
      <div className={`${styles.decoCircle} ${styles.decoCircleInner}`} />
      <div className={styles.cursorRing} ref={cursorRingRef} />

      <nav className={styles.nav}>
        <div className={styles.navInner}>
          <Link href="/" className={styles.navLogo}>
            <span className={styles.leaf}>N</span>
            NutriLog
          </Link>
          <Link href="/" className={styles.navBack}>
            <span className={styles.navBackArrow}>←</span>
            Back to home
          </Link>
        </div>
      </nav>

      <main className={styles.stage}>
        {/* form */}
        <section className={styles.leftPane}>
          <div className={styles.eyebrow}>Welcome back</div>
          <h1 className={styles.title}>
            Pick up where<br />
            <span className={styles.italic}>you left off.</span>
          </h1>
          <p className={styles.sub}>
            Your meals, your macros, your patterns — all waiting. Sign in to keep the streak going.
          </p>

          <form className={styles.form} onSubmit={handleLogin} autoComplete="on" noValidate>
            <div className={styles.field}>
              <label htmlFor="login-email">Email</label>
              <input
                id="login-email"
                name="email"
                type="email"
                placeholder="you@kitchen.in"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="login-password">Password</label>
              <input
                id="login-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <button
                type="button"
                className={styles.toggle}
                aria-label="Toggle password visibility"
                onClick={() => setShowPassword(v => !v)}
              >
                {showPassword ? 'HIDE' : 'SHOW'}
              </button>
            </div>

            <div className={styles.rowBetween}>
              <label className={styles.check}>
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={e => setRemember(e.target.checked)}
                  style={{ display: 'none' }}
                />
                <span className={`${styles.checkBox} ${remember ? styles.checkBoxChecked : ''}`} />
                <span>Keep me signed in</span>
              </label>
              <a href="#" className={styles.forgot}>Forgot password?</a>
            </div>

            {error && <div className={styles.errorBox}>{error}</div>}

            <button
              type="submit"
              className={styles.ctaPrimary}
              ref={ctaRef}
              disabled={loading}
            >
              {loading ? 'Signing in…' : (
                <>
                  Sign in to NutriLog
                  <span className={styles.ctaArrow}>→</span>
                </>
              )}
            </button>

            <div className={styles.divider}>or continue with</div>

            <div className={styles.oauth}>
              {/* TODO: wire to supabase.auth.signInWithOAuth({ provider: 'google' }) */}
              <button type="button" className={styles.oauthBtn}>
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21.6 12.227c0-.709-.064-1.39-.182-2.045H12v3.868h5.382a4.6 4.6 0 0 1-1.996 3.018v2.51h3.232c1.891-1.741 2.982-4.305 2.982-7.351z" fill="#4285F4"/>
                  <path d="M12 22c2.7 0 4.964-.895 6.618-2.422l-3.232-2.51c-.896.6-2.04.955-3.386.955-2.605 0-4.81-1.76-5.596-4.123H2.985v2.59A9.997 9.997 0 0 0 12 22z" fill="#34A853"/>
                  <path d="M6.404 13.9a6.005 6.005 0 0 1 0-3.8V7.51H2.985a10.005 10.005 0 0 0 0 8.98l3.42-2.59z" fill="#FBBC05"/>
                  <path d="M12 5.977c1.468 0 2.786.505 3.823 1.495l2.868-2.868C16.96 2.99 14.696 2 12 2A9.997 9.997 0 0 0 2.985 7.51l3.42 2.59C7.19 7.737 9.395 5.977 12 5.977z" fill="#EA4335"/>
                </svg>
                Google
              </button>
              {/* TODO: wire to supabase.auth.signInWithOAuth({ provider: 'apple' }) */}
              <button type="button" className={styles.oauthBtn}>
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.86-3.08.43-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.43C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.08zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                Apple
              </button>
            </div>
          </form>

          <p className={styles.signupLine}>
            New to NutriLog?{' '}
            <Link href="/signup">Create a free account →</Link>
          </p>
        </section>

        {/* katori 3D scene */}
        <section className={styles.rightPane}>
          <div className={styles.sceneFrame}>
            <KatoriScene />

            <div className={`${styles.chip} ${styles.chipProtein}`}>
              <span className={styles.chipDot} style={{ background: '#3b82f6' }} />
              <span className={styles.chipNum}>120g</span>
              <span>Protein</span>
            </div>
            <div className={`${styles.chip} ${styles.chipCarbs}`}>
              <span className={styles.chipDot} style={{ background: '#f59e0b' }} />
              <span className={styles.chipNum}>280g</span>
              <span>Carbs</span>
            </div>
            <div className={`${styles.chip} ${styles.chipFat}`}>
              <span className={styles.chipDot} style={{ background: '#f43f5e' }} />
              <span className={styles.chipNum}>65g</span>
              <span>Fat</span>
            </div>
            <div className={`${styles.chip} ${styles.chipKcal}`}>
              <span className={styles.chipDot} style={{ background: '#22c55e' }} />
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
