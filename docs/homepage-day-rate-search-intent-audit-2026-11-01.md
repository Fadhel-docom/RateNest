# Homepage search-intent audit: freelance day-rate answer

**Reviewed:** 2026-11-01  
**Page:** `https://ratenest.pages.dev/`  
**Question:** How do I calculate my freelance day rate?  
**Evidence type:** Current page-source audit + targeted public search-result/page review. This is not Search Console data or measured search volume.

## 1. Existing page before this change

The homepage already calculates a sustainable hourly baseline from target annual income, business expenses, working hours, weeks off, and billable share. It displays an **8-billable-hour day equivalent** in the result card and says that equivalents assume every displayed hour is billable.

The gap was explanatory rather than computational: the page did not state how a visitor should adapt that eight-hour equivalent to the number of hours actually sold in their own client day. A visitor could mistake the eight-hour figure for a universal day rate.

## 2. Target question and evidence

The targeted search review found several different but related ways competitors answer day-rate intent:

- **ToolSahla** explains the arithmetic conversion as hourly rate multiplied by billed hours per day, and separately identifies the number of billable days as an input to an annual day-rate calculation.
- **FreelanceGuide** explicitly distinguishes billable hours from time spent at a desk, gives the formula `day rate = hourly rate × billable hours per day`, and uses six billable hours as an example.
- **FreelancerMetrics** emphasizes that a day booking may price reserved availability and cancellation risk, not only output hours. Its suggested commitment premium is one publisher's recommendation, not a universal rule.
- **Round** reinforces the upstream hourly-rate foundation: income goals and expenses divided by realistic annual billable hours, with tax treatment depending on the freelancer's assumptions.

Sources opened on 2026-11-01:
- https://toolsahla.com/en/freelancer-day-rate-calculator/
- https://freelanceguide.com/tools/day-rate-calculator
- https://freelancermetrics.com/blog/freelance-day-rate-calculator
- https://www.round.so/blog/how-to-set-freelance-hourly-rate

These examples establish a useful content pattern, not keyword volume, market demand, or a ranking forecast.

## 3. Value and differentiation

Add a concise, visible answer directly to the existing homepage:

`Base day-rate conversion = sustainable hourly rate × billable hours in the booked day`

Use the page's existing default scenario transparently:
- Target income: $60,000
- Business expenses: $6,000
- Billable hours: 40 × 48 × 60% = 1,152 per year
- Base hourly rate: $66,000 ÷ 1,152 = $57.29/hr (displayed rounded)
- Six billable hours: $343.75 using the unrounded rate
- Eight billable hours: $458.33 using the unrounded rate

The answer clarifies that the existing eight-hour figure is only an equivalent, not a universal working-day assumption. It also distinguishes this base arithmetic from the commercial terms of reserving an exclusive day: scope, availability, overtime, and cancellation terms should be agreed separately. No generic commitment premium is added because the evidence does not justify treating one publisher's suggested percentage as a universal rule.

## 4. Implementation in this PR

- Updated the homepage meta description and Open Graph description to include the day-rate equivalent accurately.
- Added a visible question-led section explaining the conversion and a worked example.
- Kept the calculator's existing 8-hour equivalent unchanged; no new input, pricing assumption, external dependency, or tracking was introduced.
- Did not add FAQ schema or a separate thin day-rate page.

## 5. Verification and limits

- Source-level arithmetic was checked against the existing calculator defaults: 66,000 ÷ 1,152 × 6 = 343.75; 66,000 ÷ 1,152 × 8 = 458.333..., displayed as 458.33.
- GitHub Actions must verify the PR's unit and static-site checks. No local execution is claimed in this record.
- A browser/mobile review is still required if the rendered section changes layout; this addition uses existing explainer/formula styles and does not change calculator behavior.
- The production site, Search Console, Bing reports, indexing, AI citations, and real traffic impact were not verifiable from this session.
- No search volume, ranking, click, or revenue claim is made.

## 6. Follow-up measurement

When search data becomes available, inspect queries containing day-rate intent and compare impressions, clicks, CTR, and the landing page. Separately check a small, fixed set of AI-search prompts and record whether RateNest is cited; do not treat a citation check as a ranking metric. Revisit the wording only when there is enough evidence to justify a change.
