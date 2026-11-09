// Renders the 1200×630 Open Graph image to public/og.png. Run: node scripts/og.mjs
import { chromium } from '@playwright/test';
import fs from 'node:fs';

const font = (p) => `data:font/woff2;base64,${fs.readFileSync(p).toString('base64')}`;
const serif = font('node_modules/@fontsource/newsreader/files/newsreader-latin-400-normal.woff2');
const sans = font('node_modules/@fontsource/inter-tight/files/inter-tight-latin-500-normal.woff2');

// Real geometry: y = sin x, a = 0.9, h = 0.9; secant through both points, tangent slope cos a.
const W = 420, H = 380, P = 30, X = [-0.4, 3.9], Y = [-1.25, 1.55];
const sx = (x) => P + ((x - X[0]) / (X[1] - X[0])) * (W - 2 * P);
const sy = (y) => H - P - ((y - Y[0]) / (Y[1] - Y[0])) * (H - 2 * P);
const a = 0.9, h = 0.9, f = Math.sin;
const curve = Array.from({ length: 200 }, (_, i) => X[0] + ((X[1] - X[0]) * i) / 199).map((x, i) => `${i ? 'L' : 'M'}${sx(x).toFixed(1)} ${sy(f(x)).toFixed(1)}`).join('');
const line = (m) => { const b = f(a) - m * a; return `M${sx(X[0])} ${sy(m * X[0] + b)}L${sx(X[1])} ${sy(m * X[1] + b)}`; };
const q = (f(a + h) - f(a)) / h;
const plot = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs><clipPath id="c"><rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="22"/></clipPath></defs>
<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="22" fill="#fff" stroke="#e3e0d6" stroke-width="2"/>
<g clip-path="url(#c)"><line x1="${sx(X[0])}" x2="${sx(X[1])}" y1="${sy(0)}" y2="${sy(0)}" stroke="#cfcbbf" stroke-width="2"/>
<line x1="${sx(0)}" x2="${sx(0)}" y1="${sy(Y[0])}" y2="${sy(Y[1])}" stroke="#cfcbbf" stroke-width="2"/>
<path d="${line(Math.cos(a))}" stroke="#62656e" stroke-width="3" stroke-dasharray="10 9" fill="none"/>
<path d="${curve}" stroke="#16171d" stroke-width="5" fill="none" stroke-linecap="round"/>
<path d="${line(q)}" stroke="#3b37a8" stroke-width="4" fill="none"/>
<circle cx="${sx(a + h)}" cy="${sy(f(a + h))}" r="10" fill="#fff" stroke="#3b37a8" stroke-width="5"/>
<circle cx="${sx(a)}" cy="${sy(f(a))}" r="11" fill="#16171d"/></g></svg>`;

const html = `<!doctype html><html><head><style>
@font-face{font-family:S;src:url(${serif})}
@font-face{font-family:I;src:url(${sans})}
*{margin:0;box-sizing:border-box}
body{width:1200px;height:630px;background:#fbfaf6;font-family:I;color:#16171d;position:relative;overflow:hidden;
background-image:linear-gradient(rgba(22,23,29,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(22,23,29,.06) 1px,transparent 1px);background-size:36px 36px}
.wrap{position:absolute;left:84px;top:86px;width:640px}
.k{font-size:20px;letter-spacing:.18em;text-transform:uppercase;color:#62656e}
h1{font-family:S;font-weight:400;font-size:84px;line-height:1.02;margin-top:26px;letter-spacing:-.01em}
.r{font-family:S;font-style:italic;color:#3b37a8;font-size:36px;margin-top:22px}
.chips{display:flex;gap:14px;margin-top:26px}
.c{display:flex;align-items:center;gap:12px;border:1.5px solid #cfcbbf;background:#fff;border-radius:999px;padding:7px 22px 7px 7px;font-size:24px;font-weight:500}
.g{width:44px;height:44px;border-radius:50%;background:#3b37a8;color:#fff;font-family:S;font-style:italic;font-size:26px;display:grid;place-items:center}
svg{position:absolute;right:50px;top:110px}
.u{position:absolute;left:84px;bottom:56px;font-size:22px;color:#44474f}
</style></head><body>
<div class="wrap"><p class="k">Teaching portfolio · Mathematics</p><h1>Syeda Alishba Fatima</h1>
<p class="r">Mathematics Educator</p>
<div class="chips"><span class="c"><span class="g">∫</span>Calculus</span><span class="c"><span class="g">ε</span>Analysis</span><span class="c"><span class="g">λ</span>Algebra</span></div></div>
${plot}
<p class="u">Interactive Lab · AI Verification Lab · alishbafatima12.github.io/teaching</p>
</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(html);
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: 'public/og.png' });
await browser.close();
console.log('public/og.png written');
