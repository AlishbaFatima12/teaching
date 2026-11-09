import { useRef, useState } from 'preact/hooks';

const PYODIDE = 'https://cdn.jsdelivr.net/pyodide/v314.0.7/full/pyodide.mjs';

const DEFAULT_CODE = `import math

def f(x):  return x**2 - 2
def df(x): return 2*x

def bisection(f, a, b, tol=1e-10):
    assert f(a) * f(b) < 0, "need a sign change on [a, b]"
    k = 0
    while (b - a) / 2 > tol:
        k += 1
        m = (a + b) / 2
        if f(a) * f(m) <= 0: b = m
        else:                a = m
    return (a + b) / 2, k

def newton(f, df, x, tol=1e-12, max_iter=30):
    for k in range(1, max_iter + 1):
        d = df(x)
        if d == 0:
            raise ZeroDivisionError(f"f'(x) = 0 at x = {x}: Newton cannot continue")
        x_new = x - f(x) / d
        print(f"  k={k:2d}  x={x_new:.15f}")
        if abs(x_new - x) < tol:
            return x_new, k
        x = x_new
    raise RuntimeError("no convergence")

r, k = bisection(f, 0, 2)
print(f"bisection: {r:.12f} after {k} steps")
print("newton from x0 = 2:")
r, k = newton(f, df, 2.0)
print(f"newton:    {r:.15f} after {k} steps")
print(f"check:     sqrt(2) = {math.sqrt(2):.15f}")
`;

type PyRuntime = { runPythonAsync: (code: string) => Promise<unknown>; setStdout: (o: { batched: (s: string) => void }) => void; setStderr: (o: { batched: (s: string) => void }) => void };

export default function PythonCell() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [out, setOut] = useState('');
  const [state, setState] = useState<'idle' | 'loading' | 'ready' | 'running' | 'error'>('idle');
  const py = useRef<PyRuntime | null>(null);

  const run = async () => {
    try {
      if (!py.current) {
        setState('loading');
        setOut('Loading Python (Pyodide, about 10 MB, first time only)…');
        const mod = await import(/* @vite-ignore */ PYODIDE);
        py.current = await mod.loadPyodide();
      }
      setState('running');
      let buf = '';
      py.current!.setStdout({ batched: (s) => { buf += s + '\n'; } });
      py.current!.setStderr({ batched: (s) => { buf += s + '\n'; } });
      try {
        await py.current!.runPythonAsync(code);
      } catch (e) {
        buf += String((e as Error).message ?? e).split('\n').slice(-3).join('\n');
      }
      setOut(buf || '(no output)');
      setState('ready');
    } catch (e) {
      setState('error');
      setOut('Could not load Python in this browser: ' + String(e));
    }
  };

  return (
    <div class="card overflow-hidden p-0">
      <div class="flex flex-wrap items-center justify-between gap-3 border-b border-rule bg-sunken/50 px-4 py-3">
        <div>
          <p class="text-sm font-medium text-ink">Same algorithms in Python</p>
          <p class="text-xs text-ink-3">Runs entirely in your browser with Pyodide. Nothing is sent anywhere; Python loads only when you press Run.</p>
        </div>
        <div class="flex gap-2">
          <button type="button" class="btn btn-ghost !min-h-9 !px-3 !py-1.5 text-sm" onClick={() => { setCode(DEFAULT_CODE); setOut(''); }}>Reset code</button>
          <button type="button" class="btn btn-primary !min-h-9 !px-4 !py-1.5 text-sm" onClick={run} disabled={state === 'loading' || state === 'running'}>
            {state === 'loading' ? 'Loading Python…' : state === 'running' ? 'Running…' : 'Run in Python'}
          </button>
        </div>
      </div>
      <label class="sr-only" for="py-code">Python code</label>
      <textarea id="py-code" spellcheck={false} value={code} onInput={(e) => setCode((e.currentTarget as HTMLTextAreaElement).value)}
        class="num block h-80 w-full resize-y border-0 bg-surface p-4 text-[0.8rem] leading-relaxed text-ink outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent" />
      <pre class="num m-0 max-h-72 min-h-16 overflow-auto border-t border-rule bg-ink p-4 text-[0.78rem] leading-relaxed text-paper" aria-live="polite" aria-label="Python output">{out || 'Output appears here.'}</pre>
    </div>
  );
}
