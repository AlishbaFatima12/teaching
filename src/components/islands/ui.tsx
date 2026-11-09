/** Small accessible UI kit shared by all Interactive Lab modules. */
import type { ComponentChildren } from 'preact';
import { useId } from 'preact/hooks';
import { scales, ticks, type Frame } from '../../lib/plot';

/* ---------- Slider ---------- */
export function Slider(props: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onInput: (v: number) => void;
  display?: string;
  valueText?: string;
}) {
  const id = useId();
  return (
    <div class="min-w-0">
      <div class="flex items-baseline justify-between gap-3">
        <label for={id} class="text-sm text-ink-2">{props.label}</label>
        <output for={id} class="num text-sm font-medium text-ink">{props.display ?? props.value}</output>
      </div>
      <input
        id={id}
        type="range"
        class="range"
        min={props.min}
        max={props.max}
        step={props.step}
        value={props.value}
        aria-valuetext={props.valueText ?? props.display ?? String(props.value)}
        onInput={(e) => props.onInput(+(e.currentTarget as HTMLInputElement).value)}
      />
    </div>
  );
}

/* ---------- Segmented radio group ---------- */
export function Segmented<T extends string>(props: {
  legend: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  name: string;
}) {
  return (
    <fieldset class="min-w-0">
      <legend class="mb-1.5 text-sm text-ink-2">{props.legend}</legend>
      <div class="flex flex-wrap gap-1.5">
        {props.options.map((o) => (
          <label
            key={o.value}
            class={`cursor-pointer rounded-full border px-3 py-1.5 text-sm transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent ${
              props.value === o.value ? 'border-accent bg-accent text-accent-ink' : 'border-rule-strong bg-surface text-ink-2 hover:border-accent hover:text-accent'
            }`}
          >
            <input
              type="radio"
              class="sr-only"
              name={props.name}
              value={o.value}
              checked={props.value === o.value}
              onChange={() => props.onChange(o.value)}
            />
            {o.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/* ---------- Reset ---------- */
export function ResetButton({ onClick, label = 'Reset' }: { onClick: () => void; label?: string }) {
  return (
    <button type="button" onClick={onClick} class="btn btn-ghost !min-h-9 !px-3.5 !py-1.5 text-sm">
      <svg aria-hidden="true" viewBox="0 0 16 16" class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
        <path d="M2.5 8a5.5 5.5 0 1 0 1.6-3.9M2.5 2.5v3h3" />
      </svg>
      {label}
    </button>
  );
}

/* ---------- Readout (definition list of live values) ---------- */
export function Readout({ items, cols = 3 }: { items: { k: string; v: ComponentChildren; strong?: boolean }[]; cols?: number }) {
  return (
    <dl class={`grid gap-x-4 gap-y-3 ${cols === 4 ? 'grid-cols-2 sm:grid-cols-4' : cols === 2 ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3'}`}>
      {items.map((it) => (
        <div class="min-w-0" key={it.k}>
          <dt class="text-xs text-ink-3">{it.k}</dt>
          <dd class={`num mt-0.5 truncate text-[0.95rem] ${it.strong ? 'font-semibold text-accent' : 'text-ink'}`}>{it.v}</dd>
        </div>
      ))}
    </dl>
  );
}

/* ---------- Axes + grid for SVG plots ---------- */
export function Axes({ fr, xTicks, yTicks, xLabel = 'x', yLabel = 'y', fmtX }: {
  fr: Frame; xTicks?: number[]; yTicks?: number[]; xLabel?: string; yLabel?: string; fmtX?: (v: number) => string;
}) {
  const { sx, sy } = scales(fr);
  const xt = xTicks ?? ticks(fr.x[0], fr.x[1], 8);
  const yt = yTicks ?? ticks(fr.y[0], fr.y[1], 6);
  const x0 = Math.min(Math.max(0, fr.x[0]), fr.x[1]);
  const y0 = Math.min(Math.max(0, fr.y[0]), fr.y[1]);
  const lab = (v: number) => (Math.abs(v) < 1e-12 ? '0' : +v.toFixed(2) + '').replace('-', '−');
  return (
    <g aria-hidden="true" font-family="var(--font-mono)" font-size="11">
      {xt.map((v) => <line key={'gx' + v} x1={sx(v)} x2={sx(v)} y1={sy(fr.y[0])} y2={sy(fr.y[1])} stroke="var(--grid)" stroke-width="1" />)}
      {yt.map((v) => <line key={'gy' + v} x1={sx(fr.x[0])} x2={sx(fr.x[1])} y1={sy(v)} y2={sy(v)} stroke="var(--grid)" stroke-width="1" />)}
      <line x1={sx(fr.x[0])} x2={sx(fr.x[1])} y1={sy(y0)} y2={sy(y0)} stroke="var(--rule-strong)" stroke-width="1.3" />
      <line x1={sx(x0)} x2={sx(x0)} y1={sy(fr.y[0])} y2={sy(fr.y[1])} stroke="var(--rule-strong)" stroke-width="1.3" />
      {xt.filter((v) => Math.abs(v - x0) > 1e-9).map((v) => (
        <text key={'tx' + v} x={sx(v)} y={sy(y0) + 15} text-anchor="middle" fill="var(--ink-3)">{fmtX ? fmtX(v) : lab(v)}</text>
      ))}
      {yt.filter((v) => Math.abs(v - y0) > 1e-9).map((v) => (
        <text key={'ty' + v} x={sx(x0) - 6} y={sy(v) + 4} text-anchor="end" fill="var(--ink-3)">{lab(v)}</text>
      ))}
      <text x={sx(fr.x[1]) - 4} y={sy(y0) - 6} text-anchor="end" fill="var(--ink-3)" font-style="italic" font-family="var(--font-serif)" font-size="14">{xLabel}</text>
      <text x={sx(x0) + 6} y={sy(fr.y[1]) + 12} fill="var(--ink-3)" font-style="italic" font-family="var(--font-serif)" font-size="14">{yLabel}</text>
    </g>
  );
}

/* ---------- Plot card wrapper with accessible description ---------- */
export function PlotCard(props: { title: string; desc: string; fr: Frame; children: ComponentChildren; class?: string }) {
  const id = useId();
  return (
    <figure class={`m-0 ${props.class ?? ''}`}>
      <svg viewBox={`0 0 ${props.fr.width} ${props.fr.height}`} class="block h-auto w-full touch-none select-none" role="img" aria-labelledby={`${id}-t ${id}-d`}>
        <title id={`${id}-t`}>{props.title}</title>
        <desc id={`${id}-d`}>{props.desc}</desc>
        {props.children}
      </svg>
    </figure>
  );
}

/** Live text alternative: announced politely after interaction. */
export function LiveSummary({ text }: { text: string }) {
  return (
    <p class="mt-3 rounded-lg bg-sunken px-3 py-2 text-sm text-ink-2" aria-live="polite">
      <span class="kicker mr-2 !text-[0.65rem]">Graph state</span>{text}
    </p>
  );
}

/** Two-column interactive layout: plot + control panel. */
export function LabLayout({ plot, controls, footer }: { plot: ComponentChildren; controls: ComponentChildren; footer?: ComponentChildren }) {
  return (
    <div class="card overflow-hidden p-0">
      <div class="grid lg:grid-cols-[1.6fr_1fr]">
        <div class="min-w-0 border-b border-rule p-3 sm:p-4 lg:border-b-0 lg:border-r">{plot}</div>
        <div class="min-w-0 space-y-5 bg-sunken/40 p-4 sm:p-5">{controls}</div>
      </div>
      {footer && <div class="border-t border-rule p-4 sm:p-5">{footer}</div>}
    </div>
  );
}
