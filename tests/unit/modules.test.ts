import { describe, it, expect } from 'vitest';
import { riemann, errorSeries, INTEGRANDS, exactIntegral, pieces } from '../../src/lib/math/integration';
import { TAYLOR, taylorPoly, taylorError, trustInterval, sinLagrangeBound, polyString, factorial } from '../../src/lib/math/taylor';
import { det, apply, eigen, inverse, mul, add, signedArea, trace, type Mat } from '../../src/lib/math/linalg';
import { bisection, newton, ROOT_PROBLEMS } from '../../src/lib/math/roots';
import {
  percentChange, applyChanges, netChange, reversePercent, compound, simpleGrowth,
  overtake, doublingTime, breakEven, planCost, cheaper, exponentialModel, linearModel,
} from '../../src/lib/math/foundations';

const T = (id: string) => TAYLOR.find((t) => t.id === id)!;

/* ---------------- B. Riemann sums ---------------- */
describe('Riemann sums', () => {
  const sq = (x: number) => x * x;
  it('exact closed forms for x² on [0,1] (n = 4)', () => {
    // left = (0+1+4+9)/64, right = (1+4+9+16)/64, midpoint = (1+9+25+49)/256
    expect(riemann(sq, 0, 1, 4, 'left')).toBeCloseTo(14 / 64, 14);
    expect(riemann(sq, 0, 1, 4, 'right')).toBeCloseTo(30 / 64, 14);
    expect(riemann(sq, 0, 1, 4, 'midpoint')).toBeCloseTo(84 / 256, 14);
    expect(riemann(sq, 0, 1, 4, 'trapezoid')).toBeCloseTo((14 / 64 + 30 / 64) / 2, 14);
  });
  it('left sum formula (n−1)n(2n−1)/(6n³) → 1/3', () => {
    for (const n of [10, 100, 1000]) {
      expect(riemann(sq, 0, 1, n, 'left')).toBeCloseTo(((n - 1) * n * (2 * n - 1)) / (6 * n ** 3), 12);
    }
    expect(riemann(sq, 0, 1, 100000, 'right')).toBeCloseTo(1 / 3, 4);
  });
  it('every rule converges to the FTC value for every integrand', () => {
    for (const g of INTEGRANDS) for (const r of ['left', 'right', 'midpoint', 'trapezoid'] as const) {
      expect(riemann(g.f, g.a, g.b, 40000, r)).toBeCloseTo(exactIntegral(g), 3);
    }
  });
  it('known exact integrals', () => {
    expect(exactIntegral(INTEGRANDS.find((g) => g.id === 'sin')!)).toBeCloseTo(2, 14);
    expect(exactIntegral(INTEGRANDS.find((g) => g.id === 'x2')!)).toBeCloseTo(8 / 3, 14);
    expect(exactIntegral(INTEGRANDS.find((g) => g.id === 'exp')!)).toBeCloseTo(Math.E - 1, 14);
    expect(exactIntegral(INTEGRANDS.find((g) => g.id === 'cubic')!)).toBeCloseTo(1.5 ** 4 / 4 - 1.5 ** 2 / 2 - (1 / 4 - 1 / 2), 14);
  });
  it('midpoint and trapezoid are exact for linear functions', () => {
    const lin = (x: number) => 3 * x + 1;
    expect(riemann(lin, 0, 2, 3, 'midpoint')).toBeCloseTo(8, 12);
    expect(riemann(lin, 0, 2, 3, 'trapezoid')).toBeCloseTo(8, 12);
  });
  it('error orders: left ~ 1/n, midpoint/trapezoid ~ 1/n²; midpoint error ≈ half the trapezoid error', () => {
    const exact = Math.E - 1;
    const e = (r: 'left' | 'midpoint' | 'trapezoid', n: number) => Math.abs(riemann(Math.exp, 0, 1, n, r) - exact);
    expect(e('left', 100) / e('left', 200)).toBeCloseTo(2, 1);
    expect(e('midpoint', 100) / e('midpoint', 200)).toBeCloseTo(4, 1);
    expect(e('trapezoid', 100) / e('trapezoid', 200)).toBeCloseTo(4, 1);
    expect(e('trapezoid', 100) / e('midpoint', 100)).toBeCloseTo(2, 1);
  });
  it('errorSeries and pieces', () => {
    const s = errorSeries(Math.sin, 0, Math.PI, 2, 'midpoint', [2, 4, 8]);
    expect(s[0].err).toBeGreaterThan(s[1].err);
    const p = pieces(sq, 0, 1, 2, 'right');
    expect(p).toEqual([{ x0: 0, x1: 0.5, hl: 0.25, hr: 0.25 }, { x0: 0.5, x1: 1, hl: 1, hr: 1 }]);
    expect(() => riemann(sq, 0, 1, 0, 'left')).toThrow();
  });
});

