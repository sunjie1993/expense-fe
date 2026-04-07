# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Dev server with HTTPS (experimental)
npm run dev:http   # Dev server over HTTP
npm run build      # Production build (static export to /out)
npm run lint       # ESLint check
```

No test suite configured.

## Architecture

**Static export Next.js 16 app** — `output: 'export'` + `trailingSlash: true` in `next.config.ts`, deployed as JAMstack. No API routes, no SSR. All pages are `"use client"`. React Compiler (`babel-plugin-react-compiler`) is enabled.

**Backend**: Cloudflare Worker at `NEXT_PUBLIC_API_URL` (falls back to `http://localhost:8787`). The `fetcher` and `api*` functions in `src/lib/api.ts` prepend this base URL to every relative path — so SWR cache keys are relative paths (e.g. `/api/expenses?limit=50`) and the fetcher resolves them to the full URL.

### Key patterns

- **Auth**: React Context (`src/contexts/auth-context.tsx`) — access token in a module-level variable (memory only), refresh token in `sessionStorage`. On mount (non-login pages), attempts a token refresh from `sessionStorage` before marking auth ready. Auto-refresh on 401; redirect to `/login/` on failure.
- **Server state**: SWR via custom hooks in `src/hooks/` — each wraps `fetcher()` from `src/lib/api.ts`. After mutations, invalidate both `/api/expenses` and `/api/dashboard` keys using `useSWRConfig().mutate` with a key-matching predicate: `(key) => typeof key === "string" && (key.includes("/api/expenses") || key.includes("/api/dashboard"))`.
- **Forms**: react-hook-form + Zod schemas (in `src/lib/validations/`). Form fields are modular components in `src/components/expenses/form-fields/`. The expense form uses a two-tier category selection: main category → subcategory (lazy-loaded via `useSubCategories(mainCategoryId)`), managed by `useExpenseForm` hook. `main_category_id` is a form-only field used to drive subcategory loading — it is **not** sent to the API; only `category_id` (the subcategory) is submitted.
- **Category icons**: `CategoryIcon` and `CategoryIconBadge` in `src/lib/category-icons.tsx` — map icon name strings from the API to Lucide icons.
- **API layer**: `src/lib/api.ts` exports `apiGet<T>`, `apiPost<T>`, `apiPut<T>`, `apiDelete<T>` plus the SWR-compatible `fetcher()`. Uses native `fetch` (not Axios despite it being installed).
- **Types**: All API interfaces in `src/types/api.ts`.
- **Charts**: `ChartContainer` in `src/components/ui/chart.tsx` uses its own `ResizeObserver` (via `ref`) to measure dimensions before rendering `ResponsiveContainer` with explicit pixel values — this prevents Recharts' `-1` dimension warning on initial render.

### Routing & layout

| Route | Purpose |
|-------|---------|
| `/` | Redirects to `/dashboard/` or `/login/` based on auth |
| `/login/` | Passcode-based login |
| `/dashboard/` | Main dashboard with stat cards, chart, category ranking |
| `/dashboard/expenses/` | Expense management with filters and pagination |

Dashboard layout (`src/app/dashboard/layout.tsx`): `Sidebar` on desktop (md+), `MobileNav` bottom tab bar on mobile. Main content has `pb-16 md:pb-0` to clear the mobile tab bar. `AddExpenseFab` is desktop-only (`hidden md:block`); on mobile the tab bar's centre button opens the add dialog.

### Design system

- **Component library**: Shadcn UI (Radix primitives + Tailwind), components in `src/components/ui/`
- **Styling**: Tailwind 4 with `@theme inline` in `globals.css`. All color tokens use oklch.
- **Font**: Montserrat via `next/font/google`, CSS var `--font-montserrat`
- **Radius**: `--radius: 0.625rem` base — cards `rounded-2xl`, dialogs `rounded-3xl`, buttons `rounded-full`, inputs `rounded-xl`
- **Elevation**: `.elevation-0/1/2/4/8` utility classes (box-shadow based, defined in `globals.css`)
- **Animations**: Custom keyframes in `globals.css` (`animate-fade-in-up`, `animate-shake`, `animate-counter`, `expense-row-animation`, `category-rank-animation`). Also uses `tw-animate-css` package.
- **Dark mode**: Full dark mode via `.dark` class; `next-themes` handles toggling.

### Domain

- `spent_by` values: `"SJ"` | `"YS"` | `"Shared"` (the two users sharing expenses)
- Dashboard hooks take a `period` (`"monthly"` | `"yearly"`) + `date` pair: monthly uses `"YYYY-MM"`, yearly uses `"YYYY"`.
- Expenses page uses responsive layout: card list on mobile (`sm:hidden`), table on desktop (`hidden sm:block`).
- Locale: `en-SG` (Singapore) for currency formatting and dates.
- Always use trailing slashes in `href` values (`trailingSlash: true` is set in `next.config.ts`).