'use server'

import { createClient } from '@/utils/supabase/server'
import { headers } from 'next/headers'

type ActionState = { error?: string; success?: boolean } | null

export async function signInWithEmail(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const email = formData.get('email') as string

  const headersList = await headers()
  const origin = headersList.get('origin') ?? 'http://localhost:3000'

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${origin}/auth/callback` },
  })

  if (error) return { error: error.message }
  return { success: true }
}
