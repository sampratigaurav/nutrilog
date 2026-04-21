'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignupPage() {
  const [form, setForm] = useState({
    name: '', email: '', password: '',
    age: '', gender: 'Male', weight_kg: '', height_cm: '',
    daily_calorie_goal: '2000', daily_protein_goal: '100',
    daily_carbs_goal: '250', daily_fat_goal: '65',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
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
    router.push('/')
    router.refresh()
  }

  const inp = "w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 py-8">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-lg">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🥗</div>
          <h1 className="text-2xl font-bold">Create your NutriLog account</h1>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input className={inp} required value={form.name} onChange={e => set('name', e.target.value)} placeholder="Arjun Sharma" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input type="email" className={inp} required value={form.email} onChange={e => set('email', e.target.value)} />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
              <input type="password" className={inp} required minLength={6} value={form.password} onChange={e => set('password', e.target.value)} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
              <input type="number" className={inp} value={form.age} onChange={e => set('age', e.target.value)} placeholder="22" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select className={inp} value={form.gender} onChange={e => set('gender', e.target.value)}>
                <option>Male</option><option>Female</option><option>Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
              <input type="number" step="0.1" className={inp} value={form.weight_kg} onChange={e => set('weight_kg', e.target.value)} placeholder="70.0" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Height (cm)</label>
              <input type="number" step="0.1" className={inp} value={form.height_cm} onChange={e => set('height_cm', e.target.value)} placeholder="175.0" />
            </div>
          </div>

          <div className="border-t pt-4">
            <p className="text-sm font-semibold text-gray-600 mb-3">Daily Nutrition Goals</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { k: 'daily_calorie_goal', label: 'Calories (kcal)', placeholder: '2000' },
                { k: 'daily_protein_goal', label: 'Protein (g)', placeholder: '100' },
                { k: 'daily_carbs_goal',   label: 'Carbs (g)',    placeholder: '250' },
                { k: 'daily_fat_goal',     label: 'Fat (g)',      placeholder: '65'  },
              ].map(({ k, label, placeholder }) => (
                <div key={k}>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                  <input type="number" className={inp} value={(form as Record<string, string>)[k]}
                    onChange={e => set(k, e.target.value)} placeholder={placeholder} />
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>
          )}

          <button type="submit" disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-60">
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account?{' '}
          <Link href="/login" className="text-green-600 font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
