# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Product

Two-person shared expense tracker for SJ and YS. Passcode-based auth, dashboard with charts and category rankings, expense management with filters and pagination. Deployed as a static export to Cloudflare Pages; backend is a Cloudflare Worker.

## Tech stack

- **Framework**: Next.js 16, App Router, static export (`output: 'export'`), React 19
- **Language**: TypeScript 6 (`@/*` alias → `./src/*`)
- **Styling**: Tailwind 4 (`@theme inline`), Shadcn UI (new-york preset, Radix primitives)
- **State**: SWR for server state; React Context for auth and hero theme; react-hook-form + Zod for forms
- **Charts**: Recharts with a custom `ChartContainer` to avoid `-1`-dimension warnings
- **Toasts**: Sonner (`<Toaster position="top-center" richColors />` in providers)
- **Compiler**: React Compiler enabled via `babel-plugin-react-compiler`
- **HTTP**: native `fetch` (not Axios — it is installed but unused)

## Folder layout

```
src/
  app/                  # Routes: /, /login/, /dashboard/, /dashboard/expenses/
  components/
    ui/                 # Shadcn UI primitives (button, card, dialog, …)
    dashboard/          # Dashboard-specific components (stat cards, charts, nav)
    expenses/           # Expense list, form, form-fields/, filters
  contexts/             # auth-context.tsx, hero-theme-context.tsx
  hooks/                # SWR data-fetching hooks (one file per domain)
  lib/
    api.ts              # fetch wrapper, apiGet/Post/Put/Delete, fetcher(), token helpers
    utils.ts            # cn(), formatCurrency(), period helpers, formatExpenseDate()
    themes.ts           # HERO_THEMES, HERO_CSS_VARS, HeroId type
    category-icons.tsx  # CategoryIcon / CategoryIconBadge (icon name → Lucide)
    validations/        # Zod schemas (expense.ts exports expenseSchema, SPENDER_OPTIONS, getTodayDate)
  types/
    api.ts              # All API response interfaces
```

## Commands

```bash
npm run dev        # Dev server with HTTPS (experimental)
npm run dev:http   # Dev server over HTTP
npm run build      # Production build → /out
npm run lint       # ESLint
```

No test suite configured.

## Always do

- **Trailing slashes** — all `href` values must end with `/` (`trailingSlash: true` is set).
- **SWR invalidation after mutations** — invalidate with the predicate `(key) => typeof key === "string" && (key.includes("/api/expenses") || key.includes("/api/dashboard"))` to cover both pages.
- **`main_category_id` is UI-only** — drives subcategory loading; never include it in API payloads (only `category_id` is sent).
- **SSR guards** — use `globalThis.window` / `globalThis.sessionStorage`, not `typeof window`.
- **Use `api*` helpers, never raw `fetch`** — `apiGet`, `apiPost`, `apiPut`, `apiDelete` in `src/lib/api.ts` handle auth headers and token refresh automatically.
- **Locale `en-SG`** — all currency (`formatCurrency`) and date formatting.

## Key conventions

**Components**: all pages are `"use client"` (static export — no SSR). Shadcn components added via `npx shadcn@latest add <name>`.

**SWR keys** are relative paths (e.g. `/api/expenses?limit=50`); `fetcher()` prepends `NEXT_PUBLIC_API_URL`.

**Auth**: access token in a module-level variable (memory only); refresh token in `sessionStorage`. `auth-context.tsx` handles refresh on mount and redirects to `/login/` on 401.

**Forms**: two-tier category selection — main category → subcategory. `useExpenseForm` manages state. `main_category_id` resets `category_id` when changed.

**`getRefreshToken`** in `api.ts` is private (not exported); token helpers exported are `getAccessToken`, `setAccessToken`, `setRefreshToken`, `clearTokens`.

## Design system

**Hero theme** — Marvel Avengers dark theme, always dark. Six heroes: `iron-man` (default), `captain-america`, `thor`, `hulk`, `black-panther`, `scarlet-witch`. Active hero stored in `localStorage` key `expense-hero-theme`.

Per-hero CSS tokens (`--primary`, `--accent`, `--chart-1..5`, `--glow`, `--ring`, `--shadow-color`) are applied two ways by `HeroThemeProvider`: `el.dataset.hero` (matches `[data-hero="…"]` CSS blocks in `globals.css`) **and** inline `el.style.setProperty` from `HERO_CSS_VARS` in `themes.ts`.

Shared base colors: background `oklch(0.09 0.015 20)`, card `oklch(0.13 0.015 20)`. Elevation utility classes `.elevation-0/1/2/4/8` emit hero-coloured glow shadows via `color-mix(in oklch, var(--glow) X%, transparent)`.

Fonts: `Bebas Neue` (`--font-heading`) for headings/card titles; `Montserrat` (`--font-montserrat`) for body.

Radius: `--radius: 0.375rem` base → cards `rounded-xl`, dialogs `rounded-3xl`, buttons `rounded-full`, inputs `rounded-xl`.

**Spender colours** — hardcoded in two places, keep in sync: `spender-breakdown-chart.tsx` (`SPENDER_COLORS`) and `spender-badge.tsx` (Tailwind classes):

| Spender | Hex | Tailwind badge |
|---------|-----|----------------|
| SJ | `#e8185a` magenta | `bg-pink-500/15 text-pink-300 border-pink-500/30` |
| YS | `#0fb8c9` teal | `bg-cyan-500/15 text-cyan-300 border-cyan-500/30` |
| Shared | `#d4a017` gold | `bg-amber-500/15 text-amber-300 border-amber-500/30` |

## Key terminology

- **`spent_by`**: `"SJ"` | `"YS"` | `"Shared"`
- **period/date pair**: `"monthly"` + `"YYYY-MM"` or `"yearly"` + `"YYYY"`
- **Hero**: the active Avengers colour palette applied to `<html>`

## Custom hooks reference

| Hook | Endpoint |
|------|----------|
| `useDashboardOverview(period, date)` | `/api/dashboard/overview` |
| `useSpenderBreakdown(period, date)` | `/api/dashboard/spender-breakdown` |
| `useCategoryDrillDown(categoryId, period, date)` | `/api/dashboard/category-drill/:id` (null = disabled) |
| `useDailyTrend(yearMonth)` | `/api/dashboard/daily-trend` (null = disabled) |
| `useRecentExpenses(limit?)` | `/api/expenses?limit=N&offset=0` (default 5) |
| `useExpenses(params?)` | `/api/expenses` (filters: `spentBy`, `categoryId`, `startDate`, `endDate`, `limit`, `offset`) |
| `useMainCategories()` | `/api/categories/main` |
| `useSubCategories(parentId)` | `/api/categories/sub/:id` (null = disabled) |
| `useAllCategories()` | `/api/categories/all` |
| `usePaymentMethods()` | `/api/payment-methods` |
| `useExpenseForm({open, onSuccess})` | — form state + submit, not a data hook |

## Local dev

Create `.env.local` with `NEXT_PUBLIC_API_URL=http://localhost:8787`. No `.env.example` — only `.env.production` is committed.
