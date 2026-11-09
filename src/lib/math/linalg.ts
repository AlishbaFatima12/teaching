/** 2×2 linear algebra. Matrices are [[a, b], [c, d]] acting on column vectors. Unit-tested. */

export type Vec = [number, number];
export type Mat = [[number, number], [number, number]];

export const I2: Mat = [[1, 0], [0, 1]];

export const apply = (M: Mat, v: Vec): Vec => [M[0][0] * v[0] + M[0][1] * v[1], M[1][0] * v[0] + M[1][1] * v[1]];
export const det = (M: Mat) => M[0][0] * M[1][1] - M[0][1] * M[1][0];
export const trace = (M: Mat) => M[0][0] + M[1][1];
export const add = (A: Mat, B: Mat): Mat => [[A[0][0] + B[0][0], A[0][1] + B[0][1]], [A[1][0] + B[1][0], A[1][1] + B[1][1]]];
export const mul = (A: Mat, B: Mat): Mat => [
  [A[0][0] * B[0][0] + A[0][1] * B[1][0], A[0][0] * B[0][1] + A[0][1] * B[1][1]],
  [A[1][0] * B[0][0] + A[1][1] * B[1][0], A[1][0] * B[0][1] + A[1][1] * B[1][1]],
];
export function inverse(M: Mat): Mat | null {
  const D = det(M);
  if (Math.abs(D) < 1e-12) return null;
  return [[M[1][1] / D, -M[0][1] / D], [-M[1][0] / D, M[0][0] / D]];
}

/** Signed area of the parallelogram spanned by u and v (= det[u v]). */
export const signedArea = (u: Vec, v: Vec) => u[0] * v[1] - u[1] * v[0];

export interface Eigen {
  kind: 'real-distinct' | 'real-repeated' | 'complex';
  values: number[]; // real eigenvalues (empty if complex)
  vectors: Vec[]; // unit eigenvectors for the real eigenvalues
  complex?: { re: number; im: number };
}

const norm = (v: Vec): Vec => { const r = Math.hypot(v[0], v[1]); return r === 0 ? v : [v[0] / r, v[1] / r]; };

/** Eigenvalues/eigenvectors from the characteristic polynomial λ² − (tr)λ + det = 0. */
export function eigen(M: Mat, eps = 1e-10): Eigen {
  const t = trace(M), D = det(M);
  const disc = t * t - 4 * D;
  if (disc < -eps) return { kind: 'complex', values: [], vectors: [], complex: { re: t / 2, im: Math.sqrt(-disc) / 2 } };
  const s = Math.sqrt(Math.max(0, disc));
  const l1 = (t + s) / 2, l2 = (t - s) / 2;
  const vecFor = (l: number): Vec[] => {
    const [[a, b], [c, d]] = M;
    // Solve (M − λI)v = 0 using a non-zero row: (a−λ)x + b y = 0  ⇒  v = (b, λ−a)
    if (Math.abs(b) > eps || Math.abs(a - l) > eps) return [norm([b, l - a])];
    // otherwise row 2: c x + (d−λ) y = 0  ⇒  v = (λ−d, c)
    if (Math.abs(c) > eps || Math.abs(d - l) > eps) return [norm([l - d, c])];
    return [[1, 0], [0, 1]]; // M = λI: every vector is an eigenvector
  };
  if (disc <= eps) {
    return { kind: 'real-repeated', values: [l1], vectors: vecFor(l1) };
  }
  return { kind: 'real-distinct', values: [l1, l2], vectors: [...vecFor(l1).slice(0, 1), ...vecFor(l2).slice(0, 1)] };
}
