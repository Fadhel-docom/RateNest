import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateHourlyRate,
  rateEquivalents,
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

test("day and week equivalents use explicit 8- and 40-billable-hour assumptions", () => {
  assert.deepEqual(rateEquivalents(57.29), { dailyRate: 458.32, weeklyRate: 2291.6 });
  assert.deepEqual(rateEquivalents(0), { dailyRate: 0, weeklyRate: 0 });
  assert.throws(() => rateEquivalents(-1), RangeError);
  assert.throws(() => rateEquivalents(Number.NaN), RangeError);
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

test("billableScenarios shows billable and non-billable annual hours as billable share changes", () => {
  const rows = billableScenarios(defaults);
  assert.deepEqual(rows.map((r) => r.billablePercent), [40, 60, 80]);
  assert.deepEqual(rows.map((r) => r.totalWorkingHours), [1920, 1920, 1920]);
  assert.deepEqual(rows.map((r) => r.billableHours), [768, 1152, 1536]);
  assert.deepEqual(rows.map((r) => r.nonBillableHours), [1152, 768, 384]);
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

// ---- Phase 2: optional fee and buffer --------------------------------------
import { applyAdjustments, validateAdjustments, adjustmentSteps, MAX_FEE_PERCENT, MAX_BUFFER_PERCENT } from "./calculator.mjs";

const baseRate = calculateHourlyRate(defaults).hourlyRate;

test("adjustments default to zero and leave the base rate unchanged", () => {
  const none = applyAdjustments(baseRate);
  assert.equal(none.adjustedRate, baseRate);
  assert.equal(none.isAdjusted, false);
  assert.equal(none.bufferPerHour, 0);
  assert.equal(none.feePerHour, 0);
  assert.equal(applyAdjustments(baseRate, { feePercent: 0, bufferPercent: 0 }).adjustedRate, baseRate);
});

test("a buffer multiplies the base rate by (1 + buffer%)", () => {
  const r = applyAdjustments(100, { bufferPercent: 10 });
  assert.ok(Math.abs(r.adjustedRate - 110) < 1e-9);
  assert.ok(Math.abs(r.bufferPerHour - 10) < 1e-9);
  assert.equal(r.feePerHour, 0);
});

test("a platform fee grosses the price up so the freelancer keeps the target after the fee", () => {
  const r = applyAdjustments(90, { feePercent: 10 });
  assert.ok(Math.abs(r.adjustedRate - 100) < 1e-9);
  assert.ok(Math.abs(r.feePerHour - 10) < 1e-9);
  // After the platform keeps its share, the freelancer is left with the base rate.
  assert.ok(Math.abs(r.adjustedRate * (1 - 0.1) - 90) < 1e-9);
});

test("buffer and fee combine in a fixed order and stay internally consistent", () => {
  for (const [fee, buffer] of [[0, 0], [5, 0], [0, 15], [10, 10], [20, 25], [MAX_FEE_PERCENT, MAX_BUFFER_PERCENT]]) {
    const r = applyAdjustments(57.29, { feePercent: fee, bufferPercent: buffer });
    assert.ok(Math.abs(r.adjustedRate - 57.29 * (1 + buffer / 100) / (1 - fee / 100)) < 1e-9);
    assert.ok(Math.abs((r.adjustedRate - r.feePerHour) - r.bufferedRate) < 1e-9);
    assert.ok(Math.abs(r.adjustedRate * (1 - fee / 100) - r.baseRate * (1 + buffer / 100)) < 1e-9);
    assert.ok(r.adjustedRate >= r.baseRate);
  }
});

test("applyAdjustments rejects invalid inputs", () => {
  assert.throws(() => applyAdjustments(100, { feePercent: -1 }), RangeError);
  assert.throws(() => applyAdjustments(100, { feePercent: MAX_FEE_PERCENT + 1 }), RangeError);
  assert.throws(() => applyAdjustments(100, { feePercent: 100 }), RangeError); // would divide by zero
  assert.throws(() => applyAdjustments(100, { bufferPercent: -5 }), RangeError);
  assert.throws(() => applyAdjustments(100, { bufferPercent: MAX_BUFFER_PERCENT + 1 }), RangeError);
  assert.throws(() => applyAdjustments(Number.NaN), TypeError);
  assert.throws(() => applyAdjustments(100, { feePercent: "10" }), TypeError);
  assert.throws(() => applyAdjustments(-1), RangeError);
});

test("no fee percentage is built into the library", () => {
  // Omitting the options must never introduce a fee: the default is exactly zero.
  assert.equal(applyAdjustments(80, {}).feePerHour, 0);
  assert.equal(applyAdjustments(80, undefined).adjustedRate, 80);
});

test("validateAdjustments treats blank as zero and parses numbers", () => {
  assert.deepEqual(validateAdjustments({}), { ok: true, values: { feePercent: 0, bufferPercent: 0 }, errors: {} });
  assert.deepEqual(validateAdjustments({ feePercent: "", bufferPercent: " " }).values, { feePercent: 0, bufferPercent: 0 });
  const ok = validateAdjustments({ feePercent: "12.5", bufferPercent: "10" });
  assert.equal(ok.ok, true);
  assert.deepEqual(ok.values, { feePercent: 12.5, bufferPercent: 10 });
});

test("validateAdjustments reports friendly errors for bad values", () => {
  const bad = validateAdjustments({ feePercent: "abc", bufferPercent: "-3" });
  assert.equal(bad.ok, false);
  assert.match(bad.errors.feePercent, /valid percentage/);
  assert.match(bad.errors.bufferPercent, /negative/);
  const big = validateAdjustments({ feePercent: "51", bufferPercent: "101" });
  assert.match(big.errors.feePercent, /50% or less/);
  assert.match(big.errors.bufferPercent, /100% or less/);
  assert.equal(validateAdjustments({ feePercent: "1e2" }).ok, false);
  assert.equal(validateAdjustments({ feePercent: "0x10" }).ok, false);
});

test("adjustmentSteps only lists the adjustments that are switched on", () => {
  const opts = { currency: "USD", locale: "en-US" };
  const both = { feePercent: 10, bufferPercent: 10 };
  const adj = applyAdjustments(baseRate, both);
  assert.deepEqual(adjustmentSteps(adj, { feePercent: 0, bufferPercent: 0 }, opts), []);
  const steps = adjustmentSteps(adj, both, opts);
  assert.equal(steps.length, 2);
  assert.match(steps[0], /^Buffer: \$57\.29 × \(1 \+ 10%\) = \$63\.02\/hr$/);
  assert.match(steps[1], /^Platform fee: \$63\.02 ÷ \(1 − 10%\) = \$70\.02\/hr$/);
  assert.equal(adjustmentSteps(applyAdjustments(baseRate, { feePercent: 10 }), { feePercent: 10, bufferPercent: 0 }, opts).length, 1);
});
