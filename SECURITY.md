# Security Policy

## Supported versions

Vantage Admin is a template, not a hosted service. Security fixes are applied to the latest `main` branch only. If you are running a fork or an older snapshot, upgrade before reporting or expecting fixes.

| Version | Supported |
| ------- | --------- |
| latest `main` | ✅ |
| older commits / forks | ❌ |

## Reporting a vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

Instead:

1. Open a **private security advisory** via the repository's *Security → Advisories → Report a vulnerability* button (preferred), or
2. Contact the maintainers directly through a private channel listed on the repository profile.

Include as much of the following as you can:

- Type of issue (e.g. XSS, injection, auth bypass)
- Full paths of affected source files
- Location of the affected code (tag/branch/commit)
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code, if available
- Impact assessment

You will receive an acknowledgement within **72 hours**, and we aim to provide regular status updates while a fix is developed.

## Scope and honest expectations

This project is an **open-source admin UI template with a mock backend**. Please keep the following in mind when assessing severity:

- The bundled MSW mock API is a development fixture. Its tokens (`mock-token-<userId>`) are opaque strings with no cryptographic meaning, the seeded database lives in plain JSON, and nothing about it is hardened. It must never be exposed publicly or used in production.
- The demo credentials (`admin@vantage.dev` / `admin123`) exist for exploration and are documented in the README. They are not vulnerabilities.
- Real security posture depends entirely on the backend you replace the mock layer with — authentication, authorization, rate limiting, input validation server-side, TLS, secrets management.

That said, genuine issues in the shipped client code are taken seriously, including but not limited to:

- XSS via unsanitized rendering (e.g. `dangerouslySetInnerHTML`, unsafe `href` construction)
- Broken session handling in `AuthProvider` / token plumbing (`auth.service.ts`, storage)
- Open redirects or unsafe URL handling in routing
- Dependency vulnerabilities introduced by the template's pinned packages
- Anything that would mislead integrators into an insecure default configuration

## Disclosure policy

- We will acknowledge, investigate, and coordinate a fix privately.
- Once a fix is merged, a public advisory/CHANGELOG entry will credit reporters who wish to be named.
- We ask that you give us a reasonable window (90 days by default) to ship a fix before any public disclosure.

## Hardening guidance for downstream users

When replacing the mock backend (see README → "Replacing the Mock Backend"):

1. Enforce all request validation **server-side** — the Zod schemas in `src/models/schemas.ts` are shared contracts, not a substitute for backend checks.
2. Use real session tokens (short-lived JWT + refresh, or httpOnly cookie sessions) and wire them into `setAuthTokenReader` in `src/services/auth/auth.service.ts`.
3. Set `VITE_ENABLE_MOCK_API=false` so the MSW worker never ships to production, then delete `src/data/mock-server/`, `src/data/db/`, and `public/mockServiceWorker.js`.
4. Audit role-based behavior for your own permission model; the mock's rules (suspended users get 403, self-deletion gets 409) are examples, not policy.
