# AGENTS.md — Vantage Admin

**Purpose of this document:** a complete handoff for any AI agent (or human) continuing work on this repository. It describes what the project is, how it is built, every convention that must be followed, where everything lives, and the exact current state. Read it fully before changing anything.

---

## 1. What this project is

**Vantage Admin** is an open-source React admin template. It ships with a fully working **mock backend** so every page functions immediately after `npm install && npm run dev`. The intended user journey: clone → run → explore → replace `src/data/mock-server/` with a real backend (see README → "Replacing the Mock Backend").

- Human-facing docs live in `README.md` and `LICENSE` (MIT).
- This file is the engineering source of truth.

### Tech stack (do not add alternatives without strong reason)

| Concern      | Choice                                | Notes                                                                 |
| ------------ | ------------------------------------- | --------------------------------------------------------------------- |
| Build        | Vite 8                                | `@` alias → `./src` (in both `vite.config.ts` and `vitest.config.ts`) |
| UI           | React 19                              | StrictMode on                                                         |
| Styling      | Plain CSS + semantic tokens           | **No Tailwind, no CSS-in-JS.** Tokens in `src/styles/tokens.css`      |
| Routing      | react-router-dom v7                   | `createBrowserRouter`, lazy routes, `handle.crumb` breadcrumbs        |
| Server state | TanStack Query v5                     | Key registry in `src/lib/query-keys.ts`                               |
| Forms        | Custom `useForm` hook + Zod           | **No form library.** Schemas in `src/models/schemas.ts`               |
| Validation   | Zod v4                                | Note: uses new API (`z.email()`, not `z.string().email()`)            |
| Charts       | Hand-rolled SVG components            | **No chart library**, by design                                       |
| Mock API     | MSW v2 (`msw/browser` + `msw/node`)   | Seeded JSON db under `src/data/db/`                                   |
| Icons        | lucide-react                          | Only icon source                                                      |
| Tests        | Vitest 4 + Testing Library + msw/node | Config: `vitest.config.ts`                                            |

### TypeScript configuration (non-negotiable constraints)

From `tsconfig.app.json`:

- `strict: true`, `noUnusedLocals`, `noUnusedParameters`
- `verbatimModuleSyntax` → **type-only imports MUST use `import type { ... }`** (also enforced by eslint `@typescript-eslint/consistent-type-imports`)
- `erasableSyntaxOnly` → **no enums, no namespaces, no parameter properties.** Use `as const` object/array literals for unions.
- Paths: `"paths": { "@/*": ["./src/*"] }` — TS 6 deprecates `baseUrl`; do not re-add it.

---

## 2. Commands & verification gates

```bash
npm install          # setup
npm run dev          # http://localhost:5173 (mock API auto-starts)
npm run build        # tsc -b && vite build   ← must pass before finishing ANY task
npm run lint         # eslint .               ← must be clean (0 errors)
npm run typecheck    # tsc -b                 ← must be clean
npm run test:run     # vitest once            ← all tests green
npm run format       # prettier --write .
npm run format:check # CI-style check
npm run seed         # regenerate src/data/db/*.json via scripts/generate-db.mjs
npm run preview      # serve dist/
```

**Definition of done for any code change:** `lint` ✓ `typecheck` ✓ `test:run` ✓ `build` ✓.

If the dev server behaves strangely after files were added/renamed (e.g. "Failed to fetch dynamically imported module"), clear the cache: `rm -rf node_modules/.vite` and restart.

### Demo credentials (mock API only)

| Email                 | Password     | Role    |
| --------------------- | ------------ | ------- |
| `admin@vantage.dev`   | `admin123`   | admin   |
| `manager@vantage.dev` | `manager123` | manager |

Other seeded users accept **any password ≥ 8 chars**. Suspended users get HTTP 403 on login. Deleting your own account returns HTTP 409 conflict.

---

## 3. Architecture invariants (the golden rules)

1. **Strict layering, one direction:**
   `UI → feature hooks (use-*.ts) → feature service (*.service.ts) → services/api/client.ts → mock API OR real backend`.
   - The UI **never** imports from `src/data/db/*.json` or `src/data/mock-server/` directly.
   - Feature services are the **only** place a feature touches HTTP.
