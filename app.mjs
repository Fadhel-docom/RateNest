import { calculateHourlyRate } from "./calculator.mjs";

const form = document.querySelector("#rate-form");
const currency = document.querySelector("#currency");
const billable = document.querySelector("#billable");
const billableOutput = document.querySelector("#billable-output");
const rateResult = document.querySelector("#rate-result");
const annualTotal = document.querySelector("#annual-total");
const billableHours = document.querySelector("#billable-hours");
const workingWeeks = document.querySelector("#working-weeks");
const summary = document.querySelector("#result-summary");
const copyButton = document.querySelector("#copy-result");
const copyStatus = document.querySelector("#copy-status");

const numberFrom = (id) => Number(document.querySelector(id).value);
const formatter = () => new Intl.NumberFormat(undefined, {
  style: "currency",
  currency: currency.value,
  maximumFractionDigits: 2
});
const formatMoney = (value) => formatter().format(value);

function updateCalculation(event) {
  if (event) event.preventDefault();
  if (!form.reportValidity()) return;
  try {
    const result = calculateHourlyRate({
      income: numberFrom("#income"),
      expenses: numberFrom("#expenses"),
      hoursPerWeek: numberFrom("#hours"),
      weeksOff: numberFrom("#weeks-off"),
      billablePercent: numberFrom("#billable")
    });
    rateResult.replaceChildren(document.createTextNode(formatMoney(result.hourlyRate)));
    const suffix = document.createElement("span");
    suffix.textContent = "/hr";
    rateResult.append(suffix);
    annualTotal.textContent = formatMoney(result.annualRequired);
    billableHours.textContent = `${new Intl.NumberFormat().format(result.billableHours)} hrs`;
    workingWeeks.textContent = `${result.workingWeeks} weeks`;
    summary.textContent = `Based on ${numberFrom("#billable")}% billable time and ${result.workingWeeks} working weeks per year.`;
    copyStatus.textContent = "";
  } catch (error) {
    summary.textContent = error instanceof Error ? error.message : "Please check your inputs.";
  }
}

form.addEventListener("submit", updateCalculation);
form.addEventListener("input", (event) => {
  if (event.target.name !== "currency") updateCalculation();
});
currency.addEventListener("change", updateCalculation);
billable.addEventListener("input", () => {
  billableOutput.value = `${billable.value}%`;
  billableOutput.textContent = `${billable.value}%`;
});

copyButton.addEventListener("click", async () => {
  const text = [
    "RateNest hourly rate estimate",
    `Suggested rate: ${rateResult.textContent}`,
    `Annual income + expenses: ${annualTotal.textContent}`,
    `Billable hours per year: ${billableHours.textContent}`,
    `Working weeks per year: ${workingWeeks.textContent}`,
    "Estimate excludes personal income tax and a profit buffer."
  ].join("\n");
  try {
    await navigator.clipboard.writeText(text);
    copyStatus.textContent = "Summary copied.";
  } catch {
    copyStatus.textContent = "Copy isn't available in this browser. You can select and copy the result manually.";
  }
});

updateCalculation();
