# Meal Planner App — Progress

## Status: Phase 10 ✅ Complete (Tier 1) — Phase 11 next

---

## Completed

### Database
- [x] Supabase project created
- [x] Full schema deployed (tables, views, RLS, indexes, triggers)
- [x] Auth enabled (magic link)
- [x] `meal_logs` table added (date-based diary, recipe or manual entry, full macro + cost fields)

---

## Phase 1 — Foundation ✅ Complete
- [x] Next.js 16.2.4, TypeScript, Tailwind v4, App Router, Shadcn
- [x] Supabase SSR client (`utils/supabase/client.ts` + `server.ts`, async cookies)
- [x] `proxy.ts` (replaces deprecated `middleware.ts` in Next.js 16)
- [x] Auth flow: magic link sign-in, `/auth/callback` route, protected routes
- [x] Folder structure: `(auth)`, `dashboard`, `recipes`, `planner`, `shopping-list`
- [x] Deploy to Vercel — https://meal-planner-seven-brown.vercel.app

## Phase 2 — Recipes ✅ Complete
- [x] `/recipes` list page (cards with kcal + cost per serving)
- [x] Recipe create form with dynamic ingredient rows (name, unit, qty, nutrition, price)
- [x] Recipe edit/delete
- [x] Recipe detail page (macros + ingredients + instructions)
- [x] Display totals from `recipe_totals` view
- [x] Favourite toggle

## Phase 3 — Profile & Macro Display ✅ Complete
- [x] `/profile` setup page (display name, daily macro targets, weekly budget)
- [x] Macro progress bars on recipe detail (% of daily targets, shown when targets are set)
- [x] Cost per serving on recipe cards (was already in `recipe_totals` view)

## Phase 4 — Meal Diary & Dashboard ✅ Complete
- [x] Grocery_Remix design system applied (parchment background, gunmetal palette, Inter font)
- [x] NavBar with dark gradient header (Recipes / Planner / Shopping / Profile / Sign out)
- [x] `/planner` — interactive month calendar; past days clickable, show daily cost + meal count; today highlighted with gradient; future days greyed out; monthly spend total in header
- [x] `/planner/[date]` — day view: daily totals card, list of logged meals with delete, add-meal form
- [x] Add meal: toggle "From recipe" (auto-fills cost + macros by servings, all editable) or "Manual entry" (name + cost + optional macros)
- [x] `/dashboard` — redesigned: time-of-day greeting, week/month spend stats, weekly budget progress bar, today's macro progress bars vs targets, quick-action buttons

## Phase 5 — Shopping List ✅ Complete
- [x] Auto-generate from last 7 days of meal_logs → recipe_ingredients → ingredients (quantities aggregated + multiplied by log count)
- [x] Manual add custom items (name + qty + unit, removable)
- [x] Mobile check-off UI (tap to toggle, strikethrough, uncheck-all button)
- [x] Category grouping (sorted by produce → meat → dairy → pantry → frozen → other)

## Phase 6 — URL & File Recipe Import ✅ Complete
- [x] `app/api/import-recipe/route.ts` — fetches URL, extracts JSON-LD first (avoids 50KB truncation), falls back to stripped HTML, Claude Haiku parses
- [x] `app/api/import-recipe-file/route.ts` — accepts PDF/DOCX, extracts text with pdf-parse/mammoth, Claude Haiku parses
- [x] Import page with "From URL" / "From PDF/Word" tab toggle, drag-and-drop file upload zone
- [x] `RecipeForm` accepts `importedData?` prop — pre-fills without triggering edit mode
- [x] "Import Recipe" button on recipes list page
- [x] `proxy.ts` updated — `/api/` routes excluded from auth redirect (handle own auth)

## Phase 6.5 — Bulk Scheduling ✅ Complete
- [x] `bulkLogMeals` server action — inserts meal_logs for every date in range (max 31 days), multiplies macros by servings
- [x] `createQuickRecipe` server action — creates 1-serving recipe with single ingredient from total macros + cost
- [x] `LogToRangeForm` on recipe detail page — "+ Log to multiple days" inline form
- [x] `BulkScheduleForm` on planner page — "Bulk schedule" button, recipe picker + date range + meal type
- [x] Inline "Create new recipe" within bulk schedule — name + macros → creates and auto-selects recipe
- [x] Recipe detail page restyled — bg-card header, pill badges, ingredient divide-y list, numbered method step cards
- [x] RecipeCard improved — hover shadow, dot indicators, "No nutrition data yet" hint

