'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createRecipe, updateRecipe } from '../actions'
import TagInput from './TagInput'
import BarcodeScanner from './BarcodeScanner'

type IngredientRow = {
  localId: string
  name: string
  unit: string
  quantity: string
  kcal_per_unit: string
  protein_per_unit: string
  carbs_per_unit: string
  fat_per_unit: string
  price_per_unit: string
}

type RecipeIngredient = {
  id: string
  quantity: number
  kcal_per_unit: number | null
  protein_per_unit: number | null
  carbs_per_unit: number | null
  fat_per_unit: number | null
  price_per_unit: number | null
  ingredients: { name: string; unit: string } | null
}

type Recipe = {
  id: string
  title: string
  description: string | null
  tags: string[] | null
  servings: number
  prep_time_mins: number | null
  cook_time_mins: number | null
  instructions: string | null
  source_url: string | null
  recipe_ingredients: RecipeIngredient[]
}

export type ImportedData = {
  title?: string
  description?: string
  servings?: number
  prep_time_mins?: number
  cook_time_mins?: number
  instructions?: string
  source_url?: string
  ingredients?: Array<{ name: string; unit: string; quantity: number }>
}

type Props = { recipe?: Recipe; importedData?: ImportedData }

function emptyRow(): IngredientRow {
  return {
    localId: crypto.randomUUID(),
    name: '', unit: '', quantity: '',
    kcal_per_unit: '', protein_per_unit: '', carbs_per_unit: '',
    fat_per_unit: '', price_per_unit: '',
  }
}

