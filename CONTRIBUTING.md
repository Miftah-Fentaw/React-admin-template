# Contributing to Vantage Admin

Thanks for your interest in contributing! This document explains how to set up the project, the standards we hold changes to, and how to get your pull request merged.

## Ways to contribute

- **Bug reports** — something broken or inconsistent? Open an issue with reproduction steps.
- **Feature proposals** — check existing issues first; open a discussion-style issue before building anything large.
- **Documentation** — typos, unclear sections, missing examples: always welcome.
- **Code** — bug fixes, new features, refactors, tests, accessibility improvements.

## Getting started

```bash
git clone <your-fork-url>
cd admin
npm install
npm run dev        # http://localhost:5173
```

Sign in with any demo account from the login screen (see README). The mock API starts automatically — no backend setup required.

## Ground rules

1. **Read `AGENTS.md` before writing code.** It documents the architecture invariants, feature template, and styling conventions this repo enforces. PRs that violate them will be asked to change.
2. **Follow the layering.** UI never talks to HTTP directly and never imports mock data; features go through their `<domain>.service.ts`.
3. **No new runtime dependencies without prior agreement.** This includes chart libraries, form libraries, CSS frameworks, and icon packs. The zero-dependency stance is deliberate.
4. **Styling uses design tokens only** (`src/styles/tokens.css`). No hardcoded colors in components.
5. **Accessibility is not optional.** New interactive components need keyboard support, focus management, labels, and ARIA where applicable.

## Definition of done

Every change must pass all four gates before you open a PR:

```bash
npm run lint       # 0 errors
npm run typecheck  # tsc -b clean
npm run test:run   # all tests green
npm run build      # production build succeeds
```

Run `npm run format` before committing so `format:check` stays green in CI.

If you add a user-facing capability, add tests:

- Pure helpers → unit tests in `tests/`
- UI primitives → Testing Library specs (see `tests/Button.test.tsx`)
- Service/API behavior → msw/node integration tests (see `tests/users.service.test.ts`)

## Commit & PR style

- Use concise, imperative commit messages: `Add sort indicator to orders table`, not `fixed stuff`.
- One logical change per PR. Keep diffs reviewable.
- Link the issue being addressed (`Fixes #12`).
- Describe *what* changed, *why*, and how to verify it. Screenshots/GIFs for visual changes are appreciated.
- Update `README.md` / `AGENTS.md` if your change affects documented behavior.

## Branches & workflow

```bash
git checkout -b feat/my-feature    # or fix/, docs/, chore/
# ...make changes...
npm run format && npm run lint && npm run test:run && npm run build
git push origin feat/my-feature    # then open a PR against main
```

## Issue reports

Please include:

- What you did and what you expected
- What actually happened (exact error text/console output)
- Browser + OS versions
- Minimal reproduction steps (a branch or snippet helps)

For security vulnerabilities, **do not open a public issue** — see [`SECURITY.md`](./SECURITY.md).

## Code of conduct

By participating you agree to abide by our [Code of Conduct](./CODE_OF_CONDUCT.md). Be kind; we're all here to build something useful.

## Licensing

Contributions are made under the project's [MIT License](./LICENSE).
