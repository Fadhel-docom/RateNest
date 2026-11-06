# Value note — project quote after platform and payout costs

- **Date:** 2026-11-02
- **Status:** Research/design gate only; no production calculator changes in this PR. Model locked 2026-11-02 (see "Locked model"); implementation is a separate follow-up PR.
- **Audience:** Freelancers quoting fixed-price work who need to know how much to charge so the amount left after manually known platform/payment/payout deductions still covers their project target.
- **Visitor task:** Start from the project's labour, uncertainty allowance and direct costs, enter the deductions that actually apply to their chosen payment route, and see the gross quote required plus the estimated amount remaining.
- **Evidence and limits:** The 2026-11-02 competitor scan identifies a gap in RateNest's project quote workflow. Current public examples include a freelancer payment-fee calculator with separate platform, withdrawal and FX inputs (NomadStackCompare), a payment fee calculator with processor and currency-conversion inputs (FreelancerKit), and a project quote calculator with manually entered platform/payment percentages and fixed payment fee (Work From Anywhere Guides). Freelancer.com's official fee page documents that withdrawal costs vary by method. These examples establish that the workflow exists in adjacent tools; they do not establish search volume, demand, universal fee rates or that all providers calculate fees on the same base.
- **Current gap:** The project quote calculator includes labour, a labour-only uncertainty allowance and direct expenses, but does not gross up the target for manually entered platform/payment/payout deductions. The hourly calculator's fee controls do not provide this project-quote-specific net target.
- **Value added:** Let a freelancer model only the fees they know for the selected route, see the deductions separately, and calculate a quote that targets the required net amount without relying on stale platform defaults.
- **Proposed scope for a follow-up feature PR:** Optional user-entered percentage fee(s) and fixed payout fee, with blank fields meaning zero; explicit fee-base/order labels; a transparent step-by-step breakdown; reverse calculation of the required client quote; preserve the existing quote unchanged when all fee fields are blank/zero. FX percentage is a manually entered cost only; no live FX rates or currency conversion in this feature.
- **Formula decision required before implementation:** Avoid assuming all providers charge fees on the same base. The implementation should either (a) use a clearly named single combined percentage applied to the client-paid gross quote plus a fixed payout fee, or (b) model sequential fee stages with explicit bases and order. Do not mix these models or imply that the selected model matches every provider. The design review must select one simple, accurately labelled model.
- **Exclusions:** No tax calculation or tax reserve; no provider/platform preset or hard-coded fee; no live exchange rate; no recommendation of payment services; no legal/accounting advice; no analytics, backend, account or storage.
- **Acceptance checks for the follow-up:** Zero/blank fees reproduce the existing quote exactly; percentage boundaries and fixed-fee validation; gross-up math tested against hand-calculated cases; prevent division by zero or 100%+ deductions; show fee amounts and net result; explain assumptions and fee bases in plain language; no negative/NaN results; mobile/keyboard/accessibility and copy/print output remain coherent; all calculations stay client-side.
- **Measurement:** Once Google/Bing data exists, inspect impressions/clicks for the project quote page and queries relating to fees/net payout. Until then, make no search-volume, traffic, conversion or revenue claims.
- **Sources consulted (2026-11-02):**
  - [NomadStackCompare — Freelancer Payment Fee Calculator](https://nomadstackcompare.com/en/calculators/freelancer-payment-fees)
  - [FreelancerKit — Payment Fee Calculator](https://freelancerkit.tech/tools/payment-fee-calculator)
  - [Work From Anywhere Guides — Freelance Project Quote & Take-Home Calculator](https://workfromanywhereguides.com/tools/freelance-project-calculator)
  - [Freelancer.com — Fees and Charges](https://www.freelancer.com/feesandcharges)
  - [MathBehind — Freelance Platform Fee Calculator](https://mathbehind.com/tools/freelance-platform-fee-calculator)

## Locked model (2026-11-02, Claude review of ChatGPT's recommendation)

**Decision: model (a)** — one user-entered combined percentage on the whole client-paid quote, plus one fixed payout fee deducted once. No sequential stages, no provider presets, no default rates, no tax, no live FX.

Definitions (all money in the selected currency, computed in whole cents):
- `T` = existing quote before fees (labour + labour-only allowance + direct expenses), rounded to the nearest cent exactly as the page already displays it.
- `p` = percentage entered by the user, `0 <= p <= 50%`, at most 3 decimal places (so `p` is an exact integer count of 0.001%). Blank = 0. Values above 50% are rejected as almost certainly a typing error (50% itself is accepted), which also avoids absurd gross-ups near 100%.
- `f` = fixed payout fee, `0 <= f <= 1,000,000,000`, blank = 0.
- `gross = ceil((T + f) / (1 - p))` in cents, using exact integer arithmetic (no floating point in the gross-up, so an exact result is never bumped by a cent).
- `percentageFee = round_half_up(gross × p)` in cents; `estimatedRemaining = gross − percentageFee − f`.

Rounding rule and why: the gross is rounded **up** so the displayed amount remaining can never be below `T`. Because the percentage fee is rounded to the nearest cent, `estimatedRemaining` lands on `T` or at most 1 cent above it. Checked by brute force over 400,000 random (T, p, f) combinations: 0 cases below `T`, 0 cases more than 1 cent above. Hand case: `T = 1,350.00`, `p = 10%`, `f = 5.00` → `(1,355.00) / 0.9 = 1,505.5555…` → gross **1,505.56**; percentage fee `150.556` → **150.56**; amount remaining `1,505.56 − 150.56 − 5.00 =` **1,350.00**.

Guards: both blank/zero → the existing quote is returned **unchanged and unrounded** (the fee path is not entered). If a result would exceed JavaScript's safe-integer range in cents, the calculation is refused with a plain message instead of showing a wrong number.

UI wording (binding): percentage field "Percentage fee on the client-paid quote (%)"; fixed field "Fixed payout fee (deducted once)"; output "Estimated amount remaining after entered fees" — never "profit", "net income" or "take-home". Copy must say the fees are the user's own estimate and that providers may calculate fees on a different base. The effective hourly rates (internal, not printed) use the amount remaining after the entered fees, so they stay comparable with and equal to the fee-free result.

Printed client sheet: shows the client-paid quote, the percentage-fee line and the fixed-fee line so the lines reconcile with the total (to within 1 cent of rounding); the amount remaining stays internal.

Not covered (unchanged exclusions): providers, taxes, FX, recommending a payment service, analytics, storage.

### Update 2026-11-06 — rounding unit follows the currency

The locked model above was written in cents. Since PR #102 the pages display each currency with its own minor-unit digits (TND three, USD/EUR/GBP/CAD/AUD two), so the fee arithmetic now uses the same unit: `minorUnits` comes from `Intl` (`currencyMinorUnits`) and defaults to 2 when omitted. Every statement above holds with "cent" read as "one minor unit of the selected currency": the gross is rounded up to one minor unit, the percentage fee to the nearest one, and the amount remaining is never below the target and at most one minor unit above it (checked for 0, 2 and 3 digits). TND hand case: target 1,350.000, 10%, fixed 5.000 gives a gross of 1,505.556, a percentage fee of 150.556 and 1,350.000 remaining. Changing the currency recomputes the quote with the new unit.
