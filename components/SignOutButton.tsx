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
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-destructive/40 text-sm font-medium text-destructive hover:bg-destructive/8 active:bg-destructive/15 transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
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
