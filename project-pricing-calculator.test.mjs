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

test("validates strings and treats blank optional fields as zero", () => {
  const result = validateProjectQuote({ estimatedHours: "12.5", hourlyRate: "80", directExpenses: "", bufferPercent: "" });
  assert.equal(result.ok, true);
  assert.deepEqual(result.values, { estimatedHours: 12.5, hourlyRate: 80, directExpenses: 0, bufferPercent: 0 });
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
