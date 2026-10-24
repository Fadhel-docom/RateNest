# RateNest — project status log

Keep this file current so work can resume without repeating anything. It is **not published**
(the Pages workflow stages only the site files listed in `.github/workflows/pages.yml`).

_Last updated: 2026-10-24. New sessions start from `CLAUDE.md` at the repo root, which points here._

## Session log (newest first — add an entry at the end of every working session)
### 2026-10-24 — independent review and Phase 3 discovery
- Re-read `CLAUDE.md`, this status log, and the handoff. Confirmed no open PRs and reviewed the live page's fetched HTML plus calculator validation/formula code. Manual formula review agrees with `base × (1 + buffer%) ÷ (1 − fee%)`; 50% fee and 100% buffer are accepted boundaries in code. **No real phone/emulator interaction was performed in this session**, and browser edge cases were not claimed as passed.
- Search-intent discovery for Phase 3 found distinct fixed-price project quote intent: estimated hours, direct costs, uncertainty/revision buffer, formula breakdown, effective rate and copyable summary. See `docs/phase-3-project-pricing-research.md` (research only; search volume/difficulty unknown; no Phase 3 UI implemented yet).
- Opened branch `phase-3-project-pricing-research` for a docs-only PR. No changes to `main`, no deployment, no merge.
### 2026-10-24
- Owner re-confirmed approval of Phase 2 (already merged in PR #8 from the owner's account on 2026-10-23). Claude reviewed it independently instead of rebuilding it:
  adjustment formula checked by hand-computed values, 29 unit tests + static checks + 42/6/13 browser checks pass on `main`, no built-in fee, deploy of `b9ee807` succeeded.
- PR #9 (docs) reviewed; two unverifiable claims corrected; merged (`61cea1b`), deploy `40084285197` succeeded. No open PRs.
- Added `CLAUDE.md` (auto-loaded instructions), this session log, and `tools/browser-checks/` (the real-browser scripts that previously lived only in a temporary folder).
### 2026-10-23
- Audited the MVP and competitors (Clockify, Upwork, Bonsai) → PR #1: validation, formula breakdown, scenarios, FAQ, accessibility, tests, safer Pages workflow, Dependabot.
- PR #1 review comments (copy status, billable error element) fixed. PR #7: reflow/focus fixes + status log.
- Deployment failure diagnosed (Pages site did not exist; owner chose GitHub Actions as source); deploys succeed since.
- Dependabot PRs #2–#6 merged one at a time. Phase 2 merged (PR #8). PR #9 docs.

## Next up (suggested, in order)
Current work: review the docs-only Phase 3 search-intent research PR. If approved and CI passes, implementation can proceed in a separate small PR. Other candidates: Search Console sitemap submission (owner's Google account), axe-core in CI if the registry becomes reachable.

## Rules of engagement
- Work only in this repository, on branches + pull requests. Never commit to `main` directly.
- Never claim a test, audit or deployment passed unless it was actually run and observed.
- Phase 2 was merged from the owner's account on 2026-10-23 (PR #8) and the owner re-confirmed the approval to Claude on 2026-10-24; it is done. **Any further phase or scope change needs the owner's go-ahead.**
- Fee and buffer percentages are always entered by the user: no default or hard-coded fee rate in the code (guarded by a unit test and a static check).

## Current state
| Area | State |
|---|---|
| Phase 1 calculator | Merged (PR #1). Default result $57.29/hr matches the formula (66,000 ÷ 1,152). |
| Phase 2 (optional fee % and buffer %) | Merged (PR #8) and deployed. Both inputs default to 0%; base rate stays the headline; "rate to quote" is shown separately. |
| Unit tests | 29 pass (`node --test`), also green on GitHub Actions. |
| Static site checks | `node scripts/check-site.mjs` passes, also green on GitHub Actions. |
| Browser behaviour | Previously verified locally only (headless Chromium, 320/375/1280 px). Not part of CI. Current independent review did not rerun these checks or test a real device. |
| Deployment | **Live** at https://fadhel-docom.github.io/RateNest/ — see Deployment below. |
| Dependabot | PRs #2–#6 merged one at a time on 2026-10-23; every push-triggered deploy succeeded. Actions now on checkout@v7, setup-node@v7, configure-pages@v6, upload-pages-artifact@v5, deploy-pages@v5. The Node 20 deprecation warnings are gone. No open PRs. |

## Deployment
- Earlier failures (runs `39900163673`, `39906607307`) were at "Configure GitHub Pages": `Get Pages site failed ... Not Found` — the repo had no Pages site yet.
  Fixed by the owner selecting **GitHub Actions** as the Pages source (inferred from run times; settings history is not readable). No workflow change was needed.
  `enablement: false` in those logs is the action's default input, not the cause.
- Successful deploys: manual runs `39946265757`, `39947085731`; push runs after PR #7 (`39947408325`), the five Dependabot merges
  (`39948172472`, `39948321289`, `39948525047`, `39948660934`, `39948839606`) and PR #8 (`39949497073`). Each: all steps success, GitHub deployment status `success`.
- Live content check (assistant's web-fetch tool, since its shell cannot reach github.io): `sitemap.xml` served with the canonical URL; `index.html` shows the
  title, form, `$57.29/hr`, scenario table ("Base hourly rate" header), FAQ, and the optional fee/buffer section with 0% defaults.
  The tool returns text only, so the CSS/ARIA structure of the live page was not inspected there.

## Verification log
- Local, real Chromium: 42-check behaviour suite, 6-check review-regression suite, 13-check Phase 2 UI suite (run 2026-10-24 by Claude: defaults, validation messages, adjusted result, copy summary, no overflow, no console errors), custom accessibility measurements
  (text contrast per element, accessible names, heading order, landmarks, focus rings, reflow at 320 px with 150%/200% text) — all pass, including the
  adjusted-result state.
- **Not run:** axe-core / Lighthouse (the npm registry is blocked in the assistant's session), screen-reader testing, Safari/Firefox, real devices,
  performance scores, Search Console.
- Known limit: at 320 px with 300% text-only zoom the page still scrolls horizontally (beyond the WCAG 200% requirement).

## Competitor findings worth remembering (verified on pages, 2026-10-23)
- Clockify: step wizard, worked examples, long FAQ, heavy signup CTAs, no copy/export, silent on input privacy.
- Upwork rate calculator: two inputs, short FAQ, no formula shown. Upwork support page states a 0–15% freelancer
  service fee per contract (the calculator page mentions 10%) — fees vary, so never hard-code one.
- Bonsai resources: calculators + templates + guides, trial-signup funnel.
- Upwork Fee Calculator URL could not be loaded during research: no claims about it.

## Backlog (none started; each needs the owner's go-ahead because it changes scope)
1. Search Console: submit `sitemap.xml` (needs the owner's Google account) — optional, no code change.
2. axe-core / Lighthouse in CI if the npm registry becomes reachable; otherwise keep the custom measurements.
3. Phase 3 — project pricing calculator: do search-intent research first and only build it if it solves a distinct user need.
4. Later phases (retainer / quote generator, guides) — after Phase 3.
