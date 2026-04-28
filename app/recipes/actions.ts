'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

type IngredientRow = {
  name: string
  unit: string
  category?: string
  quantity: number
  kcal_per_unit?: number
  protein_per_unit?: number
  carbs_per_unit?: number
  fat_per_unit?: number
  price_per_unit?: number
  notes?: string
}

type RecipeInput = {
  title: string
  description?: string
  tags?: string[]
  servings: number
  prep_time_mins?: number
  cook_time_mins?: number
  instructions?: string
  source_url?: string
  ingredients: IngredientRow[]
}

async function upsertIngredient(
  supabase: Awaited<ReturnType<typeof createClient>>,
  name: string,
  unit: string,
  category?: string
): Promise<string | null> {
  const { data: existing } = await supabase
    .from('ingredients')
    .select('id')
    .eq('name', name)
    .maybeSingle()

  if (existing) return existing.id

  const { data: created } = await supabase
    .from('ingredients')
    .insert({ name, unit, category: category ?? null })
    .select('id')
    .single()

  return created?.id ?? null
}

export async function createRecipe(input: RecipeInput) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const { data: recipe, error } = await supabase
    .from('recipes')
    .insert({
      title: input.title,
      description: input.description ?? null,
      tags: input.tags ?? [],
      servings: input.servings,
      prep_time_mins: input.prep_time_mins ?? null,
      cook_time_mins: input.cook_time_mins ?? null,
      instructions: input.instructions ?? null,
      source_url: input.source_url ?? null,
      user_id: user.id,
    })
    .select('id')
    .single()

  if (error || !recipe) return { error: error?.message ?? 'Failed to create recipe' }

  for (const row of input.ingredients) {
    if (!row.name.trim()) continue
    const ingredientId = await upsertIngredient(supabase, row.name.trim(), row.unit.trim(), row.category)
    if (!ingredientId) continue
    await supabase.from('recipe_ingredients').insert({
      recipe_id: recipe.id,
      ingredient_id: ingredientId,
      quantity: row.quantity,
      kcal_per_unit: row.kcal_per_unit ?? null,
      protein_per_unit: row.protein_per_unit ?? null,
      carbs_per_unit: row.carbs_per_unit ?? null,
      fat_per_unit: row.fat_per_unit ?? null,
      price_per_unit: row.price_per_unit ?? null,
      notes: row.notes ?? null,
    })
  }

  revalidatePath('/recipes')
  redirect(`/recipes/${recipe.id}`)
}

export async function updateRecipe(id: string, input: RecipeInput) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const { error } = await supabase
    .from('recipes')
    .update({
      title: input.title,
      description: input.description ?? null,
      tags: input.tags ?? [],
      servings: input.servings,
      prep_time_mins: input.prep_time_mins ?? null,
      cook_time_mins: input.cook_time_mins ?? null,
      instructions: input.instructions ?? null,
      source_url: input.source_url ?? null,
    })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  await supabase.from('recipe_ingredients').delete().eq('recipe_id', id)

  for (const row of input.ingredients) {
    if (!row.name.trim()) continue
    const ingredientId = await upsertIngredient(supabase, row.name.trim(), row.unit.trim(), row.category)
    if (!ingredientId) continue
    await supabase.from('recipe_ingredients').insert({
      recipe_id: id,
      ingredient_id: ingredientId,
      quantity: row.quantity,
      kcal_per_unit: row.kcal_per_unit ?? null,
      protein_per_unit: row.protein_per_unit ?? null,
      carbs_per_unit: row.carbs_per_unit ?? null,
      fat_per_unit: row.fat_per_unit ?? null,
      price_per_unit: row.price_per_unit ?? null,
      notes: row.notes ?? null,
    })
  }

  revalidatePath('/recipes')
  revalidatePath(`/recipes/${id}`)
  redirect(`/recipes/${id}`)
}

