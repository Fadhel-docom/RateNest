# Phase 3 research — project pricing calculator

_Last researched: 2026-10-24. This is discovery work only; no Phase 3 product UI has been implemented._

## Decision

Proceed with a small, standalone **fixed-price project quote calculator** as the next candidate tool, subject to review of this research and the normal PR checks. It complements the existing hourly-rate calculator rather than replacing it.

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
- Clockify hourly-rate calculator: https://clockify.me/hourly-rate-calculator
