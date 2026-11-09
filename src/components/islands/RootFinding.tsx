import { useState } from 'preact/hooks';
import { ROOT_PROBLEMS, bisection, newton, type NewtonStatus } from '../../lib/math/roots';
import { fnPath, scales, fmt, type Frame } from '../../lib/plot';
import { Axes, LabLayout, LiveSummary, PlotCard, ResetButton, Segmented, Slider } from './ui';

const STATUS: Record<NewtonStatus | 'no-sign-change', string> = {
  converged: 'converged',
  'zero-derivative': "stopped: f′(x) = 0, the tangent never meets the axis",
  cycling: 'stopped: the iterates cycle and never converge',
  diverged: 'stopped: the iterates run away',
  'max-iter': 'stopped: iteration limit reached',
  'no-sign-change': 'cannot start: f(a) and f(b) have the same sign',
};

export default function RootFinding() {
  const [pid, setPid] = useState(ROOT_PROBLEMS[0].id);
  const P = ROOT_PROBLEMS.find((p) => p.id === pid)!;
  const [a, setA] = useState(P.bracket[0]);
  const [b, setB] = useState(P.bracket[1]);
  const [x0, setX0] = useState(P.x0);
  const [k, setK] = useState(3);

  const choose = (id: string) => {
    const Q = ROOT_PROBLEMS.find((p) => p.id === id)!;
    setPid(id); setA(Q.bracket[0]); setB(Q.bracket[1]); setX0(Q.x0); setK(3);
  };

  const bis = bisection(P.f, a, b, 1e-12, 50);
  const nw = newton(P.f, P.df, x0, 1e-14, 30);
  const ref = bisection(P.f, P.bracket[0], P.bracket[1], 1e-15, 80).root!; // reference root
  const maxK = Math.max(1, Math.min(40, Math.max(bis.steps.length, nw.steps.length)));
  const kC = Math.min(k, maxK);

  const fr: Frame = { width: 600, height: 380, pad: 34, x: P.window.x, y: P.window.y };
  const { sx, sy } = scales(fr);
  const bk = bis.steps[Math.min(kC, bis.steps.length) - 1];
  const nSteps = nw.steps.slice(0, kC);

  // convergence plot: log10 |x_k − r*|
  const cv: Frame = { width: 600, height: 220, pad: 40, x: [1, Math.max(8, maxK)], y: [-16, 1] };
  const cs = scales(cv);
  const lg = (v: number) => Math.max(-16, Math.min(1, Math.log10(Math.max(v, 1e-16))));
  const bisPts = bis.steps.map((s) => ({ k: s.k, e: Math.abs(s.m - ref) }));
  const bisBound = bis.steps.map((s) => ({ k: s.k, e: s.width / 2 }));
  const nwPts = nw.steps.filter((s) => s.next !== null).map((s) => ({ k: s.k, e: Math.abs((s.next as number) - ref) }));
  const pth = (pts: { k: number; e: number }[]) => pts.map((p, i) => `${i ? 'L' : 'M'}${cs.sx(p.k).toFixed(1)} ${cs.sy(lg(p.e)).toFixed(1)}`).join('');

  const nwX = nSteps.length ? (nSteps[nSteps.length - 1].next ?? nSteps[nSteps.length - 1].x) : x0;
  const summary = `${P.label}. After ${kC} steps: bisection interval [${bk ? fmt(bk.a, 6) : '—'}, ${bk ? fmt(bk.b, 6) : '—'}], ${bis.status === 'no-sign-change' ? STATUS['no-sign-change'] : 'midpoint ' + (bk ? fmt(bk.m, 8) : '—')}. Newton from ${fmt(x0, 2)}: x = ${fmt(nwX, 10)}, ${STATUS[nw.status]}.`;

  return (
    <LabLayout
      plot={
        <>
          <PlotCard title={`Bisection and Newton's method for ${P.label}`} desc={summary} fr={fr}>
            <Axes fr={fr} />
            <path d={fnPath(P.f, fr.x[0], fr.x[1], fr)} stroke="var(--ink)" stroke-width="2.6" fill="none" />
            {/* bisection bracket */}
            {bk && (
              <g>
                <rect x={sx(bk.a)} y={sy(0) - 7} width={Math.max(2, sx(bk.b) - sx(bk.a))} height={14} rx="3" fill="var(--ink-3)" opacity="0.28" />
                <line x1={sx(bk.m)} x2={sx(bk.m)} y1={sy(0) - 12} y2={sy(0) + 12} stroke="var(--ink-2)" stroke-width="2" />
              </g>
            )}
            {/* Newton zig-zag */}
            {nSteps.map((s, i) => (
              <g key={i}>
                <line x1={sx(s.x)} x2={sx(s.x)} y1={sy(0)} y2={sy(s.fx)} stroke="var(--accent)" stroke-dasharray="2 3" />
                {s.next !== null && <line x1={sx(s.x)} y1={sy(s.fx)} x2={sx(s.next)} y2={sy(0)} stroke="var(--accent)" stroke-width="1.8" />}
                <circle cx={sx(s.x)} cy={sy(s.fx)} r="3.5" fill="var(--accent)" />
              </g>
            ))}
            <circle cx={sx(x0)} cy={sy(0)} r="5" fill="var(--surface)" stroke="var(--accent)" stroke-width="2.5" />
            <g font-family="var(--font-sans)" font-size="12" fill="var(--ink-2)">
              <rect x={12} y={12} width={190} height={50} rx="8" fill="var(--surface)" stroke="var(--rule)" />
              <rect x={22} y={24} width={26} height={10} rx="2" fill="var(--ink-3)" opacity="0.4" />
              <text x={56} y={33}>bisection interval</text>
              <line x1={22} x2={48} y1={49} y2={49} stroke="var(--accent)" stroke-width="2" />
              <text x={56} y={53}>Newton tangent steps</text>
            </g>
          </PlotCard>
          <LiveSummary text={summary} />
        </>
      }
      controls={
        <>
          <label class="block text-sm text-ink-2">
            Problem
            <select class="mt-1.5 block w-full rounded-lg border border-rule-strong bg-surface px-3 py-2.5 text-ink" value={pid}
              onChange={(e) => choose((e.currentTarget as HTMLSelectElement).value)}>
              {ROOT_PROBLEMS.map((p) => <option value={p.id} key={p.id}>{p.label}</option>)}
            </select>
          </label>
          <p class="text-sm leading-relaxed text-ink-2">{P.note}</p>
          <Slider label="Step k" min={1} max={maxK} step={1} value={kC} display={`${kC} / ${maxK}`} onInput={setK} />
          <div class="grid grid-cols-2 gap-3">
            <Slider label="Bracket a" min={P.window.x[0]} max={P.window.x[1]} step={0.05} value={a} display={fmt(a, 2)} onInput={setA} />
            <Slider label="Bracket b" min={P.window.x[0]} max={P.window.x[1]} step={0.05} value={b} display={fmt(b, 2)} onInput={setB} />
          </div>
          <Slider label="Newton start x₀" min={P.window.x[0]} max={P.window.x[1]} step={0.05} value={x0} display={fmt(x0, 2)} onInput={setX0} />
          <ul class="space-y-2 text-sm">
            <li class="flex gap-2"><span class="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-ink-3"></span><span><strong class="text-ink">Bisection:</strong> <span class="text-ink-2">{bis.status === 'no-sign-change' ? STATUS['no-sign-change'] : `${bis.status === 'converged' ? 'converged' : 'running'} in ${bis.steps.length} steps`}</span></span></li>
            <li class="flex gap-2"><span class="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent"></span><span><strong class="text-ink">Newton:</strong> <span class={nw.status === 'converged' ? 'text-ink-2' : 'font-medium text-accent'}>{nw.status === 'converged' ? `converged in ${nw.steps.length} steps` : STATUS[nw.status]}</span></span></li>
          </ul>
          <ResetButton onClick={() => choose(pid)} />
        </>
      }
      footer={
        <div class="grid gap-6 xl:grid-cols-2">
          <div class="overflow-x-auto">
            <table class="num w-full min-w-[30rem] text-[0.8rem]">
              <caption class="mb-2 text-left font-sans text-sm text-ink-2">Iteration table (first {Math.min(maxK, 12)} steps; reference root {fmt(ref, 12)})</caption>
              <thead>
                <tr class="border-b border-rule text-left text-xs text-ink-3">
                  <th scope="col" class="py-1.5 pr-3 font-normal">k</th>
                  <th scope="col" class="py-1.5 pr-3 font-normal">bisection mₖ</th>
                  <th scope="col" class="py-1.5 pr-3 font-normal">|mₖ − r|</th>
                  <th scope="col" class="py-1.5 pr-3 font-normal">Newton xₖ</th>
                  <th scope="col" class="py-1.5 font-normal">|xₖ − r|</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: Math.min(maxK, 12) }, (_, i) => {
                  const bs = bis.steps[i], ns = nw.steps[i];
                  return (
                    <tr key={i} class={`border-b border-rule/60 ${i + 1 === kC ? 'bg-accent-soft' : ''}`}>
                      <td class="py-1 pr-3">{i + 1}</td>
                      <td class="py-1 pr-3 text-ink">{bs ? bs.m.toFixed(10) : '—'}</td>
                      <td class="py-1 pr-3 text-ink-3">{bs ? Math.abs(bs.m - ref).toExponential(1) : ''}</td>
                      <td class="py-1 pr-3 text-ink">{ns ? (ns.next === null ? 'f′ = 0' : ns.next.toFixed(10)) : '—'}</td>
                      <td class="py-1 text-ink-3">{ns && ns.next !== null ? Math.abs(ns.next - ref).toExponential(1) : ''}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div>
            <PlotCard title="Convergence: error against iteration" fr={cv}
              desc={`Base-10 logarithm of the error against step number. The bisection error bound halves every step, a straight line on this scale (linear convergence); Newton, when it works, plunges (quadratic convergence). Newton status: ${STATUS[nw.status]}.`}>
              {[-16, -12, -8, -4, 0].map((v) => (
                <g key={v}>
                  <line x1={cs.sx(cv.x[0])} x2={cs.sx(cv.x[1])} y1={cs.sy(v)} y2={cs.sy(v)} stroke="var(--grid)" />
                  <text x={cs.sx(cv.x[0]) - 6} y={cs.sy(v) + 4} text-anchor="end" font-size="11" fill="var(--ink-3)" font-family="var(--font-mono)">1e{v}</text>
                </g>
              ))}
              {Array.from({ length: Math.floor(cv.x[1] / 5) + 1 }, (_, i) => Math.max(1, i * 5)).map((v) => (
                <text key={v} x={cs.sx(v)} y={cv.height - 22} text-anchor="middle" font-size="11" fill="var(--ink-3)" font-family="var(--font-mono)">{v}</text>
              ))}
              <text x={cv.width / 2} y={cv.height - 6} text-anchor="middle" font-size="12" fill="var(--ink-3)">step k</text>
              <path d={pth(bisPts)} fill="none" stroke="var(--ink-3)" stroke-width="1" opacity="0.45" />
              <path d={pth(bisBound)} fill="none" stroke="var(--ink-2)" stroke-width="2" stroke-dasharray="6 4" />
              <path d={pth(nwPts)} fill="none" stroke="var(--accent)" stroke-width="2.6" />
              <g font-size="11" fill="var(--ink-2)" font-family="var(--font-sans)">
                <line x1={cv.width - 196} x2={cv.width - 174} y1={14} y2={14} stroke="var(--ink-2)" stroke-width="2" stroke-dasharray="6 4" />
                <text x={cv.width - 168} y={18}>bisection bound (bₖ − aₖ)/2</text>
                <line x1={cv.width - 196} x2={cv.width - 174} y1={30} y2={30} stroke="var(--ink-3)" stroke-width="1" opacity="0.6" />
                <text x={cv.width - 168} y={34}>bisection true error</text>
                <line x1={cv.width - 196} x2={cv.width - 174} y1={46} y2={46} stroke="var(--accent)" stroke-width="2.6" />
                <text x={cv.width - 168} y={50}>Newton error</text>
              </g>
              <line x1={cs.sx(kC)} x2={cs.sx(kC)} y1={cs.sy(cv.y[0])} y2={cs.sy(cv.y[1])} stroke="var(--ink-3)" stroke-dasharray="3 3" />
            </PlotCard>
          </div>
        </div>
      }
    />
  );
}
