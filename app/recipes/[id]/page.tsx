import { createClient } from '@/utils/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { deleteRecipe, bulkLogMeals } from '../actions'
import FavouriteButton from './_components/FavouriteButton'
import LogToRangeForm from './_components/LogToRangeForm'

function parseSteps(instructions: string): string[] {
  const byNumber = instructions.split(/\n(?=\d+[\.\)]\s)/)
  if (byNumber.length > 1) {
    return byNumber.map(s => s.replace(/^\d+[\.\)]\s*/, '').trim()).filter(Boolean)
  }
  const byBlank = instructions.split(/\n\n+/)
  if (byBlank.length > 1) return byBlank.map(s => s.trim()).filter(Boolean)
  return [instructions.trim()]
}

export default async function RecipeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const [{ data: recipe }, { data: totals }, { data: profile }] = await Promise.all([
    supabase
      .from('recipes')
      .select('*, recipe_ingredients(*, ingredients(name, unit))')
      .eq('id', id)
      .eq('user_id', user.id)
      .single(),
    supabase.from('recipe_totals').select('*').eq('recipe_id', id).single(),
    supabase.from('profiles').select('daily_kcal, daily_protein, daily_carbs, daily_fat').eq('id', user.id).single(),
  ])

  if (!recipe) notFound()

  const hasMacros = totals && (
    (totals.kcal_per_serving ?? 0) > 0 ||
    (totals.protein_per_serving_g ?? 0) > 0 ||
    (totals.carbs_per_serving_g ?? 0) > 0 ||
    (totals.fat_per_serving_g ?? 0) > 0
  )

  const steps = recipe.instructions ? parseSteps(recipe.instructions) : []
  const ingredients = (recipe.recipe_ingredients as any[]) ?? []

  return (
    <main className="max-w-3xl mx-auto">
      {/* Title section */}
      <div className="bg-card border-b border-border px-6 sm:px-10 pt-6 pb-8">
        <Link href="/recipes" className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors tracking-wide uppercase">
          ← Recipes
        </Link>

        <div className="mt-5 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight">{recipe.title}</h1>
            {recipe.description && (
              <p className="mt-2 text-muted-foreground leading-relaxed">{recipe.description}</p>
            )}
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="px-3 py-1 bg-muted rounded-full text-xs font-medium text-muted-foreground">
                {recipe.servings} serving{recipe.servings !== 1 ? 's' : ''}
              </span>
              {recipe.prep_time_mins && (
                <span className="px-3 py-1 bg-muted rounded-full text-xs font-medium text-muted-foreground">
                  {recipe.prep_time_mins} min prep
                </span>
              )}
              {recipe.cook_time_mins && (
                <span className="px-3 py-1 bg-muted rounded-full text-xs font-medium text-muted-foreground">
                  {recipe.cook_time_mins} min cook
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 shrink-0">
            <form action={async () => {
              'use server'
              const today = new Date().toISOString().slice(0, 10)
              const fd = new FormData()
              fd.set('recipe_id', id)
              fd.set('start_date', today)
              fd.set('end_date', today)
              fd.set('servings', '1')
              fd.set('meal_type', 'meal')
              await bulkLogMeals(fd)
              redirect(`/planner/${today}`)
            }}>
              <Button size="sm" type="submit" className="w-full sm:w-auto">Log today</Button>
            </form>
            <FavouriteButton recipeId={id} isFavourite={recipe.is_favourite ?? false} />
            <Link href={`/recipes/${id}/edit`} className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}>Edit</Link>
            <form action={async () => {
              'use server'
              await deleteRecipe(id)
            }}>
              <Button variant="destructive" size="sm" type="submit">Delete</Button>
            </form>
          </div>
        </div>
      </div>

      <div className="px-6 sm:px-10 py-8 space-y-10">

        {/* Macros */}
        {hasMacros ? (
          <section>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Per serving</p>
            <div className="bg-card rounded-xl border border-border p-5 space-y-5">
              <div className="grid grid-cols-5 gap-3">
                {[
                  { label: 'kcal', value: totals.kcal_per_serving != null ? Math.round(totals.kcal_per_serving) : null },
                  { label: 'Protein', value: totals.protein_per_serving_g != null ? `${totals.protein_per_serving_g.toFixed(1)}g` : null },
                  { label: 'Carbs', value: totals.carbs_per_serving_g != null ? `${totals.carbs_per_serving_g.toFixed(1)}g` : null },
                  { label: 'Fat', value: totals.fat_per_serving_g != null ? `${totals.fat_per_serving_g.toFixed(1)}g` : null },
                  { label: 'Cost', value: totals.cost_per_serving != null ? `£${Number(totals.cost_per_serving).toFixed(2)}` : null },
                ].map(({ label, value }) => (
                  <div key={label} className="text-center">
                    <p className="text-lg font-bold">{value ?? '—'}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
              {profile && (() => {
                const bars = [
                  { label: 'Protein', val: totals.protein_per_serving_g, target: profile.daily_protein },
                  { label: 'Carbs', val: totals.carbs_per_serving_g, target: profile.daily_carbs },
                  { label: 'Fat', val: totals.fat_per_serving_g, target: profile.daily_fat },
                  { label: 'kcal', val: totals.kcal_per_serving, target: profile.daily_kcal },
                ].filter(m => m.val != null && m.target != null && m.target > 0)
                if (!bars.length) return null
                return (
                  <div className="pt-4 border-t border-border space-y-3">
                    <p className="text-xs text-muted-foreground">% of your daily targets</p>
                    {bars.map(({ label, val, target }) => {
                      const pct = Math.min(Math.round((val! / target!) * 100), 100)
                      return (
                        <div key={label}>
                          <div className="flex justify-between text-xs mb-1.5">
                            <span className="text-muted-foreground">{label}</span>
                            <span className="font-semibold">{pct}%</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-border overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #474448 0%, #534B52 100%)' }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )
              })()}
            </div>
          </section>
        ) : totals && (
          <div className="bg-card rounded-xl border border-border border-dashed px-5 py-4 text-sm text-muted-foreground">
            Add per-unit nutrition to ingredients to see macros here.
          </div>
        )}

        {/* Bulk log */}
        <LogToRangeForm recipeId={id} />

        {/* Ingredients */}
        {ingredients.length > 0 && (
          <section>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Ingredients</p>
            <div className="bg-card rounded-xl border border-border overflow-hidden divide-y divide-border">
              {ingredients.map((ri: any) => (
                <div key={ri.id} className="flex items-center justify-between px-5 py-3">
                  <span className="text-sm font-medium capitalize">{ri.ingredients?.name}</span>
                  <span className="text-sm text-muted-foreground tabular-nums">
                    {ri.quantity} {ri.ingredients?.unit}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Instructions */}
        {steps.length > 0 && (
          <section>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Method</p>
            <div className="space-y-3">
              {steps.map((step, i) => (
                <div key={i} className="flex gap-4 bg-card rounded-xl border border-border px-5 py-4">
                  <span
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 text-primary-foreground"
                    style={{ background: 'linear-gradient(135deg, #2D232E 0%, #474448 100%)' }}
                  >
                    {i + 1}
                  </span>
                  <p className="text-sm leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Source */}
        {recipe.source_url && (
          <a
            href={recipe.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            View original recipe ↗
          </a>
        )}
      </div>
    </main>
  )
}
