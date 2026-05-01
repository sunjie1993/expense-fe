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
- **SWR global config** (`src/components/providers.tsx`): `revalidateOnFocus: false`, `shouldRetryOnError: false`. Also mounts `<Toaster position="top-center" richColors />` (sonner).
- **Forms**: react-hook-form + Zod schemas (in `src/lib/validations/`). Form fields are modular components in `src/components/expenses/form-fields/`. The expense form uses a two-tier category selection: main category → subcategory (lazy-loaded via `useSubCategories(mainCategoryId)`), managed by `useExpenseForm` hook. `main_category_id` is a form-only field used to drive subcategory loading — it is **not** sent to the API; only `category_id` (the subcategory) is submitted.
- **Form validation extras** (`src/lib/validations/expense.ts`): exports `expenseSchema` (Zod schema), `ExpenseFormValues` (inferred TS type), `SPENDER_OPTIONS` (array of `{value, label}` for SJ/YS/Shared), and `getTodayDate()` (returns today as `YYYY-MM-DD` ISO string, used as the default expense date).
- **Category icons**: `CategoryIcon` and `CategoryIconBadge` in `src/lib/category-icons.tsx` — map icon name strings from the API to Lucide icons.
- **API layer**: `src/lib/api.ts` exports `apiGet<T>`, `apiPost<T>`, `apiPut<T>`, `apiDelete<T>` plus the SWR-compatible `fetcher()`. Also exports token helpers used by auth-context: `getAccessToken()`, `setAccessToken()`, `getRefreshToken()`, `setRefreshToken()`, `clearTokens()`. Uses native `fetch` (not Axios despite it being installed).
- **Types**: All API interfaces in `src/types/api.ts`.
- **Charts**: `ChartContainer` in `src/components/ui/chart.tsx` uses its own `ResizeObserver` (via `ref`) to measure dimensions before rendering `ResponsiveContainer` with explicit pixel values — this prevents Recharts' `-1` dimension warning on initial render.

### Utility functions (`src/lib/utils.ts`)

- `cn(...inputs)` — merges Tailwind classes via `clsx` + `tailwind-merge`; used throughout all components.
- `formatCurrency(amount, options?)` — formats to SGD using `en-SG` locale.
- `getCurrentMonth()` / `getCurrentYear()` — returns current `"YYYY-MM"` / `"YYYY"` strings.
- `formatPeriodDisplay(period, date)` — human-readable label, e.g. `"April 2026"` or `"2026"`.
- `navigatePeriod(period, currentDate, direction)` — increments/decrements a period date string.
- `formatExpenseDate(dateString)` — returns `{ day, monthYear }` split for display in expense rows.

### Custom hooks (`src/hooks/`)

| Hook | Endpoint | Notes |
|------|----------|-------|
| `useDashboardOverview(period, date)` | `/api/dashboard/overview` | Main stat cards |
| `useSpenderBreakdown(period, date)` | `/api/dashboard/spender-breakdown` | Pie/donut chart |
| `useCategoryDrillDown(categoryId, period, date)` | `/api/dashboard/category-drill/:id` | Null key = disabled |
| `useDailyTrend(yearMonth)` | `/api/dashboard/daily-trend` | Monthly only; null key = disabled |
| `useRecentExpenses(limit?)` | `/api/expenses?limit=N&offset=0` | Default limit 5 |
| `usePaymentMethods()` | `/api/payment-methods` | Used in expense form |
| `useExpenses(params?)` | `/api/expenses` | Full filtered list; params: `spentBy`, `categoryId`, `startDate`, `endDate`, `limit`, `offset` |
| `useMainCategories()` | `/api/categories/main` | Top-level categories |
| `useSubCategories(parentId)` | `/api/categories/sub/:id` | Null key = disabled; used in expense form |
| `useAllCategories()` | `/api/categories/all` | Flat list of all categories |
| `useExpenseForm({open, onSuccess})` | — | Form state + submit logic; not a data-fetching hook |

### Routing & layout

| Route | Purpose |
|-------|---------|
| `/` | Redirects to `/dashboard/` or `/login/` based on auth |
| `/login/` | Passcode-based login |
| `/dashboard/` | Main dashboard with stat cards, chart, category ranking |
| `/dashboard/expenses/` | Expense management with filters and pagination |

Dashboard layout (`src/app/dashboard/layout.tsx`): `Sidebar` on desktop (md+), `MobileNav` bottom tab bar on mobile. Main content has `pb-16 md:pb-0` to clear the mobile tab bar. `AddExpenseFab` is desktop-only (`hidden md:block`); on mobile the tab bar's centre button opens the add dialog.

### Design system

