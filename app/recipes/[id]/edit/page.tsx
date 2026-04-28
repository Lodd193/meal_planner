import { createClient } from '@/utils/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import RecipeForm from '../../_components/RecipeForm'

export default async function EditRecipePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const { data: recipe } = await supabase
    .from('recipes')
    .select('*, recipe_ingredients(*, ingredients(name, unit))')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!recipe) notFound()

  return (
    <main className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/recipes/${id}`} className="text-sm text-muted-foreground hover:text-foreground">← Recipe</Link>
        <h1 className="text-2xl font-semibold">Edit Recipe</h1>
      </div>
      <RecipeForm recipe={recipe as any} />
    </main>
  )
}
