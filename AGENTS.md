# AGENTS.md

This project uses **Next.js 16 App Router** with a static export (`output: 'export'`).
Next.js ships its own up-to-date documentation inside `node_modules/next/dist/docs/`.
**Read those files before making changes** — the App Router API has changed significantly
and training data is often stale.

## Mandatory reads by task

| Task | Doc to read first |
|------|------------------|
| Routing, layouts, pages | `node_modules/next/dist/docs/01-app/01-getting-started/` |
| Data fetching, caching | `node_modules/next/dist/docs/01-app/02-guides/` |
| `next.config.js` options | `node_modules/next/dist/docs/01-app/03-api-reference/05-config/` |
| File conventions (`layout`, `page`, `loading`, …) | `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/` |
| Built-in components (`Image`, `Link`, `Script`, …) | `node_modules/next/dist/docs/01-app/03-api-reference/02-components/` |
| Functions (`cookies`, `headers`, `redirect`, …) | `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/` |
| Static export constraints | `node_modules/next/dist/docs/01-app/02-guides/` — search "static export" |

## Project-specific constraints (override any generic Next.js advice)

- **Static export** — `output: 'export'` is set. Server Components, Route Handlers, and
  Middleware are **not available**. Every page must be `"use client"`.
- **No SSR** — use `globalThis.window` / `globalThis.sessionStorage` for SSR guards,
  never `typeof window`.
- **Trailing slashes** — all `href` values must end with `/` (`trailingSlash: true`).
- **API calls** — use `apiGet` / `apiPost` / `apiPut` / `apiDelete` from `src/lib/api.ts`;
  never raw `fetch`.
- **SWR invalidation** — after any mutation invalidate with:
  ```ts
  (key) => typeof key === 'string' && (key.includes('/api/expenses') || key.includes('/api/dashboard'))
  ```
- **`main_category_id`** is UI-only; never include it in API payloads.

See `CLAUDE.md` for the full product brief, design system, and conventions.
