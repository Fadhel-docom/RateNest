import { calculateProjectQuote, validateProjectQuote } from "./project-pricing-calculator.mjs";

const $ = (selector) => document.querySelector(selector);
const form = $("#project-form");
const currency = $("#currency");
const outputIds = ["labour-total", "buffer-total", "expenses-total", "quote-total", "effective-rate", "actual-effective-rate"];
let lastResult = null;

function money(value) {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: currency.value, maximumFractionDigits: 2 }).format(value);
  } catch {
    return `${currency.value} ${Number(value).toFixed(2)}`;
  }
}

function showErrors(errors) {
  for (const key of ["estimatedHours", "hourlyRate", "directExpenses", "bufferPercent", "actualHours"]) {
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
}

function clearResult() {
  lastResult = null;
  for (const id of outputIds) document.getElementById(id).textContent = "—";
  $("#quote-summary").textContent = "Enter your project assumptions to estimate a fixed quote.";
  $("#actual-hours-note").hidden = true;
  $("#actual-hours-note").textContent = "";
  $("#copy-quote").disabled = true;
  $("#copy-status").textContent = "";
}

function render(values, result) {
  lastResult = { values, result, title: $("#projectTitle").value.trim(), currency: currency.value };
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
      ? `You worked ${actualUsage.hoursDifference} more hours than estimated. The fixed quote stays the same, so the effective hourly rate is lower.`
      : actualUsage.underEstimate
        ? `You worked ${actualUsage.hoursDifference} fewer hours than estimated, so the effective hourly rate is higher.`
        : "Actual hours matched your estimate.";
  $("#actual-hours-note").textContent = actualNote;
  $("#actual-hours-note").hidden = actualNote === "";
  $("#quote-summary").textContent = `Based on ${result.estimatedHours} estimated hours, a ${result.bufferPercent}% labour-only uncertainty allowance, and ${money(result.directExpenses)} in direct expenses.`;
  $("#copy-quote").disabled = false;
  $("#copy-status").textContent = "";
}

function readForm() {
  return Object.fromEntries(["estimatedHours", "hourlyRate", "directExpenses", "bufferPercent", "actualHours"].map((key) => [key, document.getElementById(key).value]));
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
    render(checked.values, calculateProjectQuote(checked.values));
  } catch (error) {
    clearResult();
    let errorField = "estimatedHours";
    if (checked.values.actualHours !== null) {
      try { calculateProjectQuote({ ...checked.values, actualHours: null }); errorField = "actualHours"; }
      catch { /* The base quote itself is invalid/too large; keep the estimated-hours fallback. */ }
    }
    $(`#${errorField}-error`).textContent = error.message;
    $(`#${errorField}-error`).hidden = false;
    $(`#${errorField}`).setAttribute("aria-invalid", "true");
  }
}

form.addEventListener("submit", (event) => { event.preventDefault(); calculate({ focusFirstError: true }); });
form.addEventListener("input", () => { calculate(); });
currency.addEventListener("change", () => { if (lastResult) render(lastResult.values, calculateProjectQuote(lastResult.values)); });
$("#copy-quote").addEventListener("click", async () => {
  if (!lastResult) return;
  const { values, result, title, currency: code } = lastResult;
  const project = title || "Freelance project";
  const summary = [
    `Project quote: ${project}`,
    `Estimated effort: ${values.estimatedHours} hours`,
    `Hourly rate used: ${moneyFor(values.hourlyRate, code)}/hr`,
    `Labour subtotal: ${moneyFor(result.labour, code)}`,
    `Labour-only uncertainty allowance (${values.bufferPercent}%): ${moneyFor(result.uncertaintyAllowance, code)}`,
    `Direct project expenses: ${moneyFor(result.directExpenses, code)}`,
    `Suggested fixed-price quote: ${moneyFor(result.quote, code)}`,
    `Effective hourly rate at estimated hours: ${moneyFor(result.effectiveHourlyRate, code)}/hr`,
    ...(result.actualUsage ? [`Actual hours worked: ${values.actualHours}`, `Effective hourly rate at actual hours: ${result.actualUsage.calculable ? `${moneyFor(result.actualUsage.effectiveHourlyRate, code)}/hr` : "not calculable at 0 hours"} (fixed quote ÷ actual hours; includes direct expenses)`] : []),
    "Assumptions: estimate only; the actual-hours rate divides the fixed quote by actual hours and includes direct expenses. It is not profit or take-home pay. Taxes and payment/platform fees are excluded unless included in direct expenses."
  ].join("\n");
  try {
    await navigator.clipboard.writeText(summary);
    $("#copy-status").textContent = "Quote summary copied.";
  } catch {
    $("#copy-status").textContent = "Copy is unavailable in this browser. Select and copy the result details manually.";
  }
});
function moneyFor(value, code) {
  try { return new Intl.NumberFormat("en-US", { style: "currency", currency: code, maximumFractionDigits: 2 }).format(value); }
  catch { return `${code} ${Number(value).toFixed(2)}`; }
}
calculate();
