'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import RecipeForm, { type ImportedData } from '../../_components/RecipeForm'

type Mode = 'url' | 'file'

export default function ImportForm() {
  const [mode, setMode] = useState<Mode>('url')
  const [url, setUrl] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [importedData, setImportedData] = useState<ImportedData | null>(null)

  async function handleUrlImport() {
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/import-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Import failed'); return }
      setImportedData({ ...data.recipe, source_url: url })
    } catch {
      setError('Network error — please try again')
    } finally {
      setLoading(false)
    }
  }

  async function handleFileImport() {
    if (!file) return
    setError(null)
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/import-recipe-file', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Import failed'); return }
      setImportedData(data.recipe)
    } catch {
      setError('Network error — please try again')
    } finally {
      setLoading(false)
    }
  }

  if (importedData) {
    return (
      <div>
        <p className="text-sm text-muted-foreground mb-6">
          Review and edit the imported recipe, then click Save.
        </p>
        <RecipeForm importedData={importedData} />
      </div>
    )
  }

  return (
    <div className="space-y-6 mt-2">
      {/* Mode toggle */}
      <div className="flex gap-0 rounded-lg border border-border p-0.5 bg-muted">
        {(['url', 'file'] as Mode[]).map(m => (
          <button
            key={m}
            onClick={() => { setMode(m); setError(null) }}
            className={`flex-1 px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              mode === m
                ? 'bg-background shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {m === 'url' ? 'From URL' : 'From PDF / Word'}
          </button>
        ))}
      </div>

      {mode === 'url' ? (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Paste a recipe URL and we'll extract the ingredients and instructions automatically.
          </p>
          <div className="flex gap-2">
            <Input
              type="url"
              placeholder="https://..."
              value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !loading && url && handleUrlImport()}
              disabled={loading}
              className="flex-1"
            />
            <Button onClick={handleUrlImport} disabled={!url || loading}>
              {loading ? 'Importing…' : 'Import'}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Upload a recipe saved as a PDF or Word document.
          </p>
          <label className={`flex flex-col items-center gap-3 border-2 border-dashed rounded-xl p-8 cursor-pointer transition-colors ${
            file ? 'border-primary/50 bg-primary/5' : 'border-border hover:border-primary/40 hover:bg-muted/50'
          }`}>
            <span className="text-3xl">{file ? '📄' : '⬆️'}</span>
            <div className="text-center">
              <p className="text-sm font-medium">
                {file ? file.name : 'Choose a file or drag it here'}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">PDF, DOC, DOCX</p>
            </div>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              className="sr-only"
              onChange={e => { setFile(e.target.files?.[0] ?? null); setError(null) }}
            />
          </label>
          <Button onClick={handleFileImport} disabled={!file || loading} className="w-full">
            {loading ? 'Processing…' : 'Import from file'}
          </Button>
        </div>
      )}

      {loading && (
        <p className="text-sm text-muted-foreground animate-pulse text-center">
          Fetching and parsing recipe…
        </p>
      )}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
}
