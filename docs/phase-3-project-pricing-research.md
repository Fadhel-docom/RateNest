# Phase 3 research — project pricing calculator

_Last researched: 2026-10-24 (initial scan, 6 examples); expanded 2026-10-25 (22 pages read in that session, see "Competitor scan" below). This is discovery work only; no Phase 3 product UI is implemented by this document._

## Decision

Proceed with a small, standalone **fixed-price project quote calculator** as the next candidate tool, subject to review of this research and the normal PR checks. It complements the existing hourly-rate calculator rather than replacing it.

The expanded scan of 2026-10-25 (below) does not change this decision; it adds evidence and a ranked list of possible refinements that still need a go-ahead.

Search-result evidence suggests a distinct task: people looking for a project pricing / quote calculator want to turn estimated effort into a fixed client price, allow for direct costs and uncertainty, and understand the effective hourly return. Upwork's tools directory separates freelance rate calculators from website/project-cost calculators. Several dedicated tools frame the project quote around estimated hours, contingency/revisions, and a copyable quote summary.

## Search-intent evidence

Searches run 2026-10-24 for:
- `freelance project pricing calculator keyword search intent fixed price quote calculator`
- `freelance project rate calculator fixed price estimator competitor tools calculator SEO query`

Observed result examples:
- Upwork Tools lists a Freelance Rate Calculator separately from Website Cost Calculator and Website Design Cost Calculator: https://www.upwork.com/tools
- Developer Business Lab positions its calculator around the minimum earnings a fixed-price project needs, and what happens if hours run over: https://www.developerbusinesslab.com/tools/freelance-project-pricing-calculator/
- OnSumo's project quote calculator offers phases/line items, contingency, rush fee, discount, tax, and a copyable quote summary: https://onsumo.com/tools/freelance/project-quote-calculator
- Numerandi describes a project quote using estimated hours × sustainable hourly rate, uncertainty allowance, direct project expenses, and target profit margin: https://numerandi.com/tools/freelance-project-pricing-calculator/
- BriefRate combines estimated hours, hourly rate, a labour-only buffer, and expenses without requiring signup: https://hollinlabs.com/briefrate
- Bonsai's estimate builder supports sections, flat/hour/day units, estimated hours, markup/discount, cost rate, and a breakdown of total price, cost, profit, and margin: https://help.hellobonsai.com/en/articles/10731093-the-estimate-builder

These are observed page/result features, not claims that RateNest has tested every competitor hands-on. Search result presence indicates plausible intent but does **not** establish search volume, difficulty, or traffic potential. No keyword-volume provider was available in this research, so those metrics remain unknown.

**Status of the six examples above:** they come from the 2026-10-24 scan (search-result evidence). On 2026-10-25 the fetch tool refused to open all six URLs (and the Clockify calculator URL) as "not on the session's allowlist", and a fresh search for each name did not return them, so they were **not re-verified** and are not counted in the 22 pages read in the expanded scan below. Treat them as "observed in the first scan, unconfirmed since".

## Competitor scan — expanded 2026-10-25

**Why this section exists.** The shared operations-room rule asks for 20 strong competitors or adjacent alternatives where feasible, with source link, access date, observed feature, visitor value and fit. The first scan listed six. This scan opened **22 further pages** (all accessed 2026-10-25) and records what each page actually showed; "not shown" means the captured page did not show it, not that the tool lacks it.

**Breakdown of the 22 by type:** 9 free web tools with a project-quote or project-profitability function (rows 1–5, 7–9, 11); 1 paid developer actor (row 6); 4 adjacent hourly-rate pages (rows 10, 12, 13, 14); 2 platform-fee calculators (rows 15–16); 3 paid kits/products (rows 17–19); 3 guides/forum threads (rows 20–22). Only the first group competes head-on with the Phase 3 tool.

