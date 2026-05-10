# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Product

Two-person shared expense tracker for SJ and YS. Passcode-based auth, dashboard with charts and category rankings, expense management with filters and pagination. Deployed as a static export to Cloudflare Pages; backend is a Cloudflare Worker.

## Tech stack

- **Framework**: Next.js 16, App Router, static export (`output: 'export'`), React 19
- **Language**: TypeScript 6 (`@/*` alias → `./src/*`)
- **Styling**: Tailwind 4 (`@theme inline`), Shadcn UI (new-york preset, Radix primitives)
- **State**: SWR for server state; React Context for auth; react-hook-form + Zod for forms
- **Charts**: Recharts with a custom `ChartContainer` to avoid `-1`-dimension warnings
- **Toasts**: Sonner (`<Toaster position="top-center" richColors />` in providers)
- **Compiler**: React Compiler enabled via `babel-plugin-react-compiler`
- **HTTP**: native `fetch` (not Axios — it is installed but unused)

## Folder layout

```
src/
  app/                  # Routes: /, /login/, /dashboard/, /dashboard/expenses/
  components/
    ui/                 # Shadcn UI primitives (button, card, dialog, …) + category-icon.tsx (CategoryIcon / CategoryIconBadge)
    dashboard/          # Dashboard-specific components (stat cards, charts, nav)
    expenses/           # Expense list, expense-form-dialog.tsx, form-fields/, filters
  contexts/             # auth-context.tsx
  hooks/                # SWR data-fetching hooks (one file per domain)
  lib/
    api.ts              # fetch wrapper, apiGet/Post/Put/Delete, fetcher(), isExpenseKey, token helpers
    utils.ts            # cn(), formatCurrency(), period helpers, formatExpenseDate()
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
- **SWR invalidation after mutations** — use `isExpenseKey` from `src/lib/api.ts` as the predicate passed to `mutate(isExpenseKey)`. It covers both `/api/expenses` and `/api/dashboard` keys.
- **SSR guards** — use `globalThis.window` / `globalThis.sessionStorage`, not `typeof window`.
- **Use `api*` helpers, never raw `fetch`** — `apiGet`, `apiPost`, `apiPut`, `apiDelete` in `src/lib/api.ts` handle auth headers and token refresh automatically.
- **Locale `en-SG`** — all currency (`formatCurrency`) and date formatting.

## Key conventions

**Components**: all pages are `"use client"` (static export — no SSR). Shadcn components added via `npx shadcn@latest add <name>`.

**SWR keys** are relative paths (e.g. `/api/expenses?limit=50`); `fetcher()` prepends `NEXT_PUBLIC_API_URL`.

**Auth**: access token in a module-level variable (memory only); refresh token in `sessionStorage`. `auth-context.tsx` handles refresh on mount and redirects to `/login/` on 401.

**Forms**: single inline grouped category picker. `useExpenseForm` handles both create and edit — pass `expense` for edit mode, omit it for create. It uses `useAllCategories` + `useMainCategories` together; `CategoryInlineField` groups subcategories under their parent header. Only `category_id` is sent to the API. `ExpenseFormDialog` is the single dialog component for both modes.

**`getRefreshToken`** in `api.ts` is private (not exported); token helpers exported are `getAccessToken`, `setAccessToken`, `setRefreshToken`, `clearTokens`.

## Design system

Standard shadcn light theme (zinc/neutral palette). White background, near-black primary, light gray accents. Font: Inter (`--font-sans`). Radius: `--radius: 0.625rem`.

**Spender colours** — hardcoded in two places, keep in sync: `spender-breakdown-chart.tsx` (`SPENDER_COLORS`) and `spender-badge.tsx` (Tailwind classes):

| Spender | Hex | Tailwind badge |
|---------|-----|----------------|
| SJ | `#e8185a` magenta | `bg-pink-50 text-pink-600 border-pink-200` |
| YS | `#0fb8c9` teal | `bg-cyan-50 text-cyan-700 border-cyan-200` |
| Shared | `#d4a017` gold | `bg-amber-50 text-amber-700 border-amber-200` |

## Key terminology

- **`spent_by`**: `"SJ"` | `"YS"` | `"Shared"`
- **period/date pair**: `"monthly"` + `"YYYY-MM"` or `"yearly"` + `"YYYY"`

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
| `useExpenseForm({expense?, open, onSuccess})` | — form state + submit; `expense` omitted = create, provided = edit |

## Local dev

Create `.env.local` with `NEXT_PUBLIC_API_URL=http://localhost:8787`. No `.env.example` — only `.env.production` is committed.