/* ---------------- C. Taylor ---------------- */
describe('Taylor polynomials', () => {
  it('coefficients', () => {
    expect([0, 1, 2, 3, 4, 5].map(T('sin').coeff)).toEqual([0, 1, 0, -1 / 6, 0, 1 / 120]);
    expect(T('sin').coeff(7)).toBeCloseTo(-1 / 5040, 15);
    expect([0, 1, 2, 3].map(T('exp').coeff)).toEqual([1, 1, 0.5, 1 / 6]);
    expect([0, 1, 2, 3, 4].map(T('log1p').coeff)).toEqual([0, 1, -0.5, 1 / 3, -0.25]);
    expect(factorial(5)).toBe(120);
  });
  it('P_n(0) = f(0) and P_n → f inside the interval of convergence', () => {
    for (const t of TAYLOR) expect(taylorPoly(t, 5, 0)).toBeCloseTo(t.f(0), 14);
    expect(taylorPoly(T('sin'), 25, 2)).toBeCloseTo(Math.sin(2), 12);
    expect(taylorPoly(T('exp'), 30, 2)).toBeCloseTo(Math.exp(2), 10);
    expect(taylorPoly(T('log1p'), 400, 0.5)).toBeCloseTo(Math.log(1.5), 12);
  });
  it('ln(1+x) series diverges outside (−1, 1]: error grows with n at x = 1.5', () => {
    expect(taylorError(T('log1p'), 20, 1.5)).toBeGreaterThan(taylorError(T('log1p'), 10, 1.5));
  });
  it('sin error obeys the Lagrange bound |x|^{n+1}/(n+1)!', () => {
    for (const n of [1, 3, 5, 7]) for (const x of [0.5, 1, 2, 3]) {
      expect(taylorError(T('sin'), n, x)).toBeLessThanOrEqual(sinLagrangeBound(n, x) + 1e-15);
    }
  });
  it('trust interval widens with degree', () => {
    const [lo1, hi1] = trustInterval(T('sin'), 1, 0.01);
    const [lo5, hi5] = trustInterval(T('sin'), 5, 0.01);
    expect(hi5).toBeGreaterThan(hi1);
    expect(lo5).toBeLessThan(lo1);
    // |sin x − x| < 0.01 ⇔ |x| < ~0.3919
    expect(hi1).toBeCloseTo(0.39, 1);
  });
  it('polyString', () => {
    expect(polyString(T('sin'), 5)).toBe('x − x³/6 + x⁵/120');
    expect(polyString(T('exp'), 2)).toBe('1 + x + x²/2');
    expect(polyString(T('log1p'), 3)).toBe('x − x²/2 + x³/3');
  });
});

