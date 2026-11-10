import test from "node:test";
import assert from "node:assert/strict";
import { buildRateHandoff, parseRateHandoff, HANDOFF_MAX_RATE } from "./rate-handoff.mjs";

const CURRENCIES = ["USD", "EUR", "GBP", "TND", "CAD", "AUD"];

test("builds a fragment from the default verified rate", () => {
  assert.equal(buildRateHandoff(57.29166666, "USD"), "rate=57.29&currency=USD");
});

test("rounds to the currency's minor units (TND uses three digits)", () => {
  assert.equal(buildRateHandoff(57.2916666, "TND", 3), "rate=57.292&currency=TND");
  assert.equal(buildRateHandoff(57.5, "USD", 0), "rate=58&currency=USD");
});

test("never builds a hand-off from unusable values", () => {
  for (const bad of [0, -1, NaN, Infinity, "57", null, undefined, 0.004, HANDOFF_MAX_RATE + 1]) {
    assert.equal(buildRateHandoff(bad, "USD"), null, String(bad));
  }
  assert.equal(buildRateHandoff(10, "usd"), null);
  assert.equal(buildRateHandoff(10, "US"), null);
  assert.equal(buildRateHandoff(10, "USD", 4), null);
});

test("a built fragment round-trips through the parser, including for TND", () => {
  for (const [rate, currency, digits] of [[57.29, "USD", 2], [76.39, "EUR", 2], [57.292, "TND", 3], [1234567.89, "GBP", 2]]) {
    const fragment = buildRateHandoff(rate, currency, digits);
    assert.deepEqual(parseRateHandoff(`#${fragment}`, CURRENCIES), { rate, currency });
  }
});

test("parses with or without the leading #, and without a currency", () => {
  assert.deepEqual(parseRateHandoff("#rate=60", CURRENCIES), { rate: 60, currency: null });
  assert.deepEqual(parseRateHandoff("rate=60&currency=CAD", CURRENCIES), { rate: 60, currency: "CAD" });
});

test("ignores malformed, hostile or out-of-range fragments entirely", () => {
  const bad = [
    "", "#", "#rate=", "#rate=abc", "#rate=-5", "#rate=0", "#rate=0.000", "#rate=1e3", "#rate=1,5", "#rate=%20%2060",
    "#rate=12.3456", "#rate=99999999999", `#rate=${HANDOFF_MAX_RATE + 1}`, "#rate=NaN", "#rate=Infinity",
    "#rate=<script>alert(1)</script>", "#currency=USD", "#rate=60&currency=XXX", "#rate=60&currency=usd",
    "#rate=60&currency=", "#rate=60&currency=USD%20", "#other=1"
  ];
  for (const hash of bad) assert.equal(parseRateHandoff(hash, CURRENCIES), null, hash);
  assert.equal(parseRateHandoff(undefined, CURRENCIES), null);
  assert.equal(parseRateHandoff(null, CURRENCIES), null);
  assert.equal(parseRateHandoff("#rate=60&currency=USD", []), null);
});

test("first value wins when a parameter is repeated (no ambiguity from duplicated keys)", () => {
  assert.deepEqual(parseRateHandoff("#rate=40&rate=999&currency=USD", CURRENCIES), { rate: 40, currency: "USD" });
});

function fakeForm(options = CURRENCIES, initialCurrency = "USD") {
  const listeners = [];
  return {
    rateInput: { value: "60", addEventListener: (type, fn, opts) => listeners.push({ type, fn, opts }) },
    currencySelect: {
      options: options.map((value) => ({ value })),
      value: initialCurrency,
      addEventListener: (type, fn, opts) => listeners.push({ type, fn, opts })
    },
    note: { hidden: true, textContent: "" },
    formatMoney: (value, code) => `${code} ${value}`,
    listeners
  };
}

test("applyIncomingRate fills the rate and currency, shows a note, and hides it after the visitor edits", async () => {
  const { applyIncomingRate } = await import("./rate-handoff.mjs");
  const form = fakeForm();
  assert.equal(applyIncomingRate({ hash: "#rate=76.39&currency=EUR", ...form }), true);
  assert.equal(form.rateInput.value, "76.39");
  assert.equal(form.currencySelect.value, "EUR");
  assert.equal(form.note.hidden, false);
  assert.match(form.note.textContent, /EUR 76\.39\/hr/);
  assert.equal(form.listeners.length, 2);
  assert.deepEqual(form.listeners.map(({ type, opts }) => ({ type, opts })), [
    { type: "input", opts: { once: true } },
    { type: "change", opts: { once: true } }
  ]);
  form.listeners[0].fn();
  assert.equal(form.note.hidden, true);
  assert.equal(form.note.textContent, "");
});


test("applyIncomingRate hides the carried-rate note when the visitor changes currency", async () => {
  const { applyIncomingRate } = await import("./rate-handoff.mjs");
  const form = fakeForm();
  assert.equal(applyIncomingRate({ hash: "#rate=76.39&currency=EUR", ...form }), true);
  assert.equal(form.note.hidden, false);
  form.currencySelect.value = "USD";
  const change = form.listeners.find((listener) => listener.type === "change");
  assert.ok(change);
  change.fn();
  assert.equal(form.note.hidden, true);
  assert.equal(form.note.textContent, "");
});

test("applyIncomingRate leaves the page untouched for missing or invalid fragments", async () => {
  const { applyIncomingRate } = await import("./rate-handoff.mjs");
  for (const hash of ["", "#", "#rate=-1", "#rate=60&currency=XXX", "#section"]) {
    const form = fakeForm();
    assert.equal(applyIncomingRate({ hash, ...form }), false, hash);
    assert.equal(form.rateInput.value, "60");
    assert.equal(form.currencySelect.value, "USD");
    assert.equal(form.note.hidden, true);
    assert.equal(form.listeners.length, 0);
  }
});

test("applyIncomingRate keeps the current currency when the link carries only a rate", async () => {
  const { applyIncomingRate } = await import("./rate-handoff.mjs");
  const form = fakeForm(CURRENCIES, "TND");
  assert.equal(applyIncomingRate({ hash: "#rate=45.5", ...form }), true);
  assert.equal(form.currencySelect.value, "TND");
  assert.equal(form.rateInput.value, "45.5");
});
