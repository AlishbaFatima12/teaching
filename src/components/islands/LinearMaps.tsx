import { useRef, useState } from 'preact/hooks';
import { apply, det, eigen, trace, type Mat, type Vec } from '../../lib/math/linalg';
import { scales, fmt, type Frame } from '../../lib/plot';
import { LabLayout, LiveSummary, PlotCard, ResetButton, Readout, Slider } from './ui';

const PRESETS: { id: string; label: string; M: Mat }[] = [
  { id: 'I', label: 'Identity', M: [[1, 0], [0, 1]] },
  { id: 'sym', label: 'Symmetric', M: [[2, 1], [1, 2]] },
  { id: 'shear', label: 'Shear', M: [[1, 1], [0, 1]] },
  { id: 'rot', label: 'Rotate 60°', M: [[0.5, -Math.sqrt(3) / 2], [Math.sqrt(3) / 2, 0.5]] },
  { id: 'ref', label: 'Reflect', M: [[0, 1], [1, 0]] },
  { id: 'proj', label: 'Singular', M: [[1, 2], [0.5, 1]] },
];
const R = 4.2;
const fr: Frame = { width: 520, height: 520, pad: 18, x: [-R, R], y: [-R, R] };
const round1 = (v: number) => Math.round(v * 10) / 10;

