/** Riemann sums and the trapezoid rule. Pure functions; unit-tested. */
import type { Fn } from './calculus';

export type RuleId = 'left' | 'right' | 'midpoint' | 'trapezoid';

export const RULES: { id: RuleId; label: string; order: 1 | 2 }[] = [
  { id: 'left', label: 'Left', order: 1 },
  { id: 'right', label: 'Right', order: 1 },
  { id: 'midpoint', label: 'Midpoint', order: 2 },
  { id: 'trapezoid', label: 'Trapezoid', order: 2 },
];

/** Approximate ∫_a^b f(x) dx with n equal subintervals. */
export function riemann(f: Fn, a: number, b: number, n: number, rule: RuleId): number {
  if (!Number.isInteger(n) || n < 1) throw new RangeError('n must be a positive integer');
  const dx = (b - a) / n;
  let s = 0;
  for (let i = 0; i < n; i++) {
    const xl = a + i * dx;
    const xr = xl + dx;
    switch (rule) {
      case 'left': s += f(xl); break;
      case 'right': s += f(xr); break;
      case 'midpoint': s += f((xl + xr) / 2); break;
      case 'trapezoid': s += (f(xl) + f(xr)) / 2; break;
    }
  }
  return s * dx;
}

/** Geometry of each piece, for drawing: rectangles (height h) or trapezoids (heights hl, hr). */
export function pieces(f: Fn, a: number, b: number, n: number, rule: RuleId) {
  const dx = (b - a) / n;
  return Array.from({ length: n }, (_, i) => {
    const x0 = a + i * dx;
    const x1 = x0 + dx;
    if (rule === 'trapezoid') return { x0, x1, hl: f(x0), hr: f(x1) };
    const h = rule === 'left' ? f(x0) : rule === 'right' ? f(x1) : f((x0 + x1) / 2);
    return { x0, x1, hl: h, hr: h };
  });
}

/** Absolute error |S_n − exact| for n = 1..nMax (for the error-vs-n plot). */
export function errorSeries(f: Fn, a: number, b: number, exact: number, rule: RuleId, ns: number[]) {
  return ns.map((n) => ({ n, err: Math.abs(riemann(f, a, b, n, rule) - exact) }));
}

export interface Integrand {
  id: string;
  label: string;
  tex: string;
  F: Fn; // antiderivative, for the exact value via the Fundamental Theorem
  f: Fn;
  a: number;
  b: number;
  y: [number, number];
}

export const INTEGRANDS: Integrand[] = [
  { id: 'x2', label: 'x squared on [0, 2]', tex: 'x^2', f: (x) => x * x, F: (x) => x ** 3 / 3, a: 0, b: 2, y: [-0.5, 4.5] },
  { id: 'sin', label: 'sine x on [0, π]', tex: '\\sin x', f: Math.sin, F: (x) => -Math.cos(x), a: 0, b: Math.PI, y: [-0.3, 1.3] },
  { id: 'exp', label: 'e to the x on [0, 1]', tex: 'e^{x}', f: Math.exp, F: Math.exp, a: 0, b: 1, y: [-0.3, 3] },
  { id: 'cubic', label: 'x cubed minus x on [−1, 1.5]', tex: 'x^3 - x', f: (x) => x ** 3 - x, F: (x) => x ** 4 / 4 - (x * x) / 2, a: -1, b: 1.5, y: [-0.8, 2] },
];

/** Exact integral by the Fundamental Theorem of Calculus. */
export const exactIntegral = (g: Integrand) => g.F(g.b) - g.F(g.a);
