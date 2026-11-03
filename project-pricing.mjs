import { calculateProjectQuote, validateProjectQuote, sumProjectHoursBreakdown, PROJECT_HOURS_CATEGORIES } from "./project-pricing-calculator.mjs";
import { formatCurrency } from "./calculator.mjs";

const $ = (selector) => document.querySelector(selector);
const form = $("#project-form");
const currency = $("#currency");
const outputIds = ["labour-total", "buffer-total", "expenses-total", "quote-total", "effective-rate", "actual-effective-rate"];
let lastResult = null;

function money(value) {
  return formatCurrency(value, currency.value, "en-US");
}

const hoursText = (n) => { const value = Number(n.toFixed(2)); return value + (value === 1 ? " hour" : " hours"); };

const FORM_KEYS = ["estimatedHours", "hourlyRate", "directExpenses", "bufferPercent", "feePercent", "fixedFee", "actualHours"];
const FEE_KEYS = ["feePercent", "fixedFee"];
const PRINT_NOTE_DEFAULT = "This estimate is not a contract or invoice. Confirm the scope, deliverables, timeline, revision limits, payment schedule and applicable taxes with your client. Taxes and platform/payment fees are not included unless listed in direct expenses.";
const PRINT_NOTE_WITH_FEES = "This estimate is not a contract or invoice. Confirm the scope, deliverables, timeline, revision limits, payment schedule and applicable taxes with your client. Payment and payout fees are included as listed above; taxes are not included unless listed in direct expenses.";
const TIP_DEFAULT = "This is a planning estimate, not a guarantee of profit. Taxes and platform/payment fees are excluded unless you include them in direct expenses. Confirm scope, deliverables, and revision limits with your client.";
const TIP_WITH_FEES = "This is a planning estimate, not a guarantee of profit. The payment fees are your own estimate on the client-paid quote; a provider may charge on a different base, so check the real fees. Taxes are excluded. Confirm scope, deliverables, and revision limits with your client.";

// The fee fields live in a collapsed section: open it whenever one of them has an error so the message is visible.
function openFeesIfNeeded() {
  if (FEE_KEYS.some((key) => !document.getElementById(`${key}-error`).hidden)) $("#payout-fees").open = true;
}

function showErrors(errors) {
  for (const key of FORM_KEYS) {
    const input = document.getElementById(key);
    const message = document.getElementById(`${key}-error`);
    if (errors[key]) {
      input.setAttribute("aria-invalid", "true");
      message.textContent = errors[key];
      message.hidden = false;
    } else {
      input.removeAttribute("aria-invalid");
      message.textContent = "";
      message.hidden = true;
    }
  }
  openFeesIfNeeded();
}

function clearResult() {
  lastResult = null;
  for (const id of outputIds) document.getElementById(id).textContent = "—";
  $("#quote-summary").textContent = "Enter your project assumptions to estimate a fixed quote.";
  $("#print-quote").disabled = true;
  $("#actual-hours-note").hidden = true;
  $("#actual-hours-note").textContent = "";
  for (const id of ["pct-fee-line", "fixed-fee-line", "remaining-line", "fee-note"]) document.getElementById(id).hidden = true;
  $("#quote-print-note").textContent = PRINT_NOTE_DEFAULT;
  $("#quote-tip").innerHTML = `<strong>Remember:</strong> ${TIP_DEFAULT}`;
  $("#copy-quote").disabled = true;
  $("#copy-status").textContent = "";
}

function readBreakdown() {
  return Object.fromEntries(PROJECT_HOURS_CATEGORIES.map(({ key }) => [key, document.getElementById(key).value]));
}

// Category lines for the copied summary: only when a breakdown was entered and it still matches the total-hours field.
function breakdownSummaryLines(breakdown, estimatedHours) {
  try {
    const sum = sumProjectHoursBreakdown(breakdown);
    if (sum.total <= 0 || sum.total !== estimatedHours) return [];
    return PROJECT_HOURS_CATEGORIES.filter(({ key }) => sum.values[key] > 0).map(({ key, label }) => `  ${label}: ${sum.values[key]} hours`);
  } catch {
    return [];
  }
}

