# Non-billable hours search-intent audit
**Reviewed:** 2026-11-01  
**Destination:** Homepage hourly-rate calculator  
**Scope:** Targeted audit of the question “How do I account for non-billable hours?” This is not a search-volume study.

## Visitor question and current coverage
The homepage already includes a billable-time percentage in its core formula, a 40% / 60% / 80% scenario table, a short explanation of non-billable examples in the FAQ, and a note that freelancers' billable hours must fund time off and business costs. The project-pricing guide also tells visitors not to divide income by every hour worked.

The missing practical detail is the annual *quantity* of non-billable working hours represented by each billable percentage. A visitor can see annual billable hours and the resulting rate, but must calculate the non-billable remainder themselves. The page also does not explicitly distinguish those hours from vacation/time off, which is already handled by the separate weeks-off input.

## Competitive observations
Seven directly relevant tools/pages were opened on 2026-11-01:

| Alternative | Observed approach | Visitor value / limitation |
|---|---|---|
| [Harvest Freelance Rate Calculator](https://www.getharvest.com/time-tracking/freelance-rate-calculator) | Uses billable-time percentage and states billable hours/year = working weeks × hours/week × billable %. | Strong explanation of how non-billable time reduces capacity; does not show the annual non-billable remainder in the formula explanation. |
| [Toggl Billable Hours Calculator](https://toggl.com/online-tools/billable-hours-calculator) | Separate billable and non-billable hour inputs, efficiency and effective hourly rate. | Makes both time categories visible; broader calculator bundle with fees/discounts and legal billing. |
| [Meadow Desk Billable Hours Calculator](https://www.meadowdesk.com/tools/billable-hours-calculator) | Task rows classified billable/non-billable; total hours, billable share, invoice total, worked example. | Clear practical model for a weekly log; not an annual sustainable-rate calculator. |
| [Spirelight Billable Hours Calculator](https://www.spirelight.ai/billable-hours-calculator) | Up to 30 minute-based entries, classifies billable/non-billable time and reports utilization. | Detailed time worksheet; does not calculate a sustainable annual rate. |
| [Numoo Freelancer Rate Calculator](https://www.numootech.com/en/library/pricing-calculator) | Rate calculator explicitly includes non-billable share such as admin and marketing. | Confirms the concept belongs in a rate calculator; downloadable tool requires a free account. |
| [Freelero toolkit](https://www.freelero.com/) | Separates hourly-rate, billable-hours, effective-rate and scope-creep tools in a connected toolkit. | Shows the value of linking related pricing/time questions; a broader tool suite. |
| [Clockbill free tools](https://clockbill.app/tools) | Links hourly-rate calculator, time-card calculator and decimal-hours converter. | Useful connected journey, but the landing page itself does not explain annual non-billable hours. |

This is a narrow, question-specific sample of seven relevant alternatives, not a full 20-competitor scan. The separate competitor scan in `docs/chatgpt-review-competitor-scan-20261031.md` covers 20 broader alternatives. These observations establish feature patterns, not query volume, rankings or demand.

## Decision and value added
Do not create another page or a separate time-tracking tool. The existing hourly calculator already has the correct input and rate formula. Improve that destination with one directly useful output: show the annual non-billable hours alongside annual billable hours in the existing scenario table, and explain the arithmetic.

For the default example:
- Weekly working hours: 40
- Working weeks after 4 weeks off: 48
- Annual working hours: 40 × 48 = 1,920
- At 60% billable: 1,152 billable hours and 768 non-billable hours
- Required annual revenue: $60,000 + $6,000 = $66,000
- Base rate: $66,000 ÷ 1,152 = $57.29/hour

The 40%, 60% and 80% scenarios should show:
- 40% billable: 768 billable / 1,152 non-billable hours; $85.94/hour
- 60% billable: 1,152 billable / 768 non-billable hours; $57.29/hour
- 80% billable: 1,536 billable / 384 non-billable hours; $42.97/hour

## Definitions and limits
- Annual working hours = weekly working hours × working weeks. Working weeks already exclude the weeks-off input.
- Annual non-billable hours = annual working hours − annual billable hours.
- Non-billable work may include admin, proposals, invoicing, business development and learning. Whether client calls, research, onboarding or revisions are billable depends on the specific agreement; do not classify every activity universally.
- Do not present 60% as a universal benchmark or recommendation. It is the current editable example default, not a market fact.
- No time logging, data collection, tracking, new default assumptions or external dependencies are introduced.

## Verification and measurement
- Add unit coverage for total working hours and the non-billable remainder at the three scenario levels.
- Add static checks so no-JavaScript scenario values match the calculator.
- Add Chromium assertions for the extra column and existing mobile widths.
- Search demand is unmeasured. If Search Console/Bing data later becomes available, inspect exact queries and page impressions/clicks for non-billable-hours wording; do not infer performance from deployment or indexing alone.
- No production behavior, indexing, AI citation or traffic impact is claimed by this audit.
