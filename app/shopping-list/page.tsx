import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import ShoppingList from './_components/ShoppingList'

export type ShoppingItem = {
  id: string
  name: string
  quantity: number
  unit: string
  category: string | null
}

type RecipeIngredientRow = {
  recipe_id: string
  quantity: number
  ingredient_id: string
  ingredients: { name: string; category: string | null; unit: string } | null
}

export default async function ShoppingListPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const fromDate = new Date()
  fromDate.setDate(fromDate.getDate() - 7)
  const from = fromDate.toISOString().slice(0, 10)

  const { data: logs } = await supabase
    .from('meal_logs')
    .select('recipe_id')
    .eq('user_id', user.id)
    .gte('logged_date', from)
    .not('recipe_id', 'is', null)

  const recipeCounts = new Map<string, number>()
  for (const log of logs ?? []) {
    if (log.recipe_id) {
      recipeCounts.set(log.recipe_id, (recipeCounts.get(log.recipe_id) ?? 0) + 1)
    }
  }

  const recipeIds = [...recipeCounts.keys()]
  let items: ShoppingItem[] = []

  if (recipeIds.length > 0) {
    const { data: rawRows } = await supabase
      .from('recipe_ingredients')
      .select('recipe_id, quantity, ingredient_id, ingredients(name, category, unit)')
      .in('recipe_id', recipeIds)

    const rows = (rawRows ?? []) as RecipeIngredientRow[]
    const itemMap = new Map<string, ShoppingItem>()

    for (const row of rows) {
      const ing = row.ingredients
      if (!ing) continue
      const count = recipeCounts.get(row.recipe_id) ?? 1
      const key = row.ingredient_id
      if (itemMap.has(key)) {
        itemMap.get(key)!.quantity += row.quantity * count
      } else {
        itemMap.set(key, {
          id: row.ingredient_id,
          name: ing.name,
          quantity: row.quantity * count,
          unit: ing.unit,
          category: ing.category,
        })
      }
    }

    items = [...itemMap.values()].sort((a, b) => a.name.localeCompare(b.name))
  }

  return (
    <main className="p-4 sm:p-8 max-w-2xl mx-auto">
      <ShoppingList items={items} generatedFromDays={items.length > 0 ? 7 : 0} />
    </main>
  )
}
