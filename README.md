# Expense Tracker

A personal expense tracking app for two users (SJ & YS) sharing expenses. Built as a static Next.js export with a Cloudflare Worker backend.

## Stack

- **Framework**: Next.js 16 (static export — no SSR, no API routes)
- **Styling**: Tailwind CSS v4 + Shadcn UI (Radix primitives)
- **State**: SWR for server state, React Context for auth
- **Forms**: react-hook-form + Zod
- **Charts**: Recharts
- **Backend**: Cloudflare Worker (separate repo)

## Commands

```bash
npm run dev        # Dev server with HTTPS (experimental)
npm run dev:http   # Dev server over plain HTTP
npm run build      # Production build — static export to /out
npm run lint       # ESLint
```

## Environment

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Cloudflare Worker base URL | `http://localhost:8787` |

## Design

Squid Game-inspired dark theme:

- **Primary**: Hot magenta `oklch(0.58 0.28 350)`
- **Accent**: Teal `oklch(0.55 0.18 192)`
- **Background**: Near-black `oklch(0.09 0.015 20)`
- **Fonts**: Bebas Neue (headings) + Montserrat (body)
- **Login transition**: ○ △ □ geometric overlay animation between login and dashboard

## Routes

| Route | Description |
|-------|-------------|
| `/` | Redirects to `/dashboard/` or `/login/` |
| `/login/` | Passcode login |
| `/dashboard/` | Stats, charts, category ranking |
| `/dashboard/expenses/` | Expense list with filters and pagination |

## Auth

Passcode-based. Access token stored in memory only; refresh token in `sessionStorage`. The login page intercepts navigation with an animated transition overlay before redirecting to the dashboard.

## Deployment

Build outputs a static site to `/out`. Deploy to any static host (Cloudflare Pages, Vercel, etc.).

```bash
npm run build
# deploy the /out directory
```
