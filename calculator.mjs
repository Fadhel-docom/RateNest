/** Calculate a sustainable hourly rate from annual targets and billable capacity. */
export function calculateHourlyRate({ income, expenses = 0, hoursPerWeek, weeksOff = 0, billablePercent = 60 }) {
  const values = { income, expenses, hoursPerWeek, weeksOff, billablePercent };
  for (const [name, value] of Object.entries(values)) {
    if (typeof value !== "number" || !Number.isFinite(value)) {
      throw new TypeError(`${name} must be a finite number`);
    }
  }
  if (income < 0) throw new RangeError("income must be at least 0");
  if (expenses < 0) throw new RangeError("expenses must be at least 0");
  if (hoursPerWeek <= 0 || hoursPerWeek > 168) throw new RangeError("hoursPerWeek must be greater than 0 and at most 168");
  if (!Number.isInteger(weeksOff) || weeksOff < 0 || weeksOff > 51) throw new RangeError("weeksOff must be an integer from 0 to 51");
  if (billablePercent < 10 || billablePercent > 100) throw new RangeError("billablePercent must be between 10 and 100");

  const workingWeeks = 52 - weeksOff;
  const billableHours = hoursPerWeek * workingWeeks * (billablePercent / 100);
  const annualRequired = income + expenses;
  return {
    hourlyRate: annualRequired / billableHours,
    annualRequired,
    billableHours,
    workingWeeks
  };
}

/** Upper bound for money fields, so absurd values are caught with a friendly message. */
export const MAX_MONEY = 1_000_000_000;

const NUMBER_PATTERN = /^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/i;

function readNumber(raw) {
  if (typeof raw === "number") return Number.isFinite(raw) ? raw : Number.NaN;
  if (typeof raw !== "string") return Number.NaN;
  const text = raw.trim();
  return NUMBER_PATTERN.test(text) ? Number(text) : Number.NaN;
}

const isBlank = (raw) => raw === undefined || raw === null || (typeof raw === "string" && raw.trim() === "");

/**
 * Validate raw form values (strings or numbers) and return parsed values plus
 * friendly, field-level error messages. Business expenses may be left blank (treated as 0).
 */
export function validateRateInputs(raw) {
  const errors = {};
  const values = {};

  const money = (key, label, { optional = false } = {}) => {
    if (isBlank(raw[key])) {
      if (optional) values[key] = 0;
      else errors[key] = `Enter your ${label}.`;
      return;
    }
    const n = readNumber(raw[key]);
    if (Number.isNaN(n)) errors[key] = "Enter a valid number, like 60000.";
    else if (n < 0) errors[key] = "This can't be negative.";
    else if (n > MAX_MONEY) errors[key] = "Enter an amount of 1,000,000,000 or less.";
    else values[key] = n;
  };

  money("income", "target annual income");
  money("expenses", "annual business expenses", { optional: true });

  if (isBlank(raw.hoursPerWeek)) errors.hoursPerWeek = "Enter your weekly work hours.";
  else {
    const n = readNumber(raw.hoursPerWeek);
    if (Number.isNaN(n)) errors.hoursPerWeek = "Enter a valid number, like 40.";
    else if (n <= 0) errors.hoursPerWeek = "Weekly hours must be greater than 0.";
    else if (n > 168) errors.hoursPerWeek = "A week only has 168 hours.";
    else values.hoursPerWeek = n;
  }

  if (isBlank(raw.weeksOff)) errors.weeksOff = "Enter your weeks off (use 0 if none).";
  else {
    const n = readNumber(raw.weeksOff);
    if (Number.isNaN(n)) errors.weeksOff = "Enter a whole number, like 4.";
    else if (!Number.isInteger(n)) errors.weeksOff = "Use whole weeks, for example 4.";
    else if (n < 0 || n > 51) errors.weeksOff = "Weeks off must be between 0 and 51.";
    else values.weeksOff = n;
  }

  if (isBlank(raw.billablePercent)) errors.billablePercent = "Choose your billable percentage.";
  else {
    const n = readNumber(raw.billablePercent);
    if (Number.isNaN(n) || n < 10 || n > 100) errors.billablePercent = "Billable time must be between 10% and 100%.";
    else values.billablePercent = n;
  }

  return { ok: Object.keys(errors).length === 0, values, errors };
}

/** Compare the hourly rate at several billable percentages, keeping all other inputs fixed. */
export function billableScenarios(values, percents = [40, 60, 80]) {
  return percents.map((billablePercent) => ({
    billablePercent,
    ...calculateHourlyRate({ ...values, billablePercent })
  }));
}

/**
 * Format an amount as currency; falls back to "CODE 0.00" if the currency or locale is unsupported.
 * With `compact: true`, whole amounts drop the cents (e.g. $66,000) while fractional amounts keep them.
 */
export function formatCurrency(value, currency, locale, { compact = false } = {}) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "—";
  try {
    const wholeOnly = compact && Number.isInteger(value);
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: wholeOnly ? 0 : 2,
      maximumFractionDigits: wholeOnly ? 0 : 2
    }).format(value);
  } catch {
    return `${currency} ${value.toFixed(2)}`;
  }
}

/** Format a plain number (for hours), with up to two decimals. */
export function formatNumber(value, locale) {
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(value);
}

/** Three plain-language lines that show exactly how the rate was reached. */
export function formulaSteps(values, result, { currency = "USD", locale } = {}) {
  const money = (v) => formatCurrency(v, currency, locale, { compact: true });
  const rate = (v) => formatCurrency(v, currency, locale);
  const num = (v) => formatNumber(v, locale);
  return [
    `Required revenue: ${money(values.income)} income + ${money(values.expenses)} expenses = ${money(result.annualRequired)}`,
    `Billable hours: ${num(values.hoursPerWeek)} hrs × ${result.workingWeeks} weeks × ${num(values.billablePercent)}% = ${num(result.billableHours)} hrs`,
    `Hourly rate: ${money(result.annualRequired)} ÷ ${num(result.billableHours)} hrs = ${rate(result.hourlyRate)}/hr`
  ];
}
