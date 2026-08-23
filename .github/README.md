# `.github` — repository automation

This folder holds the CI/CD pipeline and community templates. It is organized so **you can follow along**: one workflow is active out of the box, and the rest are clearly-marked demos you activate by renaming.

## What's here

```
.github/
├── README.md                        ← you are here
├── workflows/
│   ├── ci.yml                       ✅ ACTIVE — runs on every push/PR
│   ├── deploy-pages.example.yml     📋 DEMO — static hosting walkthrough
│   └── release.example.yml          📋 DEMO — tagged releases with build asset
├── ISSUE_TEMPLATE/
│   ├── bug_report.yml               GitHub issue form
│   └── feature_request.yml          GitHub issue form (constraint-aware)
├── PULL_REQUEST_TEMPLATE.md         PR checklist mirroring repo conventions
└── dependabot.yml                   Weekly npm + actions updates
```

## The pipeline story, end to end

### 1. CI (`workflows/ci.yml`) — active

Runs the exact gates from `AGENTS.md` ("Definition of done"):

```
npm ci → seed → format:check → lint → typecheck → test:run → build → upload dist artifact
```

No configuration needed. Push a branch, open a PR, get a green/red check.

**Ideas to extend it yourself** (good first exercises):

- Split into parallel jobs (`lint`, `test`, `build`) for faster feedback.
- Add a Node version matrix: `strategy: { matrix: { node: [20, 22] } }`.
- Cache Playwright browsers once E2E tests land.

### 2. Static deploy demo (`workflows/deploy-pages.example.yml`) — rename to activate

Because the mock API runs entirely client-side, this template deploys to GitHub Pages as a pure static site — a perfect live demo link for your README.

Activate:

```bash
git mv .github/workflows/deploy-pages.example.yml .github/workflows/deploy-pages.yml
# Repo Settings → Pages → Source: "GitHub Actions"
git commit -m "ci: enable Pages deployment" && git push
```

Key concept demonstrated: `vite build --base=/<repo-name>/` so assets resolve under the Pages subpath. Swap the last two steps for Netlify/Vercel/Cloudflare — those just need `npm ci` + `npm run build` + output dir `dist`.

### 3. Release demo (`workflows/release.example.yml`) — rename to activate

Demonstrates tag-driven releases:

```bash
git mv .github/workflows/release.example.yml .github/workflows/release.yml
git tag v1.0.0 && git push origin v1.0.0
```

The workflow re-verifies (lint/typecheck/test) before building, zips `dist/`, and opens a Release with auto-generated notes. Study alternatives: `release-drafter`, `changesets`.

### 4. Community templates

- **Issue forms** are structured YAML (not markdown), giving contributors dropdowns and required fields — see `ISSUE_TEMPLATE/bug_report.yml`.
- **PR template** mirrors the architecture checklist from `AGENTS.md`, so reviewers don't have to remember the rules.
- **Dependabot** watches both `package.json` *and* action versions in workflows; updates arrive as grouped weekly PRs.

## Design decisions worth copying

| Decision | Why |
|---|---|
| `npm ci` instead of `npm install` | Deterministic installs from the lockfile; faster in CI |
| Deterministic `npm run seed` in CI | Fresh clones always build even if generated JSON is gitignored |
| Demo workflows ship as `.example` | Nothing half-configured ever shows a red X on your repo |
| `concurrency` groups | Superseded pushes cancel their own runs → fewer wasted minutes |
| Least-privilege `permissions:` blocks | Each job only gets the tokens it needs |

## Local testing of workflows

You can't run Actions locally without extras, but two tools approximate it:

```bash
npx act -l            # lists jobs that would run (uses Docker)
npm run build         # what the build step actually executes
```

The most reliable check remains: push to a branch and watch the PR checks.