- **Component library**: Shadcn UI (Radix primitives + Tailwind), components in `src/components/ui/`. Config in `src/components.json` — style preset `new-york`, path aliases `@/ui`, `@/hooks`, `@/lib`, `@/components`.
- **Styling**: Tailwind 4 with `@theme inline` in `globals.css`. All color tokens use oklch.
- **Fonts**: Two-font system via `next/font/google`:
  - `Bebas Neue` — display/heading font, CSS var `--font-heading`. Applied via base layer CSS to `h1`, `h2`, `h3`, and `[data-slot="card-title"]`. Letter-spacing 0.06em.
  - `Montserrat` — body font, CSS var `--font-montserrat`. Applied to `<body>`.
- **Hero theme system**: Marvel Avengers-inspired dark theme with per-hero colour palettes. Always dark regardless of system theme.
  - Background: near-black `oklch(0.09 0.015 20)` — shared by all heroes.
  - Card: `oklch(0.13 0.015 20)` — shared by all heroes.
  - Per-hero tokens (`--primary`, `--accent`, `--chart-1..5`, `--glow`, `--ring`, `--shadow-color`) are defined as `[data-hero="<id>"]` CSS blocks in `globals.css`. The active hero id is applied to `<html>` by `HeroThemeProvider`.
  - Heroes: `iron-man` (red/gold), `captain-america` (navy/silver), `thor` (royal-blue/gold), `hulk` (green/purple), `black-panther` (vibranium-purple/silver), `scarlet-witch` (crimson/magenta).
  - Hero metadata (id, name, tagline, preview hex swatches) lives in `src/lib/themes.ts`.
  - Active hero persisted to `localStorage` key `expense-hero-theme`; default is `iron-man`.
  - **Hero selector**: `src/components/hero-selector.tsx` — Shadcn Dialog with 6 hero cards. Opened from sidebar (desktop) or "Hero" tab in mobile nav.
- **Radius**: `--radius: 0.375rem` base (sharper/more geometric) — cards `rounded-xl`, dialogs `rounded-3xl`, buttons `rounded-full`, inputs `rounded-xl`
- **Elevation**: `.elevation-0/1/2/4/8` utility classes emit hero-coloured glow box-shadows via `color-mix(in oklch, var(--glow) X%, transparent)` — they automatically adapt to the active hero.
- **Extra CSS utilities** (`globals.css`): `.glass-card`, `.glass-hover` (glassmorphism); `.gradient-primary`, `.gradient-card`, `.gradient-shine`, `.glow-border`, `.gradient-text` (gradient effects); `.shimmer`, `.shadow-colored`, `.progress-bar` (misc effects).
- **Animations**: Custom keyframes in `globals.css`:
  - Page/UI: `animate-fade-in-up`, `animate-fade-in-down`, `animate-shake`, `animate-counter`
  - List stagger: `expense-row-animation`, `category-rank-animation`
  - Hero/Avengers: `animate-overlay-in`, `animate-shape-in`, `animate-hero-glow`, `animate-float-pulse`
  - Also uses `tw-animate-css` package.
- **Login transition**: After successful login, `src/app/login/page.tsx` renders `AvengersTransitionOverlay` (`src/components/avengers-transition-overlay.tsx`) — full-screen overlay with the Avengers "A" SVG assembling with a spring + glow animation, before navigating to `/dashboard/` after 1.8s.
- **Login background**: Faint decorative SVG shapes (large A, shield rings, star, small A) at screen corners, pulsing with `animate-float-pulse`.
- **Dashboard loading**: The auth-check loading state shows a pulsing Avengers "A" with `animate-hero-glow`.

### Spender colours

Hardcoded in two places — keep them in sync:

| Spender | Hex | Usage |
|---------|-----|-------|
| SJ | `#e8185a` (magenta) | `SPENDER_COLORS` in `spender-breakdown-chart.tsx`; Tailwind classes in `spender-badge.tsx` |
| YS | `#0fb8c9` (teal) | same |
| Shared | `#d4a017` (dalgona gold) | same |

Tailwind badge classes (dark-friendly): `bg-pink-500/15 text-pink-300 border-pink-500/30` / `bg-cyan-500/15 text-cyan-300 border-cyan-500/30` / `bg-amber-500/15 text-amber-300 border-amber-500/30`.

### Domain

- `spent_by` values: `"SJ"` | `"YS"` | `"Shared"` (the two users sharing expenses)
- Dashboard hooks take a `period` (`"monthly"` | `"yearly"`) + `date` pair: monthly uses `"YYYY-MM"`, yearly uses `"YYYY"`.
- Expenses page uses responsive layout: card list on mobile (`sm:hidden`), table on desktop (`hidden sm:block`).
- Locale: `en-SG` (Singapore) for currency formatting and dates.
- Always use trailing slashes in `href` values (`trailingSlash: true` is set in `next.config.ts`).
- TypeScript path alias `@/*` maps to `./src/*` (configured in `tsconfig.json`).
- Environment: no `.env.example` — only `.env.production` exists. For local dev, create `.env.local` with `NEXT_PUBLIC_API_URL=http://localhost:8787`.