2. **Zod schemas are shared contracts.** `src/models/schemas.ts` validates request payloads on BOTH the client forms and the mock handlers. A real backend should enforce the same rules.
3. **All server state flows through TanStack Query.** Query keys come from `src/lib/query-keys.ts` only. Mutations update caches via `setQueryData` + `invalidateQueries`.
4. **Styling reads design tokens only.** Components use CSS custom properties (`var(--primary)`, etc.) defined in `tokens.css`. Never hardcode hex values in components; charts read `var(--chart-1..4)` so they re-theme automatically.
5. **Errors are translated once.** Thrown values are typed (`ApiError` hierarchy); UI copy comes exclusively from `getUserMessage()` in `src/lib/errors.ts`. Raw error details never reach components.
6. **Global 401 handling = hard redirect.** `AppProvider`'s QueryCache `onError` clears the session and does `window.location.assign('/login')` (drops all cached data). Auth-prefixed queries are exempt.
7. **Accessibility is a feature, not a chore.** Dialogs trap focus, dropdowns/tabs implement WAI-ARIA keyboard patterns, tables expose `aria-sort`, icon-only buttons have labels, skip link present.
8. **No comments unless they explain _why_** (per repo convention). JSDoc on exported infra APIs is fine and encouraged.

---

## 4. Directory map (annotated)

