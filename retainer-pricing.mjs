import { calculateRetainer, validateRetainer } from "./retainer-pricing-calculator.mjs";

const $ = (selector) => document.querySelector(selector);
const form = $("#retainer-form");
const currency = $("#currency");
const fields = ["monthlyHours", "hourlyRate", "discountPercent", "months"];
const outputIds = ["full-value", "discount-total", "retainer-total", "effective-rate", "contract-total"];
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
  $("#copy-retainer").disabled = true;
  $("#copy-status").textContent = "";
}

function render(values, result) {
  lastResult = { values, result, name: $("#retainerName").value.trim(), currency: currency.value };
  $("#full-value").textContent = money(result.fullRateValue);
  $("#discount-total").textContent = `−${money(result.discountAmount)}`;
  $("#retainer-total").textContent = money(result.monthlyRetainer);
  $("#effective-rate").textContent = `${money(result.effectiveHourlyRate)}/hr`;
  $("#contract-total").textContent = money(result.contractValue);
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
    $("#monthlyHours-error").textContent = error.message;
    $("#monthlyHours-error").hidden = false;
    $("#monthlyHours").setAttribute("aria-invalid", "true");
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
