import {
  calculateHourlyRate,
  validateRateInputs,
  billableScenarios,
  formulaSteps,
  formatCurrency,
  formatNumber
} from "./calculator.mjs";

const $ = (selector) => document.querySelector(selector);
const form = $("#rate-form");
const currency = $("#currency");
const billable = $("#billable");
const billableOutput = $("#billable-output");
const rateResult = $("#rate-result");
const annualTotal = $("#annual-total");
const billableHours = $("#billable-hours");
const workingWeeks = $("#working-weeks");
const summary = $("#result-summary");
const copyButton = $("#copy-result");
const copyStatus = $("#copy-status");
const announcer = $("#sr-announce");
const stepsList = $("#formula-steps");
const scenarioRows = $("#scenario-rows");

// Maps calculator field names to the id of their input element.
const FIELD_IDS = {
  income: "income",
  expenses: "expenses",
  hoursPerWeek: "hours",
  weeksOff: "weeks-off",
  billablePercent: "billable"
};

let lastValid = null;
let announceTimer;

const money = (value) => formatCurrency(value, currency.value);
const moneyCompact = (value) => formatCurrency(value, currency.value, undefined, { compact: true });

function readRaw() {
  return Object.fromEntries(Object.entries(FIELD_IDS).map(([key, id]) => [key, document.getElementById(id).value]));
}

function showErrors(errors) {
  for (const [key, id] of Object.entries(FIELD_IDS)) {
    const input = document.getElementById(id);
    const message = document.getElementById(`${id}-error`);
    if (errors[key]) {
      input.setAttribute("aria-invalid", "true");
      if (message) {
        message.textContent = errors[key];
        message.hidden = false;
      }
    } else {
      input.removeAttribute("aria-invalid");
      if (message) {
        message.textContent = "";
        message.hidden = true;
      }
    }
  }
}

// Screen-reader announcement, debounced so typing doesn't produce a message per keystroke.
function announce(text) {
  clearTimeout(announceTimer);
  announceTimer = setTimeout(() => { announcer.textContent = text; }, 600);
}

function setRate(text) {
  rateResult.replaceChildren(document.createTextNode(text));
  if (text !== "—") {
    const suffix = document.createElement("span");
    suffix.textContent = "/hr";
    rateResult.append(suffix);
  }
}

function renderEmpty() {
  lastValid = null;
  setRate("—");
  rateResult.classList.add("is-empty");
  annualTotal.textContent = "—";
  billableHours.textContent = "—";
  workingWeeks.textContent = "—";
  summary.textContent = "Fix the highlighted fields to see your rate.";
  stepsList.replaceChildren();
  scenarioRows.replaceChildren();
  copyButton.disabled = true;
  copyStatus.textContent = "";
}

function renderSteps(values, result) {
  stepsList.replaceChildren(...formulaSteps(values, result, { currency: currency.value }).map((text) => {
    const item = document.createElement("li");
    item.textContent = text;
    return item;
  }));
}

function renderScenarios(values) {
  scenarioRows.replaceChildren(...billableScenarios(values).map((row) => {
    const tr = document.createElement("tr");
    const head = document.createElement("th");
    head.scope = "row";
    head.textContent = `${row.billablePercent}% billable`;
    const hours = document.createElement("td");
    hours.textContent = `${formatNumber(row.billableHours)} hrs`;
    const rate = document.createElement("td");
    rate.textContent = `${money(row.hourlyRate)}/hr`;
    tr.append(head, hours, rate);
    return tr;
  }));
}

function render(values, result) {
  lastValid = { values, result, currency: currency.value };
  setRate(money(result.hourlyRate));
  rateResult.classList.remove("is-empty");
  annualTotal.textContent = moneyCompact(result.annualRequired);
  billableHours.textContent = `${formatNumber(result.billableHours)} hrs`;
  workingWeeks.textContent = `${result.workingWeeks} weeks`;
  summary.textContent = `Based on ${values.billablePercent}% billable time and ${result.workingWeeks} working weeks per year.`;
  renderSteps(values, result);
  renderScenarios(values);
  copyButton.disabled = false;
  copyStatus.textContent = "";
  announce(`Suggested rate: ${money(result.hourlyRate)} per hour.`);
}

function update() {
  const { ok, values, errors } = validateRateInputs(readRaw());
  showErrors(errors);
  if (!ok) {
    renderEmpty();
    announce(`Please fix: ${Object.values(errors).join(" ")}`);
    return;
  }
  try {
    render(values, calculateHourlyRate(values));
  } catch (error) {
    renderEmpty();
    summary.textContent = error instanceof Error ? error.message : "Please check your inputs.";
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  update();
  form.querySelector('[aria-invalid="true"]')?.focus();
});
form.addEventListener("input", update);
currency.addEventListener("change", update);
billable.addEventListener("input", () => {
  billableOutput.value = `${billable.value}%`;
});

copyButton.addEventListener("click", async () => {
  if (!lastValid) return;
  const { values, result } = lastValid;
  const fmt = (value) => formatCurrency(value, lastValid.currency);
  const fmtCompact = (value) => formatCurrency(value, lastValid.currency, undefined, { compact: true });
  const text = [
    "RateNest hourly rate estimate",
    `Suggested rate: ${fmt(result.hourlyRate)}/hr`,
    `Target annual income (before personal income tax): ${fmtCompact(values.income)}`,
    `Annual business expenses: ${fmtCompact(values.expenses)}`,
    `Required annual revenue: ${fmtCompact(result.annualRequired)}`,
    `Work hours per week: ${formatNumber(values.hoursPerWeek)}`,
    `Weeks off per year: ${values.weeksOff} (${result.workingWeeks} working weeks)`,
    `Billable time: ${values.billablePercent}% (${formatNumber(result.billableHours)} billable hours per year)`,
    "Estimate excludes personal income tax, platform or payment fees, and a profit buffer."
  ].join("\n");
  try {
    await navigator.clipboard.writeText(text);
    copyStatus.textContent = "Summary copied.";
  } catch {
    copyStatus.textContent = "Couldn't copy automatically. Select the result and copy it manually.";
  }
});

update();