function render(values, result, breakdown = readBreakdown()) {
  lastResult = { values, result, breakdown, title: $("#projectTitle").value.trim(), currency: currency.value };
  $("#print-project-title").textContent = lastResult.title || "Freelance project";
  $("#print-quote").disabled = false;
  $("#labour-total").textContent = money(result.labour);
  $("#buffer-total").textContent = money(result.uncertaintyAllowance);
  $("#expenses-total").textContent = money(result.directExpenses);
  $("#quote-total").textContent = money(result.quote);
  $("#effective-rate").textContent = `${money(result.effectiveHourlyRate)}/hr`;
  const actualUsage = result.actualUsage;
  $("#actual-effective-rate").textContent = !actualUsage ? "—" : actualUsage.calculable ? `${money(actualUsage.effectiveHourlyRate)}/hr` : "Not calculable";
  const actualNote = !actualUsage ? "" : !actualUsage.calculable
    ? "At 0 actual hours, an hourly rate cannot be calculated."
    : actualUsage.overEstimate
      ? `You worked ${hoursText(actualUsage.hoursDifference)} more than estimated. The fixed quote stays the same, so the effective hourly rate is lower.`
      : actualUsage.underEstimate
        ? `You worked ${hoursText(actualUsage.hoursDifference)} fewer than estimated, so the effective hourly rate is higher.`
        : "Actual hours matched your estimate.";
  $("#actual-hours-note").textContent = actualNote;
  $("#actual-hours-note").hidden = actualNote === "";
  $("#quote-summary").textContent = `Based on ${result.estimatedHours} estimated hours, a ${result.bufferPercent}% labour-only uncertainty allowance, and ${money(result.directExpenses)} in direct expenses.`;
  const fees = result.fees;
  for (const id of ["pct-fee-line", "fixed-fee-line", "remaining-line", "fee-note"]) document.getElementById(id).hidden = !fees;
  if (fees) {
    $("#pct-fee-total").textContent = money(fees.percentageFee);
    $("#fixed-fee-total").textContent = money(fees.fixedFee);
    $("#remaining-total").textContent = money(fees.estimatedRemaining);
    $("#fee-note").textContent = `The client-paid quote includes your entered fees (${fees.feePercent}% of the quote plus ${money(fees.fixedFee)} fixed), so about ${money(fees.estimatedRemaining)} remains. This is an estimate from your own inputs, not profit or take-home pay; the effective hourly rates use this remaining amount.`;
  }
  $("#quote-print-note").textContent = fees ? PRINT_NOTE_WITH_FEES : PRINT_NOTE_DEFAULT;
  $("#quote-tip").innerHTML = `<strong>Remember:</strong> ${fees ? TIP_WITH_FEES : TIP_DEFAULT}`;
  $("#copy-quote").disabled = false;
  $("#copy-status").textContent = "";
}

function readForm() {
  return Object.fromEntries(FORM_KEYS.map((key) => [key, document.getElementById(key).value]));
}

function calculate({ focusFirstError = false } = {}) {
  const checked = validateProjectQuote(readForm());
  showErrors(checked.errors);
  if (!checked.ok) {
    clearResult();
    // Only move focus on an explicit submit; moving it while typing steals focus from the field being edited.
    if (focusFirstError) form.querySelector('[aria-invalid="true"]')?.focus();
    return;
  }
  try {
    render(checked.values, calculateProjectQuote(checked.values), readBreakdown());
  } catch (error) {
    clearResult();
    // Work out which input made the result unusable: the base quote, the entered fees, or the actual hours.
    let errorField = "estimatedHours";
    const withoutActual = { ...checked.values, actualHours: null };
    try {
      calculateProjectQuote({ ...withoutActual, feePercent: 0, fixedFee: 0 });
      try { calculateProjectQuote(withoutActual); errorField = "actualHours"; }
      catch { errorField = "feePercent"; }
    } catch { /* The base quote itself is invalid/too large; keep the estimated-hours fallback. */ }
    $(`#${errorField}-error`).textContent = error.message;
    $(`#${errorField}-error`).hidden = false;
    $(`#${errorField}`).setAttribute("aria-invalid", "true");
    openFeesIfNeeded();
  }
}