```
├── AGENTS.md                     ← this file
├── README.md                     ← human docs incl. backend-swap guide
├── LICENSE                       ← MIT
├── CONTRIBUTING.md               ← contributing guide (gates, PR conventions)
├── CODE_OF_CONDUCT.md            ← Contributor Covenant v2.1
├── SECURITY.md                   ← security policy + mock-API scope notes
├── .github/                      ← CI (active) + demo deploy/release workflows, issue/PR templates, dependabot — see .github/README.md
├── index.html                    ← SEO head (title/description/canonical/OG/Twitter/JSON-LD) + inline pre-paint theme script (localStorage key 'vital.theme')
├── vite.config.ts / vitest.config.ts / tsconfig.app.json / eslint.config.js / prettier.config.js
├── scripts/generate-db.mjs       ← deterministic seed generator → src/data/db/*.json
├── public/                       favicon.svg, logo.svg, icons.svg, preview.png (og:image + landing screenshot — root ./preview.png is the README/GitHub copy), robots.txt, sitemap.xml, mockServiceWorker.js (msw)
└── src/
    ├── main.tsx                  ← enableMocking() gate (VITE_ENABLE_MOCK_API !== 'false'), then render <App/>
    ├── app/
    │   ├── App.tsx               ← <AppProvider><RouterProvider router={router}/></AppProvider>
    │   ├── providers/
    │   │   ├── AppProvider.tsx     QueryClient (staleTime 30s, no refetchOnWindowFocus, retry skips 4xx) + global 401 handler; composes Toast > Theme > Auth
    │   │   ├── ThemeProvider.tsx   light/dark/system pref, persists 'vantage.theme', sets document.documentElement.dataset.theme
    │   │   └── AuthProvider.tsx    session restore on mount (/auth/me), login/logout/setUser; status: 'loading'|'authenticated'|'unauthenticated'
    │   └── router/
    │       ├── index.tsx           createBrowserRouter; `/` = public LandingPage; app routes under `/dashboard`; lazy() pages; handle:{crumb} per route; errorElement=RouteErrorBoundary
    │       ├── protected-routes.tsx  gate for the `/dashboard` subtree
    │       ├── public-routes.tsx     redirects /login to /dashboard
    │       ├── RouteErrorBoundary.tsx friendly errorElement screen (useRouteError)
    │       └── NotFoundPage.tsx
    ├── components/
    │   ├── ui/                   ← design-system primitives (§6)
    │   ├── layout/               AdminLayout, Sidebar, UserMenu(+ThemeMenu), NotificationsMenu, PageHeader
    │   ├── charts/               AreaChart, BarChart, DonutChart, chart-utils, index.ts barrel
    │   ├── display/status-badges.tsx   status→tone maps + option lists for Select filters
    │   ├── feedback/ToastProvider.tsx  toast system; export const toast = ... via useToast()
    │   └── forms/SearchInput.tsx  debounced text input w/ label + clear button
    ├── config/
    │   ├── app.ts                appConfig (name/version/apiBaseUrl/enableMockApi/demoAccounts), STORAGE_KEYS
    │   └── navigation.ts         NAV_SECTIONS consumed by Sidebar
    ├── data/
    │   ├── db/*.json             GENERATED seed records (44 users, 33 products, 72 orders, 30 projects, 42 invoices, 7 notifications, 26 activity). Never hand-edit; run npm run seed
    │   └── mock-server/          THE SWAPPABLE BACKEND (§7): db.ts, utils.ts, browser.ts, handlers.ts aggregator, handlers/*-.handlers.ts
    ├── features/                 ← one folder per domain (§5 has the template)
    │   ├── auth/LoginPage.tsx
    │   ├── landing/LandingPage.tsx   public SEO landing page at `/` (single H1, section anchors #features/#architecture/#getting-started/#faq)
    │   ├── dashboard/            DashboardPage + service + components/{KpiCard,ActivityFeed,QuickActions,TrafficSources}
    │   ├── analytics/            analytics.service, hooks/use-analytics, pages/AnalyticsPage
│   ├── users/                users.service, hooks, pages/{UsersPage,UserDetailPage}, components/{UserFormDialog,DeleteUserDialog}
│   ├── products/             products.service, hooks, pages/{ProductsPage,ProductDetailPage}, components/{ProductFormDialog,DeleteProductDialog}
│   ├── orders/               orders.service, hooks, pages/{OrdersPage,OrderDetailPage}
│   ├── projects/             projects.service, hooks, pages/ProjectsPage, components/{ProjectFormDialog,DeleteProjectDialog}
│   ├── invoices/             invoices.service, hooks (list + status transitions), pages/InvoicesPage
│   ├── notifications/        notifications.service + hooks (UI lives in layout/NotificationsMenu)
    │   └── settings/pages/SettingsPage.tsx   profile form + theme picker + about card
    ├── hooks/                    useForm+validate, useDebouncedValue
    ├── lib/                      cn, format (all Intl helpers), errors (getUserMessage), query-keys
    ├── models/                   domain types + schemas.ts (zod contracts) — see §8
    ├── services/
    │   ├── api/client.ts           HttpClient (get/post/patch/delete, query serialization, Bearer token via setAuthTokenReader)
    │   ├── api/errors.ts           ApiError base + NetworkError/ValidationError/etc., apiErrorFromResponse()
    │   ├── auth/auth.service.ts    login/getProfile/updateProfile/logout/clearSession/restoreTokenReader (demo impl — swap here first)
    │   └── storage/storage.ts      localStorage wrapper (readSession/writeSession/clearSession)
    ├── styles/                   §9 styling guide
    └── types/                    api.ts (Paginated/ListQuery/error body/buildQueryString), env.d.ts
tests/
    ├── setup.ts                  jest-dom, cleanup, matchMedia/ResizeObserver/scrollTo stubs
    ├── mocks/server.ts           setupServer(...handlers) reusing the REAL mock handlers
    ├── format.test.ts            pure helper tests
    ├── schemas.test.ts           zod contract tests
    ├── Button.test.tsx           component test example
    └── users.service.test.ts     service integration test against msw/node (login → list → duplicate-email 422)
```

---

## 5. Feature template (follow exactly for new domains)

Every feature folder follows this shape (canonical reference: `src/features/users/`):

```
features/<domain>/
├── <domain>.service.ts      # ONLY file that talks HTTP for this domain
├── hooks/use-<domain>.ts    # TanStack Query hooks (queries + mutations)
├── pages/                   # route-level page components (lazy-loaded)
└── components/              # dialogs & feature-specific pieces
```

### Service pattern

```ts
// features/widgets/widgets.service.ts
import { apiClient } from '@/services/api/client'
import type { Paginated } from '@/types/api'

export const widgetService = {
  list(query: WidgetsQuery = {}): Promise<Paginated<Widget>> {
    return apiClient.get<Paginated<Widget>>('/widgets', { query }) // lists return envelope directly
  },
  async get(id: string): Promise<Widget> {
    const response = await apiClient.get<{ data: Widget }>(`/widgets/${id}`) // singles unwrap .data
    return response.data
  },
}
```

