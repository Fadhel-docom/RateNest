import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateHourlyRate,
  validateRateInputs,
  billableScenarios,
  formatCurrency,
  formatNumber,
  formulaSteps
} from "./calculator.mjs";

test("calculates hourly rate from income, expenses, and billable capacity", () => {
  const result = calculateHourlyRate({ income: 60000, expenses: 6000, hoursPerWeek: 40, weeksOff: 4, billablePercent: 60 });
  assert.equal(result.annualRequired, 66000);
  assert.equal(result.workingWeeks, 48);
  assert.equal(result.billableHours, 1152);
  assert.equal(result.hourlyRate, 66000 / 1152);
});

test("supports zero expenses and 100 percent billable time", () => {
  const result = calculateHourlyRate({ income: 52000, expenses: 0, hoursPerWeek: 25, weeksOff: 0, billablePercent: 100 });
  assert.equal(result.billableHours, 1300);
  assert.equal(result.hourlyRate, 40);
});

test("rejects negative income", () => {
  assert.throws(() => calculateHourlyRate({ income: -1, hoursPerWeek: 40 }), RangeError);
});

test("rejects invalid billable percentage", () => {
  assert.throws(() => calculateHourlyRate({ income: 100, hoursPerWeek: 40, billablePercent: 0 }), RangeError);
});

test("rejects zero weekly working hours", () => {
  assert.throws(() => calculateHourlyRate({ income: 100, hoursPerWeek: 0 }), RangeError);
});

test("rejects non-finite values", () => {
  assert.throws(() => calculateHourlyRate({ income: Infinity, hoursPerWeek: 40 }), TypeError);
});

test("rejects more than 51 weeks off", () => {
  assert.throws(() => calculateHourlyRate({ income: 100, hoursPerWeek: 40, weeksOff: 52 }), RangeError);
});

const defaults = { income: 60000, expenses: 6000, hoursPerWeek: 40, weeksOff: 4, billablePercent: 60 };

test("default inputs give the documented default result", () => {
  const result = calculateHourlyRate(defaults);
  assert.equal(formatCurrency(result.hourlyRate, "USD", "en-US"), "$57.29");
  assert.equal(result.annualRequired, 66000);
  assert.equal(result.billableHours, 1152);
});

test("supports decimal hours and decimal money amounts", () => {
  const result = calculateHourlyRate({ income: 50000.5, expenses: 0.25, hoursPerWeek: 37.5, weeksOff: 5, billablePercent: 65 });
  assert.equal(result.annualRequired, 50000.75);
  assert.equal(result.billableHours, 37.5 * 47 * 0.65);
});

test("accepts the boundary values", () => {
  assert.equal(calculateHourlyRate({ income: 0, hoursPerWeek: 168, weeksOff: 51, billablePercent: 10 }).hourlyRate, 0);
  assert.ok(Number.isFinite(calculateHourlyRate({ income: 1e9, expenses: 1e9, hoursPerWeek: 1, weeksOff: 51, billablePercent: 10 }).hourlyRate));
});

test("rejects out-of-range hours, billable percent, and non-integer weeks off", () => {
  assert.throws(() => calculateHourlyRate({ ...defaults, hoursPerWeek: 169 }), RangeError);
  assert.throws(() => calculateHourlyRate({ ...defaults, billablePercent: 9 }), RangeError);
  assert.throws(() => calculateHourlyRate({ ...defaults, billablePercent: 101 }), RangeError);
  assert.throws(() => calculateHourlyRate({ ...defaults, weeksOff: 4.5 }), RangeError);
  assert.throws(() => calculateHourlyRate({ ...defaults, weeksOff: -1 }), RangeError);
  assert.throws(() => calculateHourlyRate({ ...defaults, expenses: -1 }), RangeError);
});

test("rejects NaN, missing, and string values", () => {
  assert.throws(() => calculateHourlyRate({ ...defaults, income: Number.NaN }), TypeError);
  assert.throws(() => calculateHourlyRate({ hoursPerWeek: 40 }), TypeError);
  assert.throws(() => calculateHourlyRate({ ...defaults, income: "60000" }), TypeError);
});

