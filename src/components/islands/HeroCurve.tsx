import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { differenceQuotient } from '../../lib/math/calculus';
import { fnPath, linePath, scales, fmt, type Frame } from '../../lib/plot';

const f = Math.sin;
const df = Math.cos;
const A = 0.9;
const H_MAX = 2.2;
const H_MIN = 0.001;
const FR: Frame = { width: 560, height: 380, pad: 28, x: [-0.4, 3.9], y: [-1.25, 1.55] };

// slider position s ∈ [0, 1] ↔ h on a log scale (so the limit is visible)
const hFromS = (s: number) => H_MAX * (H_MIN / H_MAX) ** s;
const sFromH = (h: number) => Math.log(h / H_MAX) / Math.log(H_MIN / H_MAX);

export default function HeroCurve() {
  const [s, setS] = useState(0.62);
  const [playing, setPlaying] = useState(false);
  const raf = useRef(0);
  const t0 = useRef(0);

  // Autoplay only when motion is welcome.
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setTimeout(() => setPlaying(true), 1500); // start after first paint settles
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!playing) return;
    const PERIOD = 7000; // ms: shrink h, hold, restart
    t0.current = performance.now() - s * PERIOD * 0.8;
    const tick = (now: number) => {
      const t = ((now - t0.current) % PERIOD) / PERIOD;
      setS(Math.min(1, t / 0.8)); // 80% shrinking, 20% holding at the limit
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [playing]);

  const h = hFromS(s);
  const q = differenceQuotient(f, A, h);
  const exact = df(A);
  const { sx, sy } = scales(FR);
  const curve = useMemo(() => fnPath(f, FR.x[0], FR.x[1], FR), []);
  const sec = linePath(q, f(A) - q * A, FR);
  const tan = linePath(exact, f(A) - exact * A, FR);
  const xb = A + h;

  const summary = `Graph of y equals sine x. Secant line through x = ${fmt(A, 2)} and x = ${fmt(xb, 3)}, slope ${fmt(q)}. Tangent slope cos(${fmt(A, 2)}) = ${fmt(exact)}. Difference ${fmt(Math.abs(q - exact))}.`;

  return (
    <figure class="relative m-0">
      <div class="card overflow-hidden p-0">
        <svg viewBox={`0 0 ${FR.width} ${FR.height}`} class="block h-auto w-full" role="img" aria-labelledby="hero-plot-title hero-plot-desc">
          <title id="hero-plot-title">Secant lines approaching the tangent line of sine x</title>
          <desc id="hero-plot-desc">{summary}</desc>
          <defs>
            <pattern id="hero-grid" width="28" height="28" patternUnits="userSpaceOnUse">
              <path d="M28 0H0V28" fill="none" stroke="var(--grid)" stroke-width="1" />
            </pattern>
          </defs>
          <rect width={FR.width} height={FR.height} fill="url(#hero-grid)" />
          {/* axes */}
          <line x1={sx(FR.x[0])} x2={sx(FR.x[1])} y1={sy(0)} y2={sy(0)} stroke="var(--rule-strong)" stroke-width="1.2" />
          <line x1={sx(0)} x2={sx(0)} y1={sy(FR.y[0])} y2={sy(FR.y[1])} stroke="var(--rule-strong)" stroke-width="1.2" />
          {/* tangent (dashed) */}
          <path d={tan} stroke="var(--ink-3)" stroke-width="1.6" stroke-dasharray="6 6" fill="none" />
          {/* curve */}
          <path d={curve} stroke="var(--ink)" stroke-width="2.6" fill="none" stroke-linecap="round" />
          {/* secant */}
          <path d={sec} stroke="var(--accent)" stroke-width="2.4" fill="none" />
          {/* h bracket */}
          <line x1={sx(A)} x2={sx(xb)} y1={sy(FR.y[0]) - 10} y2={sy(FR.y[0]) - 10} stroke="var(--accent)" stroke-width="1.5" />
          <text x={(sx(A) + sx(xb)) / 2} y={sy(FR.y[0]) - 16} text-anchor="middle" font-size="13" fill="var(--accent)" font-family="var(--font-mono)">h</text>
          <line x1={sx(xb)} x2={sx(xb)} y1={sy(f(xb))} y2={sy(FR.y[0]) - 10} stroke="var(--accent)" stroke-width="1" stroke-dasharray="2 4" />
          <line x1={sx(A)} x2={sx(A)} y1={sy(f(A))} y2={sy(FR.y[0]) - 10} stroke="var(--ink-3)" stroke-width="1" stroke-dasharray="2 4" />
          {/* points */}
          <circle cx={sx(xb)} cy={sy(f(xb))} r="5.5" fill="var(--surface)" stroke="var(--accent)" stroke-width="2.5" />
          <circle cx={sx(A)} cy={sy(f(A))} r="6" fill="var(--ink)" />
          <text x={sx(A) - 10} y={sy(f(A)) - 12} text-anchor="end" font-size="14" fill="var(--ink-2)" font-family="var(--font-serif)" font-style="italic">a</text>
        </svg>

        <div class="grid gap-3 border-t border-rule bg-sunken/50 px-4 py-3 sm:grid-cols-[1fr_auto] sm:items-center">
          <dl class="grid grid-cols-3 gap-2 text-xs sm:text-sm">
            <div><dt class="text-ink-3">h</dt><dd class="num text-ink">{h < 0.01 ? h.toExponential(1) : fmt(h, 3)}</dd></div>
            <div><dt class="text-ink-3">secant slope</dt><dd class="num font-semibold text-accent">{fmt(q)}</dd></div>
            <div><dt class="text-ink-3">f′(a) = cos a</dt><dd class="num text-ink">{fmt(exact)}</dd></div>
          </dl>
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            class="btn btn-ghost justify-self-start !min-h-9 !px-3 !py-1.5 text-sm"
            aria-label={playing ? 'Pause animation' : 'Play animation'}
          >
            {playing ? (
              <><svg aria-hidden="true" viewBox="0 0 16 16" class="h-3.5 w-3.5" fill="currentColor"><rect x="3" y="2" width="3.5" height="12" rx="1" /><rect x="9.5" y="2" width="3.5" height="12" rx="1" /></svg>Pause</>
            ) : (
              <><svg aria-hidden="true" viewBox="0 0 16 16" class="h-3.5 w-3.5" fill="currentColor"><path d="M4 2.5v11l9-5.5z" /></svg>Play</>
            )}
          </button>
        </div>
        <div class="px-4 pb-4 pt-1 bg-sunken/50">
          <label for="hero-h" class="text-xs text-ink-3">Shrink h yourself</label>
          <input
            id="hero-h"
            type="range"
            class="range"
            min={0}
            max={1000}
            step={1}
            value={Math.round(s * 1000)}
            aria-valuetext={`h = ${h < 0.01 ? h.toExponential(1) : fmt(h, 3)}, secant slope ${fmt(q)}`}
            onInput={(e) => { setPlaying(false); setS(+(e.currentTarget as HTMLInputElement).value / 1000); }}
          />
        </div>
      </div>
      <p class="sr-only" aria-live="polite">{playing ? '' : summary}</p>
    </figure>
  );
}

export { hFromS, sFromH };
