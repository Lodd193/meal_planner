'use server'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function saveProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const num = (key: string) => {
    const v = Number(formData.get(key))
    return isNaN(v) || v === 0 ? null : v
  }

  await supabase.from('profiles').upsert({
    id: user.id,
    display_name: (formData.get('display_name') as string) || null,
    daily_kcal: num('daily_kcal'),
    daily_protein: num('daily_protein'),
    daily_carbs: num('daily_carbs'),
    daily_fat: num('daily_fat'),
    weekly_budget: num('weekly_budget'),
    updated_at: new Date().toISOString(),
  })

  redirect('/profile')
}
