# Meal Planner App — Project Plan

## Stack
- **Frontend:** Next.js 16.2.4 (App Router) + TypeScript
- **Styling:** Tailwind CSS v4 + Shadcn/ui + Grocery_Remix palette
- **Backend/DB:** Supabase (Postgres + Auth)
- **Deployment:** Vercel — https://meal-planner-seven-brown.vercel.app

## Core Features
- Save private recipes (manual entry + URL import)
- Meal diary: log what you actually ate, on specific dates, with real costs
- Daily macro tracking (kcal, protein, carbs, fat) vs personal targets
- Per-ingredient price tracking OR manual total cost entry
- Real spend tracking: weekly + monthly totals vs budget
- Auto-generated shopping list from diary (editable, checkable)
- Multi-user with full data isolation via Supabase RLS

---

## Database
Schema deployed to Supabase. Tables:
- `profiles` — macro targets (kcal/prot/carbs/fat) + weekly_budget + display_name
- `ingredients` — shared normalised ingredient dictionary (name, unit, category)
- `recipes` — private per user, includes source_url for imported recipes
- `recipe_ingredients` — quantities + per-unit nutrition + per-unit price
- `meal_logs` — date-based diary; each entry is a recipe OR manual entry with cost + macros
- `meal_plans` / `meal_plan_entries` — legacy week-based planning tables (unused in current build)
- `shopping_lists` + `shopping_list_items` — for Phase 5

Views:
- `recipe_totals` — auto-calculated nutrition + cost per recipe and per serving
- `daily_macro_summary` — aggregated macros (legacy)
- `weekly_spend_summary` — total spend vs budget (legacy)

RLS enabled on all user-scoped tables.

---

## Build Phases

### Phase 1 — Foundation ✅ Complete
- Supabase project + schema deployed
- Next.js 16 with TypeScript, Tailwind v4, Shadcn
- Magic link auth, protected routes, `proxy.ts` (Next.js 16 replaces `middleware.ts`)
- Vercel deployment

### Phase 2 — Recipes ✅ Complete
- `/recipes` list with cards (kcal + cost per serving)
- Create/edit form with dynamic ingredient rows (name, unit, qty, nutrition, price per unit)
- Detail page with macros + ingredients + instructions
- Favourite toggle, delete

### Phase 3 — Profile & Macro Display ✅ Complete
- `/profile` — set display name, daily macro targets, weekly budget
- Macro progress bars on recipe detail (% of daily targets)

### Phase 4 — Meal Diary & Dashboard ✅ Complete
- Grocery_Remix design system: parchment background, gunmetal palette, dark gradient NavBar
- `/planner` — interactive month calendar; past days show cost + meal count; today highlighted
- `/planner/[date]` — day view with totals, logged meal list, add-meal form
  - "From recipe" mode: pick recipe + servings → auto-fills cost + macros (all editable)
  - "Manual entry" mode: name + cost + optional macros
- `/dashboard` — time-of-day greeting, week/month spend stats, budget progress, today's macros

### Phase 5 — Shopping List ✅ Complete
- Auto-generate from last 7 days of meal_logs → recipe_ingredients → ingredients
- Quantities aggregated by ingredient, multiplied by number of times recipe was logged
- Manual add custom items (name + qty + unit, removable)
- Mobile check-off UI with strikethrough and uncheck-all
- Category grouping sorted by type

### Phase 6 — URL & File Recipe Import ✅ Complete
- Next.js Route Handler (`/api/import-recipe`) — fetches URL, extracts JSON-LD or truncated HTML, Claude Haiku parses → structured JSON
- Next.js Route Handler (`/api/import-recipe-file`) — accepts PDF/DOCX upload, extracts text with pdf-parse/mammoth, Claude Haiku parses
- Import page (`/recipes/import`) with URL tab and PDF/Word tab (drag-and-drop upload zone)
- `RecipeForm` accepts `importedData?` prop — pre-fills all fields without triggering edit mode
- "Import Recipe" button on recipes list page

### Phase 6.5 — Bulk Scheduling ✅ Complete
- `bulkLogMeals` server action — logs a recipe to every day in a date range (max 31 days)
- `createQuickRecipe` server action — creates a 1-serving recipe from name + total macros + cost
- "Log to multiple days" inline form on recipe detail page
- "Bulk schedule" panel on planner page — recipe picker + date range + servings + meal type
- "Create new recipe" inline within bulk schedule panel

