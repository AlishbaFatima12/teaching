import { useState } from 'preact/hooks';
import { INTEGRANDS, RULES, exactIntegral, pieces, riemann, type RuleId } from '../../lib/math/integration';
import { fnPath, scales, fmt, type Frame } from '../../lib/plot';
import { Axes, LabLayout, LiveSummary, PlotCard, ResetButton, Readout, Segmented, Slider } from './ui';

const DEFAULTS = { gid: 'x2', rule: 'left' as RuleId, n: 6 };
const NS = Array.from({ length: 60 }, (_, i) => Math.round(1.12 ** i)).filter((v, i, a) => a.indexOf(v) === i && v <= 1000);

export default function RiemannSums() {
  const [gid, setGid] = useState(DEFAULTS.gid);
  const [rule, setRule] = useState<RuleId>(DEFAULTS.rule);
  const [n, setN] = useState(DEFAULTS.n);

  const g = INTEGRANDS.find((x) => x.id === gid)!;
  const exact = exactIntegral(g);
  const S = riemann(g.f, g.a, g.b, n, rule);
  const err = Math.abs(S - exact);
  const pad = (g.b - g.a) * 0.12;
  const fr: Frame = { width: 600, height: 380, pad: 34, x: [g.a - pad, g.b + pad], y: g.y };
  const { sx, sy } = scales(fr);
  const ps = pieces(g.f, g.a, g.b, n, rule);

  // error-vs-n (log-log)
  const er: Frame = { width: 600, height: 230, pad: 40, x: [0, 3], y: [-12, 1] };
  const es = scales(er);
  const series = RULES.map((r) => ({
    r,
    pts: NS.map((k) => ({ k, e: Math.abs(riemann(g.f, g.a, g.b, k, r.id) - exact) })).filter((p) => p.e > 1e-13),
  }));
  const pathOf = (pts: { k: number; e: number }[]) =>
    pts.map((p, i) => `${i ? 'L' : 'M'}${es.sx(Math.log10(p.k)).toFixed(1)} ${es.sy(Math.max(-12, Math.log10(p.e))).toFixed(1)}`).join('');
  const dash: Record<RuleId, string> = { left: '', right: '6 4', midpoint: '2 4', trapezoid: '10 4 2 4' };

  const reset = () => { setGid(DEFAULTS.gid); setRule(DEFAULTS.rule); setN(DEFAULTS.n); };
  const summary = `${RULES.find((r) => r.id === rule)!.label} sum with n = ${n} for ${g.label}: ${fmt(S, 6)}. Exact value by the Fundamental Theorem: ${fmt(exact, 6)}. Error ${err.toExponential(2)}.`;

  return (
    <LabLayout
      plot={
        <>
          <PlotCard title={`${rule} Riemann sum for ${g.label}`} desc={summary} fr={fr}>
            <defs>
              <pattern id="neg-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <line x1="0" y1="0" x2="0" y2="6" stroke="var(--accent)" stroke-width="1.5" opacity="0.55" />
              </pattern>
            </defs>
            <Axes fr={fr} />
            {ps.map((p, i) => {
              const d = `M${sx(p.x0)} ${sy(0)}L${sx(p.x0)} ${sy(p.hl)}L${sx(p.x1)} ${sy(p.hr)}L${sx(p.x1)} ${sy(0)}Z`;
              const neg = (p.hl + p.hr) / 2 < 0;
              return <path key={i} d={d} fill={neg ? 'url(#neg-hatch)' : 'var(--accent-soft)'} stroke="var(--accent)" stroke-width={n > 60 ? 0.4 : 1} />;
            })}
            {rule === 'midpoint' && n <= 40 && ps.map((p, i) => <circle key={'m' + i} cx={sx((p.x0 + p.x1) / 2)} cy={sy(p.hl)} r="2.5" fill="var(--accent)" />)}
            <path d={fnPath(g.f, fr.x[0], fr.x[1], fr)} stroke="var(--ink)" stroke-width="2.6" fill="none" />
            <line x1={sx(g.a)} x2={sx(g.a)} y1={sy(fr.y[0])} y2={sy(fr.y[1])} stroke="var(--ink-3)" stroke-dasharray="2 4" />
            <line x1={sx(g.b)} x2={sx(g.b)} y1={sy(fr.y[0])} y2={sy(fr.y[1])} stroke="var(--ink-3)" stroke-dasharray="2 4" />
          </PlotCard>
          <LiveSummary text={summary} />
        </>
      }
      controls={
        <>
          <label class="block text-sm text-ink-2">
            Integrand
            <select class="mt-1.5 block w-full rounded-lg border border-rule-strong bg-surface px-3 py-2.5 text-ink" value={gid}
              onChange={(e) => setGid((e.currentTarget as HTMLSelectElement).value)}>
              {INTEGRANDS.map((x) => <option value={x.id} key={x.id}>{x.label}</option>)}
            </select>
          </label>
          <Segmented name="rule" legend="Rule" value={rule} onChange={setRule} options={RULES.map((r) => ({ value: r.id, label: r.label }))} />
          <Slider label="Number of subintervals n" min={1} max={100} step={1} value={n} display={String(n)} onInput={setN} />
          <Readout cols={2} items={[
            { k: `S_${n}`, v: fmt(S, 6), strong: true },
            { k: 'exact (FTC)', v: fmt(exact, 6) },
            { k: '|error|', v: err.toExponential(2) },
            { k: 'error × n' + (RULES.find((r) => r.id === rule)!.order === 2 ? '²' : ''), v: fmt(err * n ** RULES.find((r) => r.id === rule)!.order, 4) },
          ]} />
          <p class="text-xs leading-relaxed text-ink-3">Hatched pieces lie below the axis and count as negative: the integral is a signed area.</p>
          <ResetButton onClick={reset} />
        </>
      }
      footer={
        <div>
          <p class="mb-2 text-sm text-ink-2">Error against n on log–log axes. Slope −1 means error ∝ 1/n; slope −2 means error ∝ 1/n².</p>
          <PlotCard title="Error versus n for all four rules" fr={er}
            desc={`On log-log axes the left and right rule errors fall with slope about −1, midpoint and trapezoid with slope about −2. Current: ${rule}, n = ${n}, error ${err.toExponential(2)}.`}>
            {[0, 1, 2, 3].map((v) => (
              <g key={'x' + v}>
                <line x1={es.sx(v)} x2={es.sx(v)} y1={es.sy(er.y[0])} y2={es.sy(er.y[1])} stroke="var(--grid)" />
                <text x={es.sx(v)} y={er.height - 22} text-anchor="middle" font-size="11" fill="var(--ink-3)" font-family="var(--font-mono)">{10 ** v}</text>
              </g>
            ))}
            {[-12, -9, -6, -3, 0].map((v) => (
              <g key={'y' + v}>
                <line x1={es.sx(0)} x2={es.sx(3)} y1={es.sy(v)} y2={es.sy(v)} stroke="var(--grid)" />
                <text x={es.sx(0) - 6} y={es.sy(v) + 4} text-anchor="end" font-size="11" fill="var(--ink-3)" font-family="var(--font-mono)">1e{v}</text>
              </g>
            ))}
            <text x={er.width / 2} y={er.height - 6} text-anchor="middle" font-size="12" fill="var(--ink-3)">n (subintervals)</text>
            {series.map(({ r, pts }) => (
              <path key={r.id} d={pathOf(pts)} fill="none" stroke={r.id === rule ? 'var(--accent)' : 'var(--ink-3)'} stroke-width={r.id === rule ? 2.6 : 1.3} stroke-dasharray={dash[r.id]} opacity={r.id === rule ? 1 : 0.7} />
            ))}
            {err > 1e-13 && <circle cx={es.sx(Math.log10(n))} cy={es.sy(Math.max(-12, Math.log10(err)))} r="5" fill="var(--accent)" stroke="var(--surface)" stroke-width="2" />}
            <g font-size="11" fill="var(--ink-2)" font-family="var(--font-sans)">
              {RULES.map((r, i) => (
                <g key={r.id} transform={`translate(${er.width - 130}, ${14 + i * 16})`}>
                  <line x1="0" x2="22" y1="0" y2="0" stroke={r.id === rule ? 'var(--accent)' : 'var(--ink-3)'} stroke-width="2" stroke-dasharray={dash[r.id]} />
                  <text x="28" y="4">{r.label}</text>
                </g>
              ))}
            </g>
          </PlotCard>
        </div>
      }
    />
  );
}