| # | Tool and type | Source | Observed on the page | Value to a visitor | Fit for RateNest |
|---|---|---|---|---|---|
| 1 | FreelanceKit Project Price Calculator (free tool) | https://freelancekit.it.com/tools/project-price-calculator | Inputs: hours, rate, risk buffer %, revision allowance %. Outputs a base estimate, a project price and a three-tier quote (Essential/Standard/Premium). How the percentages combine is not shown; no expenses input; footer says "Free, no-signup"; copy/export and in-browser privacy not shown. Guidance: buffer 15–25% for well-understood work, 30–50% for vague scope. Page source carries an AdSense tag. | Separate revision allowance; tiered options. | Revision allowance is a candidate, but only with clear semantics (risk of double-counting with the buffer). Tiers are outside the MVP. |
| 2 | Bushe.co Project Price Calculator (free tool) | https://bushe.co/tools/project-price-calculator/ | Inputs: hours, rate, contingency %. Outputs quote, base, buffer added. Formula shown: quote = base × (1 + buffer ÷ 100). States it "runs entirely in your browser", free, no sign-up. No expenses; copy/export not shown. Suggests 15–30%. AdSense ID in page source. | Visible formula and an explicit privacy line. | Confirms RateNest's transparency + privacy positioning; RateNest adds expenses and a copy summary. |
| 3 | Harvest Freelance Project Quote Calculator (free tool by a time-tracking vendor) | https://www.getharvest.com/project-management/freelance-project-quote-calculator | Inputs: hours, blended rate, team members, duration in weeks, scope buffer (default 15%). Outputs recommended price, base cost, hours per person per week, weekly burn rate, "max hours before loss". Expenses are not an input; formula not shown; signup requirement not stated (calls to action push a free trial). Its own article cites a 10–20% buffer while the calculator says 10–25%. | A scope-creep limit ("max hours before loss"). | Candidate small output: hours until the effective rate falls to the entered rate (= quote ÷ rate). Team/duration inputs are out of scope. |
| 4 | Plutio Project Budget Calculator (free tool by a PM vendor) | https://plutio.com/tools/project-budget-calculator | Inputs: hours, rate, expenses, buffer %, profit margin %. The captured page shows **no** output or formula. Meta says "no signup" but the page pushes a proposal-creation signup. Guidance: multiply the estimate by 1.2–1.5, "15–25% net profit margin is healthy", a McKinsey figure of 45% overruns — no source links shown in the capture. | Expenses and margin in one place. | Keep markup and true margin distinctly labelled (the page does not show which it computes). Do not reuse its benchmarks without a primary source. |
| 5 | Teamz Lab Quote Estimator (free tool) | https://tool.teamzlab.com/freelance/quote-estimator/ | Inputs: task count, average hours per task, complexity factor (1.0/1.3/1.6/2.0×), rate, contingency % (10–25%, default 15%). Outputs base/adjusted/contingency hours and a suggested quote. Formulas and two worked examples shown (arithmetic checks out). No sign-up; "private" in the meta description but no explanation of where data goes; an ad space; cites studies without links. | Bottom-up estimate; long FAQ. | Multi-row task estimation is explicitly out of the MVP; revisit after the simple tool is validated. |
| 6 | ScopeQuote, Apify Actor (paid developer tool) | https://apify.com/gustav-fyhn/scopequote | Inputs: income goals, capacity, scope, revisions, contingency, rush, expenses, discounts, platform fees. Output: one data record with quote and "project floor". Formula not published. Paid, from $0.01 per quote. States it makes no network requests. | None for a non-technical visitor. | Not a visitor-facing competitor; shows the parameter space only. |
| 7 | ProTheme Design "WordPress Freelance Pricing Calculator" (niche free tool) | https://prothemedesign.com/tools/how-much-to-charge/ | Form fields and outputs not rendered in the capture ("?" placeholders). Described outputs: a "should quote" rate and a "break-even base price"; adds contingency time and adjusts by how much the job/client matters to you. Free/paid and privacy not shown. | Break-even vs ideal price framing. | The "job/client importance" adjustment is unexplained; do not adopt. |
| 8 | Formaloo "Job quote calculator form" (template) | https://dashboard.formaloo.com/templates/zrpzuw5njghlnbu | Template fields: service selection, estimated hours/team, timeline; "auto-calculated total", formula not shown; no expenses/tax/margin shown. Template labelled free; account requirement to use it not stated. | Generic client-quote form. | Low; a form-builder template, not a pricing method. |
| 9 | AyudaWP Freelance Rate Calculator (free WordPress-freelancer tool) | https://tools.ayudawp.com/calculadora-freelance/ | Rate tab: income target, itemised expenses, taxes (Spain brackets by default), working weeks, billable hours. Project tab: project budget + hours → profitability evaluation. "Copy summary as Markdown" and reset. Formula and privacy not shown. | Checks whether a client's budget is profitable; copy summary. | RateNest's copy summary is in line with this; tax modelling stays out of scope (no tax advice). |
| 10 | HubSpot Freelance Hourly Rate Calculator (lead-gen tool) | https://offers.hubspot.com/freelance-hourly-rate-calculator | Inputs: overhead, desired lifestyle, annual salary → ideal hourly rate. Access requires subscribing to an agency newsletter (email + frequency). Privacy text says submitted information is used to contact the visitor; hidden tracking fields and third-party pixels present. | None beyond the rate. | Reinforces RateNest's no-signup, no-tracking differentiator. |
| 11 | Gaurav Tiwari Freelance Rate Calculator (free tool + long article) | https://gauravtiwari.org/calculators/freelance-rate-calculator/ | Many inputs (currency, income, tax %, costs, health insurance, retirement %, profit/risk buffer %, weeks off, utilisation) plus a project-quote section (hours, complexity 0.9–1.5×, rush fee 0/25/50/100%). Outputs: hourly floor, day/week rates, breakdown, rate-increase scenarios, rounded quote. "Copy summary" and "Download .txt". Formula partly shown; no tool-specific privacy statement; product upsells; computed values were "$0" placeholders in the capture. | Richest feature set; downloadable summary. | Copy/download validates RateNest's summary. Complexity and rush multipliers add inputs; defer. Many inputs risk overwhelming a first-time visitor. |
| 12 | Elementor Freelance Rate Calculator (free tool by a site-builder vendor) | https://elementor.com/tools/freelance-rate-calculator/ | Inputs: annual salary, business expenses, profit margin/buffer, billable hours/day, vacation/sick/holiday days → hourly rate. Long how-it-works guidance; formula described in text, not shown as an equation; no project input field despite the text mentioning project estimates; privacy not shown. | Strong explanatory content. | Adjacent; content structure is a useful reference (not text to copy). |
| 13 | Finder (Australia) Hourly Rate Calculator (free tool, publisher) | https://finder.com.au/hourly-rate-calculator (the capture named the page `/business-insurance/hourly-rate-calculator`) | Inputs: business costs, personal costs, desired profit, billable hours. Formula shown in text: (business + personal costs + profit) ÷ hours. GST handled outside; benchmark of a 45-week year; discloses referral/sponsored income. Calculator widget not visible in the capture. | A plain, visible formula. | Adjacent; supports showing the formula in words. |
| 14 | Taskade "AI Freelance Rate Calculator Generator" (AI app builder page) | https://www.taskade.com/generate/freelancing/freelance-rate-calculator | A page promoting an AI generator that builds a calculator inside Taskade; no sample output; free/paid signals mixed ("Clone this app free", "Build from $5"). | None directly. | Not a direct competitor; shows AI-assistant substitutes for the query. |
| 15 | Taskip Platform Fee Calculator (free fee tool) | https://taskip.net/tools/platform-fee-calculator/ | Upwork/Fiverr/Toptal/direct/custom; forward (take-home) and reverse (target take-home → listed price, "divides by (1 − fee%)") modes. Hard-codes rates with "Fees verified October 2026"; cites Upwork's own page for Upwork only; Fiverr 20% and Toptal markup have no source. States numbers stay in the browser; free, no signup; no copy/export. | Reverse fee calculation. | Same ÷(1 − fee%) logic as RateNest Phase 2; RateNest deliberately has no built-in fee, which avoids the stale/unsourced-rate risk visible in rows 15–16. |
| 16 | DigitalPhablet "Upwork Hourly Rate Calculator" (free tool) | https://digitalphablet.com/tools/upwork-hourly-rate-calculator/ | One input (hourly rate); fixed 10% fee, unsourced; page metadata dated 2023-08-04; attributes the tool to Upwork without evidence on the page; unsourced rate ranges. AdSense tags in source. | Quick fee deduction. | Example of a stale, hard-coded fee — supports the repo rule never to hard-code one. |
| 17 | DevCalc (paid Gumroad product) | https://projectpricing.gumroad.com/l/azvjqd | $39; "structured pricing system for freelance software developers who want predictable margins"; description truncated, contents not shown. | Unknown. | Shows a paid alternative exists; no feature claims taken from it. |
| 18 | DatanestDigital pricing kit (DEV Community post, paid kit) | https://dev.to/datanestdigital/pricing-rate-calculator-2o73 | $19 pricing kit (whether it ships as a spreadsheet or only Markdown templates is not shown) covering hourly, project (hours by phase × rate + 20% risk buffer, complexity 1.1–1.5×) and retainer (10/20/40-hour tiers, 10–15% discount). Example uses 48 weeks × 40 h × 60% = 1,152 billable hours. Posting year not shown. | One kit for three pricing models. | Retainer demand signal consistent with the existing backlog (later phase); not authorized now. |
| 19 | Freelancer Quote & Profit Calculator (Product Hunt listing, paid toolkit) | https://www.producthunt.com/products/freelancer-quote-profit-calculator/makers | Excel/Google Sheets toolkit: hours, revisions, costs, urgency, risk, payment fees, tax reserves; includes deposit calculator and scope-creep rate. Price not shown; "launched in 2026"; 1 upvote. | Deposit and scope-creep ideas. | Low traction evidence; do not over-read. Deposit/scope-creep outputs are future ideas only. |
| 20 | SoloBizKit "How to Price Freelance Services" (free guide) | https://solobizkit.it.com/guides/price-freelance-services/ | Floor method (income + costs + buffer ÷ billable hours) → project price (hours + direct costs + contingency) → value/market check; pricing-model comparison; pre-quote checklist (deliverables, revision limits, client responsibilities, timeline, direct costs, margin). Links to hourly/day/profit/break-even calculators. No sign-up or ads seen. | Scope-control checklist. | Content idea only: an original pre-quote checklist on the tool page. |
| 21 | Finxter "How Much to Charge for a Project?" (article, 2020-10-04) | https://blog.finxter.com/?p=14289 | Value-based method: expected value = business value × probability; ±50% market adjustment from five factors; negotiation. Explicitly independent of hours. No calculator. | An alternative mental model. | Value-based pricing stays out of scope; useful as a "when not to use hours" note. |
| 22 | Clockify Help forum thread "Fixed Price Projects & Hourly Rate Calculation" (opened 2020-05-03; replies to 2022-08-23) | https://forum.clockify.me/t/fixed-price-projects-hourly-rate-calculation/293 | A user asked to enter a fixed project price and see the effective hourly rate from tracked time; staff replied there was no budget feature for that and suggested logging the amount as an expense, which does not compute the rate. Whether this has changed since 2022 is not shown. | An unmet need as of the thread. | Supports the "effective hourly rate" output; current Clockify features are unverified. |

