import test from "node:test";
import assert from "node:assert/strict";
import { calculateProjectQuote, validateProjectQuote, sumProjectHoursBreakdown, applyPayoutFees } from "./project-pricing-calculator.mjs";

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
  assert.deepEqual(result.values, { estimatedHours: 12.5, hourlyRate: 80, directExpenses: 0, bufferPercent: 0, feePercent: 0, fixedFee: 0, actualHours: null });
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

test("sums optional project effort categories and treats blanks as zero", () => {
  const result = sumProjectHoursBreakdown({ planningHours: "1.5", productionHours: "12", meetingsHours: "2", revisionsHours: "", managementHours: "0.5" });
  assert.equal(result.total, 16);
  assert.deepEqual(result.values, { planningHours: 1.5, productionHours: 12, meetingsHours: 2, revisionsHours: 0, managementHours: 0.5 });
});

test("empty or zero breakdown is valid but contributes no hours", () => {
  assert.deepEqual(sumProjectHoursBreakdown({}), { total: 0, values: { planningHours: 0, productionHours: 0, meetingsHours: 0, revisionsHours: 0, managementHours: 0 } });
  assert.equal(sumProjectHoursBreakdown({ planningHours: "0", productionHours: "" }).total, 0);
});

test("rejects malformed, negative, non-finite and excessive breakdown values", () => {
  for (const raw of [
    { planningHours: "abc" },
    { planningHours: "-1" },
    { planningHours: "Infinity" },
    { planningHours: "100001" },
    { planningHours: "60000", productionHours: "50000" }
  ]) assert.throws(() => sumProjectHoursBreakdown(raw));
});

test("breakdown total is free of floating-point noise", () => {
  assert.equal(sumProjectHoursBreakdown({ planningHours: "0.1", productionHours: "0.2" }).total, 0.3);
  assert.equal(sumProjectHoursBreakdown({ planningHours: "1.1", productionHours: "2.2", meetingsHours: "3.3" }).total, 6.6);
  assert.equal(sumProjectHoursBreakdown({ planningHours: "0.1", productionHours: "0.7", meetingsHours: "0.2" }).total, 1);
});

test("breakdown errors name the category in plain language, not the field id", () => {
  assert.throws(() => sumProjectHoursBreakdown({ planningHours: "-1" }), (e) => e instanceof TypeError && /Discovery and planning hours/.test(e.message) && !/planningHours/.test(e.message));
  assert.throws(() => sumProjectHoursBreakdown({ revisionsHours: "100001" }), (e) => e instanceof RangeError && /Revisions and QA hours/.test(e.message));
  assert.throws(() => sumProjectHoursBreakdown({ planningHours: "60000", productionHours: "50000" }), (e) => e instanceof RangeError && /combined breakdown/i.test(e.message));
});

// --- Optional payout fees: combined % on the client-paid quote + one fixed fee (model locked 2026-11-02) ---
const base = { estimatedHours: 20, hourlyRate: 60, directExpenses: 150, bufferPercent: 0 };

test("blank or zero fees reproduce the existing quote exactly and add no fee breakdown", () => {
  const plain = calculateProjectQuote(base);
  for (const fees of [{}, { feePercent: 0, fixedFee: 0 }]) {
    const result = calculateProjectQuote({ ...base, ...fees });
    assert.equal(result.quote, plain.quote);
    assert.equal(result.quote, 1350);
    assert.equal(result.fees, null);
    assert.equal(result.quoteBeforeFees, 1350);
    assert.equal(result.effectiveHourlyRate, plain.effectiveHourlyRate);
  }
  // The fee-free quote is never rounded, even with fractional cents.
  assert.equal(calculateProjectQuote({ estimatedHours: 1 / 3, hourlyRate: 10, directExpenses: 0 }).quote, (1 / 3) * 10);
});

test("hand case: target 1350, 10% and fixed 5 gross up to 1505.56 and leave exactly 1350.00", () => {
  const fees = applyPayoutFees(1350, { feePercent: 10, fixedFee: 5 });
  assert.deepEqual(fees, { feePercent: 10, quoteBeforeFees: 1350, grossQuote: 1505.56, percentageFee: 150.56, fixedFee: 5, totalDeductions: 155.56, estimatedRemaining: 1350 });
  const result = calculateProjectQuote({ ...base, feePercent: 10, fixedFee: 5 });
  assert.equal(result.quote, 1505.56);
  assert.equal(result.quoteBeforeFees, 1350);
  assert.equal(result.fees.estimatedRemaining, 1350);
});

