import test from "node:test";
import assert from "node:assert/strict";
import { calculateHourlyRate } from "./calculator.mjs";

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