export default function LinearMaps() {
  const [M, setM] = useState<Mat>(PRESETS[1].M);
  const [drag, setDrag] = useState<null | 0 | 1>(null);
  const svgRef = useRef<HTMLDivElement>(null);
  const { sx, sy, ix, iy } = scales(fr);

  const D = det(M), tr = trace(M), E = eigen(M);
  const e1 = apply(M, [1, 0]), e2 = apply(M, [0, 1]);
  const set = (i: 0 | 1, j: 0 | 1, v: number) => setM((m) => { const n = m.map((r) => [...r]) as Mat; n[i][j] = v; return n; });
  const setCol = (c: 0 | 1, v: Vec) => setM((m) => { const n = m.map((r) => [...r]) as Mat; n[0][c] = round1(v[0]); n[1][c] = round1(v[1]); return n; });

  const toWorld = (ev: PointerEvent): Vec => {
    const svg = svgRef.current!.querySelector('svg')!;
    const r = svg.getBoundingClientRect();
    const px = ((ev.clientX - r.left) / r.width) * fr.width;
    const py = ((ev.clientY - r.top) / r.height) * fr.height;
    return [Math.max(-3, Math.min(3, ix(px))), Math.max(-3, Math.min(3, iy(py)))];
  };

  // transformed grid
  const grid: string[] = [];
  for (let k = -6; k <= 6; k++) {
    const a = apply(M, [k, -8]), b = apply(M, [k, 8]);
    const c = apply(M, [-8, k]), d = apply(M, [8, k]);
    grid.push(`M${sx(a[0])} ${sy(a[1])}L${sx(b[0])} ${sy(b[1])}`, `M${sx(c[0])} ${sy(c[1])}L${sx(d[0])} ${sy(d[1])}`);
  }
  const sq = [[0, 0], e1, [e1[0] + e2[0], e1[1] + e2[1]], e2].map((p) => `${sx(p[0])},${sy(p[1])}`).join(' ');

  const eigText = E.kind === 'complex'
    ? `complex: ${fmt(E.complex!.re, 2)} ± ${fmt(E.complex!.im, 2)}i (no real eigenvector)`
    : E.values.map((l) => fmt(l, 3)).join(', ') + (E.kind === 'real-repeated' ? ' (repeated)' : '');
  const summary = `Matrix [[${fmt(M[0][0], 1)}, ${fmt(M[0][1], 1)}], [${fmt(M[1][0], 1)}, ${fmt(M[1][1], 1)}]]. The unit square maps to a parallelogram with signed area ${fmt(D, 2)}${D < 0 ? ' (orientation reversed)' : D === 0 ? ' (collapsed to a line or point)' : ''}. Eigenvalues: ${eigText}.`;

  const handle = (c: 0 | 1, v: Vec, label: string) => (
    <g
      tabIndex={0}
      role="button"
      aria-label={`${label} at (${fmt(v[0], 1)}, ${fmt(v[1], 1)}). Drag, or use arrow keys to move by 0.1.`}
      class="cursor-grab outline-none [&:focus-visible>circle:first-child]:stroke-[var(--ink)]"
      onPointerDown={(e) => { (e.currentTarget as Element).setPointerCapture(e.pointerId); setDrag(c); }}
      onPointerMove={(e) => { if (drag === c) setCol(c, toWorld(e)); }}
      onPointerUp={() => setDrag(null)}
      onKeyDown={(e) => {
        const d: Record<string, Vec> = { ArrowRight: [0.1, 0], ArrowLeft: [-0.1, 0], ArrowUp: [0, 0.1], ArrowDown: [0, -0.1] };
        if (d[e.key]) { e.preventDefault(); setCol(c, [Math.max(-3, Math.min(3, v[0] + d[e.key][0])), Math.max(-3, Math.min(3, v[1] + d[e.key][1]))]); }
      }}
    >
      <circle cx={sx(v[0])} cy={sy(v[1])} r="14" fill="transparent" stroke="transparent" stroke-width="2" />
      <circle cx={sx(v[0])} cy={sy(v[1])} r="7" fill="var(--surface)" stroke="var(--accent)" stroke-width="3" />
    </g>
  );

  const arrow = (v: Vec, color: string, w = 3) => {
    const [x, y] = [sx(v[0]), sy(v[1])], [x0, y0] = [sx(0), sy(0)];
    const ang = Math.atan2(y - y0, x - x0), L = Math.hypot(x - x0, y - y0);
    if (L < 2) return null;
    const hx = x - 12 * Math.cos(ang), hy = y - 12 * Math.sin(ang);
    return (
      <g>
        <line x1={x0} y1={y0} x2={hx} y2={hy} stroke={color} stroke-width={w} stroke-linecap="round" />
        <path d={`M${x} ${y}L${hx - 6 * Math.sin(ang)} ${hy + 6 * Math.cos(ang)}L${hx + 6 * Math.sin(ang)} ${hy - 6 * Math.cos(ang)}Z`} fill={color} />
      </g>
    );
  };

  return (
    <LabLayout
      plot={
        <div ref={svgRef}>
          <PlotCard title="Image of the grid and unit square under the matrix" desc={summary} fr={fr}>
            <defs>
              <pattern id="lm-hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <line x1="0" y1="0" x2="0" y2="7" stroke="var(--accent)" stroke-width="2" opacity="0.5" />
              </pattern>
            </defs>
            {/* original grid, faint */}
            {Array.from({ length: 9 }, (_, i) => i - 4).map((k) => (
              <g key={k}>
                <line x1={sx(k)} x2={sx(k)} y1={sy(-R)} y2={sy(R)} stroke="var(--grid)" />
                <line x1={sx(-R)} x2={sx(R)} y1={sy(k)} y2={sy(k)} stroke="var(--grid)" />
              </g>
            ))}
            <line x1={sx(-R)} x2={sx(R)} y1={sy(0)} y2={sy(0)} stroke="var(--rule-strong)" />
            <line x1={sx(0)} x2={sx(0)} y1={sy(-R)} y2={sy(R)} stroke="var(--rule-strong)" />
            {/* transformed grid */}
            <path d={grid.join('')} stroke="var(--accent)" stroke-width="0.8" opacity="0.35" fill="none" />
            {/* eigenvector lines */}
            {E.kind !== 'complex' && !(E.vectors.length === 2 && E.kind === 'real-repeated') && E.vectors.map((v, i) => (
              <line key={i} x1={sx(-R * 2 * v[0])} y1={sy(-R * 2 * v[1])} x2={sx(R * 2 * v[0])} y2={sy(R * 2 * v[1])} stroke="var(--ink-2)" stroke-width="1.4" stroke-dasharray="8 5" />
            ))}
            {/* unit square and its image */}
            <polygon points={`${sx(0)},${sy(0)} ${sx(1)},${sy(0)} ${sx(1)},${sy(1)} ${sx(0)},${sy(1)}`} fill="none" stroke="var(--ink-3)" stroke-dasharray="3 3" />
            <polygon points={sq} fill={D < 0 ? 'url(#lm-hatch)' : 'var(--accent-soft)'} fill-opacity="0.85" stroke="var(--accent)" stroke-width="1.5" />
            {arrow(e1, 'var(--accent)')}
            {arrow(e2, 'var(--ink)')}
            <text x={sx(e1[0]) + 12} y={sy(e1[1]) - 10} font-family="var(--font-serif)" font-style="italic" font-size="15" fill="var(--accent)">Ae₁</text>
            <text x={sx(e2[0]) + 12} y={sy(e2[1]) - 10} font-family="var(--font-serif)" font-style="italic" font-size="15" fill="var(--ink)">Ae₂</text>
            {handle(0, e1, 'Image of e1, first column of A')}
            {handle(1, e2, 'Image of e2, second column of A')}
          </PlotCard>
          <LiveSummary text={summary} />
        </div>
      }
      controls={
        <>
          <fieldset>
            <legend class="mb-2 text-sm text-ink-2">Matrix A (columns are Ae₁ and Ae₂)</legend>
            <div class="grid grid-cols-2 gap-x-4 gap-y-2 rounded-xl border-x-2 border-ink/70 px-3 py-1">
              <Slider label="a₁₁" min={-3} max={3} step={0.1} value={M[0][0]} display={fmt(M[0][0], 1)} onInput={(v) => set(0, 0, v)} />
              <Slider label="a₁₂" min={-3} max={3} step={0.1} value={M[0][1]} display={fmt(M[0][1], 1)} onInput={(v) => set(0, 1, v)} />
              <Slider label="a₂₁" min={-3} max={3} step={0.1} value={M[1][0]} display={fmt(M[1][0], 1)} onInput={(v) => set(1, 0, v)} />
              <Slider label="a₂₂" min={-3} max={3} step={0.1} value={M[1][1]} display={fmt(M[1][1], 1)} onInput={(v) => set(1, 1, v)} />
            </div>
          </fieldset>
          <div>
            <p class="mb-1.5 text-sm text-ink-2">Presets</p>
            <div class="flex flex-wrap gap-1.5">
              {PRESETS.map((p) => (
                <button type="button" key={p.id} class="rounded-full border border-rule-strong bg-surface px-3 py-1.5 text-sm text-ink-2 hover:border-accent hover:text-accent" onClick={() => setM(p.M)}>{p.label}</button>
              ))}
            </div>
          </div>
          <Readout cols={2} items={[
            { k: 'det A (signed area)', v: fmt(D, 2), strong: true },
            { k: 'orientation', v: D > 1e-9 ? 'preserved' : D < -1e-9 ? 'reversed' : 'collapsed' },
            { k: 'trace A', v: fmt(tr, 2) },
            { k: 'eigenvalues', v: eigText },
          ]} />
          <p class="text-xs leading-relaxed text-ink-3">Dashed lines through the origin are eigenvector directions: vectors on them are only stretched, never turned. Hatching means the orientation is reversed (det &lt; 0).</p>
          <ResetButton onClick={() => setM(PRESETS[1].M)} />
        </>
      }
    />
  );
}
