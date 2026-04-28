'use client'
import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { toggleFavourite } from '../../actions'

export default function FavouriteButton({
  recipeId,
  isFavourite,
}: {
  recipeId: string
  isFavourite: boolean
}) {
  const [fav, setFav] = useState(isFavourite)
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    const current = fav
    setFav(!current)
    startTransition(async () => {
      await toggleFavourite(recipeId, current)
    })
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClick}
      disabled={isPending}
      className="w-full sm:w-auto"
    >
      {fav ? '★ Saved' : '☆ Save'}
    </Button>
  )
}
