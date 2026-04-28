import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { saveProfile } from './actions'
import SignOutButton from '@/components/SignOutButton'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <main className="p-8 max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Profile & Targets</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Set your daily macro targets and weekly food budget.
        </p>
      </div>

      <form action={saveProfile} className="space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Display name</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              name="display_name"
              placeholder="Your name"
              defaultValue={profile?.display_name ?? ''}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Daily macro targets</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="daily_kcal">Calories (kcal)</Label>
              <Input
                id="daily_kcal"
                name="daily_kcal"
                type="number"
                min="0"
                placeholder="e.g. 2000"
                defaultValue={profile?.daily_kcal ?? ''}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="daily_protein">Protein (g)</Label>
              <Input
                id="daily_protein"
                name="daily_protein"
                type="number"
                min="0"
                placeholder="e.g. 150"
                defaultValue={profile?.daily_protein ?? ''}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="daily_carbs">Carbs (g)</Label>
              <Input
                id="daily_carbs"
                name="daily_carbs"
                type="number"
                min="0"
                placeholder="e.g. 250"
                defaultValue={profile?.daily_carbs ?? ''}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="daily_fat">Fat (g)</Label>
              <Input
                id="daily_fat"
                name="daily_fat"
                type="number"
                min="0"
                placeholder="e.g. 70"
                defaultValue={profile?.daily_fat ?? ''}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Weekly food budget</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5">
              <Label htmlFor="weekly_budget">Budget (£)</Label>
              <Input
                id="weekly_budget"
                name="weekly_budget"
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g. 60.00"
                defaultValue={profile?.weekly_budget ?? ''}
              />
            </div>
          </CardContent>
        </Card>

        <Button type="submit" className="w-full">Save changes</Button>
      </form>

      <div className="md:hidden pt-2 border-t">
        <SignOutButton variant="page" />
      </div>
    </main>
  )
}
