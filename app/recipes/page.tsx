import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import RecipeCard from './_components/RecipeCard'

export default async function RecipesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const { data: recipes } = await supabase
    .from('recipe_totals')
    .select('*')
    .eq('user_id', user.id)
    .order('title')

  return (
    <main className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Recipes</h1>
        <div className="flex gap-2">
          <Link href="/recipes/import" className={buttonVariants({ variant: 'outline' })}>Import Recipe</Link>
          <Link href="/recipes/new" className={buttonVariants()}>+ New Recipe</Link>
        </div>
      </div>
      {!recipes?.length ? (
        <p className="text-muted-foreground">No recipes yet — add your first one!</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recipes.map(r => (
            <RecipeCard key={r.recipe_id} recipe={r} />
          ))}
        </div>
      )}
    </main>
  )
}
