/** Foundations (FAN X99): percentages, growth models and break-even. Unit-tested. */

/** Percent change from old to new, in percent. */
export function percentChange(oldV: number, newV: number): number {
  if (oldV === 0) throw new RangeError('percent change from 0 is undefined');
  return ((newV - oldV) / Math.abs(oldV)) * 100;
}

/** Apply successive percentage changes (e.g. [+20, −20]) to a value. */
export const applyChanges = (v: number, pcts: number[]) => pcts.reduce((acc, p) => acc * (1 + p / 100), v);

/** Net percent change after successive changes. */
export const netChange = (pcts: number[]) => (applyChanges(1, pcts) - 1) * 100;

/** Original value before a p% change produced `after`. */
export const reversePercent = (after: number, p: number) => after / (1 + p / 100);

/** Compound amount: P(1 + r/k)^{k t}, r as a decimal rate per year, k compounding periods per year. */
export const compound = (P: number, r: number, t: number, k = 1) => P * (1 + r / k) ** (k * t);

/** Linear (simple) growth: P(1 + r t). */
export const simpleGrowth = (P: number, r: number, t: number) => P * (1 + r * t);

/** Linear model: start + slope·t.  Exponential: start·(1+g)^t. */
export const linearModel = (start: number, slope: number, t: number) => start + slope * t;
export const exponentialModel = (start: number, g: number, t: number) => start * (1 + g) ** t;

/** First integer t ≥ 0 at which exponential overtakes linear (or null within tMax). */
export function overtake(start: number, slope: number, g: number, tMax = 200): number | null {
  for (let t = 1; t <= tMax; t++) if (exponentialModel(start, g, t) > linearModel(start, slope, t)) return t;
  return null;
}

/** Years to double at rate g (exact). */
export const doublingTime = (g: number) => Math.log(2) / Math.log(1 + g);

export interface Plan { fixed: number; perUnit: number }
export const planCost = (p: Plan, units: number) => p.fixed + p.perUnit * units;

/**
 * Break-even quantity q with fixedA + rateA q = fixedB + rateB q.
 * Returns null if the plans are parallel (same rate).
 */
export function breakEven(A: Plan, B: Plan): number | null {
  if (A.perUnit === B.perUnit) return null;
  return (B.fixed - A.fixed) / (A.perUnit - B.perUnit);
}

/** Which plan is cheaper at a given usage. */
export function cheaper(A: Plan, B: Plan, units: number): 'A' | 'B' | 'equal' {
  const a = planCost(A, units), b = planCost(B, units);
  return Math.abs(a - b) < 1e-9 ? 'equal' : a < b ? 'A' : 'B';
}