> Envelope rule: **list endpoints** return `{ data, meta }` used as-is; **detail/create/update endpoints** wrap the record in `{ data }` and the service unwraps it. Keep this consistent if you touch the mock handlers or real backend.

### Hooks pattern (`hooks/use-widgets.ts`)

- Queries: `useQuery({ queryKey: queryKeys.widgets.list(query), queryFn: () => widgetService.list(query), placeholderData: (previous) => previous })` — placeholder keeps table data visible while filters/page change.
- Mutations: on success do targeted `queryClient.setQueryData(detail(id), updated)` **and** `invalidateQueries({ queryKey: queryKeys.<domain>.all })` plus any cross-domain keys that embed the data (e.g. order updates invalidate `dashboard.overview`).
- Mutations throw typed `ApiError`s; components catch and surface field errors / toasts.

### Adding a domain end-to-end checklist

1. Model + request schema in `src/models/<Domain>.ts` / `schemas.ts`.
2. Keys in `lib/query-keys.ts`.
3. Service + hooks in `features/<domain>/`.
4. Mock handlers file `data/mock-server/handlers/<domain>.handlers.ts` (register it in `handlers.ts` aggregator).
5. Pages/components following existing list/detail/dialog patterns.
6. Route entry in `app/router/index.tsx` with `handle: { crumb }` (+ nav item in `config/navigation.ts`).
7. Status badge/option-list additions in `components/display/status-badges.tsx`.

---

## 6. Design-system primitives (`src/components/ui/`) — API cheat sheet

| Component             | Key props / notes                                                                                                                                                                                                                                                                                              |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Button`              | `variant`: primary\|secondary\|ghost\|danger\|danger-ghost; `size`: sm\|md\|lg\|icon; `isLoading` (spinner + disabled); `iconLeft/iconRight`; extends native button attrs                                                                                                                                      |
| `Card` family         | `Card` (`as`: section\|div\|article\|aside), `CardHeader`, `CardTitle` (`as` h1-h3), `CardDescription`, `CardContent`, `CardFooter` — all accept `className`; Card/Header/Content/Footer also accept `style`                                                                                                   |
| `Input.tsx`           | Exports `Field` (label+error wiring, `required`, `error`, `hint`), `Input` (`invalid`, aria wiring), `Textarea`, `Select` (takes `options: {value,label}[]`), `Checkbox`, `Switch`                                                                                                                             |
| `Badge`               | `tone` (success/info/warning/destructive/neutral…), `dot` flag; tone type exported as `BadgeTone`                                                                                                                                                                                                              |
| `Avatar`              | `name` fallback initials, `src?`, `size` sm/md/lg                                                                                                                                                                                                                                                              |
| `Feedback`            | `EmptyState` (`icon`, `title`, `description`, `action`, `compact`), `ErrorState` (`message`, `title?`, `onRetry`), `Alert` (`tone` incl. destructive, `title?`) — Alert takes NO style prop; wrap in a div if spacing needed                                                                                   |
| `Dialog`              | Controlled: `open`, `onClose`, `title`, `description?`, `footer?` (render actions), `size`. Focus trap + ESC + scroll lock + focus restore                                                                                                                                                                     |
| `DropdownMenu`        | TWO modes: (a) menu items mode — pass `items: DropdownMenuItem[]` ({label, icon?, onSelect, tone?:'danger', disabled?}); (b) rich panel mode — pass `children` (used by NotificationsMenu). Always provide `trigger` render-prop and spread its props onto your `<button>`; `align`, `label`, `panelClassName` |
| `Tabs`                | Fully controlled generic: `<Tabs items={[{value,label}]} value onChange label />` with roving arrow-key focus. There are NO TabsList/TabsTrigger subcomponents                                                                                                                                                 |
| `Table`               | `TableRoot` (caption prop), `THead`, `TBody`, `Tr` (**deliberately no onClick — rows navigate via link/menu for a11y**), `Th`/`Td` (native cell attrs), `SortableTh { label, state: 'asc'\|'desc'\|null, onToggle, align? }` handles aria-sort + icon                                                          |
| `Pagination`          | `meta: PaginationMeta`, `onPageChange(page)`, `noun` ("users")                                                                                                                                                                                                                                                 |
| `Breadcrumbs`         | From route crumbs (used by PageHeader)                                                                                                                                                                                                                                                                         |
| `Spinner`, `Skeleton` | Spinner takes `label`; Skeleton accepts `style` for sizing                                                                                                                                                                                                                                                     |

Charts (`components/charts/`):

- Shared point model: `SeriesPoint { label: string; value: number }` (from `models/Dashboard`). Map richer API series into this shape at call sites (see AnalyticsPage).
- `AreaChart { data: SeriesPoint[], height?, formatValue?, ariaLabel }` — gradient fill, gridlines, hover guide + bubble tooltip.
- `BarChart { data, height?, formatValue?, ariaLabel }` — hover dim/highlight.
- `DonutChart { segments: DonutSegment[] {label,value,color}, size?, thickness?, ariaLabel }` — render your own legend next to it (AnalyticsPage shows the `.donut-layout`/`.legend-list` pattern).
- All read colors from `--chart-*` tokens; measure width via `useMeasuredWidth` (ResizeObserver).

---

## 7. Mock backend (`src/data/mock-server/`)

- `db.ts` — loads `../db/*.json`, exposes mutable arrays + `db.nextId(prefix)` (e.g. `usr_0045`) + tokenStore. Admin account id: `usr_0001`.
- `utils.ts` — `latency(min,max)` (real artificial delay!), `jsonError(status, code, message, fields?)`, `unauthorized()`, `notFound(resource)`, `getAuthUserId(request)` (**token scheme: `Authorization: Bearer mock-token-<userId>`**), pagination/sort/search helpers (`parseListQuery`, `paginate`, `applySort`, `matchesSearch`).
- `browser.ts` — `setupWorker(...handlers)`; started pre-render in `main.tsx` with `onUnhandledRequest: 'bypass'`.
- Handlers use wildcard paths (`http.get('*/users', ...)`) so any host matches.

