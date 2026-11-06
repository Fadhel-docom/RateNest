export const MAX_HOURS = 100000;
export const MAX_RATE = 1000000000;
export const MAX_EXPENSES = 1000000000;
export const MAX_BUFFER_PERCENT = 100;
export const MAX_FEE_PERCENT = 50;
export const MAX_FIXED_FEE = 1000000000;

function finiteNumber(value, name) {
  if (typeof value !== "number" || !Number.isFinite(value)) throw new TypeError(`${name} must be a finite number`);
  return value;
}

export const PROJECT_HOURS_CATEGORIES = [
  { key: "planningHours", label: "Discovery and planning" },
  { key: "productionHours", label: "Production / delivery" },
  { key: "meetingsHours", label: "Meetings and communication" },
  { key: "revisionsHours", label: "Revisions and QA" },
  { key: "managementHours", label: "Project management and admin" }
];

export function sumProjectHoursBreakdown(raw = {}) {
  const values = {};
  let total = 0;
  for (const { key, label } of PROJECT_HOURS_CATEGORIES) {
    const input = raw[key] ?? "";
    if (String(input).trim() === "") {
      values[key] = 0;
      continue;
    }
    const text = String(input).trim();
    if (!/^(?:\d+\.?\d*|\.\d+)$/.test(text)) throw new TypeError(`${label} hours must be a valid non-negative number.`);
    const value = Number(text);
    if (!Number.isFinite(value) || value < 0 || value > MAX_HOURS) throw new RangeError(`${label} hours must be between 0 and ${MAX_HOURS}.`);
    values[key] = value;
    total += value;
    if (!Number.isFinite(total) || total > MAX_HOURS) throw new RangeError(`The combined breakdown must not exceed ${MAX_HOURS} hours.`);
  }
  // Round away binary floating-point noise (0.1 + 0.2) so the total stays a clean decimal.
  return { total: Number(total.toFixed(6)), values };
}

// Whole minor units of the selected currency (cents for USD/EUR, millimes for TND). Going through toPrecision(15)
// removes binary noise such as 1.005 * 100 = 100.49999999999999 before rounding.
function toMinorUnits(amount, scale) {
  return Math.round(Number((amount * scale).toPrecision(15)));
}

/**
 * Optional user-entered payout fees, model "combined percentage on the client-paid quote + one fixed fee".
 * gross = ceil((target + fixedFee) / (1 - p)); percentageFee = round(gross * p); remaining = gross - percentageFee - fixedFee.
 * Everything is done in integer minor units of the selected currency (BigInt for the gross-up; default 2 digits, 3 for
 * TND), so the remaining amount is never below the target and at most one minor unit above it. Both fields blank/zero returns null and the quote is untouched.
 */
export function applyPayoutFees(targetQuote, { feePercent = 0, fixedFee = 0, minorUnits = 2 } = {}) {
  const target = finiteNumber(targetQuote, "targetQuote");
  const percent = finiteNumber(feePercent, "feePercent");
  const fixed = finiteNumber(fixedFee, "fixedFee");
  if (percent < 0 || percent > MAX_FEE_PERCENT) throw new RangeError(`feePercent must be between 0% and ${MAX_FEE_PERCENT}%`);
  if (Math.abs(percent * 1000 - Math.round(percent * 1000)) > 1e-9) throw new RangeError("feePercent can have at most 3 decimal places");
  if (fixed < 0 || fixed > MAX_FIXED_FEE) throw new RangeError("fixedFee must be between 0 and 1,000,000,000");
  if (target < 0) throw new RangeError("targetQuote cannot be negative");
  if (!Number.isInteger(minorUnits) || minorUnits < 0 || minorUnits > 3) throw new RangeError("minorUnits must be a whole number from 0 to 3");
  if (percent === 0 && fixed === 0) return null;
  const scale = 10 ** minorUnits;
  const targetCents = toMinorUnits(target, scale);
  const fixedCents = toMinorUnits(fixed, scale);
  if (!Number.isSafeInteger(targetCents) || !Number.isSafeInteger(targetCents + fixedCents)) throw new RangeError("The result is too large to apply fees safely");
  const p = BigInt(Math.round(percent * 1000)); // percent in thousandths of a percent: p / 100000 is the fee rate
  const denominator = 100000n - p;
  const gross = (BigInt(targetCents + fixedCents) * 100000n + denominator - 1n) / denominator;
  const percentageFee = (gross * p + 50000n) / 100000n;
  const remaining = gross - percentageFee - BigInt(fixedCents);
  if (gross > BigInt(Number.MAX_SAFE_INTEGER)) throw new RangeError("The result is too large to apply fees safely");
  return {
    feePercent: percent,
    quoteBeforeFees: targetCents / scale,
    grossQuote: Number(gross) / scale,
    percentageFee: Number(percentageFee) / scale,
    fixedFee: fixedCents / scale,
    totalDeductions: Number(percentageFee + BigInt(fixedCents)) / scale,
    estimatedRemaining: Number(remaining) / scale
  };
}

