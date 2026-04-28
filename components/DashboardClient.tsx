'use client'
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from 'recharts'
import { formatNum, getMealEmoji } from '@/lib/utils'
import Link from 'next/link'
import styles from './dashboard.module.css'

interface Props {
  profile:     Record<string, unknown>
  todayLogs:   Record<string, unknown>[]
  weeklyLogs:  Record<string, unknown>[]
  activeGoal:  Record<string, unknown> | null
  todayTotals: { calories: number; protein: number; carbs: number; fat: number }
  today:       string
}

/* ── Calorie ring ── */
function CalorieRing({ value, goal }: { value: number; goal: number }) {
  const pct  = Math.min(value / goal, 1)
  const r    = 52
  const circ = 2 * Math.PI * r
  const over = value > goal
  return (
    <div className={styles.ringCenter}>
      <svg width="144" height="144" viewBox="0 0 144 144" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="72" cy="72" r={r} fill="none" stroke="rgba(26,26,46,0.07)" strokeWidth="10" />
        <circle cx="72" cy="72" r={r} fill="none"
          stroke={over ? '#dc2626' : '#22c55e'}
          strokeWidth="10" strokeLinecap="round"
          strokeDasharray={`${circ * pct} ${circ}`}
          style={{ transition: 'stroke-dasharray .6s cubic-bezier(.2,.9,.3,1)' }}
        />
      </svg>
      <div className={styles.ringLabel}>
        <span className={`${styles.ringVal} ${over ? styles.ringValOver : ''}`}>
          {Math.round(value)}
        </span>
        <span className={styles.ringSub}>of {Math.round(goal)} kcal</span>
      </div>
    </div>
  )
}

/* ── Macro progress bar ── */
function MacroBar({
  label, value, goal, color,
}: { label: string; value: number; goal: number; color: string }) {
  const pct = goal > 0 ? Math.min((value / goal) * 100, 100) : 0
  return (
    <div className={styles.macroRow}>
      <div className={styles.macroHead}>
        <span className={styles.macroName}>{label}</span>
        <span className={styles.macroVal}>{formatNum(value)}g / {formatNum(goal)}g</span>
      </div>
      <div className={styles.track}>
        <div className={styles.fill} style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  )
}

