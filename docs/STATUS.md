# RateNest — project status log

Keep this file current so work can resume without repeating anything. It is **not published**
(the Pages workflow stages only the site files listed in `.github/workflows/pages.yml`).

_Last updated: 2026-10-25. New sessions start from `CLAUDE.md` at the repo root, which points here._

## Session log (newest first — add an entry at the end of every working session)

### 2026-10-25 — PR #15 merged into Phase 3 branch; buffer default aligned with repo rule
- Reviewed and squash-merged PR #15 into `phase-3-project-quote-calculator` only: `7ef0d1223d7ae0aa84b0f62bea75bffe343d268c`. Its fix allows result rows to wrap and long values to break; Claude's browser checks cover six- and seven-figure quotes at 320 px with 200% text.
- Reviewed PR #11's expanded research scan: 22 pages are documented, with nine direct project-quote/profitability tools and adjacent sources separated transparently. The six original sources remain unverified and search volume/difficulty remain unknown. Added a comment that the research coverage concern is addressed; PR #11 still has a `docs/STATUS.md` conflict with `main`.
- Resolved the prefilled 25% buffer issue: repository rules say fee/buffer percentages are entered by the user, so the project calculator now defaults to 0%. Updated `project-pricing.html`, `tools/browser-checks/project-pricing.py`, and `scripts/check-site.mjs`; the default example is now 20 h × $60 + $150 expenses = $1,350 and $67.50/h. The explicit 25% unit/browser scenario remains to test the formula.
- Previous CI on PR #15 (run [40172357583](https://github.com/Fadhel-docom/RateNest/actions/runs/40172357583)) passed before the default change; a fresh run is required to validate these latest edits. No new browser run was performed by ChatGPT in this session.
- Nothing merged into `main`; no deployment. Next: confirm new CI and browser checks, refresh PR #13 verification text, then complete final diff review before any main merge. After the feature is merged, rebase/resolve PR #11's status-log conflict.

