import { calculateRetainer, validateRetainer } from "./retainer-pricing-calculator.mjs";

const $ = (selector) => document.querySelector(selector);
const form = $("#retainer-form");
const currency = $("#currency");
const fields = ["monthlyHours", "hourlyRate", "discountPercent", "expectedHours", "months"];
const outputIds = ["full-value", "discount-total", "retainer-total", "effective-rate", "usage-rate", "break-even-hours", "contract-total"];
let lastResult = null;

function moneyFor(value, code) {
  try { return new Intl.NumberFormat("en-US", { style: "currency", currency: code, maximumFractionDigits: 2 }).format(value); }
  catch { return `${code} ${Number(value).toFixed(2)}`; }
}
const money = (value) => moneyFor(value, currency.value);

function showErrors(errors) {
  for (const key of fields) {
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
  $("#retainer-summary").textContent = "Enter your retainer assumptions to estimate a monthly fee.";
  $("#usage-note").hidden = true;
  $("#usage-note").textContent = "";
  $("#break-even-row").hidden = true;
  $("#break-even-note").hidden = true;
  $("#break-even-note").textContent = "";
  $("#copy-retainer").disabled = true;
  $("#copy-status").textContent = "";
}

const hoursText = (n) => `${Number(n.toFixed(2))} ${Number(n.toFixed(2)) === 1 ? "hour" : "hours"}`;

function usageNote(usage) {
  if (!usage) return "";
  if (!usage.calculable) return "With 0 hours worked there is no hourly rate to calculate.";
  if (usage.overReserved) return `Overage scenario: you expect ${hoursText(usage.hoursDifference)} more than the reserved hours. This rate assumes no extra charge, so agree in advance how extra hours are billed.`;
  if (usage.underReserved) return `You expect ${hoursText(usage.hoursDifference)} fewer than the reserved hours, so this rate is higher than the all-hours rate if the retainer is paid in full.`;
  return "";
}

function render(values, result) {
  lastResult = { values, result, name: $("#retainerName").value.trim(), currency: currency.value };
  $("#full-value").textContent = money(result.fullRateValue);
  $("#discount-total").textContent = `−${money(result.discountAmount)}`;
  $("#retainer-total").textContent = money(result.monthlyRetainer);
  $("#effective-rate").textContent = `${money(result.effectiveHourlyRate)}/hr`;
  $("#contract-total").textContent = money(result.contractValue);
  const usage = result.usage;
  $("#usage-rate").textContent = !usage ? "—" : usage.calculable ? `${money(usage.effectiveHourlyRate)}/hr` : "Not calculable";
  const note = usageNote(usage);
  $("#usage-note").textContent = note;
  $("#usage-note").hidden = note === "";
  const showBreakEven = result.discountPercent > 0;
  $("#break-even-row").hidden = !showBreakEven;
  $("#break-even-hours").textContent = result.breakEvenCalculable ? `${Number(result.breakEvenHours.toFixed(1))} hours` : "Not calculable";
  $("#break-even-note").textContent = result.breakEvenCalculable
    ? "Below this many actual hours, your effective rate is above your baseline hourly rate; above it, your effective rate is below your baseline."
    : "A break-even threshold cannot be calculated when your baseline hourly rate is $0.";
  $("#break-even-note").hidden = !showBreakEven;
  $("#retainer-summary").textContent = `Based on ${result.monthlyHours} reserved hours per month at ${money(result.hourlyRate)}/hr, a ${result.discountPercent}% retainer discount, over ${result.months} ${result.months === 1 ? "month" : "months"}.`;
  $("#copy-retainer").disabled = false;
  $("#copy-status").textContent = "";
}

function readForm() {
  return Object.fromEntries(fields.map((key) => [key, document.getElementById(key).value]));
}

function calculate({ focusFirstError = false } = {}) {
  const checked = validateRetainer(readForm());
  showErrors(checked.errors);
  if (!checked.ok) {
    clearResult();
    // Only move focus on an explicit submit; moving it while typing steals focus from the field being edited.
    if (focusFirstError) form.querySelector('[aria-invalid="true"]')?.focus();
    return;
  }
  try {
    render(checked.values, calculateRetainer(checked.values));
  } catch (error) {
    clearResult();
    // If the base retainer is valid but the usage scenario overflows, associate the error with expectedHours.
    let errorField = "monthlyHours";
    if (checked.values.expectedHours !== null) {
      try { calculateRetainer({ ...checked.values, expectedHours: null }); errorField = "expectedHours"; }
      catch { /* The base retainer itself is invalid/too large; keep the monthly-hours fallback. */ }
    }
    document.getElementById(`${errorField}-error`).textContent = error.message;
    document.getElementById(`${errorField}-error`).hidden = false;
    document.getElementById(errorField).setAttribute("aria-invalid", "true");
  }
}

form.addEventListener("submit", (event) => { event.preventDefault(); calculate({ focusFirstError: true }); });
form.addEventListener("input", () => { calculate(); });
currency.addEventListener("change", () => { if (lastResult) render(lastResult.values, calculateRetainer(lastResult.values)); });
$("#copy-retainer").addEventListener("click", async () => {
  if (!lastResult) return;
  const { values, result, name, currency: code } = lastResult;
  const summary = [
    `Retainer estimate: ${name || "Freelance retainer"}`,
    `Reserved hours per month: ${values.monthlyHours}`,
    `Hourly rate used: ${moneyFor(values.hourlyRate, code)}/hr`,
    `Value at full rate: ${moneyFor(result.fullRateValue, code)}`,
    `Retainer discount (${values.discountPercent}%): −${moneyFor(result.discountAmount, code)}`,
    `Suggested monthly retainer: ${moneyFor(result.monthlyRetainer, code)}`,
    `Effective hourly rate if all reserved hours are used: ${moneyFor(result.effectiveHourlyRate, code)}/hr`,
    ...(result.usage ? [`Effective hourly rate at expected usage (${values.expectedHours} h/month actually worked): ${result.usage.calculable ? `${moneyFor(result.usage.effectiveHourlyRate, code)}/hr` : "not calculable at 0 hours"}${result.usage.overReserved ? " (overage scenario: assumes no extra charge for hours beyond the reserved hours)" : ""}`] : []),
    ...(result.discountPercent > 0 ? [`Break-even actual hours: ${result.breakEvenCalculable ? `${Number(result.breakEvenHours.toFixed(1))} hours/month` : "not calculable because the baseline hourly rate is $0"}`, ...(result.breakEvenCalculable ? ["Below this threshold, the effective rate is above your baseline; above it, the effective rate is below your baseline."] : [])] : []),
    `Contract value over ${values.months} ${values.months === 1 ? "month" : "months"}: ${moneyFor(result.contractValue, code)}`,
    "Assumptions: estimate only; taxes and any payment/platform fees are excluded. Define scope, unused hours and extra-work terms in your agreement."
  ].join("\n");
  try {
    await navigator.clipboard.writeText(summary);
    $("#copy-status").textContent = "Retainer summary copied.";
  } catch {
    $("#copy-status").textContent = "Copy is unavailable in this browser. Select and copy the result details manually.";
  }
});
calculate();