/* ── Custom chart tooltip ── */
function ChartTip({ active, payload, label }: Record<string, unknown>) {
  if (!active || !(payload as unknown[])?.length) return null
  const data = (payload as Record<string, unknown>[])[0]
  return (
    <div style={{
      background: 'rgba(245,239,228,0.95)', border: '1px solid rgba(26,26,46,0.10)',
      borderRadius: 12, padding: '10px 14px', backdropFilter: 'blur(12px)',
      fontFamily: 'var(--font-jetbrains-mono, monospace)', fontSize: 11,
    }}>
      <div style={{ color: '#64748b', marginBottom: 4, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
        {String(label)}
      </div>
      <div style={{ fontWeight: 700, fontSize: 16, color: '#16a34a' }}>
        {Math.round(Number(data.value))} kcal
      </div>
    </div>
  )
}

/* ── Main component ── */
export default function DashboardClient({
  profile, todayLogs, weeklyLogs, activeGoal, todayTotals, today,
}: Props) {
  const calGoal  = Number(activeGoal?.target_calories  ?? profile.daily_calorie_goal ?? 2000)
  const proGoal  = Number(activeGoal?.target_protein_g ?? profile.daily_protein_goal ?? 100)
  const carbGoal = Number(activeGoal?.target_carbs_g   ?? profile.daily_carbs_goal   ?? 250)
  const fatGoal  = Number(activeGoal?.target_fat_g     ?? profile.daily_fat_goal     ?? 65)

  const chartData = weeklyLogs.map((l: Record<string, unknown>) => ({
    date:     String(l.log_date).slice(5),
    calories: Number(l.total_calories),
  }))

  const meals = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert']
  const logByMeal: Record<string, Record<string, unknown>[]> = {}
  meals.forEach(m => {
    const found = todayLogs.filter(l => l.meal_type === m)
    if (found.length) logByMeal[m] = found
  })

  const firstName = String(profile.name ?? '').split(' ')[0] || 'there'
  const remaining = Math.max(0, calGoal - todayTotals.calories)

  return (
    <div className={styles.shell}>
      <div className={styles.grain} />
      <div className={styles.pageBg} />
      <div className={styles.watermark}>भोजन</div>

      <div className={styles.page}>

        {/* ── Header ── */}
        <div className={`${styles.header} ${styles.fadeUp} ${styles.d1}`}>
          <div>
            <div className={styles.eyebrow}>Today&apos;s overview</div>
            <h1 className={styles.greeting}>
              {getGreeting()},{' '}
              <span className={styles.greetingItalic}>{firstName}.</span>
            </h1>
            <p className={styles.dateStr}>{formatDate(today)}</p>
          </div>
          <Link href="/log" className={styles.logBtn}>
            + Log Food
          </Link>
        </div>

        <div className={styles.grid}>

          {/* ── Calorie card ── */}
          <div className={`${styles.card} ${styles.fadeUp} ${styles.d2}`}>
            <p className={styles.cardTitle}>Calories today</p>
            <div className={styles.ringWrap}>
              <CalorieRing value={todayTotals.calories} goal={calGoal} />
              <div className={styles.macros}>
                <MacroBar label="Protein" value={todayTotals.protein} goal={proGoal}  color="#3b82f6" />
                <MacroBar label="Carbs"   value={todayTotals.carbs}   goal={carbGoal} color="#f59e0b" />
                <MacroBar label="Fat"     value={todayTotals.fat}     goal={fatGoal}  color="#f43f5e" />
              </div>
            </div>
            <div className={styles.statsRow}>
              <div className={styles.statCell}>
                <div className={`${styles.statNum} ${styles.statNumGreen}`}>{Math.round(remaining)}</div>
                <div className={styles.statLbl}>Remaining</div>
              </div>
              <div className={styles.statCell}>
                <div className={`${styles.statNum} ${styles.statNumInk}`}>{Math.round(todayTotals.calories)}</div>
                <div className={styles.statLbl}>Consumed</div>
              </div>
              <div className={styles.statCell}>
                <div className={`${styles.statNum} ${styles.statNumMuted}`}>{Math.round(calGoal)}</div>
                <div className={styles.statLbl}>Goal</div>
              </div>
            </div>
          </div>

          {/* ── 7-day chart ── */}
          <div className={`${styles.card} ${styles.fadeUp} ${styles.d3}`}>
            <p className={styles.cardTitle}>7-day calorie trend</p>
            <div className={styles.chartWrap}>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,26,46,0.06)" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: '#94a3b8', fontFamily: 'var(--font-jetbrains-mono, monospace)' }}
                    axisLine={false} tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#94a3b8', fontFamily: 'var(--font-jetbrains-mono, monospace)' }}
                    axisLine={false} tickLine={false}
                  />
                  <Tooltip content={<ChartTip />} cursor={{ stroke: 'rgba(34,197,94,0.2)', strokeWidth: 2 }} />
                  <Line
                    type="monotone" dataKey="calories" stroke="#22c55e" strokeWidth={2.5}
                    dot={{ r: 4, fill: '#22c55e', strokeWidth: 0 }}
                    activeDot={{ r: 6, fill: '#16a34a', stroke: '#f5efe4', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Macro summary pills */}
            <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
              {[
                { label: 'Protein', val: todayTotals.protein, color: '#3b82f6' },
                { label: 'Carbs',   val: todayTotals.carbs,   color: '#f59e0b' },
                { label: 'Fat',     val: todayTotals.fat,     color: '#f43f5e' },
              ].map(m => (
                <div key={m.label} style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: 'rgba(26,26,46,0.05)', borderRadius: 999,
                  padding: '5px 12px', fontSize: 12, fontWeight: 500,
                }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: m.color, flexShrink: 0 }} />
                  <span style={{ fontFamily: 'var(--font-jetbrains-mono,monospace)', fontSize: 11, fontWeight: 700 }}>
                    {Math.round(m.val)}g
                  </span>
                  <span style={{ color: '#64748b' }}>{m.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Today's meals ── */}
          <div className={`${styles.card} ${styles.gridFull} ${styles.fadeUp} ${styles.d4}`}>
            <p className={styles.cardTitle}>Today&apos;s meals</p>
            {Object.keys(logByMeal).length === 0 ? (
              <div className={styles.empty}>
                <span className={styles.emptyIcon}>🍽</span>
                <p className={styles.emptyText}>No meals logged today yet.</p>
                <Link href="/log" className={styles.emptyLink}>Log your first meal →</Link>
              </div>
            ) : (
              <div className={styles.mealList}>
                {Object.entries(logByMeal).map(([meal, logs]) => {
                  const kcal = Math.round(logs.reduce((s, l) => s + Number(l.total_calories), 0))
                  const items = logs.flatMap((log: Record<string, unknown>) => [
                    ...((log.diet_log_items as Record<string, unknown>[]) ?? []).map((i: Record<string, unknown>) =>
                      String((i.recipes as Record<string, unknown>)?.name ?? 'Recipe')
                    ),
                    ...((log.food_log_items as Record<string, unknown>[]) ?? []).map((i: Record<string, unknown>) =>
                      String(i.food_name)
                    ),
                  ])
                  return (
                    <div key={meal} className={styles.mealItem}>
                      <div className={styles.mealHead}>
                        <span className={styles.mealName}>
                          {getMealEmoji(meal)} {meal}
                        </span>
                        <span className={styles.mealKcal}>{kcal} kcal</span>
                      </div>
                      {items.length > 0 && (
                        <div className={styles.mealItems}>
                          {items.map((name, i) => (
                            <span key={i} className={styles.mealTag}>{name}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* ── Active goal badge ── */}
          {activeGoal && (
            <div className={`${styles.gridFull} ${styles.fadeUp} ${styles.d5}`}>
              <div className={styles.goalBadge}>
                <div className={styles.goalIcon}>🎯</div>
                <div className={styles.goalText}>
                  <p className={styles.goalTitle}>{String(activeGoal.goal_type)} goal active</p>
                  <p className={styles.goalSub}>
                    {Math.round(Number(activeGoal.target_calories))} kcal · {Math.round(Number(activeGoal.target_protein_g))}g protein · {Math.round(Number(activeGoal.target_carbs_g))}g carbs
                  </p>
                </div>
              </div>
            </div>
          )}

      </div>
    </div>
  </div>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function formatDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}
