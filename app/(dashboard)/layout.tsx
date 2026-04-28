import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import NavBar from '@/components/NavBar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // (dashboard)/page.tsx lives at "/" and renders the public landing page.
  // When no user is present we skip the auth wrapper so the landing page
  // renders without dashboard chrome.  The proxy handles auth redirects for
  // any *other* protected route before the layout even runs.
  if (!user) {
    return <>{children}</>
  }

  const { data: profile } = await supabase
    .from('users')
    .select('name')
    .eq('auth_user_id', user.id)
    .single()

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <NavBar userName={profile?.name ?? 'User'} />
      <main style={{ flex: 1 }}>
        {children}
      </main>
    </div>
  )
}