### 2026-10-25 — Claude: PR #11 competitor scan expanded, PR #15 rebuilt on the feature branch
- Owner trigger “ابدأ الآن”. Read the operations room, status, handoff and live GitHub state first (`main` `4ab4053`; PR #14 squash-merged into `phase-3-project-quote-calculator`; #11, #13, #15 open drafts; #11 conflicts with `main` in `docs/STATUS.md`). Full detail and the handoff to ChatGPT are in `docs/OPERATIONS-ROOM.md`.
- **PR #11 (research):** pushed `7b6f56b` — the research doc now has a 22-row sourced table (pages read on 2026-10-25), cross-page patterns, ranked candidate improvements (not authorized) and scan limits. The six first-scan sources could not be re-verified (fetch tool refused them) and are labelled as such. Search volume/difficulty remain unknown.
- **PR #15 (large-value reflow fix):** its base branch had been squash-merged, so it was orphaned. Merged the feature branch into it (no history rewrite) and retargeted it to `phase-3-project-quote-calculator`; the diff is now one CSS line plus two browser checks. Real bug: a six-figure quote (e.g. $122,500.00) overflowed at 320 px with 200% text (338 > 320).
- Evidence: local `node --test` 36/36, `check-site.mjs` clean, Chromium project-pricing 31/31, behaviour 42/42, review-regression 6/6, phase2-ui 13/13, a11y measurements clean. GitHub Actions (manual dispatch): [40172357583](https://github.com/Fadhel-docom/RateNest/actions/runs/40172357583) on the PR #15 branch and [40172406982](https://github.com/Fadhel-docom/RateNest/actions/runs/40172406982) on the PR #11 branch both passed. **Not run:** axe-core/Lighthouse, screen reader, Safari/Firefox, real devices. No competitor tool's computed output was verified (text-only fetch).
- Nothing merged into `main`; no deployment. Open: the prefilled 25% uncertainty buffer vs the “percentages are entered by the user” rule (scope decision), PR #13's stale verification text, and resolving #11's `STATUS.md` conflict once #13 is on `main`.

### 2026-10-25 — PR #14 reviewed and integrated into Phase 3 branch
- Reviewed the focus-handling, project-name input styling, responsive layout, and validation-copy fixes. Recorded a technical COMMENT review; GitHub rejected APPROVE because the connected account is the PR author.
- Marked PR #14 ready and squash-merged it into `phase-3-project-quote-calculator` only (merge commit `bb7ebfa59083ae86844b14f2787ef8a522310385`). Nothing was merged into `main` and no deployment occurred.
- GitHub Actions `RateNest checks` passed on the updated feature branch (run [40171322667](https://github.com/Fadhel-docom/RateNest/actions/runs/40171322667)). PR #14 records local Chromium evidence: project page 29/29, existing behavior 42/42, review regression 6/6, Phase 2 UI 13/13; axe/Lighthouse, screen reader, Safari/Firefox, and real devices remain untested in that session. These browser checks were not independently rerun by ChatGPT.
- Reviewed PR #11's research document: the MVP formula and scope align with the implementation, and search volume/difficulty are correctly marked unknown. However, it documents six competitor examples, short of the operations-room target of 20 where feasible; requested clarification/expansion before treating the research review as complete.
- PR #13 remains a draft against `main`; Phase 3 page is not deployed. Next: resolve the research coverage note, update stale PR #13 verification text, then perform the final diff/CI review before deciding whether PR #13 is ready to merge.

### 2026-10-24 — Independent review of PR #13 (Claude)
- Reviewed the full PR #13 diff (project quote calculator, 11 files) and ran it in real headless Chromium at 320/375/1280 px using the new `tools/browser-checks/project-pricing.py` (29 checks). Formula hand-checked: 20 h × 60 = 1,200 + 25% = 300 + 150 expenses = 1,650; effective 82.50/hr.
- Found and fixed (stacked PR into PR #13's branch): focus stolen to the first invalid field on every keystroke; unstyled `type=text` project-name input causing horizontal overflow at 320 px with 200% text; awkward "must be 100%." message; unstyled header nav link.
- Evidence: `node --test` 36/36, `check-site.mjs` clean, browser suites project-pricing 29/29, behaviour 42/42, review-regression 6/6, phase2-ui 13/13, a11y measurements clean (no overflow at 320 px/200% text). **Not run:** axe-core/Lighthouse, screen reader, Safari/Firefox, real devices, CI on the new branch until its PR is open.
- Nothing merged or deployed. PR #11 (research) is still an open draft and PR #13 does not contain its research doc.

### 2026-10-24 — Phase 3 implementation started
- **Owner trigger:** “ابدأ الآن”. Read the operations room, status log, handoff, Claude instructions, and current GitHub state. PR #12 (operations room) is merged as `4ab4053`; checks and the subsequent Pages deployment succeeded on `main`.
- **Research review:** Reviewed the Phase 3 project-quote research file and PR #11 diff. The narrow calculator is scoped to estimated hours × entered hourly rate, a labour-only uncertainty allowance, direct expenses, a transparent fixed quote, effective hourly return, and a copyable summary. Search volume/difficulty remain unknown; no market-rate claims are added.
- **Implementation:** Open draft PR #13 (https://github.com/Fadhel-docom/RateNest/pull/13) from `phase-3-project-quote-calculator`. Added `project-pricing.html`, `project-pricing.mjs`, `project-pricing-calculator.mjs`, and unit tests; linked it from the homepage, added its URL to the sitemap, added the three public assets to the Pages staging allowlist, and extended static checks.
- **Verification:** GitHub Actions run [40117656198](https://github.com/Fadhel-docom/RateNest/actions/runs/40117656198) passed on head `38e87700b2e39952160ff2274196967f5aaa13f3`: all 36 unit tests passed and static checks passed. The first run failed on an overly strict assertion matching the Pages staging command; the assertion was corrected and the latest run is green. No local browser test was available; 320/375/1280px interaction and copy verification remain open. No merge or deployment was performed for this feature.
- **Open before merge:** Independently review the current diff and run browser checks at 320/375/1280 CSS px with no console errors. Check input validation, copy summary, keyboard access, and that the existing hourly calculator remains unchanged. Keep PR #13 as draft until these checks and review are complete.
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
PR #11 (Phase 3 search-intent research) remains an open draft; its scan now documents 22 pages read on 2026-10-25 (the six first-scan sources are marked unconfirmed) and awaits ChatGPT's review. PR #15 (large-value reflow fix) now targets the feature branch and should be merged there before PR #13 goes to main. PR #13 remains a draft against main; PR #14's fixes are integrated into the feature branch. Phase 3 is not deployed. Open decision: the prefilled 25% uncertainty buffer. Optional later work: Search Console sitemap submission (requires owner's Google account), axe-core in CI if the registry becomes reachable.

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
| Unit tests | 36 pass on the Phase 3 feature branch; latest observed GitHub Actions run 40171322667 is green. |
| Static site checks | Latest observed Phase 3 run 40171322667 is green. |
| Browser behaviour | Verified locally only (headless Chromium, 320/375/1280 px). Not part of CI. |
| Phase 3 project quote calculator | Implemented on `phase-3-project-quote-calculator`; PR #14 fixes integrated; PR #13 remains draft and not deployed. CI green; browser evidence recorded in PR #14 but not rerun by ChatGPT. |
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
3. Phase 3 — project pricing calculator: implementation and browser verification evidence exist in PR #13/#14; research PR #11 needs competitor-coverage clarification, then final independent diff/CI review before merge.
4. Later phases (retainer / quote generator, guides) — after Phase 3.