### Endpoint map

| Method & path                                                                               | Notes                                                                                                                                                                                                            |
| ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| POST `/auth/login`                                                                          | Validates loginSchema; suspended→403 forbidden; returns `{user, token}`                                                                                                                                          |
| GET `/auth/me`                                                                              | 401 without valid token                                                                                                                                                                                          |
| PATCH `/auth/me`                                                                            | updateProfileSchema; email-uniqueness enforced                                                                                                                                                                   |
| POST `/auth/logout`                                                                         | invalidates token                                                                                                                                                                                                |
| GET/POST `/users`, GET/PATCH/DELETE `/users/:id`                                            | role/status filters, search name+email, sortable: name,email,role,status,createdAt,lastLoginAt; POST dup-email→422 with `fields.email`; DELETE self→409 conflict; manager-role restrictions apply where relevant |
| GET/POST `/products`, GET/PATCH/DELETE `/products/:id`                                      | search name/description/category, category filter, sortable: name,price,inventory,status,createdAt                                                                                                               |
| GET /orders, GET `/orders/:id`, PATCH `/orders/:id`                                         | status/paymentStatus filters, search number/customerName, sortable: number,customerName,placedAt,total,status; PATCH accepts partial `{status?, paymentStatus?}`                                                 |
| GET/POST `/projects`, GET/PATCH/DELETE `/projects/:id`                                      | status filter, search name/client/ownerName, sortable: name,client,ownerName,status,progress,dueDate,createdAt; POST dup name+client→422 with `fields.name`; dueDate is `YYYY-MM-DD` or null                     |
| GET `/invoices`, PATCH `/invoices/:id`                                                      | status filter, search number/customerName/customerEmail, sortable: number,customerName,amount,status,issuedAt,dueAt; PATCH takes `{status}` — setting paid stamps `paidAt`, leaving paid clears it               |
| GET `/dashboard/overview`                                                                   | KPIs w/ changePct, revenueByMonth, ordersByDay, trafficSources                                                                                                                                                   |
| GET `/dashboard/activity`                                                                   | Paginated activity feed                                                                                                                                                                                          |
| GET `/analytics/overview?range=`                                                            | `range` ∈ 7d\|30d\|90d; totals + per-metric `changes` (vs previous window), daily `series`, `topPages`, `topCountries`                                                                                           |
| GET/PATCH `/notifications`, POST `/notifications/read-all`, PATCH `/notifications/:id/read` | unread counts drive topbar dot                                                                                                                                                                                   |

