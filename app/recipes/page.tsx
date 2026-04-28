import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import RecipeCard from './_components/RecipeCard'
import RecipeFilter from './_components/RecipeFilter'

export default async function RecipesPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string; q?: string }>
}) {
  const { tag: activeTag = '', q: activeQ = '' } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const [{ data: totals }, { data: recipesRaw }] = await Promise.all([
    supabase.from('recipe_totals').select('*').eq('user_id', user.id).order('title'),
    supabase.from('recipes').select('id, tags').eq('user_id', user.id),
  ])

  const tagMap = new Map((recipesRaw ?? []).map(r => [r.id, r.tags ?? []]))
  let recipes = (totals ?? []).map(r => ({
    ...r,
    tags: tagMap.get(r.recipe_id ?? '') ?? [],
  }))

  if (activeTag) {
    recipes = recipes.filter(r => r.tags.includes(activeTag))
  }
  if (activeQ) {
    const q = activeQ.toLowerCase()
    recipes = recipes.filter(r => r.title?.toLowerCase().includes(q))
  }

  const allTags = [...new Set((recipesRaw ?? []).flatMap(r => r.tags ?? []))].sort()

  return (
    <main className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Recipes</h1>
        <div className="flex gap-2">
          <Link href="/recipes/import" className={buttonVariants({ variant: 'outline' })}>Import Recipe</Link>
          <Link href="/recipes/new" className={buttonVariants()}>+ New Recipe</Link>
        </div>
      </div>

      <RecipeFilter allTags={allTags} activeTag={activeTag} activeQ={activeQ} />

      {!recipes.length ? (
        <p className="text-muted-foreground">
          {activeTag || activeQ ? 'No recipes match this filter.' : 'No recipes yet — add your first one!'}
        </p>
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
