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

**Static export Next.js 15 app** — `output: 'export'` in `next.config.ts`, deployed as JAMstack. No API routes, no SSR. All pages are `"use client"`. React Compiler is enabled (`reactCompiler: true`).

**Backend**: `https://expense-backend.sunjie1993.workers.dev` (Cloudflare Worker). Base URL from `NEXT_PUBLIC_API_URL` env var (falls back to `http://localhost:8787`).

### Key patterns

- **Auth**: React Context (`src/contexts/auth-context.tsx`) — access token in module-level variable (memory only), refresh token in `sessionStorage`. On init, attempts token refresh; redirects to `/login/` on 401 failure. Login is passcode-based.
- **API layer**: `src/lib/api.ts` — uses native `fetch` (not Axios despite it being installed). Exports `apiGet<T>`, `apiPost<T>`, `apiPut<T>`, `apiDelete<T>` and SWR-compatible `fetcher()`. Auto-retries on 401 by refreshing the access token.
- **Server state**: SWR via custom hooks in `src/hooks/` — each hook builds a URL with query params and calls `useSWR` with the shared `fetcher`.
- **Forms**: react-hook-form + Zod schemas (in `src/lib/validations/`). Form fields are modular components in `src/components/expenses/form-fields/`.
- **Types**: All API interfaces in `src/types/api.ts`.
- **Charts**: Recharts (via `src/components/dashboard/spending-trend-chart.tsx`).
- **Toasts**: Sonner.
- **Category icons**: Mapped in `src/lib/category-icons.tsx`.

### Routing

| Route | Purpose |
|-------|---------|
| `/` | Redirects to `/dashboard/` or `/login/` based on auth |
| `/login/` | Passcode-based login |
| `/dashboard/` | Main dashboard with stat cards, chart, category ranking |
| `/dashboard/expenses/` | Expense management with filters and pagination |

`trailingSlash: true` is set in `next.config.ts` — always use trailing slashes in `href` values.

### Design system

- **Component library**: Shadcn UI (Radix primitives + Tailwind), components in `src/components/ui/`
- **Styling**: Tailwind 4 with `@theme inline` in `globals.css`. All color tokens use oklch.
- **Font**: Montserrat via `next/font/google`, CSS var `--font-montserrat`
- **Radius**: `--radius: 0.625rem` base. Cards use `rounded-2xl`, dialogs `rounded-3xl`, buttons `rounded-full`, inputs `rounded-xl`.
- **Elevation**: `.elevation-0/1/2/4/8` utility classes (box-shadow based, defined in `globals.css`)
- **Animations**: Custom keyframes and utility classes in `globals.css` (`animate-fade-in-up`, `animate-shake`, `animate-counter`, `expense-row-animation`, `category-rank-animation`). Also uses `tw-animate-css` package.
- **Dark mode**: Full dark mode via `.dark` class; `next-themes` handles toggling.
- **Locale**: `en-SG` (Singapore) for currency formatting and dates.