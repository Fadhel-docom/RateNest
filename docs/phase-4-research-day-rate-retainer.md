# Phase 4 candidate research — day/week rate output and retainer calculator

_Researched 2026-10-27 by Claude (web search + text-only page fetch). Discovery only: **nothing here is authorized**. Phase 4+ needs the owner's explicit go-ahead (CLAUDE.md). Search volume, keyword difficulty and traffic are **unknown** (no keyword provider available)._

Builds on `docs/phase-3-project-pricing-research.md` (22 pages already recorded there; not repeated here).

## What was searched (2026-10-27)
- `freelance retainer pricing calculator`
- `freelance day rate calculator`
- `freelance rate calculator take-home pay taxes billable hours`

## Pages actually opened (accessed 2026-10-27; text-only summaries, no calculator was run)
| # | Page | Observed | Value to a visitor | Fit for RateNest |
|---|---|---|---|---|
| 1 | FreelanceKit Retainer Calculator — https://freelancekit.it.com/tools/retainer-calculator | Inputs: hourly rate, committed hours/month, commitment discount %. Outputs: value at full rate, monthly retainer, effective hourly rate, annual contract value. Formula not shown; no copy/export; "Free, no-signup" footer; AdSense tag in metadata. Advice: discounts 5–15%, rollover at most one month. | Effective rate and annual value for a monthly retainer. | Same shape as the project calculator; discount must be user-entered (no default). |
| 2 | Teamz Lab Retainer Calculator — https://tool.teamzlab.com/freelance/retainer-calculator/ | Inputs: monthly reserved hours, rate, support level multiplier (1.0/1.15/1.30), volume discount % (5–15%). Formula shown: retainer = hours × rate × (1 − discount) (plus a multiplier step). Example: 10 h × $75 = $750, 10% off → $675/month, effective $67.50/h, $8,100/year (arithmetic checks). No copy/export; privacy and signup not stated; disclaimer "not financial/tax/legal advice". | Visible formula and worked examples. | Support-level multipliers are hard-coded values; skip. Visible formula + disclaimer are worth matching. |
| 3 | 9am.works day-rate article — https://www.9am.works/freelancer-academy/blog/freelance-day-rate-187-days-formula-benchmark | Method: yearly needs ÷ billable days (a floor); example 187 billable days = 52 − 6 holiday − 6 training weeks = 40 weeks = 200 days, minus 13 public holidays. Hourly floor × 8 for 8-hour days. Cites DACH market studies (not verified by me). No calculator, only a text template. | Explains why a day rate is *not* hourly × 8 when billable share is below 100%. | Supports a **day/week equivalent** output derived from RateNest's own inputs; do not import the cited benchmarks. |
| 4 | Harvest Freelancer Take-Home Calculator — https://www.getharvest.com/calculators/freelancer-take-home-calculator | Inputs: target income, working weeks, hours/week, billable % (default 60%), expenses. Outputs: break-even rate, "recommended rate (+20% buffer)", billable hours/week, **equivalent daily rate**. No formula shown; no tax calculation (article suggests 25–30% set-aside; self-employment tax figure for the US); signup promoted, not stated as required. | Daily-rate equivalent next to the hourly rate. | RateNest already has the 60% billable idea and the same inputs; a daily equivalent is the smallest gap. Do not add tax figures. |
| 5 | labs.xo3d.co.uk freelance rate calculator | **Not read** — fetch returned a redirect and I did not follow it in this session. | — | Not counted. |

Search results only (not opened, so not counted as read): MentorCruise, Rize, Everhour (two pages), Elementor, Agiled, Taskade, a Gumroad retainer product, TrendHunter "Retainr" coverage.

## Gap check against RateNest today
`grep` over the HTML/JS/docs found **no day-rate, daily or weekly-rate output** in RateNest. Retainer appears only as a deferred backlog item.

## Ranked candidates (not authorized)
1. **Day and week equivalent rate in the existing hourly calculator.** Output only, no new input if derived from the existing hours-per-week and billable-share inputs (confirm the exact existing inputs before design). Evidence: Harvest shows a daily rate; 9am.works explains the billable-days logic. Small, deterministic, easy to unit-test. Risk: ambiguity about "hours per day" (8-hour client expectation vs billable hours per day) — must be stated in the UI in plain words.
2. **Retainer calculator (new page, Phase 4).** Inputs: hours/month, hourly rate, discount % (default 0, user-entered). Outputs: monthly retainer, effective hourly rate, annual contract value, copy summary, formula in words. Evidence: FreelanceKit and Teamz Lab both exist; neither shows copy/export or a clear privacy statement; Teamz Lab shows its formula. Consistent with repo rules (no hard-coded percentages).
3. **Original guidance text** on retainer terms (rollover, unused hours, scope) — original wording only.
4. Defer: support-level multipliers, tax set-aside figures, market-rate benchmarks (would need primary sources and go stale).

## Limits
- Text-only fetch; interactive widgets were not run; "not shown" means the captured text did not show it.
- 4 pages opened and read, 1 not read; this is not the 20-competitor target of rule 5 for this cycle. The 22-page Phase 3 scan remains the broader record.
- No demand data. Do not treat presence of competitors as proof of search volume.

## Addendum 2026-10-28 (Claude): second pass before building the retainer calculator
The owner confirmed a standing go-ahead on 2026-10-28 (see `CLAUDE.md`). Two more searches (`freelance retainer calculator monthly retainer hours rate discount`, `how to price a monthly retainer freelancer formula hours per month rollover unused hours`) and three more pages **actually opened** (text-only fetch; no calculator run): 

| Page | Observed | Used for the RateNest design |
|---|---|---|
| Agiled — How to Price a Retainer (https://agiled.app/hub/agencies/how-to-price-a-retainer) | Three models (fixed-scope, hours-bank, value-based); hours-bank fee = rate × hours (+ buffer); warns about rollover/overage disputes and scope creep; suggests a fixed review cadence. | Ship the **hours-bank** model only (simple, transparent); mention unused-hours and extra-work terms as guidance, not as modelled features. |
| Everhour — monthly to hourly (https://everhour.com/calculators/convert-monthly-to-hourly) | Converts a monthly amount to an hourly rate; formula monthly × 12 ÷ annual hours; notes the figure is gross and excludes tax/overhead. | Confirms the reverse view people look for; RateNest shows the **effective hourly rate** and states what it excludes. |
| Indy — monthly retainer contracts (https://weareindy.com/blog/monthly-retainer-contracts-why-and-how-to-use-them) | Retainer = hourly rate × expected hours; suggests a modest retainer discount (example 10%); lists contract items (scope, hours, payment terms, extra work, end/break clause). | Discount is **optional and user-entered** (default 0); short original "terms to settle early" list. |

Decision: build **`retainer-pricing.html`** (reserved hours × rate − optional user-entered discount → monthly retainer, effective rate, contract value, copy summary). Not modelled: support-level multipliers, rollover/overage, value-based pricing, tax, benchmarks (would need primary sources). Still **no demand data**: competitor presence is not evidence of search volume. Together with the 4 pages from 2026-10-27 and the Phase 3 scan, this is 7 pages read for Phase 4, below rule 5's 20-competitor target; the shortfall is stated, not hidden.
