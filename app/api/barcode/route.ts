import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const barcode = request.nextUrl.searchParams.get('code')
  if (!barcode) return NextResponse.json({ error: 'No barcode' }, { status: 400 })

  try {
    // Try Open Food Facts (works well for Indian packaged foods)
    const res = await fetch(
      `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`
    )
    const data = await res.json()

    if (data.status !== 1 || !data.product) {
      // Try USDA if barcode not found in OFF
      const usdaKey = process.env.USDA_API_KEY
      if (usdaKey) {
        const usdaRes = await fetch(
          `https://api.nal.usda.gov/fdc/v1/foods/search?query=${barcode}&api_key=${usdaKey}&pageSize=1`
        )
        const usdaData = await usdaRes.json()
        if (usdaData.foods?.length > 0) {
          const f = usdaData.foods[0]
          return NextResponse.json({
            found: true,
            product: {
              name: f.description,
              brand: f.brandOwner ?? '',
              calories: getNutrient(f.foodNutrients, 'Energy'),
              protein_g: getNutrient(f.foodNutrients, 'Protein'),
              carbs_g: getNutrient(f.foodNutrients, 'Carbohydrate, by difference'),
              fat_g: getNutrient(f.foodNutrients, 'Total lipid (fat)'),
              fiber_g: getNutrient(f.foodNutrients, 'Fiber, total dietary'),
              serving_size: 100,
              source: 'usda',
            }
          })
        }
      }
      return NextResponse.json({ found: false })
    }

    const p = data.product
    const n = p.nutriments ?? {}
    return NextResponse.json({
      found: true,
      product: {
        name: p.product_name ?? p.product_name_en ?? 'Unknown product',
        brand: p.brands ?? '',
        image_url: p.image_front_url ?? null,
        calories: n['energy-kcal_100g'] ?? n['energy-kcal'] ?? 0,
        protein_g: n.protein_100g ?? n.protein ?? 0,
        carbs_g: n.carbohydrates_100g ?? n.carbohydrates ?? 0,
        fat_g: n.fat_100g ?? n.fat ?? 0,
        fiber_g: n.fiber_100g ?? n.fiber ?? 0,
        serving_size: parseFloat(p.serving_size) || 100,
        source: 'openfoodfacts',
        barcode,
      }
    })
  } catch (err) {
    console.error('Barcode lookup error:', err)
    return NextResponse.json({ error: 'Lookup failed' }, { status: 500 })
  }
}

function getNutrient(nutrients: { nutrientName: string; value: number }[], name: string) {
  return nutrients?.find((n: { nutrientName: string }) => n.nutrientName === name)?.value ?? 0
}