export function calculateProjectQuote({ estimatedHours, hourlyRate, directExpenses = 0, bufferPercent = 0, actualHours = null, feePercent = 0, fixedFee = 0, minorUnits = 2 }) {
  const hours = finiteNumber(estimatedHours, "estimatedHours");
  const rate = finiteNumber(hourlyRate, "hourlyRate");
  const expenses = finiteNumber(directExpenses, "directExpenses");
  const buffer = finiteNumber(bufferPercent, "bufferPercent");
  if (hours <= 0 || hours > MAX_HOURS) throw new RangeError("estimatedHours must be greater than 0 and at most 100,000");
  if (rate < 0 || rate > MAX_RATE) throw new RangeError("hourlyRate must be between 0 and 1,000,000,000");
  if (expenses < 0 || expenses > MAX_EXPENSES) throw new RangeError("directExpenses must be between 0 and 1,000,000,000");
  if (buffer < 0 || buffer > MAX_BUFFER_PERCENT) throw new RangeError("bufferPercent must be between 0% and 100%");
  const labour = hours * rate;
  const uncertaintyAllowance = labour * buffer / 100;
  const quoteBeforeFees = labour + uncertaintyAllowance + expenses;
  const fees = applyPayoutFees(quoteBeforeFees, { feePercent, fixedFee, minorUnits });
  // With fees, the client pays the grossed-up quote but the freelancer keeps about quoteBeforeFees,
  // so the effective hourly rates are based on the amount remaining after the entered fees.
  const quote = fees ? fees.grossQuote : quoteBeforeFees;
  const retained = fees ? fees.estimatedRemaining : quote;
  const effectiveHourlyRate = retained / hours;
  let actualUsage = null;
  if (actualHours !== null && actualHours !== undefined) {
    const actual = finiteNumber(actualHours, "actualHours");
    if (actual < 0 || actual > MAX_HOURS) throw new RangeError("actualHours must be between 0 and 100,000");
    actualUsage = {
      actualHours: actual,
      calculable: actual > 0,
      effectiveHourlyRate: actual > 0 ? retained / actual : null,
      overEstimate: actual > hours,
      underEstimate: actual < hours,
      hoursDifference: Math.abs(actual - hours)
    };
  }
  if (![labour, uncertaintyAllowance, quote, effectiveHourlyRate].every(Number.isFinite) || (actualUsage?.calculable && !Number.isFinite(actualUsage.effectiveHourlyRate))) {
    throw new RangeError("The result is too large to calculate safely");
  }
  return { estimatedHours: hours, hourlyRate: rate, directExpenses: expenses, bufferPercent: buffer, labour, uncertaintyAllowance, quoteBeforeFees, fees, quote, effectiveHourlyRate, actualUsage };
}

export function validateProjectQuote(raw = {}) {
  const errors = {};
  const parse = (key, label, { required = false, max, maxLabel } = {}) => {
    const rawValue = raw[key];
    if (rawValue === undefined || rawValue === null || String(rawValue).trim() === "") {
      if (required) errors[key] = `${label} is required.`;
      return required ? null : (key === "actualHours" ? null : 0);
    }
    const text = String(rawValue).trim();
    // Reject hexadecimal, Infinity, and other JavaScript numeric syntaxes not intended for form input.
    if (!/^-?(?:\d+\.?\d*|\.\d+)$/.test(text)) {
      errors[key] = `Enter a valid number for ${label.toLowerCase()}.`;
      return null;
    }
    const value = Number(text);
    if (!Number.isFinite(value) || value < 0) {
      errors[key] = `${label} cannot be negative.`;
      return null;
    }
    if (required && value === 0 && key === "estimatedHours") {
      errors[key] = "Estimated hours must be greater than 0.";
      return null;
    }
    if (key === "feePercent" && (text.split(".")[1] ?? "").length > 3) {
      errors[key] = "Percentage fee can have at most 3 decimal places.";
      return null;
    }
    if (max !== undefined && value > max) {
      errors[key] = `${label} must be ${maxLabel ?? `at most ${max.toLocaleString("en-US")}`}.`;
      return null;
    }
    return value;
  };
  const values = {
    estimatedHours: parse("estimatedHours", "Estimated hours", { required: true, max: MAX_HOURS }),
    hourlyRate: parse("hourlyRate", "Hourly rate", { required: true, max: MAX_RATE }),
    directExpenses: parse("directExpenses", "Direct expenses", { max: MAX_EXPENSES }),
    bufferPercent: parse("bufferPercent", "Uncertainty buffer", { max: MAX_BUFFER_PERCENT, maxLabel: "at most 100%" }),
    feePercent: parse("feePercent", "Percentage fee", { max: MAX_FEE_PERCENT, maxLabel: `at most ${MAX_FEE_PERCENT}%` }),
    fixedFee: parse("fixedFee", "Fixed payout fee", { max: MAX_FIXED_FEE }),
    actualHours: parse("actualHours", "Actual hours worked", { max: MAX_HOURS })
  };
  const ok = Object.keys(errors).length === 0;
  return { ok, values: ok ? values : null, errors };
}
