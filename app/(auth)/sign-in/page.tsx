'use client'

import { useActionState } from 'react'
import { signInWithEmail } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

type ActionState = { error?: string; success?: boolean } | null

export default function SignInPage() {
  const [state, action, isPending] = useActionState<ActionState, FormData>(
    signInWithEmail,
    null
  )

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>Enter your email to receive a magic link.</CardDescription>
        </CardHeader>
        <CardContent>
          {state?.success ? (
            <p className="text-sm text-green-600">Check your email for a login link.</p>
          ) : (
            <form action={action} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                />
              </div>
              {state?.error && (
                <p className="text-sm text-red-500">{state.error}</p>
              )}
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? 'Sending…' : 'Send magic link'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
