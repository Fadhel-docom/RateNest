import test from "node:test";
import assert from "node:assert/strict";
import { calculateProjectQuote, validateProjectQuote } from "./project-pricing-calculator.mjs";

test("calculates labour, labour-only uncertainty allowance, expenses, and quote", () => {
  const result = calculateProjectQuote({ estimatedHours: 20, hourlyRate: 60, directExpenses: 150, bufferPercent: 25 });
  assert.equal(result.labour, 1200);
  assert.equal(result.uncertaintyAllowance, 300);
  assert.equal(result.quote, 1650);
  assert.equal(result.effectiveHourlyRate, 82.5);
});

test("zero buffer and zero expenses leave quote equal to labour", () => {
  const result = calculateProjectQuote({ estimatedHours: 12.5, hourlyRate: 80 });
  assert.equal(result.labour, 1000);
  assert.equal(result.uncertaintyAllowance, 0);
  assert.equal(result.directExpenses, 0);
  assert.equal(result.quote, 1000);
  assert.equal(result.effectiveHourlyRate, 80);
});

test("accepts valid boundary values and decimals", () => {
  assert.equal(calculateProjectQuote({ estimatedHours: 0.25, hourlyRate: 0, directExpenses: 0, bufferPercent: 100 }).quote, 0);
  assert.equal(calculateProjectQuote({ estimatedHours: 100000, hourlyRate: 1000000000, directExpenses: 0, bufferPercent: 0 }).quote, 1e14);
});

test("rejects zero or excessive hours, negative values, and excessive percentages", () => {
  for (const input of [
    { estimatedHours: 0, hourlyRate: 1 },
    { estimatedHours: 100001, hourlyRate: 1 },
    { estimatedHours: 1, hourlyRate: -1 },
    { estimatedHours: 1, hourlyRate: 1, directExpenses: -1 },
    { estimatedHours: 1, hourlyRate: 1, bufferPercent: 100.1 }
  ]) assert.throws(() => calculateProjectQuote(input), RangeError);
});

test("rejects missing and non-finite required values", () => {
  assert.throws(() => calculateProjectQuote({ hourlyRate: 20 }), TypeError);
  assert.throws(() => calculateProjectQuote({ estimatedHours: 1, hourlyRate: Infinity }), TypeError);
});

test("calculates the effective quote rate from actual hours without changing the fixed quote", () => {
  const result = calculateProjectQuote({ estimatedHours: 20, hourlyRate: 60, directExpenses: 150, bufferPercent: 0, actualHours: 30 });
  assert.equal(result.quote, 1350);
  assert.equal(result.effectiveHourlyRate, 67.5);
  assert.deepEqual(result.actualUsage, {
    actualHours: 30,
    calculable: true,
    effectiveHourlyRate: 45,
    overEstimate: true,
    underEstimate: false,
    hoursDifference: 10
  });
});

test("actual hours below or equal to estimate are identified correctly", () => {
  const faster = calculateProjectQuote({ estimatedHours: 20, hourlyRate: 60, actualHours: 10 }).actualUsage;
  assert.equal(faster.effectiveHourlyRate, 120);
  assert.equal(faster.underEstimate, true);
  assert.equal(faster.overEstimate, false);
  const onTime = calculateProjectQuote({ estimatedHours: 20, hourlyRate: 60, actualHours: 20 }).actualUsage;
  assert.equal(onTime.effectiveHourlyRate, 60);
  assert.equal(onTime.hoursDifference, 0);
});

test("zero actual hours is not calculable and blank actual hours adds no scenario", () => {
  const zero = calculateProjectQuote({ estimatedHours: 20, hourlyRate: 60, actualHours: 0 }).actualUsage;
  assert.equal(zero.calculable, false);
  assert.equal(zero.effectiveHourlyRate, null);
  assert.equal(calculateProjectQuote({ estimatedHours: 20, hourlyRate: 60 }).actualUsage, null);
});

test("rejects negative, excessive, and non-finite actual hours", () => {
  for (const actualHours of [-1, 100001]) {
    assert.throws(() => calculateProjectQuote({ estimatedHours: 20, hourlyRate: 60, actualHours }), RangeError);
  }
  assert.throws(() => calculateProjectQuote({ estimatedHours: 20, hourlyRate: 60, actualHours: Infinity }), TypeError);
});

test("validates strings and treats blank optional fields as zero", () => {
  const result = validateProjectQuote({ estimatedHours: "12.5", hourlyRate: "80", directExpenses: "", bufferPercent: "" });
  assert.equal(result.ok, true);
  assert.deepEqual(result.values, { estimatedHours: 12.5, hourlyRate: 80, directExpenses: 0, bufferPercent: 0, actualHours: null });
});

test("validates optional actual hours and accepts zero while rejecting values above the limit", () => {
  const blank = validateProjectQuote({ estimatedHours: "20", hourlyRate: "60", actualHours: "" });
  assert.equal(blank.ok, true);
  assert.equal(blank.values.actualHours, null);
  const zero = validateProjectQuote({ estimatedHours: "20", hourlyRate: "60", actualHours: "0" });
  assert.equal(zero.ok, true);
  assert.equal(zero.values.actualHours, 0);
  const excessive = validateProjectQuote({ estimatedHours: "20", hourlyRate: "60", actualHours: "100001" });
  assert.equal(excessive.ok, false);
  assert.match(excessive.errors.actualHours, /100,000/);
});

test("reports missing, invalid, negative, and out-of-range form values", () => {
  const missing = validateProjectQuote({ estimatedHours: "", hourlyRate: "20" });
  assert.equal(missing.ok, false);
  assert.ok(missing.errors.estimatedHours);
  const invalid = validateProjectQuote({ estimatedHours: "0x10", hourlyRate: "-1", directExpenses: "abc", bufferPercent: "101" });
  assert.equal(invalid.ok, false);
  assert.match(invalid.errors.estimatedHours, /valid number/);
  assert.match(invalid.errors.hourlyRate, /negative/);
  assert.match(invalid.errors.directExpenses, /valid number/);
  assert.match(invalid.errors.bufferPercent, /100%/);
});