### Patterns across the 22 pages (observed, not measured)

- **Buffer defaults and ranges disagree.** Harvest and Teamz Lab pre-fill 15%; suggested ranges are 10–25% (Harvest, Teamz), 15–25% and 30–50% (FreelanceKit), 15–30% (Bushe), 1.2–1.5× (Plutio), 20% (DatanestDigital). None cites primary data, and Harvest's own article disagrees with its calculator. RateNest should present the buffer as the user's assumption, not as a recommended universal value.
- **Formula visibility is the exception:** shown by Bushe, Teamz Lab, Finder (in text) and Taskip (reverse mode, in an FAQ); not shown by most others.
- **Privacy statements are rare:** Bushe ("runs entirely in your browser"), Taskip (numbers stay in the browser) and ScopeQuote (makes no network requests) say so; HubSpot gates its calculator behind an email and tracking.
- **Copy/export is rare:** observed on AyudaWP (Markdown copy) and Gaurav Tiwari (copy + .txt); not shown elsewhere.
- **Ads:** AdSense tags in the source of FreelanceKit, Bushe and DigitalPhablet (tags do not prove ads are displayed); Teamz Lab shows an ad space.
- **Hard-coded platform fees:** Taskip (dated and partly sourced) and DigitalPhablet (unsourced, 2023). RateNest's no-built-in-fee rule avoids this class of staleness.