test("percentage only, fixed only and an exact division do not gain a spurious cent", () => {
  assert.deepEqual(applyPayoutFees(900, { feePercent: 10 }), { feePercent: 10, quoteBeforeFees: 900, grossQuote: 1000, percentageFee: 100, fixedFee: 0, totalDeductions: 100, estimatedRemaining: 900 });
  assert.equal(applyPayoutFees(1350, { fixedFee: 25 }).grossQuote, 1375);
  assert.equal(applyPayoutFees(1350, { fixedFee: 25 }).percentageFee, 0);
  assert.equal(applyPayoutFees(0, { feePercent: 3, fixedFee: 0 }).grossQuote, 0);
  assert.equal(applyPayoutFees(0, { fixedFee: 2 }).grossQuote, 2);
});

test("the displayed amount remaining is never below the target and at most one cent above it", () => {
  let seed = 12345;
  const rand = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
  for (let i = 0; i < 20000; i++) {
    const target = Math.round(rand() * 5e6) / 100;
    const percent = Math.round(rand() * 50000) / 1000; // 0 to 50 in 0.001 steps
    const fixed = Math.round(rand() * 1e4) / 100;
    const fees = applyPayoutFees(target, { feePercent: percent, fixedFee: fixed });
    if (!fees) continue;
    const cents = (x) => Math.round(x * 100);
    assert.ok(cents(fees.estimatedRemaining) >= cents(target), `below target for ${target} ${percent}% ${fixed}`);
    assert.ok(cents(fees.estimatedRemaining) - cents(target) <= 1, `more than 1 cent above for ${target} ${percent}% ${fixed}`);
    assert.equal(cents(fees.grossQuote) - cents(fees.percentageFee) - cents(fees.fixedFee), cents(fees.estimatedRemaining));
  }
});

test("percentage fee boundaries: 0 and 50 accepted, above 50, negative and more than 3 decimals rejected", () => {
  assert.ok(applyPayoutFees(100, { feePercent: 50 }));
  assert.equal(applyPayoutFees(100, { feePercent: 50 }).grossQuote, 200);
  assert.ok(applyPayoutFees(100, { feePercent: 0.001 }));
  assert.equal(applyPayoutFees(100, { feePercent: 0 }), null);
  for (const bad of [50.001, 99.9, 100, 150, -1, 2.9999]) assert.throws(() => applyPayoutFees(100, { feePercent: bad }), RangeError);
  assert.throws(() => applyPayoutFees(100, { fixedFee: -0.01 }), RangeError);
  assert.throws(() => applyPayoutFees(100, { fixedFee: 1000000001 }), RangeError);
  for (const bad of [NaN, Infinity, "5"]) assert.throws(() => applyPayoutFees(100, { feePercent: bad }), TypeError);
});

test("results too large to hold exactly in cents are refused instead of shown wrong", () => {
  assert.throws(() => calculateProjectQuote({ estimatedHours: 100000, hourlyRate: 1000000000, directExpenses: 0, feePercent: 5 }), /too large/);
  assert.ok(calculateProjectQuote({ estimatedHours: 100000, hourlyRate: 1000000000, directExpenses: 0 }).quote > 0);
});

test("effective hourly rates use the amount remaining after fees, so they match the fee-free result", () => {
  const plain = calculateProjectQuote({ ...base, actualHours: 30 });
  const withFees = calculateProjectQuote({ ...base, actualHours: 30, feePercent: 10, fixedFee: 5 });
  assert.equal(withFees.effectiveHourlyRate, plain.effectiveHourlyRate);
  assert.equal(withFees.actualUsage.effectiveHourlyRate, plain.actualUsage.effectiveHourlyRate);
  assert.equal(withFees.actualUsage.effectiveHourlyRate, 45);
});

test("fee fields validate as form strings: blank is zero, decimals limited, bounds enforced, no built-in rate", () => {
  const blank = validateProjectQuote({ estimatedHours: "20", hourlyRate: "60", feePercent: "", fixedFee: "" });
  assert.equal(blank.ok, true);
  assert.equal(blank.values.feePercent, 0);
  assert.equal(blank.values.fixedFee, 0);
  const missing = validateProjectQuote({ estimatedHours: "20", hourlyRate: "60" });
  assert.equal(missing.values.feePercent, 0);
  assert.equal(validateProjectQuote({ estimatedHours: "20", hourlyRate: "60", feePercent: "2.9", fixedFee: "0.25" }).ok, true);
  const bad = validateProjectQuote({ estimatedHours: "20", hourlyRate: "60", feePercent: "2.9999", fixedFee: "-1" });
  assert.equal(bad.ok, false);
  assert.match(bad.errors.feePercent, /3 decimal places/);
  assert.match(bad.errors.fixedFee, /negative/);
  assert.match(validateProjectQuote({ estimatedHours: "20", hourlyRate: "60", feePercent: "51" }).errors.feePercent, /at most 50%/);
  assert.match(validateProjectQuote({ estimatedHours: "20", hourlyRate: "60", feePercent: "abc" }).errors.feePercent, /valid number/);
  assert.match(validateProjectQuote({ estimatedHours: "20", hourlyRate: "60", fixedFee: "2000000000" }).errors.fixedFee, /at most/);
});
