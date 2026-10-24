export const MAX_HOURS = 100000;
export const MAX_RATE = 1000000000;
export const MAX_EXPENSES = 1000000000;
export const MAX_BUFFER_PERCENT = 100;

function finiteNumber(value, name) {
  if (typeof value !== "number" || !Number.isFinite(value)) throw new TypeError(`${name} must be a finite number`);
  return value;
}

export function calculateProjectQuote({ estimatedHours, hourlyRate, directExpenses = 0, bufferPercent = 0 }) {
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
  const quote = labour + uncertaintyAllowance + expenses;
  const effectiveHourlyRate = quote / hours;
  if (![labour, uncertaintyAllowance, quote, effectiveHourlyRate].every(Number.isFinite)) {
    throw new RangeError("The result is too large to calculate safely");
  }
  return { estimatedHours: hours, hourlyRate: rate, directExpenses: expenses, bufferPercent: buffer, labour, uncertaintyAllowance, quote, effectiveHourlyRate };
}

export function validateProjectQuote(raw = {}) {
  const errors = {};
  const parse = (key, label, { required = false, max, maxLabel } = {}) => {
    const rawValue = raw[key];
    if (rawValue === undefined || rawValue === null || String(rawValue).trim() === "") {
      if (required) errors[key] = `${label} is required.`;
      return required ? null : 0;
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
    bufferPercent: parse("bufferPercent", "Uncertainty buffer", { max: MAX_BUFFER_PERCENT, maxLabel: "100%" })
  };
  const ok = Object.keys(errors).length === 0;
  return { ok, values: ok ? values : null, errors };
}
