import { useState } from 'preact/hooks';
import {
  applyChanges, netChange, compound, simpleGrowth, overtake, doublingTime, breakEven, planCost, cheaper,
  linearModel, type Plan,
} from '../../lib/math/foundations';
import { scales, ticks, fmt, type Frame } from '../../lib/plot';
import { Axes, LiveSummary, PlotCard, ResetButton, Readout, Segmented, Slider } from './ui';

type Tab = 'percent' | 'growth' | 'breakeven';
const money = (v: number) => '$' + v.toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const pct = (v: number) => (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v).toFixed(2) + '%';

/* ---------- 1. Successive percentage changes ---------- */
function Percent() {
  const D = { price: 80, p1: 20, p2: -20 };
  const [price, setPrice] = useState(D.price);
  const [p1, setP1] = useState(D.p1);
  const [p2, setP2] = useState(D.p2);
  const mid = applyChanges(price, [p1]);
  const fin = applyChanges(price, [p1, p2]);
  const net = netChange([p1, p2]);
  const naive = p1 + p2;
  const max = Math.max(price, mid, fin) * 1.15;
  const bar = (v: number) => `${(v / max) * 100}%`;
  const summary = `Start ${money(price)}, change ${pct(p1)} gives ${money(mid)}, then ${pct(p2)} gives ${money(fin)}. Net change ${pct(net)}, not ${pct(naive)}.`;
  return (
    <div class="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <div>
        <p class="text-ink-2"><strong class="text-ink">Context.</strong> A jacket's price rises during the season, then goes on sale. Do equal percentages cancel?</p>
        <div class="mt-5 space-y-4" role="img" aria-label={summary}>
          {[{ k: 'Original', v: price }, { k: `After ${pct(p1)}`, v: mid }, { k: `After ${pct(p2)}`, v: fin }].map((r, i) => (
            <div key={r.k}>
              <div class="flex justify-between text-sm"><span class="text-ink-2">{r.k}</span><span class="num text-ink">{money(r.v)}</span></div>
              <div class="mt-1 h-7 overflow-hidden rounded-md bg-sunken">
                <div class={`h-full rounded-md transition-[width] duration-300 ${i === 2 ? 'bg-accent' : 'bg-ink-3/50'}`} style={{ width: bar(r.v) }} />
              </div>
            </div>
          ))}
        </div>
        <LiveSummary text={summary} />
      </div>
      <div class="space-y-5">
        <Slider label="Original price" min={10} max={500} step={5} value={price} display={money(price)} onInput={setPrice} />
        <Slider label="First change" min={-50} max={100} step={1} value={p1} display={pct(p1)} onInput={setP1} />
        <Slider label="Second change" min={-50} max={100} step={1} value={p2} display={pct(p2)} onInput={setP2} />
        <Readout cols={2} items={[
          { k: 'actual net change', v: pct(net), strong: true },
          { k: 'adding percentages', v: pct(naive) },
          { k: 'multiplier', v: `${(1 + p1 / 100).toFixed(2)} × ${(1 + p2 / 100).toFixed(2)} = ${((1 + p1 / 100) * (1 + p2 / 100)).toFixed(4)}` },
          { k: 'to undo the first change', v: pct((1 / (1 + p1 / 100) - 1) * 100) },
        ]} />
        <ResetButton onClick={() => { setPrice(D.price); setP1(D.p1); setP2(D.p2); }} />
      </div>
    </div>
  );
}

