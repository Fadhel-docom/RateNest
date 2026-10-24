# RateNest — instructions for Claude (read this first)

RateNest: free pricing tools for freelancers ("Price smarter. Work better."). Static site, no dependencies, no backend.
Live: https://fadhel-docom.github.io/RateNest/ · Repo: https://github.com/Fadhel-docom/RateNest

## Start of every session
1. Read `docs/STATUS.md` (current state, verification log, backlog) and `docs/RateNest-handoff-2026-10-23.md`.
2. Re-check the real state — do not trust the docs blindly: open PRs, latest "RateNest checks" and "Deploy RateNest to GitHub Pages" runs, newest deployment status.
3. Do the next useful in-scope work, test it, and update `docs/STATUS.md` (Session log) in the same PR.

## Hard rules (from the owner)
- Work **only** in this repository. Never touch any other repository.
- Branches + pull requests only; never push to `main`. Small PRs; merge only after CI is green and the diff was reviewed.
- Never claim a test, audit or deployment passed unless it was actually run and observed. Separate verified facts from inference.
- Phases: 1 (hourly-rate calculator) and 2 (optional fee % + profit buffer %) are done. **Phase 3+ (project pricing, retainer/quote generator, guides) needs the owner's explicit go-ahead**, and search-intent research first. No extra features or pages beyond scope.
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
- Pages workflow publishes only: `index.html styles.css app.mjs calculator.mjs sitemap.xml` (see `.github/workflows/pages.yml`). Add new public files to its staging step, or they will not be deployed.

## Architecture
`calculator.mjs` pure logic (no DOM) · `app.mjs` UI wiring · `index.html` includes static default numbers for no-JS/SEO that must match the logic · `styles.css` · tests beside the code.

## Environment quirks learned (Claude Code cloud sessions)
- GitHub: `gh pr create` fails (GraphQL blocked). Use REST: `gh api repos/Fadhel-docom/RateNest/pulls -f title=… -f head=… -f base=main -F body=@file`; merge with `gh api -X PUT repos/.../pulls/N/merge -f merge_method=squash`.
- Pushing needs the Claude GitHub App installed on the repo; the Pages settings API is blocked (the owner must change Pages settings).
- Shell cannot reach github.io or the npm registry (policy 403); do not try to bypass. Check the live site with the web-fetch tool (text only) and GitHub's deployments API. axe-core/Lighthouse could therefore not be run.
- Clone with `git clone --depth 1`. The "unpushed commits / no remote branch" stop-hook warning is a **false alarm** after a push on a shallow clone: confirm with `git ls-remote --heads origin <branch>` and `git rev-list --count origin/<branch>..HEAD` instead of pushing again.
- Playwright + Chromium are preinstalled (`/opt/pw-browsers`); use `fill()` only on text-compatible inputs (number inputs reject non-numeric text).

## Verified ground truth
Default result: 60,000 + 6,000 = 66,000 ÷ (40 × 48 × 0.60 = 1,152 h) = **$57.29/hr**. With fee 10% and buffer 20%: 57.29 × 1.2 ÷ 0.9 = $76.39/hr.