### Candidate improvements from the scan (not authorized; owner/partner decision needed before any build)

Ranked by visitor value, evidence quality, ease, risk and testability:
1. **"Hours before your effective rate drops to your rate"** output (quote ÷ rate), inspired by the principle behind Harvest's "max hours before loss". Tiny, deterministic, easy to unit-test, no new input.
2. **Plain-language revision/scope guidance** next to the buffer (FreelanceKit, SoloBizKit principle), written originally. Prefer guidance text over a second percentage field to avoid double-counting.
3. **Pre-quote checklist** (deliverables, revision limit, client responsibilities, timeline, direct costs) as original page content.
4. Defer: tiered quotes, rush fee, complexity multipliers, multi-row tasks, tax, value-based pricing, deposits, retainers.

### Limits of this scan

- Pages were read through a text-only fetch that summarises each page; interactive widgets often rendered as placeholders, so **no tool's computed output was verified** and none was used hands-on. "Not shown" is not evidence of absence.
- Not opened or unusable: `aiproposer.com` rate calculator (fetch error), `spp.co`→`wayfront.com` agency pricing calculator (redirect target not on the fetch allowlist), Zite marketplace (irrelevant page), and the six first-scan sources plus Clockify's calculator (see above).
- Search volume, keyword difficulty and traffic potential remain **unknown**; no keyword provider was available.
- The count is of pages read, not of independent companies; several are small, niche or paid products, three are guides/forum threads, and three are paid kits rather than free calculators.