### Error envelope (both mock + expected from real backends)

```jsonc
{
  "error": {
    "code": "validation_error",
    "message": "Please fix the highlighted fields.",
    "fields": { "email": "A user with this email already exists." },
  },
}
```

`code` ∈ `bad_request | unauthorized | forbidden | not_found | conflict | validation_error | rate_limited | internal_error | network_error`.

---

## 8. Models & validation (`src/models/`)

- Domain types: `User.ts` (incl. `UsersQuery`, `AuthUser`), `Product.ts`, `Order.ts` (statuses as `readonly` tuple consts + derived unions), `Project.ts` (incl. `progress` 0–100, `dueDate` as YYYY-MM-DD|null), `Invoice.ts` (status lifecycle: draft→sent→paid/overdue/cancelled, `paidAt` stamp), `Notification.ts`, `Dashboard.ts` (Kpi/SeriesPoint/TrafficSource/ActivityEvent), `Analytics.ts`, `Auth.ts` (LoginRequest/LoginResponse/UpdateProfileInput).
- `schemas.ts` — request contracts: `loginSchema`, `updateProfileSchema`, `createUserSchema`(+`.partial()` = updateUserSchema), `createProductSchema` (note `z.coerce.number()` for price/inventory from inputs), `updateOrderSchema`, plus `zodFieldErrors(error)` → `Record<string,string>` keyed by field.
- Zod v4 gotchas: top-level `z.email('msg')`; `z.enum(READONLY_TUPLE)` works with `as const` arrays; message strings are positional first args.

### Form pattern (custom, no library) — `src/hooks/use-form.ts`

```tsx
const form = useForm<FormValues, Record<string, string>>({ name: '', email: '' })
// API: values, setValues, setField(field, value), errors, setErrors({}), clearError(field),
//      submitting, setSubmitting(true/false)
const result = validate(updateProfileSchema, form.values) // zod validate helper
if (!result.ok) return form.setErrors(result.fieldErrors) // {ok:true,data} | {ok:false,fieldErrors}

// On submit catch:
applyServerFields((error as { fields?: Record<string, string> }).fields) // merge 422 field msgs
setServerError(getUserMessage(error)) // otherwise show banner
```

Reference implementations: `UserFormDialog.tsx` (dialog CRUD variant), `LoginPage.tsx`, `SettingsPage.tsx` (page variant). Inputs wire `invalid={Boolean(form.errors.x)}` and clear their own error on change.

---

## 9. List-page pattern (users/products/orders all follow it)

- State lives in **URL searchParams**: `search`, `status`/`role`/etc., `sort`, `page`. Update helper builds a new URLSearchParams, deletes `page` on filter changes, `setSearchParams(next, { replace: true })`.
- Search input value comes straight from the param; queries use `useDebouncedValue(search)`.
- Sort syntax: `-field` descending, plain `field` ascending, absent = default (orders default `-placedAt`). First toggle on an unsorted column sets ascending; third click clears.
- Render ladder: `isError ? <ErrorState/> : <> toolbar + TableRoot(skeleton rows while pending, EmptyState row when total===0, data rows otherwise) + Pagination </>`.
- Deep-link affordance exists: Users & Products support `?create=1` (opens create dialog; linked from Dashboard QuickActions).

Detail pages (`UserDetailPage`, `ProductDetailPage`, `OrderDetailPage`) use `.detail-grid` (2-col ≥980px) + `.meta-list` key/value blocks; OrderDetail additionally mutates status/payment via Selects calling `useUpdateOrder` with optimistic-free simple mutateAsync + toast, and renders line items + `.summary-line/.summary-total` totals.

Toasts: `const toast = useToast()` then `toast.success(title, detail?)` / `toast.error(title, detail?)`.

---

## 10. Styling guide (`src/styles/`)

Import order matters (`styles/index.css`): `tokens → base → utilities → components/{primitives,overlays,data-display} → layout → pages`.

