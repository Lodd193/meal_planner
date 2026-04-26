# Meal Planner App — Progress

## Status: Phase 1 — Foundation (Nearly complete — Vercel deploy remaining)

---

## Completed

### Database
- [x] Supabase project created
- [x] Full schema deployed (tables, views, RLS, indexes, triggers)
- [x] Auth enabled (magic link)

---

## Up Next — Phase 1 Remaining

- [x] `npx create-next-app@latest` — Next.js 16.2.4, TypeScript, Tailwind, App Router, no src/ directory
- [x] Install Shadcn: `npx shadcn@latest init` (Tailwind v4, defaults)
- [x] Install Supabase client: `npm install @supabase/supabase-js @supabase/ssr`
- [x] Create `utils/supabase/client.ts` and `utils/supabase/server.ts` (async cookies — Next.js 16 pattern)
- [x] Folder structure created: app/(auth), dashboard, recipes, planner, shopping-list, components/ui, utils/supabase, types
- [x] Add `.env.local` with `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- [x] Generate Supabase TypeScript types: `npx supabase gen types typescript --project-id rsabnoexqtqtayaizjtr > types/supabase.ts`
- [x] Build auth flow: sign-in page, magic link callback route, middleware session refresh
- [x] Protected `/dashboard` route (middleware + server-side guard)
- [ ] Deploy to Vercel + add env vars in Vercel dashboard

---

## Phase 2 — Recipes
- [ ] `/recipes` list page
- [ ] Recipe create form with dynamic ingredient rows
- [ ] Recipe edit/delete
- [ ] Recipe detail page
- [ ] Display totals from `recipe_totals` view
- [ ] Favourite toggle

## Phase 3 — Macro & Cost Display
- [ ] Profile setup page (macro targets + weekly budget)
- [ ] Macro progress bars on recipe detail
- [ ] Cost per serving on recipe cards

## Phase 4 — Meal Planner
- [ ] Weekly calendar grid
- [ ] Add/remove recipe slots
- [ ] Daily macro summary display
- [ ] Weekly spend display
- [ ] Week navigation

## Phase 5 — Shopping List
- [ ] Auto-generate from meal plan
- [ ] Edit list items
- [ ] Mobile check-off UI
- [ ] Category grouping

## Phase 6 — URL Import
- [ ] Supabase Edge Function scaffold
- [ ] Scraping + Claude API parsing
- [ ] Review/edit UI before save

---

## Notes / Decisions Log
- Using App Router (Next.js 14) not Pages Router
- Nutrition per-unit stored on recipe_ingredients (not global lookup) — revisit Phase 6
- No src/ directory convention
- Shadcn for UI components throughout
