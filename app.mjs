import {
  calculateHourlyRate,
  validateRateInputs,
  validateAdjustments,
  applyAdjustments,
  adjustmentSteps,
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
const resultLabel = $("#result-label");
const annualTotal = $("#annual-total");
const billableHours = $("#billable-hours");
const workingWeeks = $("#working-weeks");
const summary = $("#result-summary");
const copyButton = $("#copy-result");
const copyStatus = $("#copy-status");
const announcer = $("#sr-announce");
const stepsList = $("#formula-steps");
const scenarioRows = $("#scenario-rows");
const adjustments = $("#adjustments");
const adjustedBlock = $("#adjusted-block");
const adjustedRate = $("#adjusted-rate");
const bufferAmount = $("#buffer-amount");
const feeAmount = $("#fee-amount");

// Maps calculator field names to the id of their input element.
const FIELD_IDS = {
  income: "income",
  expenses: "expenses",
  hoursPerWeek: "hours",
  weeksOff: "weeks-off",
  billablePercent: "billable",
  feePercent: "fee",
  bufferPercent: "buffer"
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
  // An error inside the collapsed optional section would otherwise be invisible.
  if (errors.feePercent || errors.bufferPercent) adjustments.open = true;
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
  resultLabel.textContent = "YOUR SUGGESTED RATE";
  annualTotal.textContent = "—";
  billableHours.textContent = "—";
  workingWeeks.textContent = "—";
  summary.textContent = "Fix the highlighted fields to see your rate.";
  stepsList.replaceChildren();
  scenarioRows.replaceChildren();
  adjustedBlock.hidden = true;
  copyButton.disabled = true;
  copyStatus.textContent = "";
}

function renderSteps(values, result, adjustment, percents) {
  const lines = [
    ...formulaSteps(values, result, { currency: currency.value }),
    ...adjustmentSteps(adjustment, percents, { currency: currency.value })
  ];
  stepsList.replaceChildren(...lines.map((text) => {
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

function render(values, result, percents) {
  const adjustment = applyAdjustments(result.hourlyRate, percents);
  lastValid = { values, result, percents, adjustment, currency: currency.value };
  setRate(money(result.hourlyRate));
  rateResult.classList.remove("is-empty");
  // The headline stays the base rate; fee and buffer are shown separately below it.
  resultLabel.textContent = adjustment.isAdjusted ? "YOUR BASE RATE" : "YOUR SUGGESTED RATE";
  annualTotal.textContent = moneyCompact(result.annualRequired);
  billableHours.textContent = `${formatNumber(result.billableHours)} hrs`;
  workingWeeks.textContent = `${result.workingWeeks} weeks`;
  summary.textContent = `Based on ${values.billablePercent}% billable time and ${result.workingWeeks} working weeks per year.`;
  adjustedBlock.hidden = !adjustment.isAdjusted;
  if (adjustment.isAdjusted) {
    setAdjustedRate(money(adjustment.adjustedRate));
    bufferAmount.textContent = `${money(adjustment.bufferPerHour)}/hr`;
    feeAmount.textContent = `${money(adjustment.feePerHour)}/hr`;
  }
  renderSteps(values, result, adjustment, percents);
  renderScenarios(values);
  copyButton.disabled = false;
  copyStatus.textContent = "";
  announce(adjustment.isAdjusted
    ? `Base rate: ${money(result.hourlyRate)} per hour. Rate to quote with your fee and buffer: ${money(adjustment.adjustedRate)} per hour.`
    : `Suggested rate: ${money(result.hourlyRate)} per hour.`);
}

function setAdjustedRate(text) {
  adjustedRate.replaceChildren(document.createTextNode(text));
  const suffix = document.createElement("span");
  suffix.textContent = "/hr";
  adjustedRate.append(suffix);
}

function update() {
  const raw = readRaw();
  const base = validateRateInputs(raw);
  const extra = validateAdjustments(raw);
  const errors = { ...base.errors, ...extra.errors };
  showErrors(errors);
  if (!base.ok || !extra.ok) {
    renderEmpty();
    announce(`Please fix: ${Object.values(errors).join(" ")}`);
    return;
  }
  try {
    render(base.values, calculateHourlyRate(base.values), extra.values);
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
  const { values, result, percents, adjustment } = lastValid;
  const fmt = (value) => formatCurrency(value, lastValid.currency);
  const fmtCompact = (value) => formatCurrency(value, lastValid.currency, undefined, { compact: true });
  const lines = [
    "RateNest hourly rate estimate",
    `${adjustment.isAdjusted ? "Base rate" : "Suggested rate"}: ${fmt(result.hourlyRate)}/hr`
  ];
  if (adjustment.isAdjusted) {
    lines.push(`Rate to quote with your fee and buffer: ${fmt(adjustment.adjustedRate)}/hr`);
    if (percents.bufferPercent > 0) lines.push(`Profit or safety buffer (entered by you): ${formatNumber(percents.bufferPercent)}%`);
    if (percents.feePercent > 0) lines.push(`Platform or payment fee (entered by you): ${formatNumber(percents.feePercent)}%`);
  }
  lines.push(
    `Target annual income (before personal income tax): ${fmtCompact(values.income)}`,
    `Annual business expenses: ${fmtCompact(values.expenses)}`,
    `Required annual revenue: ${fmtCompact(result.annualRequired)}`,
    `Work hours per week: ${formatNumber(values.hoursPerWeek)}`,
    `Weeks off per year: ${values.weeksOff} (${result.workingWeeks} working weeks)`,
    `Billable time: ${values.billablePercent}% (${formatNumber(result.billableHours)} billable hours per year)`,
    adjustment.isAdjusted
      ? "Estimate excludes personal income tax."
      : "Estimate excludes personal income tax, platform or payment fees, and a profit buffer."
  );
  try {
    await navigator.clipboard.writeText(lines.join("\n"));
    copyStatus.textContent = "Summary copied.";
  } catch {
    copyStatus.textContent = "Couldn't copy automatically. Select the result and copy it manually.";
  }
});

update();