- **Rebranding happens in `tokens.css` only** — light defaults on `:root`, dark overrides under `[data-theme='dark']`. Semantic names: `--background/--foreground/--card/--muted/--muted-foreground/--border/--border-strong/--subtle/--primary(--subtle)(-foreground)/--destructive/--success/--warning/--info/--ring/--chart-1..4/--radius-xs..xl/--transition-fast`.
- `index.html` contains an inline script applying the stored theme before first paint (prevents FOUC). If you rename `STORAGE_KEYS.theme` ('vantage.theme'), update that script too.
- Component classes are BEM-ish: `.btn--primary`, `.card__header`, `.table__th--sortable`, `.dropdown__menu--end`, `.tabs__tab--active`, `.notifications-panel__item--unread`, `.theme-option--selected`, `.kpi-card__value`, `.kpi-change--up/down/neutral`, `.rank-list__*`, `.legend-list__*`, `.donut-layout`, `.settings-layout`, `.detail-grid/.detail-stack/.meta-list*/.summary-line/.summary-total`, `.route-error*`, `.chart-container` (must stay `position:relative` for chart tooltips).
- New page-level CSS goes into `pages.css` under a labeled section comment matching existing style.

---

## 11. Testing guide

- Runner config: `vitest.config.ts` (jsdom, globals, setupFiles `./tests/setup.ts`, css:false, restoreMocks).
- `tests/setup.ts` provides: jest-dom matchers, RTL `cleanup()` afterEach, stubs for `matchMedia`, `ResizeObserver`, `scrollTo` (jsdom lacks them; charts/theme need them).
- **Service tests reuse the production handlers**: `tests/mocks/server.ts` = `setupServer(...handlers)`; see `users.service.test.ts` for the login-first flow and asserting `ValidationError` on duplicate email.
- Conventions: colocate nothing in `src` (all specs live in `tests/`), name files `*.test.ts(x)`. When adding primitives, mirror the style of `Button.test.tsx` (render → interact via userEvent → assert role/state).

---

## 12. Current status (as of last verified run)

All gates green: `lint` ✓ · `tsc -b` ✓ · `vitest` 25/25 across 5 files ✓ · `vite build` ✓ (pages code-split per route).

**Complete:** auth/session/401 handling · dashboard (education-focused UI redesign) · users CRUD + detail · products CRUD + detail · orders list/detail + status updates · projects CRUD (list + create/edit/delete dialogs, progress bars, `?create=1` deep-link) · invoices list with status-transition menu (paid stamps `paidAt`) · analytics overview · notifications panel · settings (profile + theme) · full mock API + seed script · design system · dark/light/system theming · README/LICENSE/CONTRIBUTING/CODE_OF_CONDUCT/SECURITY docs · route error boundary · tests · `.github/` CI (active `ci.yml`) + demo deploy/release workflows + issue/PR templates + dependabot.

