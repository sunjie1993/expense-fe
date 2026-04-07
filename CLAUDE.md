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
- **Fonts**: Two-font system via `next/font/google`:
  - `Bebas Neue` — display/heading font, CSS var `--font-heading`. Applied via base layer CSS to `h1`, `h2`, `h3`, and `[data-slot="card-title"]`. Letter-spacing 0.06em.
  - `Montserrat` — body font, CSS var `--font-montserrat`. Applied to `<body>`.
- **Theme**: Squid Game-inspired dark theme. `:root` and `.dark` share the same dark palette — the app is always dark regardless of theme toggle.
  - Primary: hot magenta `oklch(0.58 0.28 350)` — the guard uniform pink
  - Accent: teal `oklch(0.55 0.18 192)` — the game shape symbols
  - Background: near-black `oklch(0.09 0.015 20)`
  - Card: `oklch(0.13 0.015 20)`
  - Chart colours: magenta, teal, dalgona gold, light pink, off-white
- **Radius**: `--radius: 0.375rem` base (sharper/more geometric) — cards `rounded-xl`, dialogs `rounded-3xl`, buttons `rounded-full`, inputs `rounded-xl`
- **Elevation**: `.elevation-0/1/2/4/8` utility classes emit magenta glow box-shadows (defined in `globals.css`) instead of neutral grey shadows.
- **Animations**: Custom keyframes in `globals.css`:
  - Page/UI: `animate-fade-in-up`, `animate-fade-in-down`, `animate-shake`, `animate-counter`
  - List stagger: `expense-row-animation`, `category-rank-animation`
  - Squid Game: `animate-squid-overlay-in`, `animate-squid-shape-in`, `animate-squid-glow`, `animate-squid-shape-pulse`
  - Also uses `tw-animate-css` package.
- **Login transition**: After successful login, `src/app/login/page.tsx` renders a `SquidTransitionOverlay` — a full-screen overlay where ○ △ □ SVG shapes appear one-by-one with a spring entrance and magenta glow, before navigating to `/dashboard/` after 1.8s.
- **Login background**: Faint large geometric SVG shapes (double-circle, double-triangle, double-square) positioned at screen corners as decorative elements.
- **Dashboard loading**: The auth-check loading state shows the three pulsing ○ △ □ shapes instead of a plain spinner.

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
