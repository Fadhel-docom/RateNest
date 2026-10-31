# RateNest — post-merge review and competitor scan
Date: 2026-10-31
Scope: PR #53 review and a focused scan of 20 publicly opened competitor/alternative pages. This is observational research, not search-volume evidence.

## 1. Independent post-merge review of PR #53

Reviewed the merged implementation on `main`:
- `retainer-pricing-calculator.mjs`: optional `expectedHours`, blank/null behavior, zero handling, range 0–744, finite-number checks, unchanged reserved-hours rate, and usage-based rate.
- `retainer-pricing.mjs`: live recalculation, result rendering, under-use/overage notes, and copied summary.
- `retainer-pricing.html`: visible label, help/error references, optional blank default, formula explanation, FAQ, and caveat about extra-hour billing.
- `retainer-pricing-calculator.test.mjs`: tests for blank, under-use, equal use, overage, zero, bounds, malformed numeric strings, and overflow.

Review conclusion: no blocking calculation defect found. The core formula is consistent: monthly retainer divided by expected actual hours; 0 is explicitly not calculable; blank means no scenario; the original rate based on all reserved hours remains unchanged. Overage text correctly states that the displayed rate assumes no additional charge and advises agreeing extra-hour billing in advance. The copied summary includes the expected-hours scenario and the overage assumption.

Non-blocking edge case to consider in a future small fix: the generic catch in `retainer-pricing.mjs` always attaches a calculation overflow error to `monthlyHours-error`. A derived overflow caused by an extremely small `expectedHours` can therefore point to the wrong input. This is an extreme-input UX issue, not a normal-use formula defect.

Verification limits for this review: I inspected source and tests through GitHub. I did not run tests locally, browser checks, screen-reader checks, or a live production check in this session. Claude's recorded local/CI results remain attributed to Claude and are not claimed as my own.

## 2. Competitor/alternative scan

Twenty pages were opened on 2026-10-31. The sample is a focused feature scan, not a complete market census or proof of search demand.

| # | Product/page | Observed visitor-facing features |
|---:|---|---|
| 1 | https://calcometry.com/project-pricing-calculator | Fixed quote from hours, rate, pass-through expenses, buffer; effective hourly result; related calculators. |
| 2 | https://freetoolcabin.com/project-pricing-calculator/ | Task-by-task hours; expenses; contingency, profit and tax; itemized quote and upfront deposit. |
| 3 | https://hollinlabs.com/briefrate | Labour-only buffer, expenses added after buffer; no-signup calculator; scope kit linked to quote. |
| 4 | https://www.freelero.com/pricing/retainer-calculator | Reserved-capacity premium, discount/premium, overage premium, annual value, print/PDF. |
| 5 | https://tools.tnaado.ca/calculators/business/freelance-project-quote-calculator/ | Separates production, meetings, revisions and admin/project-management time; expenses, risk buffer, margin or markup. |
| 6 | https://freelancecalc.co/freelance-retainer-calculator/ | Retainer scenarios, annual value, unused/overage modeling, comparison with ad-hoc hourly work. |
| 7 | https://www.freelero.com/pricing/project-pricing-calculator | Project hours, rate, expenses, payment/platform fee, contingency, desired profit margin, effective rate. |
| 8 | https://www.businesstries.com/calculators/freelance-project-rate-calculator/ | Project estimate, contingency, expenses, formula explanation, worked example, copyable result. |
| 9 | https://supabook.ai/tools/retainer-calculator/ | Effective rate, annual contract value, break-even monthly hours, overage-risk scenario and quote preview. |
| 10 | https://rize.io/tools/retainer-pricing-calculator | Cost-based retainer, target margin, scope buffer, package tiers, break-even hours and overage concepts. |
| 11 | https://rateclarity.net/calculators/freelance-retainer/ | Monthly expenses and profit buffer included in a retainer calculation; currency selector explicitly changes symbol, not conversion. |
| 12 | https://www.freelanceratekit.com/ | Hourly, daily and project rate positioning; browser-only privacy; retainer numbers and a guide library. |
| 13 | https://tools.tnaado.ca/calculators/business/retainer-pricing-calculator/ | Expected actual hours alongside included hours; effective rate and break-even relative to the freelancer's baseline rate. |
| 14 | https://themoneysheet.com/calculators/retainer-pricing/ | Committed hours, optional discount, effective rate and annual value with formula explanation. |
| 15 | https://sellergauge.com/calculators/retainer-pricing-calculator | Monthly overhead, buffer and target margin in addition to hours and baseline rate. |
| 16 | https://vintayz.com/freelance/retainer-calculator/ | Expected actual client usage, effective rate at real usage, multi-currency options and browser-only privacy. |
| 17 | https://kettlehour.com/tools/retainer-pricing-calculator.html | Retainer adjustment, separate overage rate, annual value and three suggested package tiers. |
| 18 | https://calcotools.com/freelance-project-quote-calculator | Compares hours × rate + buffer with an alternative flat fee; explains who bears overrun risk; browser-only privacy. |
| 19 | https://freelancemargin.com/freelance-retainer-calculator/ | Distinguishes hours-block, access and deliverables retainers; buffer and commitment adjustment; practical scope-creep framing. |
| 20 | https://getrateworth.com/calculators/freelance-project-pricing-calculator/ | Works backward from take-home pay, expenses, tax reserve and utilization to a floor rate, then applies project/retainer hours and complexity buffer. |

One additional page, https://onsumo.com/tools/freelance/freelance-retainer-builder, was opened but blocked by an anti-spam interstitial; it is not counted among the 20 substantive page reviews.

## 3. Patterns and next opportunity

Repeated patterns:
- Retainer tools increasingly show actual-use effective rate, not only the reserved-hours rate.
- Break-even hours relative to the freelancer's own baseline rate appear in the TNAADO retainer calculator and related retainer tools.
- Overage treatment is often explicit: a separate premium/rate, a scope note, or a warning that extra work needs separate billing.
- Project quote tools differentiate themselves through task-level estimates, meetings/revisions/admin time, and clear separation of contingency, markup, margin, expenses and tax.
- Browser-only calculation and no-signup privacy messaging are common trust signals.

Recommended next small improvement: add an optional/derived **break-even actual-hours threshold** to the existing retainer result: monthly retainer ÷ the user's entered baseline hourly rate (not a market benchmark). Explain that below this number the effective actual-work rate is above the baseline, and above it the rate is below the baseline. At a zero baseline rate, show “not calculable.” Include it in the copy summary and test discount, zero-rate, boundary and precision cases. This is supported by the observed TNAADO example (20 included hours, $100 baseline, 10% discount → $1,800 retainer and 18 break-even hours) and SupaBook/Rize break-even framing. It is a recommendation for a new PR, not implemented in this documentation-only change.

No search-volume, traffic, conversion, or revenue claims are made. A search-intent study would still be needed before creating a separate page or claiming demand.
