import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { meal_type, log_date, foods } = body
  // foods: Array of { name, source, externalId, quantity_g, calories, protein_g, carbs_g, fat_g, fiber_g, isRecipe, recipeId }

  const { data: profile } = await supabase
    .from('users')
    .select('user_id')
    .eq('auth_user_id', user.id)
    .single()

  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  // Upsert the diet_log row
  const { data: log, error: logError } = await supabase
    .from('diet_logs')
    .upsert({
      user_id: profile.user_id,
      log_date,
      meal_type,
    }, { onConflict: 'user_id,log_date,meal_type' })
    .select('log_id')
    .single()

  if (logError) return NextResponse.json({ error: logError.message }, { status: 500 })

  const logId = log.log_id

  for (const food of foods) {
    if (food.isRecipe) {
      await supabase.from('diet_log_items').upsert({
        log_id: logId,
        recipe_id: food.recipeId,
        servings: food.servings ?? 1,
      }, { onConflict: 'log_id,recipe_id' })
    } else {
      await supabase.from('food_log_items').insert({
        log_id: logId,
        food_name: food.name,
        source: food.source ?? 'manual',
        external_id: food.externalId ?? null,
        quantity_g: food.quantity_g ?? 100,
        calories: food.calories ?? 0,
        protein_g: food.protein_g ?? 0,
        carbs_g: food.carbs_g ?? 0,
        fat_g: food.fat_g ?? 0,
        fiber_g: food.fiber_g ?? 0,
        micronutrients: food.micronutrients ?? {},
      })
    }
  }

  return NextResponse.json({ success: true, log_id: logId })
}
