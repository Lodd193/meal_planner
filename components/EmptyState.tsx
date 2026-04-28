import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'

type Props = {
  icon: 'recipes' | 'meals' | 'shopping'
  title: string
  description: string
  href?: string
  cta?: string
}

const icons = {
  recipes: (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" className="mx-auto opacity-30">
      <rect x="12" y="8" width="40" height="48" rx="4" stroke="currentColor" strokeWidth="2.5" />
      <path d="M20 20h24M20 28h24M20 36h16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="46" cy="46" r="10" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="2" />
      <path d="M42 46h8M46 42v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  meals: (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" className="mx-auto opacity-30">
      <circle cx="32" cy="32" r="20" stroke="currentColor" strokeWidth="2.5" />
      <path d="M32 18v14l8 8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="32" cy="32" r="3" fill="currentColor" />
    </svg>
  ),
  shopping: (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" className="mx-auto opacity-30">
      <path d="M16 20h32l-4 22H20L16 20Z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M10 14h8l3 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="24" cy="48" r="3" fill="currentColor" />
      <circle cx="40" cy="48" r="3" fill="currentColor" />
      <path d="M26 32h12M32 26v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
}

export default function EmptyState({ icon, title, description, href, cta }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
      {icons[icon]}
      <div className="space-y-1">
        <p className="font-medium text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground max-w-xs">{description}</p>
      </div>
      {href && cta && (
        <Link href={href} className={buttonVariants({ variant: 'outline' })}>
          {cta}
        </Link>
      )}
    </div>
  )
}
