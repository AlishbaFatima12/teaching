/** Maclaurin (Taylor at 0) polynomials for sin x, e^x and ln(1+x). Pure functions; unit-tested. */

export type TaylorId = 'sin' | 'exp' | 'log1p';

export interface TaylorFn {
  id: TaylorId;
  label: string;
  tex: string;
  f: (x: number) => number;
  /** coefficient of x^k in the Maclaurin series */
  coeff: (k: number) => number;
  /** interval of convergence description */
  convergence: string;
  domain: [number, number];
  y: [number, number];
}

const factorial = (k: number): number => { let p = 1; for (let i = 2; i <= k; i++) p *= i; return p; };
export { factorial };

export const TAYLOR: TaylorFn[] = [
  {
    id: 'sin', label: 'sine x', tex: '\\sin x', f: Math.sin,
    coeff: (k) => (k % 2 === 0 ? 0 : (((k - 1) / 2) % 2 === 0 ? 1 : -1) / factorial(k)),
    convergence: 'all real x', domain: [-2 * Math.PI, 2 * Math.PI], y: [-2.5, 2.5],
  },
  {
    id: 'exp', label: 'e to the x', tex: 'e^{x}', f: Math.exp,
    coeff: (k) => 1 / factorial(k),
    convergence: 'all real x', domain: [-4, 3], y: [-1.5, 12],
  },
  {
    id: 'log1p', label: 'natural log of 1 plus x', tex: '\\ln(1+x)', f: (x) => (x > -1 ? Math.log1p(x) : NaN),
    coeff: (k) => (k === 0 ? 0 : (k % 2 === 1 ? 1 : -1) / k),
    convergence: '−1 < x ≤ 1', domain: [-1.5, 2.5], y: [-3, 2],
  },
];

/** Evaluate the degree-n Maclaurin polynomial of fn at x (Horner's method). */
export function taylorPoly(fn: TaylorFn, n: number, x: number): number {
  let s = 0;
  for (let k = n; k >= 0; k--) s = s * x + fn.coeff(k);
  return s;
}

/** |f(x) − P_n(x)| */
export function taylorError(fn: TaylorFn, n: number, x: number): number {
  return Math.abs(fn.f(x) - taylorPoly(fn, n, x));
}

/**
 * Largest symmetric-ish interval around 0 (scanned on a grid inside fn.domain) on which
 * |f − P_n| < tol. Returns [lo, hi] where the approximation can be trusted to tol.
 */
export function trustInterval(fn: TaylorFn, n: number, tol: number, step = 0.005): [number, number] {
  let hi = 0;
  while (hi + step <= fn.domain[1] && Number.isFinite(fn.f(hi + step)) && taylorError(fn, n, hi + step) < tol) hi += step;
  let lo = 0;
  while (lo - step >= fn.domain[0] && Number.isFinite(fn.f(lo - step)) && taylorError(fn, n, lo - step) < tol) lo -= step;
  return [+lo.toFixed(6), +hi.toFixed(6)];
}

/** Lagrange bound for sin: |R_n(x)| ≤ |x|^{n+1}/(n+1)!  (all derivatives bounded by 1). */
export const sinLagrangeBound = (n: number, x: number) => Math.abs(x) ** (n + 1) / factorial(n + 1);

/** Human-readable polynomial, e.g. "x − x³/6 + x⁵/120". */
const SUP = ['⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹'];
const sup = (k: number) => String(k).split('').map((d) => SUP[+d]).join('');

export function polyString(fn: TaylorFn, n: number): string {
  const terms: string[] = [];
  for (let k = 0; k <= n; k++) {
    const c = fn.coeff(k);
    if (c === 0) continue;
    const sign = c < 0 ? '−' : '+';
    const xk = k === 0 ? '' : k === 1 ? 'x' : `x${sup(k)}`;
    let mag: string;
    if (fn.id === 'log1p') mag = k === 1 ? xk : `${xk}/${k}`;
    else {
      const den = factorial(k);
      mag = k === 0 ? '1' : den === 1 ? xk : `${xk}/${den}`;
    }
    terms.push(`${sign} ${mag}`);
  }
  if (!terms.length) return '0';
  let s = terms.join(' ');
  s = s.startsWith('+ ') ? s.slice(2) : '−' + s.slice(2);
  return s;
}
