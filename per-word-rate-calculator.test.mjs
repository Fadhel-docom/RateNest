import test from "node:test";
import assert from "node:assert/strict";
import { calculatePerWordRate, validatePerWordRate } from "./per-word-rate-calculator.mjs";

test("default piece: 1,500 words at $0.10 in 6 hours pays $25/hr", () => {
  const r = calculatePerWordRate({ ratePerWord: 0.1, words: 1500, hours: 6 });
  assert.ok(Math.abs(r.grossFee - 150) < 1e-9);
  assert.equal(r.feeAmount, 0);
  assert.ok(Math.abs(r.netFee - 150) < 1e-9);
  assert.ok(Math.abs(r.effectiveHourlyRate - 25) < 1e-9);
  assert.equal(r.wordsPerHour, 250);
  assert.equal(r.target, null);
});

test("target scenario: $50/hr needs $0.20 per word, 500 words/hour, or 3 hours", () => {
  const r = calculatePerWordRate({ ratePerWord: 0.1, words: 1500, hours: 6, targetHourly: 50 });
  assert.ok(Math.abs(r.target.requiredRatePerWord - 0.2) < 1e-9);
  assert.ok(Math.abs(r.target.wordsPerHourNeeded - 500) < 1e-9);
  assert.ok(Math.abs(r.target.hoursAvailable - 3) < 1e-9);
  assert.equal(r.target.meetsTarget, false);
});

test("meetsTarget is true at exactly the required rate", () => {
  const r = calculatePerWordRate({ ratePerWord: 0.2, words: 1500, hours: 6, targetHourly: 50 });
  assert.equal(r.target.meetsTarget, true);
});

test("user-entered fee reduces net fee, hourly rate and raises the required rate", () => {
  const r = calculatePerWordRate({ ratePerWord: 0.1, words: 1500, hours: 6, feePercent: 10, targetHourly: 50 });
  assert.ok(Math.abs(r.feeAmount - 15) < 1e-9);
  assert.ok(Math.abs(r.netFee - 135) < 1e-9);
  assert.ok(Math.abs(r.effectiveHourlyRate - 22.5) < 1e-9);
  assert.ok(Math.abs(r.target.requiredRatePerWord - 50 * 6 / (1500 * 0.9)) < 1e-12);
});

test("a $0 rate has no words-per-hour threshold but is still valid", () => {
  const r = calculatePerWordRate({ ratePerWord: 0, words: 1000, hours: 2, targetHourly: 40 });
  assert.equal(r.effectiveHourlyRate, 0);
  assert.equal(r.target.wordsPerHourNeeded, null);
  assert.ok(Math.abs(r.target.requiredRatePerWord - 0.08) < 1e-12);
});

test("rejects invalid ranges", () => {
  assert.throws(() => calculatePerWordRate({ ratePerWord: -1, words: 100, hours: 1 }), RangeError);
  assert.throws(() => calculatePerWordRate({ ratePerWord: 0.1, words: 0, hours: 1 }), RangeError);
  assert.throws(() => calculatePerWordRate({ ratePerWord: 0.1, words: 100, hours: 0 }), RangeError);
  assert.throws(() => calculatePerWordRate({ ratePerWord: 0.1, words: 100, hours: 1, feePercent: 51 }), RangeError);
  assert.throws(() => calculatePerWordRate({ ratePerWord: 0.1, words: 100, hours: 1, targetHourly: 0 }), RangeError);
  assert.throws(() => calculatePerWordRate({ ratePerWord: NaN, words: 100, hours: 1 }), TypeError);
});

test("accepts boundary values and detects overflow", () => {
  assert.doesNotThrow(() => calculatePerWordRate({ ratePerWord: 1e6, words: 1e7, hours: 1e5, feePercent: 50, targetHourly: 1e9 }));
  assert.throws(() => calculatePerWordRate({ ratePerWord: 1e6, words: 1e7, hours: 1e5, targetHourly: 1e9 * 2 }), RangeError);
});

test("validation: required fields, blank optionals, strict number syntax", () => {
  const blank = validatePerWordRate({});
  assert.equal(blank.ok, false);
  assert.ok(blank.errors.ratePerWord && blank.errors.words && blank.errors.hours);
  const ok = validatePerWordRate({ ratePerWord: "0.10", words: "1500", hours: "6", feePercent: "", targetHourly: "" });
  assert.equal(ok.ok, true);
  assert.deepEqual(ok.values, { ratePerWord: 0.1, words: 1500, hours: 6, feePercent: 0, targetHourly: null });
  for (const bad of ["0x10", "Infinity", "1e3", "abc", "1,5"]) {
    assert.equal(validatePerWordRate({ ratePerWord: bad, words: "100", hours: "1" }).ok, false, bad);
  }
  assert.equal(validatePerWordRate({ ratePerWord: "0.1", words: "0", hours: "1" }).errors.words, "Word count must be greater than 0.");
  assert.equal(validatePerWordRate({ ratePerWord: "0.1", words: "100", hours: "1", feePercent: "60" }).errors.feePercent, "Fee must be at most 50%.");
  assert.equal(validatePerWordRate({ ratePerWord: "0.1", words: "100", hours: "1", targetHourly: "0" }).errors.targetHourly, "Target hourly rate must be greater than 0.");
  assert.equal(validatePerWordRate({ ratePerWord: "-1", words: "100", hours: "1" }).errors.ratePerWord, "Rate per word cannot be negative.");
});
