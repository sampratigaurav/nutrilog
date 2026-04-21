'use client'
import { useState, useRef, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { formatNum } from '@/lib/utils'

interface DetectedFood {
  name: string; estimated_quantity_g: number;
  calories_per_100g: number; protein_g: number;
  carbs_g: number; fat_g: number; fiber_g: number; confidence: string;
}

type Meal = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack' | 'Dessert'
const MEALS: Meal[] = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert']

function ScanPageContent() {
  const searchParams = useSearchParams()
  const initialMode = searchParams.get('mode') === 'barcode' ? 'barcode' : 'camera'
  const [mode, setMode] = useState<'camera' | 'barcode'>(initialMode)
  const [analyzing, setAnalyzing] = useState(false)
  const [foods, setFoods] = useState<DetectedFood[]>([])
  const [mealDesc, setMealDesc] = useState('')
  const [error, setError] = useState('')
  const [meal, setMeal] = useState<Meal>('Lunch')
  const [barcode, setBarcode] = useState('')
  const [barcodeResult, setBarcodeResult] = useState<Record<string, unknown> | null>(null)
  const [logging, setLogging] = useState(false)
  const [logDone, setLogDone] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [cameraActive, setCameraActive] = useState(false)
  const router = useRouter()
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    return () => { streamRef.current?.getTracks().forEach(t => t.stop()) }
  }, [])

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      streamRef.current = stream
      if (videoRef.current) { videoRef.current.srcObject = stream; setCameraActive(true) }
    } catch { setError('Camera access denied. Please use the upload option.') }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach(t => t.stop())
    setCameraActive(false)
  }

  function captureFromCamera() {
    const canvas = document.createElement('canvas')
    const video = videoRef.current!
    canvas.width = video.videoWidth; canvas.height = video.videoHeight
    canvas.getContext('2d')!.drawImage(video, 0, 0)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
    setPreview(dataUrl)
    stopCamera()
    analyzeImage(dataUrl.split(',')[1], 'image/jpeg')
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async (ev) => {
      const dataUrl = ev.target?.result as string
      setPreview(dataUrl)
      const base64 = dataUrl.split(',')[1]
      const mimeType = file.type
      await analyzeImage(base64, mimeType)
    }
    reader.readAsDataURL(file)
  }

  async function analyzeImage(base64: string, mimeType: string) {
    setAnalyzing(true); setError(''); setFoods([])
    try {
      const res = await fetch('/api/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64, mimeType }),
      })
      const data = await res.json()
      if (data.error) { setError(data.error); return }
      setFoods(data.foods ?? [])
      setMealDesc(data.meal_description ?? '')
    } catch { setError('Analysis failed. Please try again.') }
    finally { setAnalyzing(false) }
  }

  async function lookupBarcode() {
    if (!barcode.trim()) return
    setAnalyzing(true); setError(''); setBarcodeResult(null)
    try {
      const res = await fetch(`/api/barcode?code=${encodeURIComponent(barcode)}`)
      const data = await res.json()
      if (!data.found) { setError('Product not found. Try searching manually.'); return }
      setBarcodeResult(data.product)
    } catch { setError('Lookup failed.') }
    finally { setAnalyzing(false) }
  }

  async function logDetectedFoods() {
    setLogging(true)
    const foodsPayload = foods.map(f => ({
      name: f.name, source: 'ai',
      quantity_g: f.estimated_quantity_g,
      calories: f.calories_per_100g * f.estimated_quantity_g / 100,
      protein_g: f.protein_g * f.estimated_quantity_g / 100,
      carbs_g: f.carbs_g * f.estimated_quantity_g / 100,
      fat_g: f.fat_g * f.estimated_quantity_g / 100,
      fiber_g: f.fiber_g * f.estimated_quantity_g / 100,
    }))
    await fetch('/api/log-food', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        meal_type: meal,
        log_date: new Date().toISOString().split('T')[0],
        foods: foodsPayload,
      }),
    })
    setLogging(false); setLogDone(true)
    setTimeout(() => router.push('/'), 1500)
  }

  async function logBarcodeProduct() {
    if (!barcodeResult) return
    setLogging(true)
    const p = barcodeResult as Record<string, unknown>
    await fetch('/api/log-food', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        meal_type: meal,
        log_date: new Date().toISOString().split('T')[0],
        foods: [{
          name: `${p.name}${p.brand ? ` (${p.brand})` : ''}`,
          source: p.source,
          quantity_g: p.serving_size,
          calories: Number(p.calories) * Number(p.serving_size) / 100,
          protein_g: Number(p.protein_g) * Number(p.serving_size) / 100,
          carbs_g: Number(p.carbs_g) * Number(p.serving_size) / 100,
          fat_g: Number(p.fat_g) * Number(p.serving_size) / 100,
          fiber_g: Number(p.fiber_g) * Number(p.serving_size) / 100,
        }],
      }),
    })
    setLogging(false); setLogDone(true)
    setTimeout(() => router.push('/'), 1500)
  }

  const MEAL_EMOJI: Record<string, string> = { Breakfast:'🌅',Lunch:'☀️',Dinner:'🌙',Snack:'🍎',Dessert:'🍰' }

  return (
    <div className="space-y-5 pb-24 sm:pb-0">
      <h1 className="text-xl font-bold">Scan Food 📷</h1>

      {/* Mode tabs */}
      <div className="flex gap-2">
        {(['camera', 'barcode'] as const).map(m => (
          <button key={m} onClick={() => { setMode(m); setFoods([]); setBarcodeResult(null); setError(''); setPreview(null); stopCamera() }}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition ${mode === m ? 'bg-green-600 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
            {m === 'camera' ? '📷 Photo Analysis' : '🔍 Barcode Scan'}
          </button>
        ))}
      </div>

      {/* Meal selector */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {MEALS.map(m => (
          <button key={m} onClick={() => setMeal(m)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition ${meal === m ? 'bg-green-600 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
            {MEAL_EMOJI[m]} {m}
          </button>
        ))}
      </div>

      {mode === 'camera' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-4">
          {!cameraActive && !preview && (
            <div className="space-y-3">
              <button onClick={startCamera}
                className="w-full border-2 border-dashed border-green-300 rounded-xl py-8 text-center hover:bg-green-50 transition">
                <div className="text-4xl mb-2">📷</div>
                <p className="text-sm font-medium text-green-700">Open Camera</p>
                <p className="text-xs text-gray-400 mt-1">Uses your device camera</p>
              </button>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400">or</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
              <button onClick={() => fileRef.current?.click()}
                className="w-full bg-gray-100 hover:bg-gray-200 rounded-xl py-4 text-sm font-medium text-gray-700 transition">
                📁 Upload a photo
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
            </div>
          )}

          {cameraActive && (
            <div className="space-y-3">
              <video ref={videoRef} autoPlay playsInline className="w-full rounded-xl bg-black aspect-video object-cover" />
              <div className="flex gap-2">
                <button onClick={captureFromCamera}
                  className="flex-1 bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition">
                  📸 Capture & Analyze
                </button>
                <button onClick={stopCamera}
                  className="px-4 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition">
                  ✕
                </button>
              </div>
            </div>
          )}

          {preview && !cameraActive && (
            <div>
              <img src={preview} alt="Food preview" className="w-full rounded-xl object-cover max-h-64" />
              <button onClick={() => { setPreview(null); setFoods([]); setError('') }}
                className="mt-2 text-sm text-gray-500 hover:text-gray-700 underline">
                Try different photo
              </button>
            </div>
          )}

          {analyzing && (
            <div className="text-center py-6">
              <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-gray-500">Analyzing your food with AI…</p>
            </div>
          )}

          {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>}

          {foods.length > 0 && (
            <div className="space-y-3">
              {mealDesc && <p className="text-sm text-gray-600 italic">🤖 {mealDesc}</p>}
              <h3 className="font-semibold text-gray-700">Detected Foods</h3>
              {foods.map((f, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-800">{f.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${f.confidence === 'high' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {f.confidence}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    ~{f.estimated_quantity_g}g · {formatNum(f.calories_per_100g * f.estimated_quantity_g / 100, 0)} kcal ·
                    P:{formatNum(f.protein_g * f.estimated_quantity_g / 100)}g ·
                    C:{formatNum(f.carbs_g * f.estimated_quantity_g / 100)}g ·
                    F:{formatNum(f.fat_g * f.estimated_quantity_g / 100)}g
                  </p>
                </div>
              ))}
              <div className="bg-green-50 rounded-xl p-3 text-sm font-medium text-green-800">
                Total: {formatNum(foods.reduce((s, f) => s + f.calories_per_100g * f.estimated_quantity_g / 100, 0), 0)} kcal
              </div>
              <button onClick={logDetectedFoods} disabled={logging || logDone}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition disabled:opacity-60">
                {logDone ? '✓ Logged!' : logging ? 'Logging…' : `Log to ${MEAL_EMOJI[meal]} ${meal}`}
              </button>
            </div>
          )}
        </div>
      )}

      {mode === 'barcode' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-4">
          <div className="text-center py-4">
            <div className="text-5xl mb-3">🔍</div>
            <p className="text-sm text-gray-500">Enter the barcode number from the product packaging</p>
          </div>
          <div className="flex gap-2">
            <input
              value={barcode}
              onChange={e => setBarcode(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && lookupBarcode()}
              placeholder="Enter barcode number (e.g. 8901058000015)"
              className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button onClick={lookupBarcode} disabled={analyzing}
              className="bg-green-600 text-white px-5 rounded-xl font-medium hover:bg-green-700 transition disabled:opacity-60">
              {analyzing ? '…' : 'Look up'}
            </button>
          </div>

          {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>}

          {barcodeResult && (
            <div className="space-y-3">
              <div className="bg-gray-50 rounded-xl p-4">
                {(barcodeResult.image_url as string) && (
                  <img src={barcodeResult.image_url as string} alt="Product" className="w-24 h-24 object-contain mx-auto mb-3 rounded-lg" />
                )}
                <h3 className="font-semibold text-gray-800">{barcodeResult.name as string}</h3>
                {(barcodeResult.brand as string) && <p className="text-sm text-gray-500">{barcodeResult.brand as string}</p>}
                <div className="grid grid-cols-4 gap-2 mt-3">
                  {[
                    { label: 'Calories', val: formatNum(Number(barcodeResult.calories), 0) + ' kcal' },
                    { label: 'Protein',  val: formatNum(Number(barcodeResult.protein_g)) + 'g' },
                    { label: 'Carbs',    val: formatNum(Number(barcodeResult.carbs_g))   + 'g' },
                    { label: 'Fat',      val: formatNum(Number(barcodeResult.fat_g))     + 'g' },
                  ].map(({ label, val }) => (
                    <div key={label} className="text-center bg-white rounded-lg p-2">
                      <div className="text-sm font-bold text-gray-800">{val}</div>
                      <div className="text-xs text-gray-400">{label}</div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-2">Per {barcodeResult.serving_size as number}g serving</p>
              </div>
              <button onClick={logBarcodeProduct} disabled={logging || logDone}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition disabled:opacity-60">
                {logDone ? '✓ Logged!' : logging ? 'Logging…' : `Log to ${MEAL_EMOJI[meal]} ${meal}`}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function ScanPage() {
  return (
    <Suspense fallback={<div className="text-center py-10 text-gray-400">Loading…</div>}>
      <ScanPageContent />
    </Suspense>
  )
}
