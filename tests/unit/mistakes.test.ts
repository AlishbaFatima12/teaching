/**
 * Every AI Verification Lab item: the AI's claim is false and the stated correction is true.
 * Also checks every number quoted in the "how to catch this" lines.
 */
import { describe, it, expect } from 'vitest';
import { mistakes } from '../../src/content/mistakes';
import { centralDifference } from '../../src/lib/math/calculus';
import { riemann } from '../../src/lib/math/integration';
import { det, inverse, mul, add, I2, type Mat } from '../../src/lib/math/linalg';
import { applyChanges, compound, reversePercent } from '../../src/lib/math/foundations';

const d = (f: (x: number) => number, x: number) => centralDifference(f, x, 1e-5);
const eqM = (A: Mat, B: Mat) => A.flat().every((v, i) => Math.abs(v - B.flat()[i]) < 1e-12);

const checks: Record<string, () => void> = {
  'fan-square': () => {
    for (const x of [-2, 1, 3.5]) {
      expect((x + 3) ** 2).toBeCloseTo(x * x + 6 * x + 9, 12);
    }
    expect((1 + 3) ** 2).toBe(16);
    expect(1 + 9).toBe(10); // AI value at x = 1
  },
  'fan-percent-cancel': () => {
    expect(applyChanges(80, [20, -20])).toBeCloseTo(76.8, 12);
    expect(applyChanges(80, [20])).toBeCloseTo(96, 12);
    expect(1.2 * 0.8).toBeCloseTo(0.96, 12);
  },
  'fan-reverse-percent': () => {
    expect(reversePercent(60, -25)).toBeCloseTo(80, 12);
    expect(75 * 0.75).toBe(56.25);
    expect(80 * 0.75).toBe(60);
  },
  'fan-divide-by-x': () => {
    for (const x of [0, 5]) expect(x * x).toBe(5 * x);
  },
  'fan-compound': () => {
    expect(compound(1000, 0.05, 10)).toBeCloseTo(1628.89, 2);
    expect((compound(1000, 0.05, 10) / 1000 - 1) * 100).toBeCloseTo(62.9, 1);
    expect(compound(1000, 0.05, 2)).toBeCloseTo(1102.5, 10);
    expect(compound(1000, 0.05, 10)).not.toBeCloseTo(1500, 0);
  },
  'c1-chain': () => {
    const f = (x: number) => Math.sin(x * x);
    for (const x of [0.3, 1, 1.7]) {
      expect(d(f, x)).toBeCloseTo(Math.cos(x * x) * 2 * x, 6);
      expect(Math.abs(d(f, x) - Math.cos(x * x))).toBeGreaterThan(0.05);
    }
    expect(d(f, 0)).toBeCloseTo(0, 8);
  },
  'c1-product': () => {
    const f = (x: number) => x * x * Math.sin(x);
    for (const x of [0.5, 2, Math.PI]) expect(d(f, x)).toBeCloseTo(2 * x * Math.sin(x) + x * x * Math.cos(x), 6);
    expect(d(f, Math.PI)).toBeCloseTo(-(Math.PI ** 2), 6);
    expect(2 * Math.PI * Math.cos(Math.PI)).toBeCloseTo(-6.28, 2);
    expect(Math.PI ** 2).toBeCloseTo(9.87, 2);
  },
  'c1-limit-sin': () => {
    expect(Math.sin(0.05) / 0.01).toBeCloseTo(4.998, 3);
    expect(Math.sin(5e-7) / 1e-7).toBeCloseTo(5, 9);
  },
  'c1-critical': () => {
    const f = (x: number) => x ** 3;
    expect(d(f, 0)).toBeCloseTo(0, 8);
    expect(f(-0.1)).toBeCloseTo(-0.001, 12);
    expect(f(0.1)).toBeCloseTo(0.001, 12);
    for (const x of [-1, -0.2, 0.2, 1]) expect(d(f, x)).toBeGreaterThan(0);
  },
  'c1-one-to-infinity': () => {
    expect((1 + 1 / 1000) ** 1000).toBeCloseTo(2.717, 3);
    expect((1 + 1e-8) ** 1e8).toBeCloseTo(Math.E, 6);
  },
  'c2-signed-area': () => {
    expect(riemann(Math.sin, 0, 2 * Math.PI, 2000, 'midpoint')).toBeCloseTo(0, 10);
    expect(riemann((x) => Math.abs(Math.sin(x)), 0, 2 * Math.PI, 20000, 'midpoint')).toBeCloseTo(4, 6);
  },
  'c2-improper': () => {
    // ∫_t^1 x^{-2} dx = 1/t − 1 grows without bound as t → 0+
    const partial = (t: number) => riemann((x) => 1 / (x * x), t, 1, 200000, 'midpoint');
    expect(partial(0.01)).toBeCloseTo(99, 2);
    expect(partial(0.001)).toBeGreaterThan(900);
    expect(partial(0.001)).toBeGreaterThan(partial(0.01));
  },
  'c2-parts': () => {
    const F = (x: number) => x * Math.exp(x) - Math.exp(x);
    const Fai = (x: number) => ((x * x) / 2) * Math.exp(x);
    for (const x of [-1, 0.5, 2]) {
      expect(d(F, x)).toBeCloseTo(x * Math.exp(x), 6);
      expect(Math.abs(d(Fai, x) - x * Math.exp(x))).toBeGreaterThan(0.05);
    }
  },
  'c2-harmonic': () => {
    const S = (n: number) => { let s = 0; for (let k = 1; k <= n; k++) s += 1 / k; return s; };
    expect(S(1000)).toBeCloseTo(7.485, 3);
    expect(S(1_000_000)).toBeCloseTo(14.393, 3);
    // grouping bound: S(2^m) ≥ 1 + m/2
    for (const m of [4, 8, 12]) expect(S(2 ** m)).toBeGreaterThanOrEqual(1 + m / 2);
  },
  'la-det-sum': () => {
    expect(det(add(I2, I2))).toBe(4);
    expect(det(I2) + det(I2)).toBe(2);
  },
  'la-inverse-order': () => {
    const A: Mat = [[1, 1], [0, 1]], B: Mat = [[1, 0], [1, 1]];
    const AB = mul(A, B);
    const right = mul(inverse(B)!, inverse(A)!);
    const wrong = mul(inverse(A)!, inverse(B)!);
    expect(eqM(mul(AB, right), I2)).toBe(true);
    expect(eqM(mul(AB, wrong), I2)).toBe(false);
    expect(eqM(inverse(AB)!, right)).toBe(true);
  },
  'la-cancel': () => {
    const A: Mat = [[1, 0], [0, 0]], B: Mat = [[1, 0], [0, 1]], C: Mat = [[1, 0], [0, 2]];
    expect(eqM(mul(A, B), mul(A, C))).toBe(true);
    expect(eqM(B, C)).toBe(false);
    expect(det(A)).toBe(0);
  },
};

describe('AI Verification Lab', () => {
  it('has at least 12 items, unique ids, all four course groups and all levels', () => {
    expect(mistakes.length).toBeGreaterThanOrEqual(12);
    expect(new Set(mistakes.map((m) => m.id)).size).toBe(mistakes.length);
    expect(new Set(mistakes.map((m) => m.course)).size).toBe(4);
    expect(new Set(mistakes.map((m) => m.level)).size).toBe(3);
  });
  it('every item has a hint, a worked solution and a "how to catch this" line', () => {
    for (const m of mistakes) {
      expect(m.hint.length).toBeGreaterThan(10);
      expect(m.solution.length).toBeGreaterThan(0);
      expect(m.catchIt.length).toBeGreaterThan(10);
    }
  });
  it('every item has a numerical check', () => {
    expect(Object.keys(checks).sort()).toEqual(mistakes.map((m) => m.id).sort());
  });
  for (const m of mistakes) {
    it(`${m.id}: AI claim is wrong, correction is right`, () => checks[m.id]());
  }
});
