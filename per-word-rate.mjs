import { calculatePerWordRate, validatePerWordRate } from "./per-word-rate-calculator.mjs";
import { formatCurrency, currencyMinorUnits } from "./calculator.mjs";

const $ = (selector) => document.querySelector(selector);
const form = $("#per-word-form");
const currency = $("#currency");
const fields = ["ratePerWord", "words", "hours", "feePercent", "targetHourly"];
const outputIds = ["gross-fee", "fee-amount", "net-fee", "effective-hourly", "words-per-hour", "required-rate", "words-needed", "hours-available"];
let lastResult = null;

const moneyFor = (value, code) => formatCurrency(value, code, "en-US");
const money = (value) => moneyFor(value, currency.value);
// A per-word price needs more digits than a whole-currency amount (for example $0.125 per word).
function perWordFor(value, code) {
  if (!Number.isFinite(value)) return "—";
  const digits = currencyMinorUnits(code, "en-US");
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: code, minimumFractionDigits: digits, maximumFractionDigits: Math.max(digits, 4) }).format(value);
  } catch {
    return `${code} ${value.toFixed(4)}`;
  }
}
const perWord = (value) => perWordFor(value, currency.value);
const numberText = (value, max = 2) => new Intl.NumberFormat("en-US", { maximumFractionDigits: max }).format(value);
const hoursText = (value) => `${numberText(value)} ${Number(value.toFixed(2)) === 1 ? "hour" : "hours"}`;

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
  $("#piece-summary").textContent = "Enter the rate, word count and hours to see your hourly rate.";
  $("#target-rows").hidden = true;
  $("#target-note").textContent = "";
  $("#copy-summary").disabled = true;
  $("#copy-status").textContent = "";
}

function targetNote(result) {
  const t = result.target;
  if (t.meetsTarget) return "At this rate and these hours you reach your target hourly rate.";
  const parts = [`To reach your target you could raise the rate to ${perWord(t.requiredRatePerWord)} per word`];
  if (t.wordsPerHourNeeded !== null) parts.push(`write ${numberText(t.wordsPerHourNeeded, 0)} finished words per hour`);
  parts.push(`or finish the piece in ${hoursText(t.hoursAvailable)}`);
  return `${parts.join(", ")}. Round any new rate up to a figure you can quote.`;
}

function render(values, result) {
  lastResult = { values, result, currency: currency.value };
  $("#effective-hourly").textContent = `${money(result.effectiveHourlyRate)}/hr`;
  $("#piece-summary").textContent = `Based on ${numberText(result.words, 0)} words at ${perWord(result.ratePerWord)} per word, finished in ${hoursText(result.hours)}${result.feePercent > 0 ? `, with a ${numberText(result.feePercent)}% fee` : ""}.`;
  $("#gross-fee").textContent = money(result.grossFee);
  $("#fee-amount").textContent = `−${money(result.feeAmount)}`;
  $("#net-fee").textContent = money(result.netFee);
  $("#words-per-hour").textContent = numberText(result.wordsPerHour, 0);
  const t = result.target;
  $("#target-rows").hidden = !t;
  if (t) {
    $("#required-rate").textContent = `${perWord(t.requiredRatePerWord)}/word`;
    $("#words-needed").textContent = t.wordsPerHourNeeded === null ? "Not calculable" : numberText(t.wordsPerHourNeeded, 0);
    $("#hours-available").textContent = hoursText(t.hoursAvailable);
    $("#target-note").textContent = targetNote(result);
  } else {
    $("#target-note").textContent = "";
  }
  $("#copy-summary").disabled = false;
  $("#copy-status").textContent = "";
}

function readForm() {
  return Object.fromEntries(fields.map((key) => [key, document.getElementById(key).value]));
}

function calculate({ focusFirstError = false } = {}) {
  const checked = validatePerWordRate(readForm());
  showErrors(checked.errors);
  if (!checked.ok) {
    clearResult();
    // Only move focus on an explicit submit; moving it while typing steals focus from the field being edited.
    if (focusFirstError) form.querySelector('[aria-invalid="true"]')?.focus();
    return;
  }
  try {
    render(checked.values, calculatePerWordRate(checked.values));
  } catch (error) {
    clearResult();
    const field = checked.values.targetHourly !== null ? "targetHourly" : "ratePerWord";
    document.getElementById(`${field}-error`).textContent = error.message;
    document.getElementById(`${field}-error`).hidden = false;
    document.getElementById(field).setAttribute("aria-invalid", "true");
  }
}

form.addEventListener("submit", (event) => { event.preventDefault(); calculate({ focusFirstError: true }); });
form.addEventListener("input", () => { calculate(); });
currency.addEventListener("change", () => { if (lastResult) render(lastResult.values, calculatePerWordRate(lastResult.values)); });
$("#copy-summary").addEventListener("click", async () => {
  if (!lastResult) return;
  const { values, result, currency: code } = lastResult;
  const m = (v) => moneyFor(v, code);
  const pw = (v) => perWordFor(v, code);
  const t = result.target;
  const summary = [
    "Per-word rate to hourly rate",
    `Rate per word: ${pw(values.ratePerWord)}`,
    `Paid words: ${numberText(values.words, 0)}`,
    `Total hours for the piece: ${numberText(values.hours)}`,
    `Fee for the piece: ${m(result.grossFee)}`,
    ...(values.feePercent > 0 ? [`Platform or payment fee (${numberText(values.feePercent)}%): −${m(result.feeAmount)}`, `You keep: ${m(result.netFee)}`] : []),
    `Hourly rate for this piece: ${m(result.effectiveHourlyRate)}/hr`,
    `Finished words per hour: ${numberText(result.wordsPerHour, 0)}`,
    ...(t ? [
      `Target hourly rate: ${m(t.targetHourly)}/hr`,
      `Per-word rate for the target: ${pw(t.requiredRatePerWord)}`,
      `Words per hour needed at the current rate: ${t.wordsPerHourNeeded === null ? "not calculable at a rate of 0" : numberText(t.wordsPerHourNeeded, 0)}`,
      `Hours that fit the target at this fee: ${numberText(t.hoursAvailable)}`
    ] : []),
    "Assumptions: planning estimate only; taxes are excluded and no fee is applied unless entered. The result depends on the hours entered."
  ].join("\n");
  try {
    await navigator.clipboard.writeText(summary);
    $("#copy-status").textContent = "Summary copied.";
  } catch {
    $("#copy-status").textContent = "Copy is unavailable in this browser. Select and copy the result details manually.";
  }
});
calculate();
