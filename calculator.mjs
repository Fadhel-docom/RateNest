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
