# Meal Planner App — Project Plan

## Stack
- **Frontend:** Next.js 14 (App Router) + TypeScript
- **Styling:** Tailwind CSS + Shadcn/ui
- **Backend/DB:** Supabase (Postgres + Auth + Storage)
- **Deployment:** Vercel

## Core Features
- Save private recipes (manual entry + URL import)
- Weekly meal planner (calendar grid)
- Daily macro tracking (kcal, protein, carbs, fat) vs personal targets
- Per-ingredient price tracking + weekly spend vs budget
- Auto-generated shopping list from meal plan (editable, checkable)
- Multi-user with full data isolation via Supabase RLS

---

## Database
Schema fully deployed to Supabase. Tables:
- `profiles` — extends auth.users with macro targets + weekly budget
- `ingredients` — shared normalised ingredient dictionary (name, unit, category)
- `recipes` — private per user, includes source_url for imported recipes
- `recipe_ingredients` — quantities + per-unit nutrition + per-unit price
- `meal_plans` — one per user per week (keyed on Monday date)
- `meal_plan_entries` — recipe slots per day/meal_type within a plan
- `shopping_lists` + `shopping_list_items` — generated from meal plan, editable

Views:
- `recipe_totals` — auto-calculated nutrition + cost per recipe and per serving
- `daily_macro_summary` — aggregated macros per day per meal plan
- `weekly_spend_summary` — total spend vs budget per week

RLS enabled on all user-scoped tables. Indexes on all FK and filter columns.

---

## Build Phases

### Phase 1 — Foundation
- Supabase project setup ✅ (schema deployed)
- Next.js project init with TypeScript + Tailwind + Shadcn
- Supabase auth (magic link email)
- Protected `/dashboard` route
- Supabase typed client setup (`@supabase/ssr`)
- Deploy skeleton to Vercel

### Phase 2 — Recipes
- Recipe list page (`/recipes`)
- Recipe create/edit form with dynamic ingredient rows
- Recipe detail page
- Display per-recipe macro + cost totals (from `recipe_totals` view)
- Favourite toggle

### Phase 3 — Macro & Cost Display
- Profile setup page (set macro targets + weekly budget)
- Per-recipe macro breakdown UI (progress bars vs targets)
- Cost per serving display on recipe cards

### Phase 4 — Meal Planner
- Weekly calendar grid UI (`/planner`)
- Add/remove recipes to day + meal_type slots
- Daily macro totals vs targets (from `daily_macro_summary` view)
- Weekly estimated spend (from `weekly_spend_summary` view)
- Navigate between weeks

### Phase 5 — Shopping List
- Auto-generate list from active meal plan (aggregate + merge ingredients)
- Edit list (add custom items, adjust quantities, delete)
- Check off items on mobile during shop
- Group by category (aisle order)
- Display total estimated cost vs weekly budget

### Phase 6 — URL Recipe Import
- Supabase Edge Function (TypeScript) to scrape URL
- LLM parsing (Claude API) to extract structured recipe data
- Map parsed data to recipe + recipe_ingredients schema
- Review/edit before saving UI

---

## Key Technical Decisions
- App Router (not Pages Router) — modern standard, worth learning early
- Nutrition stored per-unit on `recipe_ingredients` (not a global lookup) — simpler for Phase 1, revisit in Phase 6
- Shopping list generation is a server action that aggregates `meal_plan_entries` → `recipe_ingredients`, scales by servings, merges duplicate ingredients
- `day_of_week` and `meal_type` are Postgres enums for type safety
- All monetary values in GBP, stored as `numeric` not `float` to avoid rounding errors
