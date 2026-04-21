'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatNum } from '@/lib/utils'

type GoalType = 'Weight Loss' | 'Muscle Gain' | 'Maintenance' | 'Custom'

const GOAL_PRESETS: Record<GoalType, { calories: number; protein_g: number; carbs_g: number; fat_g: number }> = {
  'Weight Loss':  { calories: 1600, protein_g: 100, carbs_g: 180, fat_g: 50 },
  'Muscle Gain':  { calories: 2800, protein_g: 160, carbs_g: 330, fat_g: 75 },
  'Maintenance':  { calories: 2000, protein_g: 110, carbs_g: 250, fat_g: 65 },
  'Custom':       { calories: 2000, protein_g: 100, carbs_g: 250, fat_g: 65 },
}

interface Goal {
  goal_id: number; goal_type: GoalType; start_date: string; end_date: string | null;
  target_calories: number; target_protein_g: number; target_carbs_g: number; target_fat_g: number;
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [goalType, setGoalType] = useState<GoalType>('Maintenance')
  const [form, setForm] = useState({ calories: 2000, protein_g: 110, carbs_g: 250, fat_g: 65 })
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [endDate, setEndDate] = useState('')
  const supabase = createClient()

  useEffect(() => { loadGoals() }, [])

  async function loadGoals() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: profile } = await supabase.from('users').select('user_id').eq('auth_user_id', user.id).single()
    if (!profile) return
    const { data } = await supabase.from('nutritional_goals').select('*').eq('user_id', profile.user_id).order('start_date', { ascending: false })
    setGoals((data as Goal[]) ?? [])
  }

  function applyPreset(type: GoalType) {
    setGoalType(type)
    setForm(GOAL_PRESETS[type])
  }

  async function handleSave() {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: profile } = await supabase.from('users').select('user_id').eq('auth_user_id', user.id).single()
    if (!profile) return
    await supabase.from('nutritional_goals').insert({
      user_id: profile.user_id,
      goal_type: goalType,
      start_date: startDate,
      end_date: endDate || null,
      target_calories: form.calories,
      target_protein_g: form.protein_g,
      target_carbs_g: form.carbs_g,
      target_fat_g: form.fat_g,
    })
    setSaving(false); setSaved(true)
    setShowForm(false)
    await loadGoals()
    setTimeout(() => setSaved(false), 2000)
  }

  const today = new Date().toISOString().split('T')[0]
  const activeGoals = goals.filter(g => g.start_date <= today && (!g.end_date || g.end_date >= today))
  const pastGoals = goals.filter(g => g.end_date && g.end_date < today)

  const GOAL_ICONS: Record<GoalType, string> = { 'Weight Loss': '⚖️', 'Muscle Gain': '💪', 'Maintenance': '🎯', 'Custom': '⚙️' }
  const GOAL_COLORS: Record<GoalType, string> = {
    'Weight Loss': 'bg-orange-50 border-orange-200',
    'Muscle Gain': 'bg-blue-50 border-blue-200',
    'Maintenance': 'bg-green-50 border-green-200',
    'Custom': 'bg-purple-50 border-purple-200',
  }

  const inp = "border border-gray-300 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-green-500"

  return (
    <div className="space-y-5 pb-20 sm:pb-0">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Goals 🎯</h1>
        {saved && <span className="text-sm text-green-600 font-medium">✓ Goal saved!</span>}
        <button onClick={() => setShowForm(f => !f)}
          className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition">
          {showForm ? 'Cancel' : '+ New Goal'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
          <h2 className="font-semibold text-gray-700">Create New Goal</h2>

          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(GOAL_PRESETS) as GoalType[]).map(type => (
              <button key={type} onClick={() => applyPreset(type)}
                className={`py-2.5 px-3 rounded-xl text-sm font-medium border-2 transition ${goalType === type ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                {GOAL_ICONS[type]} {type}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { key: 'calories', label: 'Calories (kcal)' },
              { key: 'protein_g', label: 'Protein (g)' },
              { key: 'carbs_g', label: 'Carbs (g)' },
              { key: 'fat_g', label: 'Fat (g)' },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                <input type="number" className={inp}
                  value={(form as Record<string, number>)[key]}
                  onChange={e => setForm(f => ({ ...f, [key]: parseFloat(e.target.value) || 0 }))} />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Start Date</label>
              <input type="date" className={inp} value={startDate} onChange={e => setStartDate(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">End Date (optional)</label>
              <input type="date" className={inp} value={endDate} onChange={e => setEndDate(e.target.value)} />
            </div>
          </div>

          <button onClick={handleSave} disabled={saving}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition disabled:opacity-60">
            {saving ? 'Saving…' : 'Save Goal'}
          </button>
        </div>
      )}

      {activeGoals.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Active Goals</h2>
          <div className="space-y-3">
            {activeGoals.map(g => (
              <div key={g.goal_id} className={`border rounded-2xl p-4 ${GOAL_COLORS[g.goal_type]}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{GOAL_ICONS[g.goal_type]}</span>
                  <span className="font-semibold text-gray-800">{g.goal_type}</span>
                  <span className="ml-auto text-xs text-gray-500">
                    {g.start_date} {g.end_date ? `→ ${g.end_date}` : '(ongoing)'}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: 'Calories', val: formatNum(g.target_calories, 0) + ' kcal' },
                    { label: 'Protein',  val: formatNum(g.target_protein_g) + 'g' },
                    { label: 'Carbs',    val: formatNum(g.target_carbs_g) + 'g' },
                    { label: 'Fat',      val: formatNum(g.target_fat_g) + 'g' },
                  ].map(({ label, val }) => (
                    <div key={label} className="text-center bg-white bg-opacity-60 rounded-lg p-2">
                      <div className="text-sm font-bold text-gray-800">{val}</div>
                      <div className="text-xs text-gray-500">{label}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeGoals.length === 0 && !showForm && (
        <div className="text-center py-12 text-gray-400">
          <div className="text-5xl mb-3">🎯</div>
          <p className="mb-2">No active goals yet.</p>
          <button onClick={() => setShowForm(true)} className="text-green-600 font-medium hover:underline text-sm">
            Create your first goal →
          </button>
        </div>
      )}

      {pastGoals.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Past Goals</h2>
          <div className="space-y-2">
            {pastGoals.map(g => (
              <div key={g.goal_id} className="bg-white border border-gray-100 rounded-xl p-3 flex items-center gap-3 opacity-70">
                <span>{GOAL_ICONS[g.goal_type]}</span>
                <span className="text-sm text-gray-600">{g.goal_type}</span>
                <span className="text-xs text-gray-400 ml-auto">{g.start_date} → {g.end_date}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
