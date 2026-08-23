# Vantage Admin

A production-quality React admin template with a fully working mock API — clone it, log in, and every page works out of the box. Swap the mock services for your backend when you're ready to ship.

![Tech](https://img.shields.io/badge/React_19-Vite-blue) ![Type safety](https://img.shields.io/badge/TypeScript-strict-green)

## Demo accounts

The mock API seeds realistic fictional data and accepts:

| Email                 | Password     | Role    |
| --------------------- | ------------ | ------- |
| `admin@vantage.dev`   | `admin123`   | Admin   |
| `manager@vantage.dev` | `manager123` | Manager |

Any other seeded user accepts any password of 8+ characters. Suspended accounts are rejected; you cannot delete your own account.

## Features

- **Dashboard** — KPI tiles with deltas, revenue chart, traffic sources, recent activity feed
- **Users** — searchable/sortable/paginated list, create & edit dialog, delete confirmation, detail page
- **Products** — catalog CRUD with categories, inventory badges, price formatting
- **Orders** — fulfillment + payment status management on a detail page with line items and totals
- **Analytics** — URL-synced date ranges, per-metric deltas, area/bar/donut charts, top pages
- **Notifications** — dropdown panel with unread state and mark-as-read
- **Auth** — session restore, protected routes, global 401 handling, role-aware UI
- **Settings** — profile form with server-side field errors, light/dark/system theme picker

## Tech stack

| Concern      | Choice                                       |
| ------------ | -------------------------------------------- |
| Build        | Vite                                         |
| UI           | React 19, plain CSS with design tokens       |
| Routing      | react-router v7 (lazy routes, breadcrumbs)   |
| Server state | TanStack Query v5                            |
| Forms        | Custom `useForm` hook + Zod schemas          |
| Charts       | Hand-rolled SVG (zero dependencies)          |
| Mock API     | MSW v2 with a seeded JSON database           |
| Validation   | Zod v4 (shared by forms **and** mock server) |
| Testing      | Vitest + Testing Library + msw/node          |

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
```

Sign in with a demo account above. That's it — no environment variables required.

## Scripts

| Script              | What it does                                 |
| ------------------- | -------------------------------------------- |
| `npm run dev`       | Start the dev server                         |
| `npm run build`     | Type-check then production build             |
| `npm run preview`   | Preview the production build                 |
| `npm run lint`      | ESLint                                       |
| `npm run typecheck` | `tsc -b`                                     |
| `npm run format`    | Prettier write                               |
| `npm run test`      | Vitest in watch mode                         |
| `npm run test:run`  | Vitest once (CI)                             |
| `npm run seed`      | Regenerate the mock database (`src/data/db`) |

## Project structure

```
src/
├── app/                  # Providers, router, guards
├── components/
│   ├── ui/               # Design-system primitives (Button, Dialog, Table…)
│   ├── layout/           # AdminLayout, Sidebar, menus, PageHeader
│   ├── charts/           # Dependency-free SVG charts
│   └── …                 # Toasts, badges, form helpers
├── config/               # Runtime config, navigation registry
├── data/
│   ├── db/               # Seeded JSON records (generated — do not hand-edit)
│   └── mock-server/      # MSW handlers + in-memory database
├── features/             # One folder per domain:
│   └── users/
│       ├── users.service.ts    # The ONLY file that talks HTTP
│       ├── hooks/use-users.ts  # TanStack Query hooks
│       ├── components/         # Feature-specific components
│       └── pages/              # Route-level pages
├── hooks/                # Cross-feature hooks (useForm, debounce…)
├── lib/                  # Pure helpers (format, errors, query keys)
├── models/               # Types + Zod request schemas (shared contracts)
├── services/             # API client, auth service, storage
├── styles/               # Design tokens + global CSS
└── types/                # Generic API types (Paginated, ListQuery…)
```

### Data flow

```
UI → feature hooks → feature service → API client → mock API OR real backend
```

The UI never imports mock data directly. Every feature goes through its service, so replacing the backend is a non-event.

## Replacing the Mock Backend

The mock API exists so the template is useful before you have a server. It is deliberately isolated:

1. **Point the client at your backend.** Set `VITE_API_URL=https://your-api.com` (see `.env.example`) and `VITE_ENABLE_MOCK_API=false` — this stops the MSW worker from starting.
2. **Match the response contract** (or adapt the services). The client expects:
   - Lists: `{ "data": [...], "meta": { "page", "pageSize", "total", "totalPages" } }`
   - Single resources: `{ "data": { ... } }` (or the bare resource — see each service)
   - Errors: `{ "code": string, "message": string, "fields"?: { [field]: string } }`
   - Auth: `POST /auth/login` → `{ user, token }`, `GET /auth/me`, `PATCH /auth/me`, `POST /auth/logout`. Token is sent as `Authorization: Bearer <token>`.
3. **Delete the mock layer when confident**: remove `src/data/mock-server/`, `src/data/db/`, `public/mockServiceWorker.js`, the `enableMocking()` block in `src/main.tsx`, and the `msw` dependency.

Request payload validation lives in `src/models/schemas.ts`. A real backend should enforce the same constraints — the Zod schemas double as living documentation.

### Authentication

`src/services/auth/auth.service.ts` is a demo implementation around opaque tokens issued by the mock server. Replace its four calls with your identity provider (JWT refresh, cookie sessions, OAuth, Supabase, Firebase…). The `AuthProvider`, route guards and 401 handling stay untouched.

## Theming

All colors, spacing, radii and shadows are semantic CSS custom properties in `src/styles/tokens.css` with a `[data-theme='dark']` override. Components read tokens only — rebrand by editing one file. Theme preference (light/dark/system) persists to `localStorage` and is applied pre-paint to avoid flashes.

## Accessibility

Dialogs trap focus and restore it, dropdowns and tabs implement WAI-ARIA keyboard patterns, tables expose sort state via `aria-sort`, icon-only controls have accessible names, and there is a skip link on every authenticated page.

## Testing

- **Unit** — pure helpers and schemas (`tests/*.test.ts`)
- **Components** — Testing Library (`tests/Button.test.tsx`)
- **Services** — real MSW handlers under `msw/node`, pinning the API contract (`tests/users.service.test.ts`)

Run everything with `npm run test:run`.

## License

[MIT](./LICENSE)