export async function deleteRecipe(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  await supabase.from('recipes').delete().eq('id', id).eq('user_id', user.id)
  revalidatePath('/recipes')
  redirect('/recipes')
}

export async function createQuickRecipe(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const title = (formData.get('title') as string).trim()
  if (!title) return { error: 'Recipe name is required' }

  const num = (k: string) => { const v = Number(formData.get(k)); return v > 0 ? v : null }

  const { data: recipe, error: recipeErr } = await supabase
    .from('recipes')
    .insert({ title, servings: 1, user_id: user.id })
    .select('id')
    .single()

  if (recipeErr || !recipe) return { error: recipeErr?.message ?? 'Failed to create recipe' }

  const ingredientName = title.toLowerCase()
  const { data: existing } = await supabase
    .from('ingredients')
    .select('id')
    .eq('name', ingredientName)
    .maybeSingle()

  let ingredientId = existing?.id ?? null
  if (!ingredientId) {
    const { data: created } = await supabase
      .from('ingredients')
      .insert({ name: ingredientName, unit: 'serving' })
      .select('id')
      .single()
    ingredientId = created?.id ?? null
  }

  if (ingredientId) {
    await supabase.from('recipe_ingredients').insert({
      recipe_id: recipe.id,
      ingredient_id: ingredientId,
      quantity: 1,
      kcal_per_unit: num('kcal'),
      protein_per_unit: num('protein'),
      carbs_per_unit: num('carbs'),
      fat_per_unit: num('fat'),
      price_per_unit: num('cost'),
    })
  }

  revalidatePath('/recipes')
  return { id: recipe.id, title }
}

export async function bulkLogMeals(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const recipeId = formData.get('recipe_id') as string
  const startDate = formData.get('start_date') as string
  const endDate = formData.get('end_date') as string
  const servings = Math.max(0.25, Number(formData.get('servings')) || 1)
  const mealType = (formData.get('meal_type') as string) || 'meal'

  if (!recipeId || !startDate || !endDate) return { error: 'Missing required fields' }

  const start = new Date(startDate)
  const end = new Date(endDate)
  if (end < start) return { error: 'End date must be on or after start date' }

  const diffDays = Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1
  if (diffDays > 31) return { error: 'Date range cannot exceed 31 days' }

  const { data: totals } = await supabase
    .from('recipe_totals')
    .select('kcal_per_serving, protein_per_serving_g, carbs_per_serving_g, fat_per_serving_g, cost_per_serving')
    .eq('recipe_id', recipeId)
    .single()

  const dates: string[] = []
  const cur = new Date(start)
  while (cur <= end) {
    dates.push(cur.toISOString().slice(0, 10))
    cur.setDate(cur.getDate() + 1)
  }

  const rows = dates.map(date => ({
    user_id: user.id,
    logged_date: date,
    meal_type: mealType,
    recipe_id: recipeId,
    custom_name: null,
    total_cost: totals?.cost_per_serving != null ? Number((Number(totals.cost_per_serving) * servings).toFixed(2)) : null,
    kcal: totals?.kcal_per_serving != null ? Math.round(totals.kcal_per_serving * servings) : null,
    protein_g: totals?.protein_per_serving_g != null ? Number((totals.protein_per_serving_g * servings).toFixed(1)) : null,
    carbs_g: totals?.carbs_per_serving_g != null ? Number((totals.carbs_per_serving_g * servings).toFixed(1)) : null,
    fat_g: totals?.fat_per_serving_g != null ? Number((totals.fat_per_serving_g * servings).toFixed(1)) : null,
  }))

  const { error } = await supabase.from('meal_logs').insert(rows)
  if (error) return { error: error.message }

  revalidatePath('/planner')
  return { success: true, count: dates.length }
}

export async function toggleFavourite(id: string, current: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  await supabase
    .from('recipes')
    .update({ is_favourite: !current })
    .eq('id', id)
    .eq('user_id', user.id)

  revalidatePath('/recipes')
  revalidatePath(`/recipes/${id}`)
}