/* ---------------- D. Linear maps ---------------- */
describe('2×2 linear algebra', () => {
  const A: Mat = [[2, 1], [1, 2]];
  it('determinant, trace, apply', () => {
    expect(det(A)).toBe(3);
    expect(trace(A)).toBe(4);
    expect(apply(A, [1, 0])).toEqual([2, 1]);
    expect(det([[0, 1], [1, 0]])).toBe(-1); // reflection reverses orientation
  });
  it('det = signed area of the image of the unit square', () => {
    const M: Mat = [[1.5, -0.5], [0.3, 0.8]];
    expect(signedArea(apply(M, [1, 0]), apply(M, [0, 1]))).toBeCloseTo(det(M), 14);
  });
  it('det is multiplicative but not additive', () => {
    const B: Mat = [[1, 2], [0, 1]];
    expect(det(mul(A, B))).toBeCloseTo(det(A) * det(B), 12);
    expect(det(add([[1, 0], [0, 1]], [[1, 0], [0, 1]]))).toBe(4); // det(I + I) = 4 ≠ 1 + 1
  });
  it('inverse', () => {
    const Ai = inverse(A)!;
    expect(mul(A, Ai).flat().map((v) => +v.toFixed(12))).toEqual([1, 0, 0, 1]);
    expect(inverse([[1, 2], [2, 4]])).toBeNull();
  });
  it('eigen: symmetric matrix has eigenvalues 3, 1 with eigenvectors (1,1), (1,−1)', () => {
    const e = eigen(A);
    expect(e.kind).toBe('real-distinct');
    expect(e.values[0]).toBeCloseTo(3, 12);
    expect(e.values[1]).toBeCloseTo(1, 12);
    for (let i = 0; i < 2; i++) {
      const v = e.vectors[i], Av = apply(A, v);
      expect(Av[0]).toBeCloseTo(e.values[i] * v[0], 12);
      expect(Av[1]).toBeCloseTo(e.values[i] * v[1], 12);
    }
  });
  it('eigen: rotation has complex eigenvalues; shear is repeated; λI', () => {
    const r = eigen([[0, -1], [1, 0]]);
    expect(r.kind).toBe('complex');
    expect(r.complex).toEqual({ re: 0, im: 1 });
    const s = eigen([[1, 1], [0, 1]]);
    expect(s.kind).toBe('real-repeated');
    expect(s.values[0]).toBeCloseTo(1, 12);
    expect(s.vectors[0][0]).toBeCloseTo(1, 12);
    expect(s.vectors[0][1]).toBeCloseTo(0, 12);
    expect(eigen([[2, 0], [0, 2]]).vectors.length).toBe(2);
  });
  it('eigen: random matrices satisfy Av = λv', () => {
    const rnd = (k: number) => Math.sin(k * 12.9898) * 3;
    for (let k = 1; k < 50; k++) {
      const M: Mat = [[rnd(k), rnd(k + 0.1)], [rnd(k + 0.2), rnd(k + 0.3)]];
      const e = eigen(M);
      e.values.forEach((l, i) => {
        const v = e.vectors[i], Mv = apply(M, v);
        expect(Mv[0]).toBeCloseTo(l * v[0], 8);
        expect(Mv[1]).toBeCloseTo(l * v[1], 8);
      });
      if (e.kind !== 'complex') expect(e.values.reduce((s, l) => s + l, 0) * (e.kind === 'real-repeated' ? 2 : 1)).toBeCloseTo(trace(M), 8);
    }
  });
});

/* ---------------- E. Root finding ---------------- */
describe('bisection and Newton', () => {
  const P = (id: string) => ROOT_PROBLEMS.find((p) => p.id === id)!;
  it('bisection finds √2 and halves the bracket each step', () => {
    const r = bisection(P('sqrt2').f, 0, 2, 1e-12);
    expect(r.status).toBe('converged');
    expect(r.root!).toBeCloseTo(Math.SQRT2, 11);
    expect(r.steps[1].width).toBeCloseTo(r.steps[0].width / 2, 15);
    expect(r.steps[0].m).toBe(1);
  });
  it('bisection iteration count matches log2((b−a)/tol)', () => {
    const r = bisection((x) => x * x - 2, 0, 2, 1e-6);
    expect(r.steps.length).toBe(Math.ceil(Math.log2(2 / 1e-6)));
  });
  it('iteration counts quoted in Module E, guided question 1', () => {
    expect(bisection((x) => x * x - 2, 0, 2, 1e-10, 60).steps.length).toBe(35);
    expect(newton((x) => x * x - 2, (x) => 2 * x, 2, 1e-14, 30).steps.length).toBe(6);
  });
  it('bisection rejects a bracket without a sign change', () => {
    expect(bisection((x) => x * x + 1, -1, 1).status).toBe('no-sign-change');
  });
  it('Newton for √2 from 2: iterates 1.5, 1.41666…, quadratic convergence', () => {
    const r = newton(P('sqrt2').f, P('sqrt2').df, 2);
    expect(r.status).toBe('converged');
    expect(r.steps[0].next).toBe(1.5);
    expect(r.steps[1].next).toBeCloseTo(17 / 12, 15);
    expect(r.steps[2].next).toBeCloseTo(577 / 408, 15);
    expect(r.root!).toBeCloseTo(Math.SQRT2, 15);
    expect(r.steps.length).toBeLessThanOrEqual(7);
  });
  it('Newton for cos x = x', () => {
    const r = newton(P('cos').f, P('cos').df, 1);
    expect(r.root!).toBeCloseTo(0.7390851332151607, 13);
  });
  it('Newton cycles 0 → 1 → 0 on x³ − 2x + 2', () => {
    const r = newton(P('flat').f, P('flat').df, 0);
    expect(r.status).toBe('cycling');
    expect(r.steps.map((s) => s.next)).toEqual([1, 0]);
    const b = bisection(P('flat').f, -2, -1, 1e-12);
    expect(P('flat').f(b.root!)).toBeCloseTo(0, 9);
  });
  it('Newton stops on a zero derivative', () => {
    expect(newton(P('zero-d').f, P('zero-d').df, 0).status).toBe('zero-derivative');
  });
  it('every problem: bisection bracket has a sign change', () => {
    for (const p of ROOT_PROBLEMS) expect(Math.sign(p.f(p.bracket[0]))).not.toBe(Math.sign(p.f(p.bracket[1])));
  });
});

