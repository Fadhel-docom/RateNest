# Value review: per-word rate to hourly calculator (writers)

- **Date checked:** 2026-11-26
- **Page:** `per-word-rate-calculator.html` (canonical `https://ratenest.pages.dev/per-word-rate-calculator`)
- **Status of evidence:** web-search samples and fetched competitor pages only. No search-volume, keyword-difficulty, Search Console or Bing data exists for this page or query. Demand is **not** claimed.

## Visitor need (and the evidence for it)
- **Question the visitor is trying to answer:** "I am paid per word. What does this job really pay per hour, and what per-word rate would I need?"
- **Evidence this need is addressed elsewhere (so it is a real task, not a RateNest invention):** a 2026-11-26 search for `freelance writer rate calculator per word to hourly` returned guides (Upwork, Money Crashers, Smart Blogger, Contra, Grammarist, Payoneer) plus a few small calculators (`makealivingwriting.com/freelance-rate-calculator`, a GitHub Pages tool) and the generic writer pages from Everhour and Harvest.
- **Assumption, not fact:** that a dedicated per-word-to-hourly tool can earn impressions. Verify with Search Console after indexing; do not treat the page as a success until real impressions, clicks or tool use are observed.

## Alternatives reviewed (2026-11-26)
- Everhour and Harvest "hourly rate calculator for writers": these start from an income goal and produce an hourly rate. They are not described, in the snippets reviewed, as converting a given per-word price into an effective hourly rate. Not independently audited.
- Make a Living Writing and small GitHub Pages tools surfaced in results; their feature sets were **not** opened or audited in this pass. No weakness is claimed.
- Guides (Upwork and others) explain per-word vs hourly pricing in prose; they do not compute the user's own job.

## Added value
The visitor can enter a real job (rate per word, words, every hour spent) and see the effective hourly rate, finished words per hour, and — if they enter a target — the per-word rate, writing speed or hours that would reach it. It also teaches which hours to count, and routes to project and retainer pricing when per-word pricing is a poor fit.

## Limits and safety
- No market rates, tax, or platform fee are assumed. The fee field starts at 0% and the target hourly rate starts blank (guarded by `scripts/check-site.mjs`).
- The starting figures ($0.10 per word, 1,500 words, 6 hours) are labelled as an example, not a market rate.
- Result accuracy depends on the user's time count; the page says so.
- Calculations stay client-side. No analytics, tracking or data collection added.

## Verification performed
- `node --test`: 100 of 100 passed locally (8 new tests for the calculator and validation).
- `node scripts/check-site.mjs`: all checks passed locally, including 14 new per-word checks (metadata, canonical/OG, ids/ARIA/labels, static defaults equal the calculator output, worked example matches the formulas, no assumed fee/goal, sitemap and internal links).
- Real Chromium (Playwright) at 1280px and 390px: default result, target scenario ($0.20 per word, 500 words/hour, 3 hours), 10% fee scenario ($22.50/hr), invalid input (`words = 0` shows an error and disables copy), TND formatting, copy-to-clipboard contents, no horizontal overflow, no console errors.

## Not verified
- Cloudflare production deployment of this page, and Google/Bing discovery or indexing.
- Screen-reader behaviour, Safari/Firefox, a physical phone, and the printed layout (this page has no print action).
- Any claim about demand, ranking or earnings.

## Follow-up measurement
1. After the page deploys, request indexing of the single new URL in Search Console (quota is limited; once only).
2. After 3–4 weeks, read Search Console page and query data for `/per-word-rate-calculator`. If impressions exist, improve title/description and content for the real queries; if none, do not mass-produce similar pages (see `VALUE-BEFORE-PUBLISHING.md`).
3. Candidate next tools only after step 2: other pricing-unit tools (per shoot, per finished minute, day rate), each needing its own value review.
