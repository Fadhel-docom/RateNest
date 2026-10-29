import test from "node:test";
import assert from "node:assert/strict";
import { calculateRetainer, validateRetainer } from "./retainer-pricing-calculator.mjs";

test("default retainer: 20 h x $60, 0% discount, 12 months", () => {
  const r = calculateRetainer({ monthlyHours: 20, hourlyRate: 60 });
  assert.equal(r.fullRateValue, 1200);
  assert.equal(r.discountAmount, 0);
  assert.equal(r.monthlyRetainer, 1200);
  assert.equal(r.effectiveHourlyRate, 60);
  assert.equal(r.contractValue, 14400);
});

test("user-entered discount lowers the retainer and the effective rate", () => {
  const r = calculateRetainer({ monthlyHours: 20, hourlyRate: 60, discountPercent: 10, months: 6 });
  assert.equal(r.discountAmount, 120);
  assert.equal(r.monthlyRetainer, 1080);
  assert.equal(r.effectiveHourlyRate, 54);
  assert.equal(r.contractValue, 6480);
});

test("accepts boundary values and decimals", () => {
  assert.equal(calculateRetainer({ monthlyHours: 0.5, hourlyRate: 0, discountPercent: 100, months: 1 }).monthlyRetainer, 0);
  assert.equal(calculateRetainer({ monthlyHours: 744, hourlyRate: 1000000000, months: 120 }).contractValue, 744 * 1e9 * 120);
  assert.equal(calculateRetainer({ monthlyHours: 12.5, hourlyRate: 80 }).monthlyRetainer, 1000);
});

test("rejects out-of-range and non-integer inputs", () => {
  for (const input of [
    { monthlyHours: 0, hourlyRate: 1 },
    { monthlyHours: 745, hourlyRate: 1 },
    { monthlyHours: 1, hourlyRate: -1 },
    { monthlyHours: 1, hourlyRate: 1, discountPercent: 100.1 },
    { monthlyHours: 1, hourlyRate: 1, discountPercent: -1 },
    { monthlyHours: 1, hourlyRate: 1, months: 0 },
    { monthlyHours: 1, hourlyRate: 1, months: 1.5 },
    { monthlyHours: 1, hourlyRate: 1, months: 121 }
  ]) assert.throws(() => calculateRetainer(input), RangeError);
});

test("rejects missing and non-finite values", () => {
  assert.throws(() => calculateRetainer({ hourlyRate: 20 }), TypeError);
  assert.throws(() => calculateRetainer({ monthlyHours: 1, hourlyRate: Infinity }), TypeError);
});

test("no discount is built in: the default is zero and the effective rate equals the entered rate", () => {
  const r = calculateRetainer({ monthlyHours: 10, hourlyRate: 95 });
  assert.equal(r.discountPercent, 0);
  assert.equal(r.effectiveHourlyRate, 95);
});

test("validates strings, treats blank optional fields as defaults", () => {
  const ok = validateRetainer({ monthlyHours: "20", hourlyRate: "60", discountPercent: "", months: "" });
  assert.equal(ok.ok, true);
  assert.deepEqual(ok.values, { monthlyHours: 20, hourlyRate: 60, discountPercent: 0, months: 12, expectedHours: null });
});

test("reports missing, invalid, negative, fractional and out-of-range form values", () => {
  const missing = validateRetainer({ monthlyHours: "", hourlyRate: "" });
  assert.equal(missing.ok, false);
  assert.ok(missing.errors.monthlyHours && missing.errors.hourlyRate);
  const bad = validateRetainer({ monthlyHours: "0", hourlyRate: "-1", discountPercent: "101", months: "2.5" });
  assert.equal(bad.ok, false);
  assert.match(bad.errors.monthlyHours, /greater than 0/);
  assert.match(bad.errors.hourlyRate, /negative/);
  assert.match(bad.errors.discountPercent, /100%/);
  assert.match(bad.errors.months, /whole number/);
  const hex = validateRetainer({ monthlyHours: "0x10", hourlyRate: "abc", months: "1e2" });
  assert.match(hex.errors.monthlyHours, /valid number/);
  assert.match(hex.errors.hourlyRate, /valid number/);
  assert.match(hex.errors.months, /valid number/);
  assert.match(validateRetainer({ monthlyHours: "745", hourlyRate: "1" }).errors.monthlyHours, /at most 744/);
  assert.match(validateRetainer({ monthlyHours: "1", hourlyRate: "1", months: "0" }).errors.months, /at least 1/);
});

