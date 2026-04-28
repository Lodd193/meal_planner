import { createClient } from '@/utils/supabase/server'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { code } = await params

  if (!/^\d{8,14}$/.test(code)) {
    return Response.json({ error: 'Invalid barcode' }, { status: 400 })
  }

  let data: Record<string, unknown>
  try {
    const res = await fetch(
      `https://world.openfoodfacts.org/api/v0/product/${code}.json`,
      { headers: { 'User-Agent': 'MealPlannerApp/1.0' }, next: { revalidate: 86400 } }
    )
    if (!res.ok) return Response.json({ error: 'Lookup failed' }, { status: 502 })
    data = await res.json()
  } catch {
    return Response.json({ error: 'Lookup failed' }, { status: 502 })
  }

  if ((data as { status: number }).status === 0) {
    return Response.json({ error: 'Product not found' }, { status: 404 })
  }

  const p = (data as { product?: Record<string, unknown> }).product ?? {}
  const n = (p.nutriments ?? {}) as Record<string, number | null>

  return Response.json({
    name: p.product_name_en ?? p.product_name ?? p.generic_name ?? null,
    kcal_per_100g: n['energy-kcal_100g'] ?? null,
    protein_per_100g: n['proteins_100g'] ?? null,
    carbs_per_100g: n['carbohydrates_100g'] ?? null,
    fat_per_100g: n['fat_100g'] ?? null,
  })
}
