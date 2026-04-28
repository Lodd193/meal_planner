'use server'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function addMealLog(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const date = formData.get('date') as string
  const meal_type = (formData.get('meal_type') as string) || 'meal'
  const recipe_id = (formData.get('recipe_id') as string) || null
  const custom_name = (formData.get('custom_name') as string) || null
  const num = (k: string) => { const v = Number(formData.get(k)); return v > 0 ? v : null }

  if (!recipe_id && !custom_name) return

  await supabase.from('meal_logs').insert({
    user_id: user.id,
    logged_date: date,
    meal_type,
    recipe_id,
    custom_name,
    total_cost: num('total_cost'),
    kcal: num('kcal'),
    protein_g: num('protein_g'),
    carbs_g: num('carbs_g'),
    fat_g: num('fat_g'),
  })

  revalidatePath(`/planner/${date}`)
  revalidatePath('/planner')
}

export async function deleteMealLog(id: string, date: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  await supabase.from('meal_logs').delete().eq('id', id).eq('user_id', user.id)

  revalidatePath(`/planner/${date}`)
  revalidatePath('/planner')
}
