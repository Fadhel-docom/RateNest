// Pure logic (no DOM) for the per-word rate -> effective hourly rate calculator.
export const MAX_RATE_PER_WORD = 1000000;
export const MAX_WORDS = 10000000;
export const MAX_HOURS = 100000;
export const MAX_TARGET_HOURLY = 1000000000;
export const MAX_FEE_PERCENT = 50;

function finiteNumber(value, name) {
  if (typeof value !== "number" || !Number.isFinite(value)) throw new TypeError(`${name} must be a finite number`);
  return value;
}

/**
 * ratePerWord: what the client pays per word. words: paid word count. hours: ALL hours the piece takes
 * (research, interviews, drafting, editing, revisions, client communication). feePercent: optional,
 * entered by the user (never assumed) - a platform or payment fee taken from the fee. targetHourly:
 * optional hourly rate the user wants to earn (never assumed).
 */
export function calculatePerWordRate({ ratePerWord, words, hours, feePercent = 0, targetHourly = null }) {
  const rate = finiteNumber(ratePerWord, "ratePerWord");
  const wordCount = finiteNumber(words, "words");
  const totalHours = finiteNumber(hours, "hours");
  const fee = finiteNumber(feePercent, "feePercent");
  if (rate < 0 || rate > MAX_RATE_PER_WORD) throw new RangeError("ratePerWord must be between 0 and 1,000,000");
  if (wordCount <= 0 || wordCount > MAX_WORDS) throw new RangeError("words must be greater than 0 and at most 10,000,000");
  if (totalHours <= 0 || totalHours > MAX_HOURS) throw new RangeError("hours must be greater than 0 and at most 100,000");
  if (fee < 0 || fee > MAX_FEE_PERCENT) throw new RangeError("feePercent must be between 0% and 50%");

  const keep = (100 - fee) / 100;
  const grossFee = rate * wordCount;
  const feeAmount = grossFee * fee / 100;
  const netFee = grossFee - feeAmount;
  const effectiveHourlyRate = netFee / totalHours;
  const wordsPerHour = wordCount / totalHours;

  let target = null;
  if (targetHourly !== null && targetHourly !== undefined) {
    const goal = finiteNumber(targetHourly, "targetHourly");
    if (goal <= 0 || goal > MAX_TARGET_HOURLY) throw new RangeError("targetHourly must be greater than 0 and at most 1,000,000,000");
    target = {
      targetHourly: goal,
      // Per-word rate that pays the goal for these words in these hours, after any entered fee.
      requiredRatePerWord: goal * totalHours / (wordCount * keep),
      // Finished words per hour needed to reach the goal at the current per-word rate (null at a $0 rate).
      wordsPerHourNeeded: rate > 0 ? goal / (rate * keep) : null,
      // Hours the piece can take at the current fee and still reach the goal.
      hoursAvailable: netFee / goal,
      meetsTarget: effectiveHourlyRate >= goal * (1 - 1e-12)
    };
  }

  const all = [grossFee, feeAmount, netFee, effectiveHourlyRate, wordsPerHour];
  if (target) all.push(target.requiredRatePerWord, target.hoursAvailable, ...(target.wordsPerHourNeeded === null ? [] : [target.wordsPerHourNeeded]));
  if (!all.every(Number.isFinite)) throw new RangeError("The result is too large to calculate safely");
  return { ratePerWord: rate, words: wordCount, hours: totalHours, feePercent: fee, grossFee, feeAmount, netFee, effectiveHourlyRate, wordsPerHour, target };
}

export function validatePerWordRate(raw = {}) {
  const errors = {};
  const parse = (key, label, { required = false, max, maxLabel, positive = false } = {}) => {
    const rawValue = raw[key];
    if (rawValue === undefined || rawValue === null || String(rawValue).trim() === "") {
      if (required) errors[key] = `${label} is required.`;
      return required ? null : (key === "targetHourly" ? null : 0);
    }
    const text = String(rawValue).trim();
    // Reject hexadecimal, Infinity, exponent and other JavaScript numeric syntaxes not intended for form input.
    if (!/^-?(?:\d+\.?\d*|\.\d+)$/.test(text)) {
      errors[key] = `Enter a valid number for ${label.toLowerCase()}.`;
      return null;
    }
    const value = Number(text);
    if (!Number.isFinite(value) || value < 0) {
      errors[key] = `${label} cannot be negative.`;
      return null;
    }
    if (positive && value <= 0) {
      errors[key] = `${label} must be greater than 0.`;
      return null;
    }
    if (max !== undefined && value > max) {
      errors[key] = `${label} must be ${maxLabel ?? `at most ${max.toLocaleString("en-US")}`}.`;
      return null;
    }
    return value;
  };
  const values = {
    ratePerWord: parse("ratePerWord", "Rate per word", { required: true, max: MAX_RATE_PER_WORD }),
    words: parse("words", "Word count", { required: true, positive: true, max: MAX_WORDS }),
    hours: parse("hours", "Total hours", { required: true, positive: true, max: MAX_HOURS }),
    feePercent: parse("feePercent", "Fee", { max: MAX_FEE_PERCENT, maxLabel: "at most 50%" }),
    targetHourly: parse("targetHourly", "Target hourly rate", { positive: true, max: MAX_TARGET_HOURLY })
  };
  const ok = Object.keys(errors).length === 0;
  return { ok, values: ok ? values : null, errors };
}
