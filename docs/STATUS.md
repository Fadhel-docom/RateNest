# RateNest — project status log

Keep this file current so work can resume without repeating anything. It is **not published**
(the Pages workflow stages only the site files listed in `.github/workflows/pages.yml`).

_Last updated: 2026-10-24. New sessions start from `CLAUDE.md` at the repo root, which points here._

## Session log (newest first — add an entry at the end of every working session)

### 2026-10-24 — Phase 3 implementation started
- **Owner trigger:** “ابدأ الآن”. Read the operations room, status log, handoff, Claude instructions, and current GitHub state. PR #12 (operations room) is merged as `4ab4053`; checks and the subsequent Pages deployment succeeded on `main`.
- **Research review:** Reviewed the Phase 3 project-quote research file and PR #11 diff. The narrow calculator is scoped to estimated hours × entered hourly rate, a labour-only uncertainty allowance, direct expenses, a transparent fixed quote, effective hourly return, and a copyable summary. Search volume/difficulty remain unknown; no market-rate claims are added.
- **Implementation:** Started `phase-3-project-quote-calculator` from current `main`. Added `project-pricing.html`, `project-pricing.mjs`, `project-pricing-calculator.mjs`, and unit tests; linked it from the homepage, added its URL to the sitemap, added the three public assets to the Pages staging allowlist, and extended static checks.
- **Verification:** No local Node/browser runtime was available through this GitHub-only work session. Source was reviewed from GitHub; CI and tests are pending on the implementation branch. No merge or deployment was performed for this feature.
- **Open before merge:** Review current diff, confirm all unit/static checks are green, and run browser checks at 320/375/1280 CSS px with no console errors. Check input validation and copy summary. Existing hourly calculator must remain unchanged.
- **Handoff:** Claude: independently review the implementation and formula/validation, especially buffer semantics, keyboard/screen-reader behavior, and the Pages allowlist. Report findings here before any merge.
- **Owner action required:** No.

### 2026-10-24 — Shared operations room
- Owner established a shared, ongoing workflow for ChatGPT and Claude: no hierarchy, read-before-work, evidence-based quality rules, competitor benchmarking, and a durable handoff log.
- Added `docs/OPERATIONS-ROOM.md` as the shared rules and work log; updated `CLAUDE.md` so every Claude session reads it first.
- Work is on `docs/shared-operations-room`; no changes to `main`, no merge, and no deployment.
- Verified current PR #11 is open as a draft and its `RateNest checks` run for head `bcccda37322c385b16d7f445777e0679f77bae65` completed successfully. This does not mean PR #11 was reviewed or merged.
- No local tests were run for this documentation-only change. CI for this branch/PR must be checked after the PR is opened.
- Handoff: Claude should read the operations room before starting new work and add a dated entry for each session. Owner's trigger “ابدأ الآن” means inspect the shared log and live repository state, then take the next useful in-scope action without routine questions.

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
PR #11 (Phase 3 search-intent research) is open as a draft; its latest observed RateNest checks run is green, but the diff still needs review and it has not been merged. The owner explicitly authorized moving forward with development on 2026-10-24; after reviewing the research and checks, Phase 3 implementation may proceed in a separate branch + PR. The shared operations room is being added in its own docs PR. Optional later work: Search Console sitemap submission (requires owner's Google account), axe-core in CI if the registry becomes reachable.

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
| Browser behaviour | Verified locally only (headless Chromium, 320/375/1280 px). Not part of CI. |
| Phase 3 project quote calculator | Implementation in progress on `phase-3-project-quote-calculator`; not merged or deployed. CI/browser verification pending. |
| Deployment | **Live** at https://fadhel-docom.github.io/RateNest/ — current production remains on main; Phase 3 page is not yet deployed. |
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
3. Phase 3 — project pricing calculator: research reviewed; narrow implementation is in progress in a separate PR and must pass independent review and checks before merge.
4. Later phases (retainer / quote generator, guides) — after Phase 3.
