'use server'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function addSpendLog(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const spend_date = formData.get('spend_date') as string
  const amount = Number(formData.get('amount'))
  const description = (formData.get('description') as string ?? '').trim()
  const category = (formData.get('category') as string) || null

  if (!spend_date || !amount || !description) return

  await supabase.from('spend_logs').insert({
    user_id: user.id,
    spend_date,
    amount,
    description,
    category,
  })

  revalidatePath('/spend-log')
  revalidatePath('/dashboard')
}

export async function deleteSpendLog(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  await supabase.from('spend_logs').delete().eq('id', id).eq('user_id', user.id)

  revalidatePath('/spend-log')
  revalidatePath('/dashboard')
}