/* ---------------- F. Foundations ---------------- */
describe('foundations', () => {
  it('percent change', () => {
    expect(percentChange(80, 100)).toBe(25);
    expect(percentChange(100, 80)).toBe(-20);
    expect(() => percentChange(0, 5)).toThrow();
  });
  it('+20% then −20% is a 4% loss, not zero', () => {
    expect(applyChanges(100, [20, -20])).toBeCloseTo(96, 12);
    expect(netChange([20, -20])).toBeCloseTo(-4, 12);
    expect(netChange([10, 10])).toBeCloseTo(21, 12);
  });
  it('reverse percentages', () => {
    expect(reversePercent(60, -25)).toBeCloseTo(80, 12);
    expect(reversePercent(115, 15)).toBeCloseTo(100, 12);
  });
  it('compound vs simple growth', () => {
    expect(compound(1000, 0.05, 10)).toBeCloseTo(1628.894626777442, 8);
    expect(simpleGrowth(1000, 0.05, 10)).toBe(1500);
    expect(compound(1000, 0.12, 1, 12)).toBeCloseTo(1126.825030131969, 8);
    expect(compound(1, 1, 1, 1e6)).toBeCloseTo(Math.E, 5);
  });
  it('exponential overtakes linear; doubling time', () => {
    expect(linearModel(100, 10, 5)).toBe(150);
    expect(exponentialModel(100, 0.1, 2)).toBeCloseTo(121, 10);
    // 100 + 20t vs 100·1.05^t: first t where exponential is larger
    const t = overtake(100, 20, 0.05)!;
    expect(exponentialModel(100, 0.05, t)).toBeGreaterThan(linearModel(100, 20, t));
    expect(exponentialModel(100, 0.05, t - 1)).toBeLessThanOrEqual(linearModel(100, 20, t - 1));
    expect(doublingTime(0.07)).toBeCloseTo(10.244768351058712, 10);
    // values quoted in Module F, guided question 2
    expect(overtake(1000, 100, 0.07)).toBe(11);
    let m = 0; for (let y = 1; y < 50; y++) if (compound(1000, 0.07, y, 12) > linearModel(1000, 100, y)) { m = y; break; }
    expect(m).toBe(10);
    // Module F, guided question 1 and 3
    expect(applyChanges(80, [20, -20])).toBeCloseTo(76.8, 12);
    expect(planCost({ fixed: 20, perUnit: 0.1 }, 100)).toBeCloseTo(30, 12);
  });
  it('break-even', () => {
    const A = { fixed: 20, perUnit: 0.1 }, B = { fixed: 5, perUnit: 0.25 };
    const q = breakEven(A, B)!;
    expect(q).toBeCloseTo(100, 10);
    expect(planCost(A, q)).toBeCloseTo(planCost(B, q), 10);
    expect(cheaper(A, B, 50)).toBe('B');
    expect(cheaper(A, B, 200)).toBe('A');
    expect(breakEven(A, { fixed: 1, perUnit: 0.1 })).toBeNull();
  });
});
