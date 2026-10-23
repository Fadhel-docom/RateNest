# RateNest — project status log

Keep this file current so work can resume without repeating anything. It is **not published**
(the Pages workflow stages only the site files listed in `.github/workflows/pages.yml`).

_Last updated: 2026-10-23 (after the first successful Pages deployment)._

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
| **Deployment** | **Live** at https://fadhel-docom.github.io/RateNest/ — deployed from `main` at `917aad0` by two successful `workflow_dispatch` runs (see Deployment diagnosis). |
| Dependabot | PRs #2–#6 open (major bumps of checkout, setup-node, configure-pages, upload-pages-artifact, deploy-pages). Their CI is green, but the deploy-related actions only run on `main`, so they are untested until merged. Not merged yet. |

## Deployment diagnosis (resolved)
- **Verified:** runs `39900163673` (04:24 UTC) and `39906607307` (05:35 UTC) failed at "Configure GitHub Pages" with
  `HttpError: Not Found ... Get Pages site failed` — i.e. the Pages site did not exist when `actions/configure-pages` ran.
- **Verified:** manual run `39946265757` (11:28 UTC) and `39947085731` (11:34 UTC), both on `917aad0`, succeeded in every
  step; the GitHub deployment status is `success` with `environment_url` https://fadhel-docom.github.io/RateNest/; the
  repository reports `has_pages: true`.
- **Verified live content** (fetched through the assistant's web tool): `sitemap.xml` is served with the canonical URL;
  `index.html` loads with the expected title, H1, calculator form, `$57.29/hr`, scenario table and FAQ.
- **Inferred (settings history is not readable):** the owner selected "GitHub Actions" as the Pages source between the 05:35 and
  11:28 runs. That is the only change between the failed and successful runs of the same commit; no workflow change fixed it.
- `enablement: false` in the log is `configure-pages`' default input, not an error. The workflow needed no change.
- Remaining notices (not failures): Node.js 20 deprecation warnings from actions v4/v5 — addressed by the open Dependabot PRs.

## Verification log
- Local, real Chromium: 42-check behaviour suite, 6-check PR-review regression suite, custom accessibility
  measurements (text contrast per element, accessible names, heading order, landmarks, focus rings, reflow at
  320 px with 150%/200% text size).
- **Not run:** axe-core / Lighthouse (the npm registry is blocked in the assistant's session), screen-reader
  testing, Safari/Firefox, real devices, performance scores, Search Console.
- Deployment verification: the assistant's shell cannot reach github.io (egress policy); page content was checked via its web-fetch tool and GitHub's deployment API.
- Known limit: at 320 px with 300% text-only zoom the page still scrolls horizontally (beyond the WCAG 200% requirement).

## Competitor findings worth remembering (verified on pages, 2026-10-23)
- Clockify: step wizard, worked examples, long FAQ, heavy signup CTAs, no copy/export, silent on input privacy.
- Upwork rate calculator: two inputs, short FAQ, no formula shown. Upwork support page states a 0–15% freelancer
  service fee per contract (the calculator page mentions 10%) — fees vary, so never hard-code one.
- Bonsai resources: calculators + templates + guides, trial-signup funnel.
- Upwork Fee Calculator URL could not be loaded during research: no claims about it.

## Backlog (in priority order)
1. Merge Dependabot PRs #2–#6 **one at a time**, re-running the deploy workflow and checking the live site after each; revert the
   one that breaks it. Keep `upload-pages-artifact` and `deploy-pages` bumps compatible with each other.
2. Search Console: submit `sitemap.xml` (owner account required) — optional, no code change.
3. axe-core / Lighthouse in CI if the npm registry becomes reachable; otherwise keep the custom measurements.
4. **Phase 2 (needs the owner's explicit approval):** manual fee % and profit-buffer % inputs, shown separately from the base
   rate, no default fee in code.
5. Later phases (project pricing, retainer/quote generator, guides) — only after search-intent research.
