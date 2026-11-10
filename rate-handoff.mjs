// Opt-in hand-off of a calculated hourly rate from the hourly calculator to the project and retainer calculators.
// The value travels in the URL fragment (#rate=57.29&currency=USD). A fragment is handled only by the browser: it is
// never sent to the server, never stored, and nothing is imported unless the visitor clicks the link.

export const HANDOFF_MAX_RATE = 1_000_000_000; // same ceiling as the hourly-rate inputs on the receiving pages

const RATE_PATTERN = /^\d{1,10}(\.\d{1,3})?$/;
const CURRENCY_PATTERN = /^[A-Z]{3}$/;

/** Returns "rate=57.29&currency=USD", or null when there is no usable positive finite rate. */
export function buildRateHandoff(rate, currency, minorUnits = 2) {
  if (typeof rate !== "number" || !Number.isFinite(rate)) return null;
  if (!Number.isInteger(minorUnits) || minorUnits < 0 || minorUnits > 3) return null;
  if (typeof currency !== "string" || !CURRENCY_PATTERN.test(currency)) return null;
  const rounded = Number(rate.toFixed(minorUnits));
  if (!(rounded > 0) || rounded > HANDOFF_MAX_RATE) return null;
  return new URLSearchParams({ rate: String(rounded), currency }).toString();
}

/**
 * Reads a location.hash value. Returns { rate, currency } or null.
 * Anything malformed, non-positive, oversized, or in an unsupported currency is ignored as a whole,
 * so the receiving page keeps its normal default instead of guessing.
 */
export function parseRateHandoff(hash, allowedCurrencies = []) {
  if (typeof hash !== "string") return null;
  const params = new URLSearchParams(hash.startsWith("#") ? hash.slice(1) : hash);
  const rawRate = params.get("rate");
  if (rawRate === null || !RATE_PATTERN.test(rawRate)) return null;
  const rate = Number(rawRate);
  if (!Number.isFinite(rate) || !(rate > 0) || rate > HANDOFF_MAX_RATE) return null;
  const rawCurrency = params.get("currency");
  if (rawCurrency === null) return { rate, currency: null };
  if (!CURRENCY_PATTERN.test(rawCurrency) || !allowedCurrencies.includes(rawCurrency)) return null;
  return { rate, currency: rawCurrency };
}

/**
 * Receiving side. Pre-fills the hourly-rate input (and the currency, when the link carried a supported one)
 * from the URL fragment and shows a status note that disappears as soon as the visitor edits the rate.
 * Returns true when something was applied. Takes the elements as arguments so it has no hidden globals.
 */
export function applyIncomingRate({ hash, rateInput, currencySelect, note, formatMoney }) {
  const allowed = Array.from(currencySelect.options, (option) => option.value);
  const incoming = parseRateHandoff(hash, allowed);
  if (incoming === null) return false;
  if (incoming.currency !== null) currencySelect.value = incoming.currency;
  rateInput.value = String(incoming.rate);
  note.textContent = `Rate carried over from the hourly calculator: ${formatMoney(incoming.rate, currencySelect.value)}/hr. Edit it any time.`;
  note.hidden = false;
  const dismissNote = () => {
    note.hidden = true;
    note.textContent = "";
  };
  rateInput.addEventListener("input", dismissNote, { once: true });
  currencySelect.addEventListener("change", dismissNote, { once: true });
  return true;
}
