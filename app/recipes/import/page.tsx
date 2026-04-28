import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ImportForm from './_components/ImportForm'

export default async function ImportRecipePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  return (
    <main className="p-8 max-w-2xl mx-auto">
      <Link href="/recipes" className="text-sm text-muted-foreground hover:text-foreground">
        ← Recipes
      </Link>
      <h1 className="text-2xl font-semibold mt-4 mb-2">Import Recipe</h1>
      <ImportForm />
    </main>
  )
}