/* ---------- 2. Linear vs exponential, compounding ---------- */
function Growth() {
  const D = { P: 1000, add: 100, g: 7, years: 30, k: '1' };
  const [P, setP] = useState(D.P);
  const [add, setAdd] = useState(D.add);
  const [g, setG] = useState(D.g);
  const [years, setYears] = useState(D.years);
  const [k, setK] = useState(D.k);
  const kk = +k;
  const lin = (t: number) => linearModel(P, add, t);
  const ex = (t: number) => compound(P, g / 100, t, kk);
  const yMax = Math.max(lin(years), ex(years)) * 1.08;
  const fr: Frame = { width: 600, height: 340, pad: 46, x: [0, years], y: [0, yMax] };
  const { sx, sy } = scales(fr);
  const path = (fn: (t: number) => number) => Array.from({ length: 121 }, (_, i) => (i / 120) * years).map((t, i) => `${i ? 'L' : 'M'}${sx(t).toFixed(1)} ${sy(fn(t)).toFixed(1)}`).join('');
  // first whole year exponential beats linear
  let over: number | null = null;
  for (let t = 1; t <= 200; t++) if (ex(t) > lin(t)) { over = t; break; }
  const annualOnly = overtake(P, add, g / 100);
  const summary = `Linear: ${money(P)} plus ${money(add)} per year reaches ${money(lin(years))} after ${years} years. Exponential at ${g}% compounded ${kk === 1 ? 'yearly' : kk === 12 ? 'monthly' : 'daily'} reaches ${money(ex(years))}. Exponential is ahead from year ${over ?? 'beyond 200'}.`;
  return (
    <div class="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <div>
        <p class="text-ink-2"><strong class="text-ink">Context.</strong> Two ways a {money(P)} balance can grow: add a fixed amount every year (linear), or earn a percentage every year (exponential).</p>
        <PlotCard title="Linear versus exponential growth" desc={summary} fr={fr} class="mt-4">
          <Axes fr={fr} xLabel="years" yLabel="$" yTicks={ticks(0, yMax, 5)} />
          <path d={path(lin)} stroke="var(--ink-3)" stroke-width="2.4" fill="none" stroke-dasharray="7 5" />
          <path d={path(ex)} stroke="var(--accent)" stroke-width="2.8" fill="none" />
          {over !== null && over <= years && (
            <g>
              <line x1={sx(over)} x2={sx(over)} y1={sy(0)} y2={sy(ex(over))} stroke="var(--accent)" stroke-dasharray="2 3" />
              <circle cx={sx(over)} cy={sy(ex(over))} r="5" fill="var(--accent)" />
              <text x={sx(over) + 8} y={sy(ex(over)) - 8} font-size="12" fill="var(--accent)" font-family="var(--font-sans)">ahead from year {over}</text>
            </g>
          )}
        </PlotCard>
        <LiveSummary text={summary} />
      </div>
      <div class="space-y-5">
        <Slider label="Starting balance" min={100} max={10000} step={100} value={P} display={money(P)} onInput={setP} />
        <Slider label="Linear: amount added per year" min={0} max={1000} step={10} value={add} display={money(add)} onInput={setAdd} />
        <Slider label="Exponential: growth rate per year" min={0.5} max={15} step={0.5} value={g} display={g.toFixed(1) + '%'} onInput={setG} />
        <Segmented name="k" legend="Compounded" value={k} onChange={setK} options={[{ value: '1', label: 'Yearly' }, { value: '12', label: 'Monthly' }, { value: '365', label: 'Daily' }]} />
        <Slider label="Years shown" min={5} max={60} step={1} value={years} display={String(years)} onInput={setYears} />
        <Readout cols={2} items={[
          { k: 'exponential ahead from', v: over ? `year ${over}` : '> 200 yrs', strong: true },
          { k: 'doubling time', v: `${doublingTime(g / 100).toFixed(1)} yrs` },
          { k: `linear, year ${years}`, v: money(lin(years)) },
          { k: `exponential, year ${years}`, v: money(ex(years)) },
          { k: 'simple interest instead', v: money(simpleGrowth(P, g / 100, years)) },
          { k: 'yearly-compounding crossover', v: annualOnly ? `year ${annualOnly}` : '—' },
        ]} />
        <ResetButton onClick={() => { setP(D.P); setAdd(D.add); setG(D.g); setYears(D.years); setK(D.k); }} />
      </div>
    </div>
  );
}

