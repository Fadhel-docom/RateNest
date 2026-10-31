export const MAX_MONTHLY_HOURS = 744; // hours in a 31-day month
export const MAX_RATE = 1000000000;
export const MAX_DISCOUNT_PERCENT = 100;
export const MAX_MONTHS = 120;

function finiteNumber(value, name) {
  if (typeof value !== "number" || !Number.isFinite(value)) throw new TypeError(`${name} must be a finite number`);
  return value;
}

export function calculateRetainer({ monthlyHours, hourlyRate, discountPercent = 0, months = 12, expectedHours = null }) {
  const hours = finiteNumber(monthlyHours, "monthlyHours");
  const rate = finiteNumber(hourlyRate, "hourlyRate");
  const discount = finiteNumber(discountPercent, "discountPercent");
  const length = finiteNumber(months, "months");
  if (hours <= 0 || hours > MAX_MONTHLY_HOURS) throw new RangeError("monthlyHours must be greater than 0 and at most 744");
  if (rate < 0 || rate > MAX_RATE) throw new RangeError("hourlyRate must be between 0 and 1,000,000,000");
  if (discount < 0 || discount > MAX_DISCOUNT_PERCENT) throw new RangeError("discountPercent must be between 0% and 100%");
  if (!Number.isInteger(length) || length < 1 || length > MAX_MONTHS) throw new RangeError("months must be a whole number from 1 to 120");
  const fullRateValue = hours * rate;
  const discountAmount = fullRateValue * discount / 100;
  const monthlyRetainer = fullRateValue - discountAmount;
  const effectiveHourlyRate = monthlyRetainer / hours;
  const contractValue = monthlyRetainer * length;
  // At break-even usage, the discounted retainer equals the user's baseline hourly rate.
  const breakEvenCalculable = discount > 0 && rate > 0;
  const breakEvenHours = breakEvenCalculable ? hours * (100 - discount) / 100 : null;
  // Optional scenario: the hours the freelancer expects to work. Never defaulted, never capped.
  let usage = null;
  if (expectedHours !== null && expectedHours !== undefined) {
    const expected = finiteNumber(expectedHours, "expectedHours");
    if (expected < 0 || expected > MAX_MONTHLY_HOURS) throw new RangeError("expectedHours must be between 0 and 744");
    usage = {
      expectedHours: expected,
      calculable: expected > 0,
      effectiveHourlyRate: expected > 0 ? monthlyRetainer / expected : null,
      overReserved: expected > hours,
      underReserved: expected < hours,
      hoursDifference: Math.abs(expected - hours)
    };
  }
  if (![fullRateValue, discountAmount, monthlyRetainer, effectiveHourlyRate, contractValue].every(Number.isFinite) || (usage?.calculable && !Number.isFinite(usage.effectiveHourlyRate))) {
    throw new RangeError("The result is too large to calculate safely");
  }
  return { monthlyHours: hours, hourlyRate: rate, discountPercent: discount, months: length, fullRateValue, discountAmount, monthlyRetainer, effectiveHourlyRate, contractValue, breakEvenCalculable, breakEvenHours, usage };
}

export function validateRetainer(raw = {}) {
  const errors = {};
  const parse = (key, label, { required = false, max, maxLabel, integer = false, min = 0, minLabel } = {}) => {
    const rawValue = raw[key];
    if (rawValue === undefined || rawValue === null || String(rawValue).trim() === "") {
      if (required) errors[key] = `${label} is required.`;
      return required ? null : (key === "months" ? 12 : key === "expectedHours" ? null : 0);
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
    if (value < min) {
      errors[key] = `${label} must be ${minLabel ?? `at least ${min}`}.`;
      return null;
    }
    if (integer && !Number.isInteger(value)) {
      errors[key] = `${label} must be a whole number.`;
      return null;
    }
    if (max !== undefined && value > max) {
      errors[key] = `${label} must be ${maxLabel ?? `at most ${max.toLocaleString("en-US")}`}.`;
      return null;
    }
    return value;
  };
  const values = {
    monthlyHours: parse("monthlyHours", "Monthly hours", { required: true, max: MAX_MONTHLY_HOURS, min: Number.MIN_VALUE, minLabel: "greater than 0" }),
    hourlyRate: parse("hourlyRate", "Hourly rate", { required: true, max: MAX_RATE }),
    discountPercent: parse("discountPercent", "Retainer discount", { max: MAX_DISCOUNT_PERCENT, maxLabel: "at most 100%" }),
    months: parse("months", "Contract length", { integer: true, min: 1, minLabel: "at least 1 month", max: MAX_MONTHS, maxLabel: "at most 120 months" }),
    expectedHours: parse("expectedHours", "Expected hours worked", { max: MAX_MONTHLY_HOURS })
  };
  const ok = Object.keys(errors).length === 0;
  return { ok, values: ok ? values : null, errors };
}