test("validateRateInputs parses string form values", () => {
  const { ok, values, errors } = validateRateInputs({ income: "60000", expenses: "6000", hoursPerWeek: "40", weeksOff: "4", billablePercent: "60" });
  assert.equal(ok, true);
  assert.deepEqual(errors, {});
  assert.deepEqual(values, defaults);
});

test("validateRateInputs treats blank expenses as zero but blank required fields as errors", () => {
  const blankExpenses = validateRateInputs({ income: "1000", expenses: "", hoursPerWeek: "40", weeksOff: "0", billablePercent: "60" });
  assert.equal(blankExpenses.ok, true);
  assert.equal(blankExpenses.values.expenses, 0);

  const blanks = validateRateInputs({ income: "", expenses: "", hoursPerWeek: " ", weeksOff: "", billablePercent: "" });
  assert.equal(blanks.ok, false);
  assert.deepEqual(Object.keys(blanks.errors).sort(), ["billablePercent", "hoursPerWeek", "income", "weeksOff"]);
});

test("validateRateInputs returns friendly messages for invalid values", () => {
  const { ok, errors } = validateRateInputs({ income: "-5", expenses: "abc", hoursPerWeek: "0", weeksOff: "4.5", billablePercent: "5" });
  assert.equal(ok, false);
  assert.match(errors.income, /negative/);
  assert.match(errors.expenses, /valid number/);
  assert.match(errors.hoursPerWeek, /greater than 0/);
  assert.match(errors.weeksOff, /whole weeks/);
  assert.match(errors.billablePercent, /between 10% and 100%/);
});

test("validateRateInputs rejects extreme money values, over-long weeks, and non-numeric text", () => {
  const { errors } = validateRateInputs({ income: "1000000001", expenses: "0x10", hoursPerWeek: "169", weeksOff: "52", billablePercent: "100" });
  assert.match(errors.income, /1,000,000,000/);
  assert.ok(errors.expenses);
  assert.match(errors.hoursPerWeek, /168/);
  assert.match(errors.weeksOff, /0 and 51/);
});

test("validateRateInputs accepts decimals and numbers typed as numbers", () => {
  const { ok, values } = validateRateInputs({ income: 60000.5, expenses: "0.5", hoursPerWeek: "37.5", weeksOff: 4, billablePercent: 60 });
  assert.equal(ok, true);
  assert.equal(values.hoursPerWeek, 37.5);
});

test("billableScenarios shows the rate falling as billable time rises", () => {
  const rows = billableScenarios(defaults);
  assert.deepEqual(rows.map((r) => r.billablePercent), [40, 60, 80]);
  assert.deepEqual(rows.map((r) => r.billableHours), [768, 1152, 1536]);
  assert.deepEqual(rows.map((r) => formatCurrency(r.hourlyRate, "USD", "en-US")), ["$85.94", "$57.29", "$42.97"]);
});

test("formatCurrency formats, supports compact whole amounts, and falls back safely", () => {
  assert.equal(formatCurrency(66000, "USD", "en-US"), "$66,000.00");
  assert.equal(formatCurrency(66000, "USD", "en-US", { compact: true }), "$66,000");
  assert.equal(formatCurrency(66000.5, "USD", "en-US", { compact: true }), "$66,000.50");
  assert.equal(formatCurrency(Number.NaN, "USD", "en-US"), "—");
  assert.equal(formatCurrency(12.345, "NOT-A-CURRENCY", "en-US"), "NOT-A-CURRENCY 12.35");
  assert.match(formatCurrency(57.29, "EUR", "en-US"), /57\.29/);
  assert.match(formatCurrency(57.29, "TND", "en-US"), /57\.29/);
});

test("formatNumber and formulaSteps present the calculation in plain language", () => {
  assert.equal(formatNumber(1152, "en-US"), "1,152");
  const steps = formulaSteps(defaults, calculateHourlyRate(defaults), { currency: "USD", locale: "en-US" });
  assert.deepEqual(steps, [
    "Required revenue: $60,000 income + $6,000 expenses = $66,000",
    "Billable hours: 40 hrs × 48 weeks × 60% = 1,152 hrs",
    "Hourly rate: $66,000 ÷ 1,152 hrs = $57.29/hr"
  ]);
});
