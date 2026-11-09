import { describe, it, expect } from 'vitest';
import {
  FUNCTIONS, differenceQuotient, centralDifference, secantLine, tangentLine, quotientTable,
} from '../../src/lib/math/calculus';
import { ticks, fnPath, fmt } from '../../src/lib/plot';

describe('difference quotients', () => {
  it('is exact for a linear function', () => {
    expect(differenceQuotient((x) => 3 * x - 1, 2, 0.5)).toBeCloseTo(3, 12);
  });
  it('equals 2a + h for x^2 (algebraic identity)', () => {
    for (const [a, h] of [[1, 0.5], [-2, 0.1], [0.3, 1e-3]]) {
      expect(differenceQuotient((x) => x * x, a, h)).toBeCloseTo(2 * a + h, 9);
    }
  });
  it('converges to f′(a) as h → 0 for every library function', () => {
    for (const fn of FUNCTIONS) {
      const a = fn.id === 'sqrt' ? 1.5 : 0.7;
      const err1 = Math.abs(differenceQuotient(fn.f, a, 1e-1) - fn.df(a));
      const err2 = Math.abs(differenceQuotient(fn.f, a, 1e-3) - fn.df(a));
      expect(err2).toBeLessThan(err1);
      expect(err2).toBeLessThan(5e-3);
    }
  });
  it('forward difference error is O(h); central is O(h^2)', () => {
    const f = Math.exp, a = 0.5, exact = Math.exp(0.5);
    const fwd = (h: number) => Math.abs(differenceQuotient(f, a, h) - exact);
    const cen = (h: number) => Math.abs(centralDifference(f, a, h) - exact);
    expect(fwd(1e-2) / fwd(1e-3)).toBeCloseTo(10, 0);
    expect(cen(1e-2) / cen(1e-3)).toBeCloseTo(100, -1);
  });
  it('rejects h = 0', () => {
    expect(() => differenceQuotient(Math.sin, 0, 0)).toThrow(RangeError);
  });
  it('sin: quotient at a = 0 tends to cos 0 = 1', () => {
    const t = quotientTable(Math.sin, 0, 1, 10, 6);
    expect(t[0].q).toBeCloseTo(Math.sin(1), 12);
    expect(t[5].q).toBeCloseTo(1, 9);
  });
});

describe('lines', () => {
  it('secant passes through both points', () => {
    const f = (x: number) => x ** 3;
    const { m, b } = secantLine(f, 1, 0.5);
    expect(m * 1 + b).toBeCloseTo(1, 12);
    expect(m * 1.5 + b).toBeCloseTo(3.375, 12);
  });
  it('tangent to x^2 at 3 is y = 6x − 9', () => {
    const { m, b } = tangentLine((x) => x * x, (x) => 2 * x, 3);
    expect(m).toBe(6);
    expect(b).toBe(-9);
  });
});

describe('plot helpers', () => {
  it('ticks are nice and cover the range', () => {
    expect(ticks(0, 10, 5)).toEqual([0, 2, 4, 6, 8, 10]);
    expect(ticks(-1.4, 1.6, 6)).toEqual([-1, -0.5, 0, 0.5, 1, 1.5]);
  });
  it('fnPath skips undefined values', () => {
    const d = fnPath(Math.sqrt, -1, 1, { width: 100, height: 100, pad: 0, x: [-1, 1], y: [0, 1] }, 20);
    expect(d.startsWith('M50.00')).toBe(true);
  });
  it('fmt avoids negative zero', () => {
    expect(fmt(-0.00001, 3)).toBe('0.000');
  });
});
