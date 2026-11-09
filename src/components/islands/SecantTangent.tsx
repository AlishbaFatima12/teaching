import { useEffect, useRef, useState } from 'preact/hooks';
import { FUNCTIONS, differenceQuotient, quotientTable } from '../../lib/math/calculus';
import { fnPath, linePath, scales, fmt, type Frame } from '../../lib/plot';
import { Axes, LabLayout, LiveSummary, PlotCard, ResetButton, Readout, Segmented, Slider } from './ui';

const DEFAULTS = { fid: 'square', a: 1, s: 0.15, side: 'right' as 'right' | 'left' };
const H_MAX = 2, H_MIN = 1e-4;
const hFromS = (s: number) => H_MAX * (H_MIN / H_MAX) ** s;
const showH = (h: number) => (Math.abs(h) < 0.01 ? h.toExponential(1) : fmt(h, 3));

export default function SecantTangent() {
  const [fid, setFid] = useState(DEFAULTS.fid);
  const [a, setA] = useState(DEFAULTS.a);
  const [s, setS] = useState(DEFAULTS.s);
  const [side, setSide] = useState(DEFAULTS.side);
  const [anim, setAnim] = useState(false);
  const raf = useRef(0);

  const F = FUNCTIONS.find((f) => f.id === fid)!;
  const aMin = fid === 'sqrt' ? 0.25 : F.domain[0] + 0.3;
  const aMax = F.domain[1] - 0.3;
  const aC = Math.min(Math.max(a, aMin), aMax);
  const h = (side === 'right' ? 1 : -1) * hFromS(s);
  const valid = Number.isFinite(F.f(aC + h));
  const q = valid ? differenceQuotient(F.f, aC, h) : NaN;
  const exact = F.df(aC);

  const fr: Frame = { width: 600, height: 420, pad: 34, x: F.domain, y: F.range };
  const { sx, sy } = scales(fr);

  useEffect(() => {
    if (!anim) return;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { setS(1); setAnim(false); return; }
    let start = 0; const from = s;
    const tick = (t: number) => {
      if (!start) start = t;
      const p = Math.min(1, (t - start) / 3500);
      setS(from + (1 - from) * p);
      if (p < 1) raf.current = requestAnimationFrame(tick); else setAnim(false);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [anim]);

  const reset = () => { setAnim(false); setFid(DEFAULTS.fid); setA(DEFAULTS.a); setS(DEFAULTS.s); setSide(DEFAULTS.side); };
  const table = quotientTable(F.f, aC, side === 'right' ? 1 : -1, 10, 6).filter((r) => Number.isFinite(r.q));

  const summary = `${F.label}. Point a = ${fmt(aC, 2)}, h = ${showH(h)}. Secant slope ${fmt(q)}; derivative f′(a) = ${fmt(exact)}; difference ${fmt(Math.abs(q - exact))}.`;

  return (
    <div>
      <LabLayout
        plot={
          <>
            <PlotCard title={`Secant and tangent lines for ${F.label}`} desc={summary} fr={fr}>
              <Axes fr={fr} />
              <path d={linePath(exact, F.f(aC) - exact * aC, fr)} stroke="var(--ink-3)" stroke-width="1.6" stroke-dasharray="7 6" fill="none" />
              <path d={fnPath(F.f, fr.x[0], fr.x[1], fr)} stroke="var(--ink)" stroke-width="2.6" fill="none" />
              {valid && <path d={linePath(q, F.f(aC) - q * aC, fr)} stroke="var(--accent)" stroke-width="2.4" fill="none" />}
              {valid && (
                <>
                  <line x1={sx(aC)} x2={sx(aC + h)} y1={sy(F.f(aC))} y2={sy(F.f(aC))} stroke="var(--accent)" stroke-dasharray="3 4" />
                  <line x1={sx(aC + h)} x2={sx(aC + h)} y1={sy(F.f(aC))} y2={sy(F.f(aC + h))} stroke="var(--accent)" stroke-dasharray="3 4" />
                  <circle cx={sx(aC + h)} cy={sy(F.f(aC + h))} r="5.5" fill="var(--surface)" stroke="var(--accent)" stroke-width="2.5" />
                </>
              )}
              <circle cx={sx(aC)} cy={sy(F.f(aC))} r="6" fill="var(--ink)" />
              <g font-family="var(--font-sans)" font-size="12" fill="var(--ink-2)">
                <rect x={fr.width - 186} y={12} width={174} height={50} rx="8" fill="var(--surface)" stroke="var(--rule)" />
                <line x1={fr.width - 176} x2={fr.width - 150} y1={30} y2={30} stroke="var(--accent)" stroke-width="2.4" />
                <text x={fr.width - 142} y={34}>secant</text>
                <line x1={fr.width - 176} x2={fr.width - 150} y1={50} y2={50} stroke="var(--ink-3)" stroke-width="1.6" stroke-dasharray="7 6" />
                <text x={fr.width - 142} y={54}>tangent (exact)</text>
              </g>
            </PlotCard>
            <LiveSummary text={summary} />
          </>
        }
        controls={
          <>
            <label class="block text-sm text-ink-2">
              Function
              <select class="mt-1.5 block w-full rounded-lg border border-rule-strong bg-surface px-3 py-2.5 text-ink" value={fid}
                onChange={(e) => { setFid((e.currentTarget as HTMLSelectElement).value); setA(fid === 'sqrt' ? 1 : DEFAULTS.a); }}>
                {FUNCTIONS.map((f) => <option value={f.id} key={f.id}>{f.label}</option>)}
              </select>
            </label>
            <Slider label="Point a" min={aMin} max={aMax} step={0.01} value={aC} display={fmt(aC, 2)} onInput={setA} />
            <Slider label="Shrink h (log scale)" min={0} max={1} step={0.001} value={s} display={showH(h)}
              valueText={`h equals ${showH(h)}`} onInput={(v) => { setAnim(false); setS(v); }} />
            <Segmented name="side" legend="Approach from" value={side} onChange={setSide}
              options={[{ value: 'right', label: 'h > 0 (right)' }, { value: 'left', label: 'h < 0 (left)' }]} />
            <Readout cols={2} items={[
              { k: 'secant slope', v: fmt(q), strong: true },
              { k: "f′(a) exact", v: fmt(exact) },
              { k: 'f(a)', v: fmt(F.f(aC)) },
              { k: '|secant − f′(a)|', v: fmt(Math.abs(q - exact), 6) },
            ]} />
            <div class="flex flex-wrap gap-2">
              <button type="button" class="btn btn-primary !min-h-9 !px-3.5 !py-1.5 text-sm" onClick={() => { setS(0); setTimeout(() => setAnim(true), 30); }} disabled={anim}>
                Animate h → 0
              </button>
              <ResetButton onClick={reset} />
            </div>
          </>
        }
        footer={
          <div class="overflow-x-auto">
            <table class="num w-full min-w-[22rem] text-sm">
              <caption class="mb-2 text-left font-sans text-sm text-ink-2">Limit table at a = {fmt(aC, 2)}: the quotient settles on f′(a) = {fmt(exact, 6)}</caption>
              <thead><tr class="border-b border-rule text-left text-xs text-ink-3"><th class="py-1.5 pr-4 font-normal" scope="col">h</th><th class="py-1.5 pr-4 font-normal" scope="col">(f(a+h) − f(a)) / h</th><th class="py-1.5 font-normal" scope="col">error</th></tr></thead>
              <tbody>
                {table.map((r) => (
                  <tr class="border-b border-rule/60" key={r.h}>
                    <td class="py-1.5 pr-4">{r.h.toExponential(0)}</td>
                    <td class="py-1.5 pr-4 text-ink">{r.q.toFixed(8)}</td>
                    <td class="py-1.5 text-ink-3">{Math.abs(r.q - exact).toExponential(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        }
      />
    </div>
  );
}
