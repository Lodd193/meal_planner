import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

const client = new Anthropic()

const SYSTEM = `You are a recipe extractor. Given recipe data (either structured JSON-LD or raw HTML), return JSON only — no markdown fences, no explanation.

Return this exact structure:
{
  "title": "string",
  "description": "string or null",
  "servings": integer,
  "prep_time_mins": integer or null,
  "cook_time_mins": integer or null,
  "instructions": "full instructions as plain text",
  "ingredients": [
    { "name": "lowercase ingredient name", "unit": "abbreviation e.g. g ml tsp tbsp cup", "quantity": number }
  ]
}

Rules:
- servings must be a positive integer (default 4 if not found)
- ingredients: name lowercase, unit abbreviated (infer "g" if a number appears with no unit), quantity as a number
- ISO 8601 durations like PT15M = 15 mins, PT1H30M = 90 mins
- instructions: full cooking method as plain text, numbered steps if possible
- Null for any unavailable field`

function extractJsonLd(html: string): string | null {
  const blocks = html.match(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)
  if (!blocks) return null
  for (const block of blocks) {
    const content = block.replace(/<script[^>]*>/, '').replace(/<\/script>/, '').trim()
    try {
      const parsed = JSON.parse(content)
      if (parsed['@type'] === 'Recipe') return content
      // Handle @graph arrays
      if (Array.isArray(parsed['@graph'])) {
        const recipe = parsed['@graph'].find((n: { '@type': string }) => n['@type'] === 'Recipe')
        if (recipe) return JSON.stringify(recipe)
      }
    } catch { /* skip malformed blocks */ }
  }
  return null
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  let url: string
  try {
    const body = await req.json()
    url = body.url
    new URL(url)
  } catch {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
  }

  let html: string
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      signal: AbortSignal.timeout(15_000),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    html = await res.text()
  } catch (e) {
    return NextResponse.json(
      { error: `Could not fetch that URL: ${e instanceof Error ? e.message : String(e)}` },
      { status: 400 }
    )
  }

  // Prefer structured JSON-LD over raw HTML — avoids truncation issues
  const jsonLd = extractJsonLd(html)
  const content = jsonLd ?? html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
    .slice(0, 50_000)

  try {
    const stream = client.messages.stream({
      model: 'claude-haiku-4-5',
      max_tokens: 2048,
      system: [{ type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content }],
    })

    const msg = await stream.finalMessage()
    const raw = msg.content.find(b => b.type === 'text')?.text ?? ''

    let json = raw.trim()
    if (json.startsWith('```')) {
      json = json.replace(/^```[a-z]*\n?/, '').replace(/\n?```$/, '')
    }

    const recipe = JSON.parse(json)
    return NextResponse.json({ recipe })
  } catch (e) {
    console.error('Import error:', e)
    return NextResponse.json(
      { error: 'Failed to extract recipe — try a different URL.' },
      { status: 500 }
    )
  }
}
