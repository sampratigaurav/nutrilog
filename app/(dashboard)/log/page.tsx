'use client'
import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { formatNum } from '@/lib/utils'

type Meal = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack' | 'Dessert'

interface FoodItem {
  id: string; name: string; source: string; externalId?: string;
  calories: number; protein_g: number; carbs_g: number; fat_g: number; fiber_g: number;
  servingSize: number; unit: string; isRecipe?: boolean; recipeId?: number;
  micronutrients?: Record<string, unknown>;
  mealType?: string; cuisineType?: string;
}

interface CartItem extends FoodItem {
  quantity_g: number;
  servings?: number;
}

const MEALS: Meal[] = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert']
const MEAL_EMOJI: Record<Meal, string> = { Breakfast: '🌅', Lunch: '☀️', Dinner: '🌙', Snack: '🍎', Dessert: '🍰' }

export default function LogFoodPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<FoodItem[]>([])
  const [searching, setSearching] = useState(false)
  const [cart, setCart] = useState<CartItem[]>([])
  const [meal, setMeal] = useState<Meal>('Lunch')
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0])
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [qtyMap, setQtyMap] = useState<Record<string, number>>({})
  const router = useRouter()

  const search = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); return }
    setSearching(true)
    const res = await fetch(`/api/food-search?q=${encodeURIComponent(q)}`)
    const data = await res.json()
    setResults(data.results ?? [])
    setSearching(false)
  }, [])

  function addToCart(item: FoodItem) {
    const qty = qtyMap[item.id] ?? (item.isRecipe ? 1 : 100)
    const factor = item.isRecipe ? (qty) : (qty / 100)
    setCart(c => [...c, {
      ...item,
      quantity_g: qty,
      servings: item.isRecipe ? qty : undefined,
      calories: item.calories * factor,
      protein_g: item.protein_g * factor,
      carbs_g: item.carbs_g * factor,
      fat_g: item.fat_g * factor,
      fiber_g: item.fiber_g * factor,
    }])
    setResults([])
    setQuery('')
  }

  function removeFromCart(id: string) {
    setCart(c => c.filter(i => i.id !== id))
  }

  const cartTotals = cart.reduce(
    (a, i) => ({ cal: a.cal + i.calories, pro: a.pro + i.protein_g, carb: a.carb + i.carbs_g, fat: a.fat + i.fat_g }),
    { cal: 0, pro: 0, carb: 0, fat: 0 }
  )

  async function handleLog() {
    if (cart.length === 0) return
    setSubmitting(true)
    const foods = cart.map(item => ({
      name: item.name,
      source: item.source,
      externalId: item.externalId,
      quantity_g: item.quantity_g,
      servings: item.servings,
      calories: item.calories,
      protein_g: item.protein_g,
      carbs_g: item.carbs_g,
      fat_g: item.fat_g,
      fiber_g: item.fiber_g,
      micronutrients: item.micronutrients ?? {},
      isRecipe: item.isRecipe,
      recipeId: item.isRecipe ? parseInt(item.externalId ?? '0') : undefined,
    }))
    await fetch('/api/log-food', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ meal_type: meal, log_date: logDate, foods }),
    })
    setSubmitting(false)
    setSubmitted(true)
    setCart([])
    setTimeout(() => { setSubmitted(false); router.push('/') }, 1800)
  }

  const sourceColor: Record<string, string> = {
    own_db: 'bg-green-100 text-green-700',
    recipe: 'bg-purple-100 text-purple-700',
    usda: 'bg-blue-100 text-blue-700',
    openfoodfacts: 'bg-orange-100 text-orange-700',
  }
  const sourceLabel: Record<string, string> = {
    own_db: 'DB', recipe: 'Recipe', usda: 'USDA', openfoodfacts: 'OFF'
  }

  return (
    <div className="space-y-5 pb-24 sm:pb-0">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Log Food ➕</h1>
        <div className="flex items-center gap-2">
          <input type="date" value={logDate} onChange={e => setLogDate(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm" />
        </div>
      </div>

      {/* Meal selector */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {MEALS.map(m => (
          <button key={m} onClick={() => setMeal(m)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition ${meal === m ? 'bg-green-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            {MEAL_EMOJI[m]} {m}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="relative">
          <input
            value={query}
            onChange={e => { setQuery(e.target.value); search(e.target.value) }}
            placeholder="Search any food — rice, dal, chicken, biscuit…"
            className="w-full border border-gray-300 rounded-xl px-4 py-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          {searching && (
            <div className="absolute right-3 top-3 w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
          )}
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div className="mt-2 border border-gray-100 rounded-xl overflow-hidden divide-y divide-gray-50">
            {results.map(item => (
              <div key={item.id} className="flex items-center gap-3 p-3 hover:bg-gray-50">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-gray-900 truncate">{item.name}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${sourceColor[item.source] ?? 'bg-gray-100 text-gray-600'}`}>
                      {sourceLabel[item.source] ?? item.source}
                    </span>
                  </div>
                  {!item.isRecipe && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      {formatNum(item.calories, 0)} kcal · {formatNum(item.protein_g)}g protein / 100g
                    </p>
                  )}
                  {item.isRecipe && (
                    <p className="text-xs text-gray-400 mt-0.5">{item.mealType} · {item.cuisineType}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <input
                    type="number"
                    min="1"
                    defaultValue={item.isRecipe ? 1 : 100}
                    onChange={e => setQtyMap(m => ({ ...m, [item.id]: parseFloat(e.target.value) || (item.isRecipe ? 1 : 100) }))}
                    className="w-16 border border-gray-200 rounded-lg px-2 py-1 text-sm text-center"
                  />
                  <span className="text-xs text-gray-400">{item.isRecipe ? 'srv' : 'g'}</span>
                  <button onClick={() => addToCart(item)}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition">
                    Add
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cart */}
      {cart.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <h2 className="font-semibold text-gray-700 mb-3">Selected ({MEAL_EMOJI[meal]} {meal})</h2>
          <div className="space-y-2 mb-4">
            {cart.map(item => (
              <div key={item.id + Math.random()} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{item.name}</p>
                  <p className="text-xs text-gray-500">
                    {item.isRecipe ? `${item.quantity_g} serving(s)` : `${item.quantity_g}g`} ·{' '}
                    {formatNum(item.calories, 0)} kcal · P:{formatNum(item.protein_g)}g · C:{formatNum(item.carbs_g)}g · F:{formatNum(item.fat_g)}g
                  </p>
                </div>
                <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-600 text-lg">✕</button>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="grid grid-cols-4 gap-2 bg-green-50 rounded-xl p-3 mb-4">
            {[
              { label: 'Calories', val: formatNum(cartTotals.cal, 0) + ' kcal' },
              { label: 'Protein',  val: formatNum(cartTotals.pro) + 'g' },
              { label: 'Carbs',    val: formatNum(cartTotals.carb) + 'g' },
              { label: 'Fat',      val: formatNum(cartTotals.fat) + 'g' },
            ].map(({ label, val }) => (
              <div key={label} className="text-center">
                <div className="text-sm font-bold text-green-800">{val}</div>
                <div className="text-xs text-green-600">{label}</div>
              </div>
            ))}
          </div>

          <button onClick={handleLog} disabled={submitting || submitted}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition disabled:opacity-60 text-sm">
            {submitted ? '✓ Logged!' : submitting ? 'Logging…' : `Log ${MEAL_EMOJI[meal]} ${meal}`}
          </button>
        </div>
      )}

      {/* Quick access links */}
      <div className="grid grid-cols-2 gap-3">
        <a href="/scan"
          className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-3 shadow-sm hover:shadow-md transition">
          <span className="text-3xl">📷</span>
          <div>
            <p className="font-semibold text-gray-800">Photo Scan</p>
            <p className="text-xs text-gray-500">Take a pic of your meal</p>
          </div>
        </a>
        <a href="/scan?mode=barcode"
          className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-3 shadow-sm hover:shadow-md transition">
          <span className="text-3xl">🔍</span>
          <div>
            <p className="font-semibold text-gray-800">Barcode Scan</p>
            <p className="text-xs text-gray-500">Packaged food scanner</p>
          </div>
        </a>
      </div>
    </div>
  )
}
