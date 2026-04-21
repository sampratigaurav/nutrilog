import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q') ?? ''
  if (!query.trim()) return NextResponse.json({ results: [] })

  const supabase = await createClient()

  // 1. Search own ingredients DB
  const { data: ownIngredients } = await supabase
    .from('ingredients')
    .select('*')
    .ilike('name', `%${query}%`)
    .limit(5)

  // 2. Search own recipes
  const { data: ownRecipes } = await supabase
    .from('recipes')
    .select('recipe_id, name, meal_type, cuisine_type')
    .ilike('name', `%${query}%`)
    .limit(5)

  // 3. USDA FoodData Central
  const usdaKey = process.env.USDA_API_KEY
  let usdaResults: FoodItem[] = []
  if (usdaKey) {
    try {
      const usdaRes = await fetch(
        `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(query)}&pageSize=8&api_key=${usdaKey}`
      )
      if (usdaRes.ok) {
        const usdaData = await usdaRes.json()
        usdaResults = (usdaData.foods ?? []).map((f: USDAFood) => ({
          id: `usda_${f.fdcId}`,
          name: f.description,
          source: 'usda',
          externalId: String(f.fdcId),
          calories: getNutrient(f.foodNutrients, 'Energy') ?? 0,
          protein_g: getNutrient(f.foodNutrients, 'Protein') ?? 0,
          carbs_g: getNutrient(f.foodNutrients, 'Carbohydrate, by difference') ?? 0,
          fat_g: getNutrient(f.foodNutrients, 'Total lipid (fat)') ?? 0,
          fiber_g: getNutrient(f.foodNutrients, 'Fiber, total dietary') ?? 0,
          servingSize: 100,
          unit: 'g',
        }))
      }
    } catch {}
  }

  // 4. Open Food Facts (good for Indian packaged foods + barcode)
  let offResults: FoodItem[] = []
  try {
    const offRes = await fetch(
      `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=6&fields=product_name,nutriments,serving_size,brands`
    )
    if (offRes.ok) {
      const offData = await offRes.json()
      offResults = ((offData.products ?? []) as OFFProduct[])
        .filter((p: OFFProduct) => p.product_name && p.nutriments)
        .map((p: OFFProduct) => ({
          id: `off_${p.id ?? p.product_name}`,
          name: `${p.product_name}${p.brands ? ` (${p.brands})` : ''}`,
          source: 'openfoodfacts',
          externalId: p.id ?? '',
          calories: p.nutriments?.['energy-kcal_100g'] ?? 0,
          protein_g: p.nutriments?.protein_100g ?? 0,
          carbs_g: p.nutriments?.carbohydrates_100g ?? 0,
          fat_g: p.nutriments?.fat_100g ?? 0,
          fiber_g: p.nutriments?.fiber_100g ?? 0,
          servingSize: 100,
          unit: 'g',
        }))
    }
  } catch {}

  const ownIngredientItems: FoodItem[] = (ownIngredients ?? []).map(i => ({
    id: `ing_${i.ingredient_id}`,
    name: i.name,
    source: 'own_db',
    externalId: String(i.ingredient_id),
    calories: Number(i.calories_per_100g),
    protein_g: Number(i.protein_g),
    carbs_g: Number(i.carbs_g),
    fat_g: Number(i.fat_g),
    fiber_g: Number(i.fiber_g),
    micronutrients: i.micronutrients,
    servingSize: 100,
    unit: 'g',
  }))

  const ownRecipeItems: FoodItem[] = (ownRecipes ?? []).map(r => ({
    id: `recipe_${r.recipe_id}`,
    name: r.name,
    source: 'recipe',
    externalId: String(r.recipe_id),
    calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, fiber_g: 0,
    servingSize: 1,
    unit: 'serving',
    mealType: r.meal_type,
    cuisineType: r.cuisine_type,
    isRecipe: true,
  }))

  return NextResponse.json({
    results: [...ownIngredientItems, ...ownRecipeItems, ...usdaResults, ...offResults]
  })
}

interface FoodItem {
  id: string; name: string; source: string; externalId: string;
  calories: number; protein_g: number; carbs_g: number; fat_g: number;
  fiber_g: number; servingSize: number; unit: string;
  micronutrients?: Record<string, unknown>;
  mealType?: string; cuisineType?: string; isRecipe?: boolean;
}
interface USDAFood {
  fdcId: number; description: string;
  foodNutrients: { nutrientName: string; value: number }[];
}
interface OFFProduct {
  id?: string; product_name: string; brands?: string;
  nutriments?: Record<string, number>;
}

function getNutrient(nutrients: { nutrientName: string; value: number }[], name: string) {
  return nutrients?.find(n => n.nutrientName === name)?.value ?? null
}