form.addEventListener("submit", (event) => { event.preventDefault(); calculate({ focusFirstError: true }); });
form.addEventListener("input", () => { calculate(); });
currency.addEventListener("change", () => { if (lastResult) render(lastResult.values, calculateProjectQuote(lastResult.values), lastResult.breakdown); });
$("#apply-hours-breakdown").addEventListener("click", () => {
  const status = $("#breakdown-status");
  try {
    const breakdown = sumProjectHoursBreakdown(readBreakdown());
    if (breakdown.total <= 0) throw new RangeError("Enter at least one positive category before adding the breakdown.");
    $("#estimatedHours").value = String(breakdown.total);
    status.textContent = `Breakdown total added: ${hoursText(breakdown.total)}. Edit the total above if needed; changing categories later will not update it until you add the breakdown again.`;
    calculate();
  } catch (error) {
    status.textContent = error.message;
  }
});
$("#print-quote").addEventListener("click", () => { if (lastResult) window.print(); });
$("#copy-quote").addEventListener("click", async () => {
  if (!lastResult) return;
  const { values, result, title, currency: code } = lastResult;
  const project = title || "Freelance project";
  const summary = [
    `Project quote: ${project}`,
    `Estimated effort: ${values.estimatedHours} hours`,
    ...breakdownSummaryLines(lastResult.breakdown, values.estimatedHours),
    `Hourly rate used: ${moneyFor(values.hourlyRate, code)}/hr`,
    `Labour subtotal: ${moneyFor(result.labour, code)}`,
    `Labour-only uncertainty allowance (${values.bufferPercent}%): ${moneyFor(result.uncertaintyAllowance, code)}`,
    `Direct project expenses: ${moneyFor(result.directExpenses, code)}`,
    ...(result.fees ? [`Quote before payment fees: ${moneyFor(result.fees.quoteBeforeFees, code)}`, `Percentage payment fee (${result.fees.feePercent}% of the client-paid quote): ${moneyFor(result.fees.percentageFee, code)}`, `Fixed payout fee: ${moneyFor(result.fees.fixedFee, code)}`] : []),
    `Suggested fixed-price quote: ${moneyFor(result.quote, code)}`,
    ...(result.fees ? [`Estimated amount remaining after entered fees: ${moneyFor(result.fees.estimatedRemaining, code)}`] : []),
    `Effective hourly rate at estimated hours: ${moneyFor(result.effectiveHourlyRate, code)}/hr`,
    ...(result.actualUsage ? [`Actual hours worked: ${values.actualHours}`, `Effective hourly rate at actual hours: ${result.actualUsage.calculable ? `${moneyFor(result.actualUsage.effectiveHourlyRate, code)}/hr` : "not calculable at 0 hours"} (${result.fees ? "amount remaining after entered fees" : "fixed quote"} ÷ actual hours; includes direct expenses)`] : []),
    result.fees
      ? "Assumptions: estimate only. The payment fees are the user's own inputs (one percentage on the client-paid quote plus one fixed fee); a provider may charge on a different base. The amount remaining is not profit or take-home pay. Taxes are excluded unless included in direct expenses."
      : "Assumptions: estimate only; the actual-hours rate divides the fixed quote by actual hours and includes direct expenses. It is not profit or take-home pay. Taxes and payment/platform fees are excluded unless included in direct expenses."
  ].join("\n");
  try {
    await navigator.clipboard.writeText(summary);
    $("#copy-status").textContent = "Quote summary copied.";
  } catch {
    $("#copy-status").textContent = "Copy is unavailable in this browser. Select and copy the result details manually.";
  }
});
function moneyFor(value, code) {
  return formatCurrency(value, code, "en-US");
}
calculate();
