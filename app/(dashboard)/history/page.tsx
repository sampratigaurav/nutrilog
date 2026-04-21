import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { formatNum, getMealEmoji } from '@/lib/utils'

export default async function HistoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('users').select('user_id').eq('auth_user_id', user.id).single()
  if (!profile) redirect('/login')

  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0]

  const { data: logs } = await supabase
    .from('diet_logs')
    .select('*, food_log_items(food_name, calories, quantity_g), diet_log_items(servings, recipes(name))')
    .eq('user_id', profile.user_id)
    .gte('log_date', thirtyDaysAgo)
    .order('log_date', { ascending: false })
    .order('meal_type')

  // Group by date
  const byDate: Record<string, typeof logs> = {}
  for (const log of logs ?? []) {
    const d = log.log_date as string
    if (!byDate[d]) byDate[d] = []
    byDate[d]!.push(log)
  }

  return (
    <div className="space-y-5 pb-20 sm:pb-0">
      <h1 className="text-xl font-bold">History 📅</h1>
      <p className="text-sm text-gray-500">Last 30 days of logged meals</p>

      {Object.keys(byDate).length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-3">📋</div>
          <p>No meals logged yet. <a href="/log" className="text-green-600 underline">Log your first meal</a></p>
        </div>
      )}

      {Object.entries(byDate).map(([date, dateLogs]) => {
        const dayTotal = (dateLogs ?? []).reduce((s, l) => s + Number(l.total_calories), 0)
        return (
          <div key={date} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
              <span className="font-semibold text-gray-800">{formatDate(date)}</span>
              <span className="text-sm font-bold text-green-700">{Math.round(dayTotal)} kcal</span>
            </div>
            <div className="divide-y divide-gray-50">
              {(dateLogs ?? []).map(log => {
                const items = [
                  ...((log.diet_log_items as Record<string, unknown>[]) ?? []).map((i: Record<string, unknown>) => ({
                    name: String((i.recipes as Record<string, unknown>)?.name ?? ''),
                    note: `${formatNum(Number(i.servings), 1)} srv`
                  })),
                  ...((log.food_log_items as Record<string, unknown>[]) ?? []).map((i: Record<string, unknown>) => ({
                    name: String(i.food_name),
                    note: `${formatNum(Number(i.quantity_g), 0)}g`
                  })),
                ]
                return (
                  <div key={log.log_id as number} className="px-4 py-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">
                        {getMealEmoji(log.meal_type as string)} {log.meal_type}
                      </span>
                      <span className="text-xs text-gray-500">
                        {Math.round(Number(log.total_calories))} kcal · P:{formatNum(Number(log.total_protein_g))}g · C:{formatNum(Number(log.total_carbs_g))}g · F:{formatNum(Number(log.total_fat_g))}g
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {items.map((item, i) => (
                        <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                          {item.name} · {item.note}
                        </span>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function formatDate(d: string) {
  const date = new Date(d + 'T00:00:00')
  const today = new Date(); today.setHours(0,0,0,0)
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1)
  if (date.getTime() === today.getTime()) return 'Today'
  if (date.getTime() === yesterday.getTime()) return 'Yesterday'
  return date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })
}
