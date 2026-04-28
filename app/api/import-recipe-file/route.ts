import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

const client = new Anthropic()

const SYSTEM = `You are a recipe extractor. Given text extracted from a recipe document, return JSON only — no markdown fences, no explanation.

Return this exact structure:
{
  "title": "string",
  "description": "string or null",
  "servings": integer,
  "prep_time_mins": integer or null,
  "cook_time_mins": integer or null,
  "instructions": "full instructions as plain text, numbered steps",
  "ingredients": [
    { "name": "lowercase ingredient name", "unit": "abbreviation e.g. g ml tsp tbsp cup", "quantity": number }
  ]
}

Rules:
- servings must be a positive integer (default 4 if not found)
- ingredients: name lowercase, unit abbreviated, quantity as a number
- instructions: full cooking method, numbered steps
- Null for any unavailable field`

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  let file: File
  try {
    const form = await req.formData()
    const f = form.get('file')
    if (!(f instanceof File)) throw new Error('No file')
    file = f
  } catch {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf')
  const isDocx = file.name.endsWith('.docx') || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  const isDoc = file.name.endsWith('.doc') || file.type === 'application/msword'

  if (!isPdf && !isDocx && !isDoc) {
    return NextResponse.json({ error: 'Unsupported file type — please upload a PDF or Word document' }, { status: 400 })
  }

  let text: string
  try {
    const buffer = Buffer.from(await file.arrayBuffer())
    if (isPdf) {
      const { default: pdfParse } = await import('pdf-parse') as any
      const data = await pdfParse(buffer)
      text = data.text
    } else {
      const mammoth = await import('mammoth')
      const result = await mammoth.extractRawText({ buffer })
      text = result.value
    }
  } catch (e) {
    return NextResponse.json(
      { error: `Could not read file: ${e instanceof Error ? e.message : String(e)}` },
      { status: 400 }
    )
  }

  if (!text.trim()) {
    return NextResponse.json({ error: 'No text could be extracted from the file' }, { status: 400 })
  }

  try {
    const stream = client.messages.stream({
      model: 'claude-haiku-4-5',
      max_tokens: 2048,
      system: [{ type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content: text.slice(0, 20_000) }],
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
    console.error('File import error:', e)
    return NextResponse.json(
      { error: 'Failed to extract recipe from file.' },
      { status: 500 }
    )
  }
}