/* ---------- 3. Two-plan break-even ---------- */
function BreakEven() {
  const D = { fa: 20, ra: 0.1, fb: 5, rb: 0.25 };
  const [fa, setFa] = useState(D.fa);
  const [ra, setRa] = useState(D.ra);
  const [fb, setFb] = useState(D.fb);
  const [rb, setRb] = useState(D.rb);
  const A: Plan = { fixed: fa, perUnit: ra }, B: Plan = { fixed: fb, perUnit: rb };
  const q = breakEven(A, B);
  const uMax = q !== null && q > 0 ? Math.min(1000, Math.max(50, Math.ceil((q * 2) / 50) * 50)) : 200;
  const yMax = Math.max(planCost(A, uMax), planCost(B, uMax), 1) * 1.1;
  const fr: Frame = { width: 600, height: 320, pad: 46, x: [0, uMax], y: [0, yMax] };
  const { sx, sy } = scales(fr);
  const line = (p: Plan) => `M${sx(0)} ${sy(planCost(p, 0))}L${sx(uMax)} ${sy(planCost(p, uMax))}`;
  const qIn = q !== null && q > 0 && q <= uMax;
  const below = q === null ? (fa < fb ? 'A' : fa > fb ? 'B' : 'either') : q <= 0 ? cheaper(A, B, 1) : cheaper(A, B, q / 2);
  const above = q === null ? below : q <= 0 ? below : cheaper(A, B, q * 2);
  const summary = q === null
    ? `Both plans charge the same per minute, so they never break even; plan ${below} is always cheaper.`
    : q <= 0
      ? `The lines cross at a negative usage, so plan ${below} is cheaper for all usage.`
      : `Plan A: ${money(fa)} plus ${money(ra)} per minute. Plan B: ${money(fb)} plus ${money(rb)} per minute. They cost the same, ${money(planCost(A, q))}, at ${fmt(q, 1)} minutes. Below that plan ${below} is cheaper; above it plan ${above}.`;
  return (
    <div class="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <div>
        <p class="text-ink-2"><strong class="text-ink">Context.</strong> Two monthly phone plans: a higher fixed fee with cheaper minutes, or a lower fee with dearer minutes. Which should you choose?</p>
        <PlotCard title="Monthly cost of two plans" desc={summary} fr={fr} class="mt-4">
          <Axes fr={fr} xLabel="minutes" yLabel="$" xTicks={ticks(0, uMax, 5)} yTicks={ticks(0, yMax, 5)} />
          {qIn && <rect x={sx(0)} y={sy(yMax)} width={sx(q!) - sx(0)} height={sy(0) - sy(yMax)} fill="var(--accent-soft)" opacity="0.6" />}
          <path d={line(A)} stroke="var(--accent)" stroke-width="2.8" />
          <path d={line(B)} stroke="var(--ink-2)" stroke-width="2.4" stroke-dasharray="7 5" />
          <text x={sx(uMax) - 4} y={sy(planCost(A, uMax)) - 8} text-anchor="end" font-size="13" fill="var(--accent)" font-family="var(--font-sans)">Plan A</text>
          <text x={sx(uMax) - 4} y={sy(planCost(B, uMax)) + 18} text-anchor="end" font-size="13" fill="var(--ink-2)" font-family="var(--font-sans)">Plan B</text>
          {qIn && (
            <g>
              <line x1={sx(q!)} x2={sx(q!)} y1={sy(0)} y2={sy(planCost(A, q!))} stroke="var(--ink)" stroke-dasharray="2 3" />
              <circle cx={sx(q!)} cy={sy(planCost(A, q!))} r="6" fill="var(--surface)" stroke="var(--ink)" stroke-width="2.5" />
              <text x={sx(q!) + 10} y={sy(planCost(A, q!)) + 22} font-size="12" fill="var(--ink)" font-family="var(--font-sans)">break-even: {fmt(q!, 1)} min</text>
            </g>
          )}
        </PlotCard>
        <LiveSummary text={summary} />
      </div>
      <div class="space-y-5">
        <div class="grid grid-cols-2 gap-3">
          <Slider label="A: monthly fee" min={0} max={60} step={1} value={fa} display={money(fa)} onInput={setFa} />
          <Slider label="A: per minute" min={0} max={0.5} step={0.01} value={ra} display={money(ra)} onInput={setRa} />
          <Slider label="B: monthly fee" min={0} max={60} step={1} value={fb} display={money(fb)} onInput={setFb} />
          <Slider label="B: per minute" min={0} max={0.5} step={0.01} value={rb} display={money(rb)} onInput={setRb} />
        </div>
        <Readout cols={2} items={[
          { k: 'break-even', v: q === null ? 'never (parallel)' : q <= 0 ? 'none for usage ≥ 0' : `${fmt(q, 1)} min`, strong: true },
          { k: 'cost there', v: q !== null && q > 0 ? money(planCost(A, q)) : '—' },
          { k: 'cheaper below', v: q !== null && q > 0 ? `Plan ${below}` : '—' },
          { k: 'cheaper above', v: q !== null && q > 0 ? `Plan ${above}` : `Plan ${below}` },
        ]} />
        <p class="text-xs leading-relaxed text-ink-3">Solve {fa} + {ra}m = {fb} + {rb}m: the fixed-fee difference divided by the per-minute difference.</p>
        <ResetButton onClick={() => { setFa(D.fa); setRa(D.ra); setFb(D.fb); setRb(D.rb); }} />
      </div>
    </div>
  );
}

export default function Foundations() {
  const [tab, setTab] = useState<Tab>('percent');
  const tabs: { id: Tab; label: string }[] = [
    { id: 'percent', label: 'Percent change' },
    { id: 'growth', label: 'Linear vs exponential' },
    { id: 'breakeven', label: 'Break-even' },
  ];
  const onKey = (e: KeyboardEvent, i: number) => {
    const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const n = tabs[(i + d + tabs.length) % tabs.length];
    setTab(n.id);
    (document.getElementById(`tab-${n.id}`) as HTMLElement | null)?.focus();
  };
  return (
    <div class="card overflow-hidden p-0">
      <div role="tablist" aria-label="Foundations topics" class="flex gap-1 overflow-x-auto border-b border-rule bg-sunken/50 p-2">
        {tabs.map((t, i) => (
          <button key={t.id} id={`tab-${t.id}`} role="tab" type="button" aria-selected={tab === t.id} aria-controls={`panel-${t.id}`} tabIndex={tab === t.id ? 0 : -1}
            onClick={() => setTab(t.id)} onKeyDown={(e) => onKey(e as unknown as KeyboardEvent, i)}
            class={`shrink-0 rounded-full px-4 py-2 text-sm transition-colors ${tab === t.id ? 'bg-accent text-accent-ink' : 'text-ink-2 hover:bg-surface hover:text-ink'}`}>
            {t.label}
          </button>
        ))}
      </div>
      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} class="p-4 sm:p-6">
        {tab === 'percent' ? <Percent /> : tab === 'growth' ? <Growth /> : <BreakEven />}
      </div>
    </div>
  );
}
