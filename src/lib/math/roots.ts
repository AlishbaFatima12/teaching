/** Bisection and Newton's method with explicit failure reporting. Unit-tested. */
import type { Fn } from './calculus';

export interface BisectionStep { k: number; a: number; b: number; m: number; fm: number; width: number }
export interface BisectionResult { steps: BisectionStep[]; root: number | null; status: 'converged' | 'no-sign-change' | 'max-iter' }

export function bisection(f: Fn, a: number, b: number, tol = 1e-10, maxIter = 60): BisectionResult {
  let fa = f(a), fb = f(b);
  if (fa === 0) return { steps: [], root: a, status: 'converged' };
  if (fb === 0) return { steps: [], root: b, status: 'converged' };
  if (Math.sign(fa) === Math.sign(fb)) return { steps: [], root: null, status: 'no-sign-change' };
  const steps: BisectionStep[] = [];
  for (let k = 1; k <= maxIter; k++) {
    const m = (a + b) / 2;
    const fm = f(m);
    steps.push({ k, a, b, m, fm, width: b - a });
    if (fm === 0 || (b - a) / 2 < tol) return { steps, root: m, status: 'converged' };
    if (Math.sign(fm) === Math.sign(fa)) { a = m; fa = fm; } else { b = m; fb = fm; }
  }
  return { steps, root: (a + b) / 2, status: 'max-iter' };
}

export interface NewtonStep { k: number; x: number; fx: number; dfx: number; next: number | null }
export type NewtonStatus = 'converged' | 'zero-derivative' | 'cycling' | 'diverged' | 'max-iter';
export interface NewtonResult { steps: NewtonStep[]; root: number | null; status: NewtonStatus }

export function newton(f: Fn, df: Fn, x0: number, tol = 1e-12, maxIter = 40): NewtonResult {
  const steps: NewtonStep[] = [];
  let x = x0;
  const seen: number[] = [x0];
  for (let k = 1; k <= maxIter; k++) {
    const fx = f(x), dfx = df(x);
    if (Math.abs(dfx) < 1e-14) { steps.push({ k, x, fx, dfx, next: null }); return { steps, root: null, status: 'zero-derivative' }; }
    const next = x - fx / dfx;
    steps.push({ k, x, fx, dfx, next });
    if (!Number.isFinite(next) || Math.abs(next) > 1e8) return { steps, root: null, status: 'diverged' };
    if (Math.abs(next - x) < tol * Math.max(1, Math.abs(next)) || Math.abs(f(next)) === 0) return { steps, root: next, status: 'converged' };
    // cycling: we return to an earlier iterate (within tolerance) without converging
    if (k >= 2 && seen.slice(0, -1).some((s) => Math.abs(s - next) < 1e-9)) return { steps, root: null, status: 'cycling' };
    seen.push(next);
    x = next;
  }
  return { steps, root: null, status: 'max-iter' };
}

export interface RootProblem {
  id: string;
  label: string;
  tex: string;
  f: Fn;
  df: Fn;
  bracket: [number, number];
  x0: number;
  window: { x: [number, number]; y: [number, number] };
  note: string;
  py: { f: string; df: string };
}

export const ROOT_PROBLEMS: RootProblem[] = [
  {
    id: 'sqrt2', label: 'x² − 2 (find √2)', tex: 'x^2 - 2', f: (x) => x * x - 2, df: (x) => 2 * x,
    bracket: [0, 2], x0: 2, window: { x: [-0.5, 2.5], y: [-2.5, 4.5] },
    note: 'A well-behaved root: Newton roughly doubles the correct digits each step; bisection gains one binary digit.',
    py: { f: 'x**2 - 2', df: '2*x' },
  },
  {
    id: 'cos', label: 'cos x − x', tex: '\\cos x - x', f: (x) => Math.cos(x) - x, df: (x) => -Math.sin(x) - 1,
    bracket: [0, 1], x0: 1, window: { x: [-0.5, 1.6], y: [-1.6, 1.6] },
    note: 'The classic fixed-point problem. Both methods succeed; count the iterations.',
    py: { f: 'math.cos(x) - x', df: '-math.sin(x) - 1' },
  },
  {
    id: 'flat', label: 'x³ − 2x + 2 from x₀ = 0 (cycling)', tex: 'x^3 - 2x + 2', f: (x) => x ** 3 - 2 * x + 2, df: (x) => 3 * x * x - 2,
    bracket: [-2, -1], x0: 0, window: { x: [-2.5, 2], y: [-3, 5] },
    note: 'From x₀ = 0 Newton jumps to 1 and back to 0 forever. Bisection on [−2, −1] still finds the real root.',
    py: { f: 'x**3 - 2*x + 2', df: '3*x**2 - 2' },
  },
  {
    id: 'zero-d', label: 'x² − 1 from x₀ = 0 (zero derivative)', tex: 'x^2 - 1', f: (x) => x * x - 1, df: (x) => 2 * x,
    bracket: [0, 2], x0: 0, window: { x: [-2, 2], y: [-1.5, 3] },
    note: 'At x₀ = 0 the tangent is horizontal and never meets the axis: Newton cannot take a step.',
    py: { f: 'x**2 - 1', df: '2*x' },
  },
];
