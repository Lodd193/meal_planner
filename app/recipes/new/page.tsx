import Link from 'next/link'
import RecipeForm from '../_components/RecipeForm'

export default function NewRecipePage() {
  return (
    <main className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/recipes" className="text-sm text-muted-foreground hover:text-foreground">← Recipes</Link>
        <h1 className="text-2xl font-semibold">New Recipe</h1>
      </div>
      <RecipeForm />
    </main>
  )
}
