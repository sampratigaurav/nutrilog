'use client'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { formatNum, getMealEmoji } from '@/lib/utils'
import Link from 'next/link'

interface Props {
  profile: Record<string, unknown>
  todayLogs: Record<string, unknown>[]
  weeklyLogs: Record<string, unknown>[]
  activeGoal: Record<string, unknown> | null
  todayTotals: { calories: number; protein: number; carbs: number; fat: number }
  today: string
}

function MacroBar({ label, value, goal, color }: { label: string; value: number; goal: number; color: string }) {
  const pct = Math.min((value / goal) * 100, 100)
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="font-medium text-gray-700">{label}</span>
        <span className="text-gray-500">{formatNum(value)}g / {formatNum(goal)}g</span>
      </div>
      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function CalorieRing({ value, goal }: { value: number; goal: number }) {
  const pct = Math.min(value / goal, 1)
  const r = 54
  const circ = 2 * Math.PI * r
  const dash = circ * pct
  const over = value > goal
  return (
    <div className="relative flex items-center justify-center w-40 h-40">
      <svg width="160" height="160" viewBox="0 0 160 160" className="-rotate-90">
        <circle cx="80" cy="80" r={r} fill="none" stroke="#f0fdf4" strokeWidth="14" />
        <circle cx="80" cy="80" r={r} fill="none"
          stroke={over ? '#ef4444' : '#22c55e'}
          strokeWidth="14" strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`} />
      </svg>
      <div className="absolute text-center">
        <div className={`text-2xl font-bold ${over ? 'text-red-500' : 'text-green-700'}`}>
          {Math.round(value)}
        </div>
        <div className="text-xs text-gray-500">of {Math.round(goal as number)} kcal</div>
      </div>
    </div>
  )
}

export default function DashboardClient({ profile, todayLogs, weeklyLogs, activeGoal, todayTotals, today }: Props) {
  const calGoal  = Number(activeGoal?.target_calories  ?? profile.daily_calorie_goal ?? 2000)
  const proGoal  = Number(activeGoal?.target_protein_g ?? profile.daily_protein_goal ?? 100)
  const carbGoal = Number(activeGoal?.target_carbs_g   ?? profile.daily_carbs_goal   ?? 250)
  const fatGoal  = Number(activeGoal?.target_fat_g     ?? profile.daily_fat_goal     ?? 65)

  const chartData = weeklyLogs.map((l: Record<string, unknown>) => ({
    date: String(l.log_date).slice(5),
    calories: Number(l.total_calories),
    protein: Number(l.total_protein_g),
  }))

  const meals = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert']
  const logByMeal: Record<string, Record<string, unknown>[]> = {}
  meals.forEach(m => {
    const found = todayLogs.filter(l => l.meal_type === m)
    if (found.length) logByMeal[m] = found
  })

  return (
    <div className="space-y-6 pb-20 sm:pb-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Good {getGreeting()}, {String(profile.name).split(' ')[0]}! 👋
          </h1>
          <p className="text-sm text-gray-500">{formatDate(today)}</p>
        </div>
        <Link href="/log"
          className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition">
          + Log Food
        </Link>
      </div>

      {/* Calorie overview */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-700 mb-4">Today&apos;s Calories</h2>
        <div className="flex items-center gap-8">
          <CalorieRing value={todayTotals.calories} goal={calGoal} />
          <div className="flex-1 space-y-3">
            <MacroBar label="Protein"  value={todayTotals.protein} goal={proGoal}  color="bg-blue-500" />
            <MacroBar label="Carbs"    value={todayTotals.carbs}   goal={carbGoal} color="bg-amber-500" />
            <MacroBar label="Fat"      value={todayTotals.fat}     goal={fatGoal}  color="bg-rose-400" />
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3 pt-4 border-t border-gray-100">
          {[
            { label: 'Remaining', val: Math.max(0, calGoal - todayTotals.calories), color: 'text-green-700' },
            { label: 'Consumed',  val: todayTotals.calories, color: 'text-gray-900' },
            { label: 'Goal',      val: calGoal, color: 'text-gray-500' },
          ].map(({ label, val, color }) => (
            <div key={label} className="text-center">
              <div className={`text-lg font-bold ${color}`}>{Math.round(val)}</div>
              <div className="text-xs text-gray-400">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly chart */}
      {chartData.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-700 mb-4">7-Day Calorie Trend</h2>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="calories" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} name="Calories" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Today's meals */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-700 mb-4">Today&apos;s Meals</h2>
        {Object.keys(logByMeal).length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <div className="text-4xl mb-2">🍽️</div>
            <p>No meals logged today.</p>
            <Link href="/log" className="text-green-600 text-sm font-medium hover:underline">Log your first meal →</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {Object.entries(logByMeal).map(([meal, logs]) => (
              <div key={meal} className="border border-gray-100 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-800">{getMealEmoji(meal)} {meal}</span>
                  <span className="text-sm text-green-700 font-semibold">
                    {Math.round(logs.reduce((s, l) => s + Number(l.total_calories), 0))} kcal
                  </span>
                </div>
                {logs.map((log: Record<string, unknown>) => {
                  const items = [
                    ...((log.diet_log_items as Record<string, unknown>[]) ?? []).map((i: Record<string, unknown>) => ({
                      name: String((i.recipes as Record<string, unknown>)?.name ?? 'Recipe'),
                    })),
                    ...((log.food_log_items as Record<string, unknown>[]) ?? []).map((i: Record<string, unknown>) => ({
                      name: String(i.food_name),
                    })),
                  ]
                  return items.map((item, idx) => (
                    <div key={idx} className="text-sm text-gray-500 ml-2">• {item.name}</div>
                  ))
                })}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Active goal badge */}
      {activeGoal && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
          <span className="text-2xl">🎯</span>
          <div>
            <p className="font-semibold text-green-800">{String(activeGoal.goal_type)} Goal Active</p>
            <p className="text-sm text-green-600">
              Target: {Math.round(Number(activeGoal.target_calories))} kcal · {Math.round(Number(activeGoal.target_protein_g))}g protein
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}

function formatDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })
}
