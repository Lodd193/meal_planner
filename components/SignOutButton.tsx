'use client'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function SignOutButton() {
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/sign-in')
    router.refresh()
  }

  return (
    <button
      onClick={handleSignOut}
      className="ml-2 px-3 py-1.5 rounded-full text-sm transition-all duration-200 hover:bg-white/10"
      style={{ color: 'rgba(224,221,207,0.65)' }}
    >
      Sign out
    </button>
  )
}
