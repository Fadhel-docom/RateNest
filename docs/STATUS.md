# RateNest — project status log

Keep this file current so work can resume without repeating anything. It is **not published**
(the Pages workflow stages only the site files listed in `.github/workflows/pages.yml`).

_Last updated: 2026-10-23._

## Rules of engagement
- Work only in this repository, on branches + pull requests. Never commit to `main` directly.
- Never claim a test, audit or deployment passed unless it was actually run and observed.
- **Phase 2 (platform fee + profit buffer) needs the owner's explicit approval.** When approved, fee % and
  buffer % must be entered manually by the user — no default or hard-coded fee rate in the code.

## Current state
| Area | State |
|---|---|
| Phase 1 calculator | Built, merged to `main` (PR #1). Default result $57.29/hr matches the formula (66,000 ÷ 1,152). |
| Unit tests | 20 pass (`node --test`), also green on GitHub Actions. |
| Static site checks | `node scripts/check-site.mjs` passes, also green on GitHub Actions. |
| Browser behaviour | Verified locally only (headless Chromium, 320/375/1280 px). Not part of CI. |
| **Deployment** | **Not live.** Every Pages deploy fails at "Configure GitHub Pages" (`Get Pages site failed ... Not Found`) because Pages is not enabled with source "GitHub Actions". |
| Dependabot | PRs #2–#6 open (major bumps of checkout, setup-node, configure-pages, upload-pages-artifact, deploy-pages). Their CI is green, but the deploy-related actions cannot be exercised until Pages works. |

## Owner action required (the only one)
Settings → Pages → Build and deployment → Source → **GitHub Actions**. (The API path for this is blocked
for the assistant's session.) Afterwards re-run "Deploy RateNest to GitHub Pages" (Actions tab → Run workflow).

## Verification log
- Local, real Chromium: 42-check behaviour suite, 6-check PR-review regression suite, custom accessibility
  measurements (text contrast per element, accessible names, heading order, landmarks, focus rings, reflow at
  320 px with 150%/200% text size).
- **Not run:** axe-core / Lighthouse (the npm registry is blocked in the assistant's session), screen-reader
  testing, Safari/Firefox, real devices, performance scores, Search Console.
- Known limit: at 320 px with 300% text-only zoom the page still scrolls horizontally (beyond the WCAG 200% requirement).

## Competitor findings worth remembering (verified on pages, 2026-10-23)
- Clockify: step wizard, worked examples, long FAQ, heavy signup CTAs, no copy/export, silent on input privacy.
- Upwork rate calculator: two inputs, short FAQ, no formula shown. Upwork support page states a 0–15% freelancer
  service fee per contract (the calculator page mentions 10%) — fees vary, so never hard-code one.
- Bonsai resources: calculators + templates + guides, trial-signup funnel.
- Upwork Fee Calculator URL could not be loaded during research: no claims about it.

## Backlog (in priority order, none started)
1. Once Pages is live: verify the deployed URL, canonical, sitemap; then merge Dependabot PRs one at a time
   (deploy-related ones last) and re-verify the deploy after each.
2. Optional: axe-core in CI if the registry becomes available; otherwise keep the custom measurements.
3. Phase 2 (needs owner approval): manual fee % and profit-buffer % inputs, shown separately from the base rate.
4. Later phases: project pricing calculator, retainer/quote generator, guides — only after search-intent research.
