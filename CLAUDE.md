# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Dev server with HTTPS
npm run dev:http   # Dev server over HTTP
npm run build      # Production build (static export to /out)
npm run lint       # ESLint check
```

No test suite configured.

## Architecture

**Static export Next.js 15 app** — `output: 'export'` in `next.config.ts`, deployed as JAMstack. No API routes, no SSR. All pages are `"use client"`.

**Backend**: `https://expense-backend.sunjie1993.workers.dev` (Cloudflare Worker). Base URL from `NEXT_PUBLIC_API_URL` env var.

### Key patterns

- **Auth**: React Context (`src/contexts/auth-context.tsx`) — access token in memory, refresh token in `sessionStorage`. Auto-refresh on 401; redirect to `/login/` on failure.
- **Server state**: SWR via custom hooks in `src/hooks/` — each wraps `fetcher()` from `src/lib/api.ts`.
- **Forms**: react-hook-form + Zod schemas (in `src/lib/validations/`). Form fields are modular components in `src/components/expenses/form-fields/`.
- **API layer**: `src/lib/api.ts` exports `apiGet<T>`, `apiPost<T>`, `apiPut<T>`, `apiDelete<T>` plus the SWR-compatible `fetcher()`.
- **Types**: All API interfaces in `src/types/api.ts`.

### Routing

| Route | Purpose |
|-------|---------|
| `/` | Redirects to `/dashboard/` or `/login/` based on auth |
| `/login/` | Passcode-based login |
| `/dashboard/` | Main dashboard |
| `/dashboard/expenses/` | Expense management |

### Design system (MD3-inspired)

- **Font**: Montserrat via `next/font/google`, CSS var `--font-montserrat`
- **Colors**: oklch tokens — primary Blue-600, secondary Blue-100 (`bg-secondary`)
- **Radius**: `--radius: 0.75rem` base → cards `rounded-2xl`, dialogs `rounded-3xl`, buttons `rounded-full`, inputs `rounded-xl`
- **Elevation**: `.md3-elevation-1/2/3/4` utility classes (defined in `globals.css`)
- **Sidebar**: MD3 Navigation Drawer — `bg-sidebar` (blue-50), active item `bg-secondary rounded-full`
- **Button variants**: `default` (filled), `tonal` (bg-secondary), `outline` (border-2 border-primary), `ghost`, `secondary` (elevated), `link`
- All custom tokens and utilities live in `src/app/globals.css` via Tailwind 4 `@theme inline`.

### Locale

`en-SG` (Singapore) for currency formatting and dates.