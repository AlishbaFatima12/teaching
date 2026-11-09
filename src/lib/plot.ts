/** Small helpers for hand-written SVG plots. */
import type { Fn } from './math/calculus';

export interface Frame {
  width: number;
  height: number;
  pad: number;
  x: [number, number];
  y: [number, number];
}

export function scales(fr: Frame) {
  const { width, height, pad, x, y } = fr;
  const sx = (v: number) => pad + ((v - x[0]) / (x[1] - x[0])) * (width - 2 * pad);
  const sy = (v: number) => height - pad - ((v - y[0]) / (y[1] - y[0])) * (height - 2 * pad);
  const ix = (px: number) => x[0] + ((px - pad) / (width - 2 * pad)) * (x[1] - x[0]);
  const iy = (py: number) => y[0] + ((height - pad - py) / (height - 2 * pad)) * (y[1] - y[0]);
  return { sx, sy, ix, iy };
}

/** SVG path for y = f(x) on [x0, x1]; breaks the path where f is undefined or leaves the frame badly. */
export function fnPath(f: Fn, x0: number, x1: number, fr: Frame, samples = 240): string {
  const { sx, sy } = scales(fr);
  const yLo = fr.y[0] - (fr.y[1] - fr.y[0]) * 2;
  const yHi = fr.y[1] + (fr.y[1] - fr.y[0]) * 2;
  let d = '';
  let pen = false;
  for (let i = 0; i <= samples; i++) {
    const x = x0 + ((x1 - x0) * i) / samples;
    const y = f(x);
    if (!Number.isFinite(y) || y < yLo || y > yHi) { pen = false; continue; }
    d += `${pen ? 'L' : 'M'}${sx(x).toFixed(2)} ${sy(y).toFixed(2)}`;
    pen = true;
  }
  return d;
}

/** Path for the line y = m x + b clipped to the frame's x-range. */
export function linePath(m: number, b: number, fr: Frame): string {
  const { sx, sy } = scales(fr);
  const [x0, x1] = fr.x;
  return `M${sx(x0).toFixed(2)} ${sy(m * x0 + b).toFixed(2)}L${sx(x1).toFixed(2)} ${sy(m * x1 + b).toFixed(2)}`;
}

/** "Nice" tick positions for an interval. */
export function ticks(lo: number, hi: number, target = 6): number[] {
  const span = hi - lo;
  const raw = span / target;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 5, 10].map((k) => k * mag).find((s) => span / s <= target) ?? 10 * mag;
  const out: number[] = [];
  for (let v = Math.ceil(lo / step) * step; v <= hi + 1e-9; v += step) out.push(Math.abs(v) < 1e-12 ? 0 : +v.toFixed(10));
  return out;
}

export const fmt = (v: number, d = 4) => {
  if (!Number.isFinite(v)) return '—';
  const s = v.toFixed(d);
  return s === `-${(0).toFixed(d)}` ? (0).toFixed(d) : s;
};