**SEO & discoverability (added):** public landing page at `/` (`features/landing/LandingPage.tsx`, single H1, sections: Why/Features/Built for Real Applications/Mock API Architecture/Connect Your Own Backend/Responsive/Dark Mode/Getting Started/FAQ) · dashboard app moved under `/dashboard` (all internal links prefixed) · index.html head: title, meta description, canonical, OG (+image alt/dimensions), Twitter large card, JSON-LD WebSite + SoftwareApplication (no fabricated ratings) · `public/robots.txt` + `public/sitemap.xml` (single canonical URL https://vital-admin-template.vercel.app/) · README rewritten for Vital Admin with preview.png near top · CONTRIBUTION.md renamed to CONTRIBUTING.md.

**Dashboard redesign (added):** KPI cards with inline sparklines (Students, Teachers, Programs) · Top Programs donut chart with center label · Total Children stacked area chart (Infant/Toddler/School Age) · Program cards with cover images and session details · Revenue bar chart with 1st/2nd biannually period toggle · Messages panel with Add Message CTA · Student list with search, edit/delete action buttons · Calendar widget (monthly grid, today highlight, event dots, prev/next navigation) · Schedule section with colored date badges · Three-column layout (main content + right sidebar). New mock endpoints: `GET /dashboard/programs`, `GET /dashboard/messages`, `GET /dashboard/schedule`.

**Known remaining ideas / backlog (none blocking):**

- Error boundary exists but there is no per-feature Suspense error boundary inside AdminLayout.
- No i18n layer (copy is hardcoded English).
- No end-to-end browser tests (Playwright would fit; none installed).
- `public/icons.svg` is unused legacy — candidate for deletion after verifying.
- Accessibility audit beyond the built-ins (screen-reader pass) not performed.
- Prettier formatting was applied once; keep `format:check` green going forward.
- Student list "Parent" column uses user email as a stand-in; real data would have a dedicated parent field.
- "Add Message" and student edit/delete actions are placeholder toasts; no backend mutation yet.

---

## 13. Gotchas log (things that actually bit during development — do not rediscover these)

1. **`globals.browser` is an object, not an array** — in `eslint.config.js` use `{ ...globals.browser }`; array-spread crashes ESLint at startup.
2. **`tsc -b --noEmit` is invalid** — build mode doesn't take `--noEmit`; the package script `typecheck` is plain `tsc -b` (tsconfigs already have `noEmit`).
3. **TypeScript 6 deprecated `baseUrl`** — `paths` entries are resolved relative to the tsconfig; never re-add `baseUrl`.
4. **MSW `HttpResponse` requires an explicit type argument** in v2.15 typings; for helper return types use `ReturnType<typeof HttpResponse.json>` — annotating `HttpResponse<unknown>` breaks handler assignability.
5. **TanStack v5 `QueryCache.onError` signature** — annotate as `(error: Error, query: Query<unknown, unknown, unknown, readonly unknown[]>)`; looser `unknown` params fail contravariance checks.
6. **Interfaces don't satisfy `Record<string, unknown>`** — that's why `useForm` constrains `Values extends object` and `RequestOptions.query` is `object` (cast internally before `buildQueryString`). Don't "fix" these back.
7. **Hooks import services with `../<domain>.service`**, not `./` (hooks live in a subfolder). Wrong relative paths caused a cascade of implicit-`any` errors.
8. **eslint-plugin-react-hooks v7 experimental rules**: `react-hooks/set-state-in-effect` is intentionally OFF (flagged deliberate dialog-reset/navigation effects); `react-refresh/only-export-components` is OFF (providers export hooks; router exports lazy consts). `react-hooks/immutability` stays ON — it caught a real declaration-order bug in `DropdownMenu` (helpers like `closeWithFocusRestore` must be declared above the effects that close over them).
9. **Vite dev cache goes stale** after mass file adds/renames → "Failed to fetch dynamically imported module". Fix: stop dev server, `rm -rf node_modules/.vite`, restart.
10. **Zod v4**: `z.string().email()` is gone → use `z.email('...')`; `z.coerce.number('msg')` for numeric form inputs.
11. **`Alert` has no `style` prop** (wrap in a div); `Tr` intentionally lacks row onClick; `Tabs` is a single controlled component (no subcomponents); `AreaChart`/`BarChart` take pre-mapped `SeriesPoint[]`, not accessors.
12. **`placeholderData: (previous) => previous`** makes range/filter switches report `success` with stale data — early-return skeletons only on genuine first-load `isPending`, and always branch `isError || !data` afterwards (AnalyticsPage shows the correct structure).
13. **Auth token plumbing**: `auth.service.ts` wires `setAuthTokenReader` at module load AND after login; storage-backed. If you swap auth, keep the reader indirection or first-request `/auth/me` will be unauthenticated.
14. **Seed data is generated** — editing `src/data/db/*.json` by hand will be overwritten by `npm run seed`; change `scripts/generate-db.mjs` instead.
15. **Two preview.png copies exist on purpose** — repo-root `./preview.png` renders in the README/GitHub UI; `public/preview.png` is what the site serves (og:image, Twitter card, landing hero). Keep them in sync when the screenshot changes.
16. **The dashboard lives under `/dashboard`, not `/`** — `/` is the public SEO landing page. All internal links must use the `/dashboard` prefix; breadcrumbs derive from `useMatches()` so they adapt automatically. Old demo URLs like `/users` now 404 by design.
17. **`Github` icon does not exist in lucide-react v1.33+** — brand icons were removed; use text links to GitHub instead.

---

_When you finish work, update §12 (status) and, if you hit something new and non-obvious, append it to §13. That keeps this document trustworthy for the next agent._
