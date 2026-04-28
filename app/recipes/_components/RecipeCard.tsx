import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Tables } from '@/types/supabase'

type Props = { recipe: Tables<'recipe_totals'> & { tags?: string[] } }

export default function RecipeCard({ recipe }: Props) {
  const kcal = recipe.kcal_per_serving != null && recipe.kcal_per_serving > 0
    ? Math.round(recipe.kcal_per_serving)
    : null
  const cost = recipe.cost_per_serving != null && Number(recipe.cost_per_serving) > 0
    ? Number(recipe.cost_per_serving).toFixed(2)
    : null

  return (
    <Link href={`/recipes/${recipe.recipe_id}`} className="group">
      <Card className="h-full transition-all duration-200 hover:shadow-md hover:border-primary/30 cursor-pointer">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold leading-snug line-clamp-2 group-hover:text-primary/80 transition-colors">
            {recipe.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="w-1 h-1 rounded-full bg-muted-foreground/50 shrink-0" />
            {recipe.servings} serving{recipe.servings !== 1 ? 's' : ''}
          </div>
          {kcal && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="w-1 h-1 rounded-full bg-primary/50 shrink-0" />
              {kcal} kcal / serving
            </div>
          )}
          {cost && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="w-1 h-1 rounded-full bg-primary/50 shrink-0" />
              £{cost} / serving
            </div>
          )}
          {!kcal && !cost && (
            <p className="text-xs text-muted-foreground/60 italic">No nutrition data yet</p>
          )}
          {recipe.tags && recipe.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {recipe.tags.slice(0, 3).map(tag => (
                <span key={tag} className="px-2 py-0.5 bg-muted rounded-full text-xs text-muted-foreground">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