export default function RecipeForm({ recipe, importedData }: Props) {
  const [title, setTitle] = useState(recipe?.title ?? importedData?.title ?? '')
  const [description, setDescription] = useState(recipe?.description ?? importedData?.description ?? '')
  const [servings, setServings] = useState(String(recipe?.servings ?? importedData?.servings ?? 1))
  const [prepTime, setPrepTime] = useState(String(recipe?.prep_time_mins ?? importedData?.prep_time_mins ?? ''))
  const [cookTime, setCookTime] = useState(String(recipe?.cook_time_mins ?? importedData?.cook_time_mins ?? ''))
  const [instructions, setInstructions] = useState(recipe?.instructions ?? importedData?.instructions ?? '')
  const [sourceUrl, setSourceUrl] = useState(recipe?.source_url ?? importedData?.source_url ?? '')
  const [tags, setTags] = useState<string[]>(recipe?.tags ?? [])
  const [rows, setRows] = useState<IngredientRow[]>(() => {
    if (recipe?.recipe_ingredients?.length) {
      return recipe.recipe_ingredients.map(ri => ({
        localId: ri.id,
        name: ri.ingredients?.name ?? '',
        unit: ri.ingredients?.unit ?? '',
        quantity: String(ri.quantity),
        kcal_per_unit: ri.kcal_per_unit != null ? String(ri.kcal_per_unit) : '',
        protein_per_unit: ri.protein_per_unit != null ? String(ri.protein_per_unit) : '',
        carbs_per_unit: ri.carbs_per_unit != null ? String(ri.carbs_per_unit) : '',
        fat_per_unit: ri.fat_per_unit != null ? String(ri.fat_per_unit) : '',
        price_per_unit: ri.price_per_unit != null ? String(ri.price_per_unit) : '',
      }))
    }
    if (importedData?.ingredients?.length) {
      return importedData.ingredients.map(ing => ({
        localId: crypto.randomUUID(),
        name: ing.name,
        unit: ing.unit,
        quantity: String(ing.quantity),
        kcal_per_unit: '',
        protein_per_unit: '',
        carbs_per_unit: '',
        fat_per_unit: '',
        price_per_unit: '',
      }))
    }
    return [emptyRow()]
  })
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [scanningRowId, setScanningRowId] = useState<string | null>(null)
  const [scanNote, setScanNote] = useState<string | null>(null)

  function updateRow(localId: string, field: keyof IngredientRow, value: string) {
    setRows(prev => prev.map(r => r.localId === localId ? { ...r, [field]: value } : r))
  }

  async function handleScanResult(barcode: string) {
    const rowId = scanningRowId
    setScanningRowId(null)
    if (!rowId) return
    setScanNote('Looking up product…')
    try {
      const res = await fetch(`/api/barcode/${barcode}`)
      const data = await res.json()
      if (!res.ok || data.error) {
        setScanNote('Product not found — fill in manually.')
        return
      }
      if (data.name) updateRow(rowId, 'name', data.name)
      updateRow(rowId, 'unit', 'g')
      const per = (v: number | null) => v != null ? String((v / 100).toFixed(3)) : ''
      if (data.kcal_per_100g != null) updateRow(rowId, 'kcal_per_unit', per(data.kcal_per_100g))
      if (data.protein_per_100g != null) updateRow(rowId, 'protein_per_unit', per(data.protein_per_100g))
      if (data.carbs_per_100g != null) updateRow(rowId, 'carbs_per_unit', per(data.carbs_per_100g))
      if (data.fat_per_100g != null) updateRow(rowId, 'fat_per_unit', per(data.fat_per_100g))
      setScanNote('Filled from barcode — set quantity in grams.')
    } catch {
      setScanNote('Lookup failed — fill in manually.')
    }
    setTimeout(() => setScanNote(null), 5000)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const input = {
      title,
      description: description || undefined,
      tags,
      servings: Number(servings),
      prep_time_mins: prepTime ? Number(prepTime) : undefined,
      cook_time_mins: cookTime ? Number(cookTime) : undefined,
      instructions: instructions || undefined,
      source_url: sourceUrl || undefined,
      ingredients: rows
        .filter(r => r.name.trim())
        .map(r => ({
          name: r.name.trim(),
          unit: r.unit.trim(),
          quantity: Number(r.quantity) || 0,
          kcal_per_unit: r.kcal_per_unit ? Number(r.kcal_per_unit) : undefined,
          protein_per_unit: r.protein_per_unit ? Number(r.protein_per_unit) : undefined,
          carbs_per_unit: r.carbs_per_unit ? Number(r.carbs_per_unit) : undefined,
          fat_per_unit: r.fat_per_unit ? Number(r.fat_per_unit) : undefined,
          price_per_unit: r.price_per_unit ? Number(r.price_per_unit) : undefined,
        })),
    }

    startTransition(async () => {
      const result = recipe
        ? await updateRecipe(recipe.id, input)
        : await createRecipe(input)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic fields */}
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="title">Title *</Label>
          <Input id="title" value={title} onChange={e => setTitle(e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="description">Description</Label>
          <Input id="description" value={description} onChange={e => setDescription(e.target.value)} />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="servings">Servings *</Label>
            <Input id="servings" type="number" min="1" value={servings} onChange={e => setServings(e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="prep">Prep (mins)</Label>
            <Input id="prep" type="number" min="0" value={prepTime} onChange={e => setPrepTime(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cook">Cook (mins)</Label>
            <Input id="cook" type="number" min="0" value={cookTime} onChange={e => setCookTime(e.target.value)} />
          </div>
        </div>
        <TagInput tags={tags} onChange={setTags} />
        <div className="space-y-1.5">
          <Label htmlFor="source">Source URL</Label>
          <Input id="source" type="url" value={sourceUrl} onChange={e => setSourceUrl(e.target.value)} placeholder="https://..." />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="instructions">Instructions</Label>
          <Textarea id="instructions" value={instructions} onChange={e => setInstructions(e.target.value)} rows={5} />
        </div>
      </div>

      {/* Ingredients */}
      <div className="space-y-3">
        <h2 className="font-medium">Ingredients</h2>
        {scanNote && (
          <p className="text-xs text-muted-foreground px-1">{scanNote}</p>
        )}
        <div className="overflow-x-auto">
          <div className="min-w-[700px]">
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_auto] gap-2 text-xs text-muted-foreground px-1 mb-1">
              <span>Name</span><span>Unit</span><span>Qty</span>
              <span>kcal/u</span><span>prot/u</span><span>carbs/u</span><span>fat/u</span><span>£/u</span><span />
            </div>
            {rows.map(row => (
              <div key={row.localId} className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_auto] gap-2 items-center mb-2">
                <Input placeholder="Chicken breast" value={row.name} onChange={e => updateRow(row.localId, 'name', e.target.value)} />
                <Input placeholder="g" value={row.unit} onChange={e => updateRow(row.localId, 'unit', e.target.value)} />
                <Input type="number" min="0" placeholder="0" value={row.quantity} onChange={e => updateRow(row.localId, 'quantity', e.target.value)} />
                <Input type="number" min="0" step="0.1" placeholder="0" value={row.kcal_per_unit} onChange={e => updateRow(row.localId, 'kcal_per_unit', e.target.value)} />
                <Input type="number" min="0" step="0.1" placeholder="0" value={row.protein_per_unit} onChange={e => updateRow(row.localId, 'protein_per_unit', e.target.value)} />
                <Input type="number" min="0" step="0.1" placeholder="0" value={row.carbs_per_unit} onChange={e => updateRow(row.localId, 'carbs_per_unit', e.target.value)} />
                <Input type="number" min="0" step="0.1" placeholder="0" value={row.fat_per_unit} onChange={e => updateRow(row.localId, 'fat_per_unit', e.target.value)} />
                <Input type="number" min="0" step="0.01" placeholder="0" value={row.price_per_unit} onChange={e => updateRow(row.localId, 'price_per_unit', e.target.value)} />
                <div className="flex gap-0.5">
                  <Button
                    type="button" variant="ghost" size="sm"
                    onClick={() => setScanningRowId(row.localId)}
                    title="Scan barcode"
                    className="text-muted-foreground hover:text-foreground px-2"
                  >
                    ▦
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setRows(p => p.filter(r => r.localId !== row.localId))} disabled={rows.length === 1}>×</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={() => setRows(p => [...p, emptyRow()])}>
          + Add ingredient
        </Button>
      </div>

      {scanningRowId && (
        <BarcodeScanner
          onResult={handleScanResult}
          onClose={() => setScanningRowId(null)}
        />
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}

      <Button type="submit" disabled={isPending}>
        {isPending ? 'Saving…' : recipe ? 'Update recipe' : 'Create recipe'}
      </Button>
    </form>
  )
}