test("expected usage is optional: no usage scenario unless the user enters one", () => {
  assert.equal(calculateRetainer({ monthlyHours: 20, hourlyRate: 60 }).usage, null);
  assert.equal(calculateRetainer({ monthlyHours: 20, hourlyRate: 60, expectedHours: null }).usage, null);
  assert.equal(validateRetainer({ monthlyHours: "20", hourlyRate: "60", expectedHours: "" }).values.expectedHours, null);
});

test("under-use raises the effective rate; the all-hours rate stays unchanged", () => {
  const r = calculateRetainer({ monthlyHours: 20, hourlyRate: 60, expectedHours: 16 });
  assert.equal(r.effectiveHourlyRate, 60);
  assert.equal(r.usage.effectiveHourlyRate, 75);
  assert.equal(r.usage.underReserved, true);
  assert.equal(r.usage.overReserved, false);
  assert.equal(r.usage.hoursDifference, 4);
});

test("over-use is an overage scenario: input is not capped and the rate falls below the all-hours rate", () => {
  const r = calculateRetainer({ monthlyHours: 20, hourlyRate: 60, expectedHours: 30 });
  assert.equal(r.usage.overReserved, true);
  assert.equal(r.usage.hoursDifference, 10);
  assert.equal(r.usage.effectiveHourlyRate, 40);
});

test("expected usage equal to reserved hours matches the all-hours rate; the discount flows through", () => {
  const same = calculateRetainer({ monthlyHours: 20, hourlyRate: 60, discountPercent: 10, expectedHours: 20 });
  assert.equal(same.usage.effectiveHourlyRate, same.effectiveHourlyRate);
  assert.equal(same.usage.overReserved || same.usage.underReserved, false);
  assert.equal(calculateRetainer({ monthlyHours: 20, hourlyRate: 60, discountPercent: 10, expectedHours: 12 }).usage.effectiveHourlyRate, 90);
});

test("zero expected hours is not calculable (no division by zero)", () => {
  const r = calculateRetainer({ monthlyHours: 20, hourlyRate: 60, expectedHours: 0 });
  assert.equal(r.usage.calculable, false);
  assert.equal(r.usage.effectiveHourlyRate, null);
  assert.equal(validateRetainer({ monthlyHours: "20", hourlyRate: "60", expectedHours: "0" }).values.expectedHours, 0);
});

test("expected hours boundaries and validation", () => {
  assert.equal(calculateRetainer({ monthlyHours: 744, hourlyRate: 1, expectedHours: 744 }).usage.effectiveHourlyRate, 1);
  assert.equal(calculateRetainer({ monthlyHours: 1, hourlyRate: 100, expectedHours: 0.5 }).usage.effectiveHourlyRate, 200);
  for (const bad of [-1, 744.01, 745]) assert.throws(() => calculateRetainer({ monthlyHours: 1, hourlyRate: 1, expectedHours: bad }), RangeError);
  for (const bad of [NaN, Infinity, "5"]) assert.throws(() => calculateRetainer({ monthlyHours: 1, hourlyRate: 1, expectedHours: bad }), TypeError);
  assert.match(validateRetainer({ monthlyHours: "1", hourlyRate: "1", expectedHours: "745" }).errors.expectedHours, /at most 744/);
  assert.match(validateRetainer({ monthlyHours: "1", hourlyRate: "1", expectedHours: "-1" }).errors.expectedHours, /negative/);
  assert.match(validateRetainer({ monthlyHours: "1", hourlyRate: "1", expectedHours: "abc" }).errors.expectedHours, /valid number/);
  assert.match(validateRetainer({ monthlyHours: "1", hourlyRate: "1", expectedHours: "0x10" }).errors.expectedHours, /valid number/);
});

test("a huge rate with tiny expected hours is rejected instead of returning Infinity", () => {
  assert.throws(() => calculateRetainer({ monthlyHours: 744, hourlyRate: 1000000000, expectedHours: Number.MIN_VALUE }), RangeError);
});
