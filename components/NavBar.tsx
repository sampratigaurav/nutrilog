'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

const links = [
  { href: '/',         label: 'Dashboard', icon: '📊' },
  { href: '/log',      label: 'Log Food',  icon: '➕' },
  { href: '/scan',     label: 'Scan',      icon: '📷' },
  { href: '/history',  label: 'History',   icon: '📅' },
  { href: '/goals',    label: 'Goals',     icon: '🎯' },
]

export default function NavBar({ userName }: { userName: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 flex items-center justify-between h-14">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-bold text-green-700 text-lg flex items-center gap-1">
            🥗 NutriLog
          </Link>
          <nav className="hidden sm:flex items-center gap-1">
            {links.map(l => (
              <Link key={l.href} href={l.href}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition',
                  pathname === l.href
                    ? 'bg-green-100 text-green-700'
                    : 'text-gray-600 hover:bg-gray-100'
                )}>
                {l.icon} {l.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600 hidden sm:block">Hi, {userName}</span>
          <button onClick={signOut}
            className="text-sm text-red-600 hover:text-red-700 font-medium">
            Sign out
          </button>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex z-50">
        {links.map(l => (
          <Link key={l.href} href={l.href}
            className={cn(
              'flex-1 flex flex-col items-center py-2 text-xs font-medium transition',
              pathname === l.href ? 'text-green-700' : 'text-gray-500'
            )}>
            <span className="text-lg">{l.icon}</span>
            <span>{l.label}</span>
          </Link>
        ))}
      </nav>
    </header>
  )
}
