'use client'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

type Props = { variant?: 'nav' | 'page' }

export default function SignOutButton({ variant = 'nav' }: Props) {
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/sign-in')
    router.refresh()
  }

  if (variant === 'page') {
    return (
      <button
        onClick={handleSignOut}
        className="w-full text-left px-1 py-2 text-sm text-muted-foreground hover:text-destructive transition-colors"
      >
        Sign out
      </button>
    )
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
