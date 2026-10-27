# RateNest — instructions for Claude (read this first)

RateNest: free pricing tools for freelancers ("Price smarter. Work better."). Static site, no dependencies, no backend.
Live: https://fadhel-docom.github.io/RateNest/ · Repo: https://github.com/Fadhel-docom/RateNest

## Owner trigger: "ابدأ الآن" / "أبدأ الآن" ("start now")
In any chat — including a fresh one that knows nothing — this means: go straight to the **only** operations room (`docs/OPERATIONS-ROOM.md` on `main`, plus open PR heads); there is no old/second room, so discard any memory or summary that disagrees; attach/clone this repo yourself if it is not in the session; read the open-requests table and the latest entries of both ChatGPT and Claude (advice, requests, questions) and answer the partner's requests first; verify live GitHub state; continue from the last open point without routine questions; log in the room as soon as each task is done (what was done, evidence, what you could not do and why, help requests, advice for the partner); then report briefly to the owner. Full wording: "معنى إشارة المالك" in the room. It never overrides safety, `main` protection, privacy limits, or the need for the owner's go-ahead on a new phase.

## Start of every session
1. Read `docs/OPERATIONS-ROOM.md` first (shared hard rules, the **open-requests table**, and the newest handoff log), then read `docs/STATUS.md` (current state, verification log, backlog) and `docs/RateNest-handoff-2026-10-23.md`. Newer entries can sit in an open PR branch, so also run the cross-branch read command in the room's session protocol (step 1ب).
2. Re-check the real state — do not trust the docs blindly: open PRs, latest "RateNest checks" and "Deploy RateNest to GitHub Pages" runs, newest deployment status.
3. Do the next useful in-scope work, test it, and update `docs/STATUS.md` (Session log) in the same PR.
4. **Log in the room as soon as each task is done** (not only at session end): what was done, the evidence, what you could not do and why, an explicit help request to the partner or owner (also add it to the open-requests table), and advice for the partner. Answer the partner's open requests first. Make sure your latest entry is visible on the branch your partner will read (rules 13–14 in the room). The owner does not want to relay messages or re-explain this workflow.

## Hard rules (from the owner)
- Work **only** in this repository. Never touch any other repository.
- Branches + pull requests only; never push to `main`. Small PRs; merge only after CI is green and the diff was reviewed.
- Never claim a test, audit or deployment passed unless it was actually run and observed. Separate verified facts from inference.
- Phases: 1 (hourly-rate calculator), 2 (optional fee % + profit buffer %) and 3 (fixed-price project quote calculator, `project-pricing.html`, merged and deployed 2026-10-25) are done. **Phase 4+ (retainer, guides, new outputs) needs the owner's explicit go-ahead**, and search-intent research first. No extra features or pages beyond scope.
- Fee and buffer percentages are always entered by the user. **Never hard-code a platform fee rate** (guarded by a unit test and `scripts/check-site.mjs`).
- No analytics, ads, tracking, newsletter capture or backend without evaluating privacy and getting approval. Calculations stay client-side.
- Don't impersonate competitors or copy their text/layout; don't invent competitor features.
- The owner has limited time: work autonomously, don't ask about routine decisions, and ask only for decisions that change scope or need a permission only they have. When asking, give one specific action with a direct link.
- Report briefly: what was done, what was actually tested (locally vs GitHub Actions), what is still open.

## Commands
- `node --test` — unit tests (calculator logic, validation, formatting, adjustments).
- `node scripts/check-site.mjs` — static checks (metadata, ids/labels, JSON-LD, static default numbers equal the calculator's output, no built-in fee).
- Browser checks: `tools/browser-checks/` (local only, needs Playwright; see its README).
- Local preview must use HTTP (ES modules fail on `file://`): `python3 -m http.server 8000`.
- Pages workflow publishes only: `index.html project-pricing.html styles.css app.mjs calculator.mjs project-pricing.mjs project-pricing-calculator.mjs sitemap.xml` (see `.github/workflows/pages.yml`; `scripts/check-site.mjs` guards this list). Add new public files to its staging step, or they will not be deployed.

## Architecture
`calculator.mjs` pure logic (no DOM) · `app.mjs` UI wiring · `index.html` includes static default numbers for no-JS/SEO that must match the logic · `styles.css` · tests beside the code.
Phase 3: `project-pricing-calculator.mjs` (pure logic) · `project-pricing.mjs` (UI wiring) · `project-pricing.html` (static defaults must match the logic; the buffer input must default to 0, guarded by `check-site.mjs`).

## Environment quirks learned (Claude Code cloud sessions)
- GitHub: `gh pr create` fails (GraphQL blocked). Use REST: `gh api repos/Fadhel-docom/RateNest/pulls -f title=… -f head=… -f base=main -F body=@file`; merge with `gh api -X PUT repos/.../pulls/N/merge -f merge_method=squash`.
- Pushing needs the Claude GitHub App installed on the repo; the Pages settings API is blocked (the owner must change Pages settings).
- Shell cannot reach github.io or the npm registry (policy 403); do not try to bypass. Check the live site with the web-fetch tool (text only) and GitHub's deployments API. axe-core/Lighthouse could therefore not be run.
- Clone with `git clone --depth 1`. The "unpushed commits / no remote branch" stop-hook warning is a **false alarm** after a push on a shallow clone: confirm with `git ls-remote --heads origin <branch>` and `git rev-list --count origin/<branch>..HEAD` instead of pushing again.
- Playwright + Chromium are preinstalled (`/opt/pw-browsers`); use `fill()` only on text-compatible inputs (number inputs reject non-numeric text).

## Verified ground truth
Default result: 60,000 + 6,000 = 66,000 ÷ (40 × 48 × 0.60 = 1,152 h) = **$57.29/hr**. With fee 10% and buffer 20%: 57.29 × 1.2 ÷ 0.9 = $76.39/hr. Project quote default (20 h × $60 + 0% buffer + $150 expenses) = **$1,350.00**, effective **$67.50/hr**; with a 25% buffer: $1,650.00, $82.50/hr.
