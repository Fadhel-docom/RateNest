# RateNest — handoff, 2026-10-23

Repository (the only one in scope): https://github.com/Fadhel-docom/RateNest · Live: https://fadhel-docom.github.io/RateNest/

## State in one paragraph
Phase 1 (hourly-rate calculator) and Phase 2 (optional, manually entered platform/payment fee % and profit/safety buffer %) are merged to `main` and
**deployed**. 29 unit tests, the static site checks and the "RateNest checks" workflow pass. Nothing beyond Phase 2 has been started.

## What changed today
- PR #1: validation with inline errors and no stale results, decimal hours, formula breakdown, billable-time scenario table, FAQ, accessibility and
  metadata improvements, `scripts/check-site.mjs`, least-privilege Pages workflow (publishes site files only), Dependabot, README corrections, plus two review fixes
  from ChatGPT's PR comments.
- PR #7: reflow fix at 320 px with 200% text, explicit focus outlines, H1 plain-text spacing, status log and this handoff.
- PRs #6, #3, #4, #5, #2 (Dependabot): all Actions bumped, merged one at a time with a verified deploy after each.
- PR #8 (Phase 2, approved by the owner): `applyAdjustments`, `validateAdjustments`, `adjustmentSteps`; collapsible optional section; separate "rate to quote" block;
  copy summary and breakdown include the entered percentages; FAQ/README updated. Fee and buffer default to exactly 0 — no built-in fee rate. Sanity caps: fee 0–50%, buffer 0–100%.

## Phase 2 formulas
```text
with buffer   = base rate × (1 + buffer%)
rate to quote = with buffer ÷ (1 − fee%)      # the freelancer keeps the base rate after the platform's share
```
The base calculation is unchanged and stays the headline; the scenario table stays the base rate.

## Deployment: cause and fix
- Symptom: "Publish site" failed at "Configure GitHub Pages" — `Get Pages site failed ... Not Found` (runs `39900163673`, `39906607307`).
- Cause (verified from the logs): the repository had no Pages site yet. Fix: Pages source set to **GitHub Actions** by the owner; no code change was needed.
- Evidence it works: eight later runs (manual, PR #7, five Dependabot merges, PR #8) passed every step with GitHub deployment status `success`; live `index.html` and
  `sitemap.xml` were fetched and show the expected content, including the Phase 2 section.
- Not verifiable by the assistant: the Pages settings history, so *when* the owner changed the setting is inferred from run times.

## Tests: what actually ran
| Check | Where | Result |
|---|---|---|
| `node --test` (29 tests) | local + GitHub Actions | pass |
| `node scripts/check-site.mjs` | local + GitHub Actions | pass |
| 42-check behaviour suite, 6-check review-regression suite, 13-check Phase 2 UI suite (run 2026-10-24 by Claude: defaults, validation messages, adjusted result, copy summary, no overflow, no console errors), custom accessibility measurements | local headless Chromium only | pass |
| axe-core, Lighthouse, screen reader, Safari/Firefox, real devices | — | **not run** (npm registry blocked in the assistant's session; no other tool available) |

## Next step
No owner action is required. Anything further (Phase 3 project-pricing calculator, retainer/quote generator, guides, Search Console submission) is a scope change:
do search-intent research first and get the owner's go-ahead.

## Rules
Branches + PRs only, never push to `main`; no other repository; no claim of a pass without having observed it.