## Phase 7 — Spend Log ✅ Complete
- [x] DB migration run: `spend_logs` table + RLS + index
- [x] `app/spend-log/actions.ts` — addSpendLog, deleteSpendLog server actions
- [x] `app/spend-log/_components/SpendLogList.tsx` — client component, add form + list + delete
- [x] `app/spend-log/page.tsx` — monthly view with prev/next navigator, total, entries
- [x] `app/dashboard/page.tsx` — spend_logs included in week/month spend totals
- [x] "Spend" link added to NavBar

## Phase 8 — Performance ✅ Complete
- [x] `app/dashboard/loading.tsx` — skeleton stat cards + macro bars
- [x] `app/recipes/loading.tsx` — skeleton recipe cards (6-up grid)
- [x] `app/planner/loading.tsx` — skeleton calendar grid
- [x] `app/spend-log/loading.tsx` — skeleton chart + total + list
- [x] `app/shopping-list/loading.tsx` — skeleton category groups
- [x] `FavouriteButton.tsx` — optimistic toggle (instant star, no page reload)
- [x] `MealLogList.tsx` — optimistic delete (item + totals update instantly)
- [x] `SpendLogList.tsx` — optimistic delete (item removed immediately)

## Phase 9 — Recipe Tagging & Search ✅ Complete
- [x] DB migration: `tags text[]` column pre-existed; GIN index created
- [x] `TagInput.tsx` — chip input with Enter/comma/backspace, preset suggestions (Vegetarian, Vegan, High Protein, Quick, etc.)
- [x] Tag pills on RecipeCard (up to 3) and recipe detail header (all tags, each links to filtered list)
- [x] `RecipeFilter.tsx` — search input (300ms debounce) + tag pill toggle bar, URL param driven
- [x] `recipes/page.tsx` — merges tags from `recipes` onto `recipe_totals`, filters server-side by `?tag` and `?q`
- [x] `actions.ts` — createRecipe / updateRecipe persist tags array
- [x] `RecipeForm.tsx` — TagInput wired in, tags included in submit

## Phase 10 — Notifications & Nudges ✅ Tier 1 Complete
- [x] Dashboard nudge: dashed-border banner links to today's planner if nothing logged yet
- [x] Logging streak: consecutive-day counter shown as a pill next to greeting (hidden when 0–1)
- [x] Budget alert: red-tinted warning card when weekly spend > 90% of budget; shows % used and overspend message
- [ ] Web Push (Tier 2): service worker + push subscription DB table + Vercel cron + profile opt-in

## Phase 11 — Barcode Scanning
- [ ] Install `@zxing/browser`
- [ ] `BarcodeScanner` client component — opens camera, decodes barcode, calls lookup
- [ ] `/api/barcode/[code]` route handler — fetches Open Food Facts API, returns name + macros
- [ ] Integrate scan button into RecipeForm ingredient rows
- [ ] Auto-fill ingredient name, unit, and per-unit nutrition from scan result
- [ ] Fallback UI when camera not available or barcode not in Open Food Facts

---

## Notes / Decisions Log
- Using App Router (Next.js 16.2.4) — `proxy.ts` replaces `middleware.ts`
- `cookies()` from `next/headers` is async in Next.js 15+ — must `await cookies()`
- Shadcn v4 uses `@base-ui/react/button` — no `asChild`; use `buttonVariants()` on `<Link>`
- Route params are Promises in Next.js 15+: `await params`
- Meal diary is date-based logging (what you actually ate), not week-based planning
- `meal_logs` constraint: `recipe_id IS NOT NULL OR custom_name IS NOT NULL`
- PowerShell `>` writes UTF-16 LE — pipe Supabase type gen through Node to convert to UTF-8
- Nutrition per-unit stored on `recipe_ingredients` (not global lookup) — revisit Phase 6
