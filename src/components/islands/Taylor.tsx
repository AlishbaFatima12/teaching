import { useState } from 'preact/hooks';
import { TAYLOR, taylorPoly, taylorError, trustInterval, polyString, sinLagrangeBound, type TaylorId } from '../../lib/math/taylor';
import { fnPath, scales, fmt, type Frame } from '../../lib/plot';
import { Axes, LabLayout, LiveSummary, PlotCard, ResetButton, Readout, Segmented, Slider } from './ui';

const DEFAULTS = { id: 'sin' as TaylorId, n: 3, tol: '0.01', x: 1 };
const TOLS = ['0.1', '0.01', '0.001'] as const;

export default function Taylor() {
  const [id, setId] = useState<TaylorId>(DEFAULTS.id);
  const [n, setN] = useState(DEFAULTS.n);
  const [tol, setTol] = useState<string>(DEFAULTS.tol);
  const [x, setX] = useState(DEFAULTS.x);

  const T = TAYLOR.find((t) => t.id === id)!;
  const fr: Frame = { width: 600, height: 400, pad: 34, x: T.domain, y: T.y };
  const { sx, sy } = scales(fr);
  const [lo, hi] = trustInterval(T, n, +tol);
  const xC = Math.min(Math.max(x, T.domain[0] + 0.05), T.domain[1] - 0.05);
  const fx = T.f(xC), px = taylorPoly(T, n, xC);
  const errX = Number.isFinite(fx) ? Math.abs(fx - px) : NaN;
  const reset = () => { setId(DEFAULTS.id); setN(DEFAULTS.n); setTol(DEFAULTS.tol); setX(DEFAULTS.x); };

  const summary = `Degree ${n} Taylor polynomial of ${T.label} at 0. Error below ${tol} for x in [${fmt(lo, 2)}, ${fmt(hi, 2)}]. At x = ${fmt(xC, 2)}: f = ${fmt(fx)}, polynomial = ${fmt(px)}, error ${Number.isFinite(errX) ? errX.toExponential(2) : 'undefined'}.`;

  return (
    <LabLayout
      plot={
        <>
          <PlotCard title={`Taylor polynomial of degree ${n} for ${T.label}`} desc={summary} fr={fr}>
            <rect x={sx(lo)} y={sy(fr.y[1])} width={Math.max(0, sx(hi) - sx(lo))} height={sy(fr.y[0]) - sy(fr.y[1])} fill="var(--accent-soft)" />
            <Axes fr={fr} />
            <path d={fnPath(T.f, fr.x[0], fr.x[1], fr, 400)} stroke="var(--ink)" stroke-width="2.6" fill="none" />
            <path d={fnPath((t) => taylorPoly(T, n, t), fr.x[0], fr.x[1], fr, 400)} stroke="var(--accent)" stroke-width="2.4" stroke-dasharray="8 5" fill="none" />
            <line x1={sx(xC)} x2={sx(xC)} y1={sy(fr.y[0])} y2={sy(fr.y[1])} stroke="var(--ink-3)" stroke-dasharray="2 4" />
            {Number.isFinite(fx) && <circle cx={sx(xC)} cy={sy(fx)} r="5" fill="var(--ink)" />}
            {px > fr.y[0] && px < fr.y[1] && <circle cx={sx(xC)} cy={sy(px)} r="5" fill="var(--surface)" stroke="var(--accent)" stroke-width="2.5" />}
            {id === 'log1p' && <line x1={sx(-1)} x2={sx(-1)} y1={sy(fr.y[0])} y2={sy(fr.y[1])} stroke="var(--ink-2)" stroke-width="1.2" />}
            {id === 'log1p' && <line x1={sx(1)} x2={sx(1)} y1={sy(fr.y[0])} y2={sy(fr.y[1])} stroke="var(--ink-2)" stroke-width="1.2" stroke-dasharray="4 3" />}
            <g font-family="var(--font-sans)" font-size="12" fill="var(--ink-2)">
              <rect x={12} y={12} width={196} height={70} rx="8" fill="var(--surface)" stroke="var(--rule)" />
              <line x1={22} x2={48} y1={30} y2={30} stroke="var(--ink)" stroke-width="2.6" />
              <text x={56} y={34}>f(x)</text>
              <line x1={22} x2={48} y1={50} y2={50} stroke="var(--accent)" stroke-width="2.4" stroke-dasharray="8 5" />
              <text x={56} y={54}>Pₙ(x), n = {n}</text>
              <rect x={22} y={63} width={26} height={10} fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="0.6" />
              <text x={56} y={72}>|f − Pₙ| &lt; {tol}</text>
            </g>
          </PlotCard>
          <LiveSummary text={summary} />
        </>
      }
      controls={
        <>
          <Segmented name="tfn" legend="Function" value={id} onChange={(v) => { setId(v); setX(DEFAULTS.x); }}
            options={[{ value: 'sin', label: 'sin x' }, { value: 'exp', label: 'eˣ' }, { value: 'log1p', label: 'ln(1+x)' }]} />
          <Slider label="Degree n" min={0} max={15} step={1} value={n} display={String(n)} onInput={setN} />
          <Segmented name="tol" legend="Trust the approximation to within" value={tol} onChange={setTol}
            options={TOLS.map((t) => ({ value: t, label: t }))} />
          <Slider label="Probe x" min={T.domain[0]} max={T.domain[1]} step={0.01} value={xC} display={fmt(xC, 2)} onInput={setX} />
          <div class="rounded-lg border border-rule bg-surface p-3">
            <p class="text-xs text-ink-3">P<sub>{n}</sub>(x) =</p>
            <p class="num mt-1 break-words text-sm leading-relaxed text-ink">{polyString(T, n)}</p>
          </div>
          <Readout cols={2} items={[
            { k: 'trusted on', v: `[${fmt(lo, 2)}, ${fmt(hi, 2)}]`, strong: true },
            { k: `error at x = ${fmt(xC, 2)}`, v: Number.isFinite(errX) ? errX.toExponential(2) : 'undefined' },
            { k: 'series converges for', v: T.convergence },
            id === 'sin'
              ? { k: 'Lagrange bound', v: sinLagrangeBound(n, xC).toExponential(2) }
              : { k: 'f(x)', v: fmt(fx) },
          ]} />
          <ResetButton onClick={reset} />
        </>
      }
    />
  );
}
