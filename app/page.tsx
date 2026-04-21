import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import NavBar from '@/components/NavBar'
import DashboardClient from '@/components/DashboardClient'

export default async function RootPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const today = new Date().toISOString().split('T')[0]

  const { data: profile } = await supabase
    .from('users').select('*').eq('auth_user_id', user.id).single()
  if (!profile) redirect('/login')

  const { data: todayLogs } = await supabase
    .from('diet_logs')
    .select('*, food_log_items(*), diet_log_items(*, recipes(name))')
    .eq('user_id', profile.user_id).eq('log_date', today).order('meal_type')

  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0]
  const { data: weeklyLogs } = await supabase
    .from('diet_logs')
    .select('log_date, total_calories, total_protein_g, total_carbs_g, total_fat_g')
    .eq('user_id', profile.user_id).gte('log_date', sevenDaysAgo).order('log_date')

  const { data: activeGoal } = await supabase
    .from('nutritional_goals').select('*').eq('user_id', profile.user_id)
    .lte('start_date', today).or(`end_date.is.null,end_date.gte.${today}`)
    .order('start_date', { ascending: false }).limit(1).single()

  const totals = (todayLogs ?? []).reduce(
    (acc, log) => ({
      calories: acc.calories + Number(log.total_calories),
      protein:  acc.protein  + Number(log.total_protein_g),
      carbs:    acc.carbs    + Number(log.total_carbs_g),
      fat:      acc.fat      + Number(log.total_fat_g),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  )

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar userName={profile.name ?? 'User'} />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6">
        <DashboardClient
          profile={profile}
          todayLogs={todayLogs ?? []}
          weeklyLogs={weeklyLogs ?? []}
          activeGoal={activeGoal ?? null}
          todayTotals={totals}
          today={today}
        />
      </main>
    </div>
  )
}

