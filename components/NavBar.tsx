'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import styles from './dashboard.module.css'

const links = [
  { href: '/dashboard', label: 'Dashboard', icon: '◈' },
  { href: '/log',       label: 'Log Food',  icon: '+' },
  { href: '/scan',      label: 'Scan',      icon: '⊙' },
  { href: '/history',   label: 'History',   icon: '≡' },
  { href: '/goals',     label: 'Goals',     icon: '◎' },
]

export default function NavBar({ userName }: { userName: string }) {
  const pathname = usePathname()
  const router   = useRouter()
  const supabase = createClient()

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <>
      <header className={styles.nav}>
        <div className={styles.navInner}>
          {/* Logo */}
          <Link href="/dashboard" className={styles.navLogo}>
            <span className={styles.leaf}>N</span>
            NutriLog
          </Link>

          {/* Desktop links */}
          <nav className={styles.navLinks}>
            {links.map(l => (
              <Link
                key={l.href}
                href={l.href}
                className={`${styles.navLink} ${pathname === l.href || (l.href === '/dashboard' && pathname === '/') ? styles.navLinkActive : ''}`}
              >
                <span className={styles.navLinkIcon}>{l.icon}</span>
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Right */}
          <div className={styles.navRight}>
            <span className={styles.navUser}>{userName}</span>
            <button onClick={signOut} className={styles.navSignOut}>
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Mobile bottom nav */}
      <nav className={styles.mobileNav}>
        <div className={styles.mobileNavInner}>
          {links.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className={`${styles.mobileNavLink} ${pathname === l.href ? styles.mobileNavLinkActive : ''}`}
            >
              <span className={styles.mobileNavIcon}>{l.icon}</span>
              <span>{l.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  )
}