## Recommended first release (narrow MVP)

Inputs:
1. Project title (optional, for the copied summary only).
2. Estimated project hours.
3. Rate to use (default can be manually copied from the current hourly calculator only if an explicit, robust interaction is designed; otherwise require user entry to avoid hidden coupling).
4. Direct project expenses.
5. Uncertainty / revision buffer percentage, applied to labour only and labelled clearly.
6. Optional fee and safety buffer reuse only if the existing Phase 2 semantics can be explained without double-counting; avoid adding another confusing margin field in v1.

Outputs:
- Labour subtotal.
- Labour-only uncertainty allowance.
- Direct expenses.
- Suggested fixed-price quote.
- Effective hourly rate at the quoted total (and, if actual hours are entered later, an actual effective rate is a separate future feature).
- A plain-language formula breakdown.
- Copyable client-facing quote summary, with no account or backend.

Proposed baseline formula (must be confirmed in implementation and tests):
```text
labour = estimated hours × selected hourly rate
uncertainty allowance = labour × (buffer % / 100)
suggested quote = labour + uncertainty allowance + direct expenses
effective rate = suggested quote / estimated hours
```

This uses a transparent markup/buffer on labour, **not** a true profit-margin formula. If a true target profit margin is added later, it must use `price = cost / (1 - margin)` and be labelled distinctly from markup. Do not call the labour rate a project cost unless the UI explains what it represents.

## Competitor strengths to adopt (without copying)

- Clockify: straightforward rate/time concepts, multiple currencies, clear billable vs non-billable distinction.
- Upwork: discoverable tool directory and calculators aligned to specific tasks.
- Bonsai: cost/profit breakdown and structured estimate sections.
- Focused quote tools: contingency/revision allowance, clear assumptions, copyable output, no-signup workflow.

RateNest's differentiation should remain: no signup, no backend, calculations in the browser, transparent formula, simple responsive interface, no invented market-rate claims, and no hard-coded platform fee.

## Out of scope for this MVP

- Project management, client CRM, invoicing, contracts, accounts, analytics, ads, tracking, newsletter capture, or server-side storage.
- Tax calculations or tax advice.
- Market-rate estimates presented as verified facts.
- Multiple task rows / complex quote builder until the simplest calculator is validated.
- Any new fee default or assumptions about a platform's current fees.

## Acceptance criteria for implementation PR

- Formula and labels distinguish buffer/markup from true profit margin.
- Validation covers blank, zero, negative, extreme, decimal, and upper-bound values.
- Results update predictably; invalid inputs clear stale results and show field-level messages.
- Copy summary contains the entered assumptions and full price breakdown.
- Mobile layout works at 320, 375, and 1280 CSS pixels; no console errors.
- Unit tests and `node scripts/check-site.mjs` pass.
- Browser checks are actually run and observed; clearly report local Chromium vs CI. No claims about real devices or Lighthouse unless actually tested.
- Existing hourly-rate and Phase 2 behavior remains unchanged.
- Update `docs/STATUS.md` in the same PR; publish any new page assets only through the existing Pages workflow's explicit allowlist.
- Do not merge until CI is green and the complete diff has been independently reviewed.

## Sources

- Upwork Tools: https://www.upwork.com/tools
- Developer Business Lab: https://www.developerbusinesslab.com/tools/freelance-project-pricing-calculator/
- OnSumo: https://onsumo.com/tools/freelance/project-quote-calculator
- Numerandi: https://numerandi.com/tools/freelance-project-pricing-calculator/
- BriefRate: https://hollinlabs.com/briefrate
- Bonsai Estimate Builder: https://help.hellobonsai.com/en/articles/10731093-the-estimate-builder
- Clockify hourly-rate calculator: https://clockify.me/hourly-rate-calculator (first scan; not re-verified on 2026-10-25)
- Expanded scan, 2026-10-25: the 22 URLs in the table above, each with its access date (2026-10-25).
