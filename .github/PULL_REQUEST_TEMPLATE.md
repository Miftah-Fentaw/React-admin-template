<!-- Keep the PR focused: one logical change per PR. Delete sections that don't apply. -->

## Summary

<!-- What does this PR change and why? Link the issue: Fixes #123 -->

## Type of change

- [ ] 🐞 Bug fix
- [ ] ✨ New feature
- [ ] ♻️ Refactor (no behavior change)
- [ ] 📝 Documentation
- [ ] 🎨 Styling / design tokens
- [ ] ✅ Tests
- [ ] 🔧 Tooling / CI

## Verification

<!-- The repo's definition of done — all four gates must pass locally. -->

- [ ] `npm run lint` — clean
- [ ] `npm run typecheck` — clean
- [ ] `npm run test:run` — green
- [ ] `npm run build` — succeeds

## Architecture checklist

<!-- See AGENTS.md §3 for the invariants. Reviewers will check these. -->

- [ ] UI does not import mock data / JSON directly
- [ ] HTTP lives only in `<domain>.service.ts`
- [ ] Query keys added/changed via `src/lib/query-keys.ts`
- [ ] Styles use design tokens from `tokens.css` (no hardcoded colors)
- [ ] New interactive components are keyboard-accessible with labels

## Screenshots / recordings

<!-- For visual changes, include before/after. -->

## Notes for reviewers

<!-- Anything subtle worth calling out: tricky edge cases, trade-offs, follow-ups. -->