### Phase 7 — Spend Log ✅ Complete
- `/spend-log` page — monthly view with prev/next navigator, rolling 12-month bar chart (click to navigate), entry list + add form
- Dashboard updated to include spend_logs in week/month spend totals
- "Spend" added to NavBar

### Phase 8 — Performance
- `loading.tsx` files on slow server routes (recipes, planner, spend-log, shopping-list)
- Suspense boundaries around data-heavy sections within pages
- Optimistic UI for low-stakes mutations: favourite toggle, meal delete, spend delete
- Prefetch key links (today's planner page, recipes list) on dashboard hover

### Phase 9 — Recipe Tagging & Search
- **Requires DB migration:** `alter table recipes add column tags text[] default '{}'; create index recipes_tags_gin on recipes using gin(tags);`
- Tag input on recipe create/edit form — free-text with common suggestions (Vegetarian, Vegan, High Protein, Quick, Dairy-free, etc.)
- Tag pills on recipe cards and detail page
- Filter bar on `/recipes` — filter by one or more tags, plus text search on title
- Tag-based filter passed as URL `?tag=X` param (server-side, no client state)

### Phase 10 — Notifications & Nudges
- In-app nudge on dashboard: "You haven't logged anything today" if no meal_logs for today
- Logging streak counter: consecutive days with at least one log
- Web Push notifications (service worker + Vercel cron) — opt-in reminder at user-chosen time (e.g. 7pm "Don't forget to log dinner")
- Budget alert: dashboard warning when weekly spend exceeds 90% of budget

### Phase 11 — Barcode Scanning ✅ Complete
- Barcode scan button on each ingredient row in RecipeForm — opens camera via Web API
- `@zxing/browser` for camera-based barcode decoding (no native app needed)
- Open Food Facts API lookup by barcode → ingredient name + per-100g macros
- Auto-fills ingredient name, unit (g/ml), and nutrition fields; user adjusts quantity
- Graceful fallback to manual entry if camera unavailable or barcode not found

### Phase 12 — Quick Wins (Polish) ✅ Complete
- **Active nav highlighting** — `NavLinks` client component, `usePathname()` highlights current route with frosted pill
- **Empty states** — SVG illustration + description + CTA on recipes list, day view, shopping list
- **Smooth page transitions** — `experimental.viewTransition: true` in next.config; crossfade between all routes

### Phase 13 — Bottom Nav ✅ Complete
- Fixed bottom tab bar always visible (Recipes / Diary / Shop / Spend / Profile + SVG icons)
- Top nav simplified to brand-only header; bottom nav handles all navigation on all screen sizes
- Active tab highlighted via `usePathname()`; iPhone safe-area-inset-bottom padding
- Diary tab links to `/planner` calendar overview
- Sign-out button on Profile page (prominent destructive style with icon)

### Phase 14 — Recipe Images
- Add `cover_image_url text` column to `recipes` table (Supabase migration)
- Supabase Storage bucket `recipe-images` (private, user-scoped RLS policy)
- Image upload input on RecipeForm — client-side preview before submit, upload on save
- Recipe cards show cover image (aspect-ratio 4/3, object-cover) with fallback to coloured placeholder
- Recipe detail page shows full-width hero image in header
- Optional: auto-fetch OG image from `source_url` during URL import

### Phase 15 — Macro Donut on Recipe Detail ✅ Complete
- Pure SVG donut (strokeDasharray arcs) showing protein/carbs/fat split; kcal in centre
- Hover thickens arc segment and scales legend dot; legend shows grams + % of macro split
- Gunmetal/amber/sage colour scheme matches design system
- Falls back to kcal+cost stat grid when only calorie data available (no macro breakdown)

---

## Key Technical Decisions
- App Router (Next.js 16) — `proxy.ts` not `middleware.ts`, params are Promises (`await params`)
- `cookies()` is async in Next.js 15+ — must `await cookies()`
- Shadcn v4: no `asChild` on Button — use `<Link className={buttonVariants()}>` pattern
- Meal diary is date-based logging (actual consumption), not week-based planning
- `meal_logs` allows recipe OR manual entry; constraint enforces at least one name source
- PowerShell `>` writes UTF-16 LE — convert with Node after `supabase gen types`
- Nutrition stored per-unit on `recipe_ingredients` (not global lookup) — revisit in Phase 6
- All monetary values in GBP, stored as `numeric` to avoid float rounding
