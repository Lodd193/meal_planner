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

### Phase 7 — Spend Log
- **Requires DB migration first** — run SQL in Supabase before building (see progress.md)
- `/spend-log` page — monthly view with navigator, entry list, add form
- Dashboard updated to include spend_logs in week/month spend totals
- "Spend" added to NavBar

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
