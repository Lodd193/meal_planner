'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { addSpendLog, deleteSpendLog } from '../actions'

type SpendLog = {
  id: string
  spend_date: string
  amount: number
  description: string
  category: string | null
}

const CATEGORIES = ['Groceries', 'Eating out', 'Takeaway', 'Drinks', 'Other']

export default function SpendLogList({ logs, defaultDate }: { logs: SpendLog[]; defaultDate: string }) {
  const [pending, setPending] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleAdd(formData: FormData) {
    setPending(true)
    await addSpendLog(formData)
    setPending(false)
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    await deleteSpendLog(id)
    setDeletingId(null)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-5">
          <form action={handleAdd} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Date</Label>
                <Input type="date" name="spend_date" defaultValue={defaultDate} required />
              </div>
              <div className="space-y-1.5">
                <Label>Amount (£)</Label>
                <Input type="number" name="amount" step="0.01" min="0.01" placeholder="0.00" required />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Input name="description" placeholder="e.g. Tesco weekly shop" required />
            </div>
            <div className="space-y-1.5">
              <Label>Category</Label>
              <select
                name="category"
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                defaultValue="Groceries"
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <Button type="submit" disabled={pending} className="w-full">
              {pending ? 'Adding…' : '+ Add entry'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {logs.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">No spend entries this month.</p>
      ) : (
        <div className="divide-y divide-border rounded-lg border">
          {logs.map(log => (
            <div key={log.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="font-medium text-sm">{log.description}</p>
                <p className="text-xs text-muted-foreground">
                  {log.spend_date}{log.category ? ` · ${log.category}` : ''}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold">£{Number(log.amount).toFixed(2)}</span>
                <button
                  type="button"
                  onClick={() => handleDelete(log.id)}
                  disabled={deletingId === log.id}
                  className="text-muted-foreground hover:text-destructive text-xs transition-colors"
                >
                  {deletingId === log.id ? '…' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
