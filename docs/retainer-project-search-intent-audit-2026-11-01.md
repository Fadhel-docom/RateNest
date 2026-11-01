# Search-intent audit: retainer and fixed-project effective hourly rate

**Reviewed:** 2026-11-01  
**Pages:** `/retainer-pricing` and `/project-pricing`  
**Purpose:** Follow Claude's handoff after PR #64: compare the existing pages with the plan's retainer and post-project effective-rate questions before changing visitor-facing content.  
**Evidence limit:** Public page/source review only. No Search Console/Bing query data, keyword volume, traffic or ranking evidence was available.

## 1. Retainer pricing — existing answer is already substantial

RateNest's retainer page already supports:
- Reserved monthly hours, the user's own hourly rate, optional discount (0% default), and contract length.
- An optional, blank-by-default expected-hours-used input.
- Effective hourly rate at full reserved usage and at expected actual usage.
- Explicit 0-hour handling, over-reserved usage messaging, and a break-even threshold when a discount is selected.
- Copyable result summary, transparent formula, and FAQs explaining discounts, effective rates, actual usage, break-even, taxes/fees, and browser-only privacy.
- Contract guidance for scope, unused hours, extra work, review and exit.

This already answers the main informational intent: how a retainer price relates to reserved capacity and actual usage. It is not necessary to add another FAQ or duplicate the usage feature.

### Competitive comparison
- [Freshlance Retainer Calculator](https://freshlance.app/tools/retainer-calculator) (opened 2026-11-01): expected actual usage, overage treatment, capacity share, unused-hour rollover, included admin/meeting hours and a monthly bill breakdown.
- [Freelero Retainer Calculator](https://www.freelero.com/pricing/retainer-calculator) (search result reviewed 2026-11-01): included/reserved hours, discounts or premiums, overage rate, annual value, and agreement terms for scope, availability and rollover.
- [TNAADO Retainer Pricing Calculator](https://tools.tnaado.ca/calculators/business/retainer-pricing-calculator/) (search result reviewed 2026-11-01): expected actual hours and effective rate compared with the included-hours baseline.
- [FreelancePricing.com Retainer Pricing Calculator](https://freelancepricing.com/retainer-pricing-calculator) (search result reviewed 2026-11-01): reverse-plans a retainer from monthly revenue and billable capacity.

**Decision:** No retainer code or content change in this PR. More detailed rollover, overage pricing and capacity modeling are valid future ideas, but they increase assumptions and scope. RateNest currently states these limits plainly; keep that honesty rather than imply it models contract rules it does not calculate.

## 2. Fixed project pricing — identified gap

The existing project calculator estimates:
- Labour = estimated hours × hourly rate.
- Uncertainty allowance = labour × user-entered buffer percentage.
- Quote = labour + allowance + direct expenses.
- Existing effective hourly rate = quote ÷ estimated hours.

It correctly says this effective rate includes direct expenses and is not profit. However, the page did not answer the natural follow-up: **what was my effective hourly rate after the fixed-price project actually took more or fewer hours than estimated?** It only reports the estimate-based rate and did not let the visitor enter the final hours worked.

### Competitive comparison
- [ToolNest / Vintayz Project Pricing Calculator](https://vintayz.com/freelance/project-pricing-calculator/) (opened 2026-11-01): distinguishes the estimate-based rate from a project-overrun scenario, asks for actual hours, and shows the effective rate after project costs. Its formula subtracts project costs before dividing by hours.
- [Calcometry Project Pricing Calculator](https://calcometry.com/project-pricing-calculator) (opened 2026-11-01): explains that effective hourly rate is total quote divided by actual hours, gives examples at different actual-hour totals, and recommends tracking actual hours to refine future estimates.
- [CalcoTools Project Quote Calculator](https://calcotools.com/freelance-project-quote-calculator) (opened 2026-11-01): explains that the effective rate falls when a fixed-fee project overruns and answers this in a dedicated FAQ.
- [TimeBill Project Price Calculator](https://www.gettimebill.com/tools/project-price-calculator) (opened 2026-11-01): covers revision hours, fixed expenses and a project risk buffer; its accompanying guide explains the risk of a flat quote when work exceeds the estimate.

These examples demonstrate a visitor problem and established ways to explain it; they do not establish search volume or demand.

## 3. Change implemented on the existing project calculator

Added an optional, blank-by-default **Actual hours worked** input. It does not alter the fixed quote. When entered:
- The page shows the quote divided by actual hours.
- Fewer hours than estimated means a higher quote-per-hour figure; more hours means a lower figure.
- Zero hours is accepted but shown as not calculable; negative or more than 100,000 hours is rejected.
- The result is included in the copyable summary only when the visitor supplies actual hours.
- The formula and FAQ clarify that the figure includes direct project expenses and is not profit or take-home pay.

**Definition choice:** RateNest uses `fixed quote ÷ actual hours` so the new figure is consistent with the existing page's quote ÷ estimated hours definition. Some competitors subtract direct project costs first; this calculator explicitly discloses that its quote-per-hour figure includes expenses. It must not be presented as net earnings or profit.

No new page, new default, buffer recommendation, tax assumption, tracking, analytics, external dependency or data collection was added. Inputs remain client-side.

## 4. Verification plan and limits

- Unit tests cover blank, zero, below-estimate, equal-estimate, above-estimate, negative, excessive and non-finite actual-hour scenarios.
- Static site checks guard the optional blank input, no assumed result, example arithmetic and formula disclosure.
- Chromium browser checks cover responsive widths, default state, actual-hours scenarios, zero/blank behavior, validation and copied summaries.
- GitHub Actions is the authoritative test result for this PR. No local run is claimed.
- Production deployment, live-site behavior, Search Console/Bing indexing, AI citations and traffic impact are not established by this audit.

## 5. Follow-up

When Search Console/Bing query data is accessible, compare impressions, clicks and CTR for fixed-price project and effective-hourly-rate queries. Do not add a separate scope-creep page unless query data or observed visitor need justifies it. Consider a more advanced profitability calculator only as a separately scoped feature: it would need careful handling of actual costs, overhead, taxes and platform fees, and must not be conflated with this quote-per-hour result.
