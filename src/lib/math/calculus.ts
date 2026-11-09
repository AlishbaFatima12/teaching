/** Core single-variable calculus routines used by the Interactive Lab. Pure functions; unit-tested. */

export type Fn = (x: number) => number;

export interface NamedFn {
  id: string;
  label: string; // plain text, for screen readers and selects
  tex: string; // KaTeX source
  f: Fn;
  df: Fn; // exact derivative
  domain: [number, number]; // sensible plotting window in x
  range: [number, number]; // sensible plotting window in y
}

export const FUNCTIONS: NamedFn[] = [
  { id: 'square', label: 'f(x) = x squared', tex: 'x^2', f: (x) => x * x, df: (x) => 2 * x, domain: [-2.5, 2.5], range: [-1, 6] },
  { id: 'cubic', label: 'f(x) = x cubed minus 2x', tex: 'x^3 - 2x', f: (x) => x ** 3 - 2 * x, df: (x) => 3 * x * x - 2, domain: [-2.2, 2.2], range: [-4, 4] },
  { id: 'sin', label: 'f(x) = sine of x', tex: '\\sin x', f: Math.sin, df: Math.cos, domain: [-0.5, 2 * Math.PI], range: [-1.6, 1.6] },
  { id: 'exp', label: 'f(x) = e to the x', tex: 'e^{x}', f: Math.exp, df: Math.exp, domain: [-2.5, 2], range: [-0.5, 7] },
  { id: 'sqrt', label: 'f(x) = square root of x', tex: '\\sqrt{x}', f: Math.sqrt, df: (x) => 1 / (2 * Math.sqrt(x)), domain: [0, 4.5], range: [-0.5, 2.5] },
];

/** Forward difference quotient (f(a+h) − f(a)) / h. */
export function differenceQuotient(f: Fn, a: number, h: number): number {
  if (h === 0) throw new RangeError('h must be non-zero');
  return (f(a + h) - f(a)) / h;
}

/** Symmetric (central) difference quotient (f(a+h) − f(a−h)) / 2h. */
export function centralDifference(f: Fn, a: number, h: number): number {
  if (h === 0) throw new RangeError('h must be non-zero');
  return (f(a + h) - f(a - h)) / (2 * h);
}

/** Secant line through (a, f(a)) and (a+h, f(a+h)) as slope and intercept. */
export function secantLine(f: Fn, a: number, h: number): { m: number; b: number } {
  const m = differenceQuotient(f, a, h);
  return { m, b: f(a) - m * a };
}

/** Tangent line at a, given the exact derivative. */
export function tangentLine(f: Fn, df: Fn, a: number): { m: number; b: number } {
  const m = df(a);
  return { m, b: f(a) - m * a };
}

/** Sequence of difference quotients for h = h0, h0/r, h0/r², … (for limit tables). */
export function quotientTable(f: Fn, a: number, h0 = 1, r = 10, rows = 6): { h: number; q: number }[] {
  const out: { h: number; q: number }[] = [];
  let h = h0;
  for (let i = 0; i < rows; i++) {
    out.push({ h, q: differenceQuotient(f, a, h) });
    h /= r;
  }
  return out;
}
