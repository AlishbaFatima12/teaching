// Lighthouse (mobile preset, simulated throttling) against a running `astro preview`.
// Usage: node scripts/lighthouse.mjs [baseURL]   → reports/lighthouse/*.html|json + summary.md
import { chromium } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const base = process.argv[2] ?? 'http://127.0.0.1:4322/teaching/';
const pages = ['', 'philosophy/', 'lab/', 'lab/secant-tangent/', 'lab/linear-maps/', 'lab/root-finding/', 'ai-lab/', 'courses/', 'experience/', 'contact/'];
const out = 'reports/lighthouse';
fs.mkdirSync(out, { recursive: true });
const SYSTEM_CHROME = ['C:/Program Files/Google/Chrome/Application/chrome.exe', '/usr/bin/google-chrome', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'].find((p) => fs.existsSync(p));
const chrome = process.env.CHROME_PATH ?? SYSTEM_CHROME ?? chromium.executablePath();
const lhBin = path.join('node_modules', 'lighthouse', 'cli', 'index.js');

const rows = [];
for (const p of pages) {
  const name = p.replace(/\/$/, '').replace(/\//g, '_') || 'home';
  execFileSync(process.execPath, [lhBin, base + p, '--quiet', '--output=json', '--output=html', `--output-path=${out}/${name}`,
    '--only-categories=performance,accessibility,best-practices,seo', '--chrome-flags=--headless=new'],
    { env: { ...process.env, CHROME_PATH: chrome }, stdio: 'inherit' });
  const j = JSON.parse(fs.readFileSync(`${out}/${name}.report.json`, 'utf8'));
  const s = (k) => Math.round(j.categories[k].score * 100);
  rows.push({ page: '/' + p, perf: s('performance'), a11y: s('accessibility'), bp: s('best-practices'), seo: s('seo'),
    lcp: j.audits['largest-contentful-paint'].displayValue, cls: j.audits['cumulative-layout-shift'].displayValue, tbt: j.audits['total-blocking-time'].displayValue });
  console.log(rows.at(-1));
}
const md = ['# Lighthouse report (mobile)', '', `Run: ${new Date().toISOString()} · Lighthouse ${JSON.parse(fs.readFileSync('node_modules/lighthouse/package.json', 'utf8')).version} · mobile preset, simulated throttling · production build`, '',
  '| Page | Performance | Accessibility | Best Practices | SEO | LCP | CLS | TBT |', '|---|---|---|---|---|---|---|---|',
  ...rows.map((r) => `| ${r.page} | ${r.perf} | ${r.a11y} | ${r.bp} | ${r.seo} | ${r.lcp} | ${r.cls} | ${r.tbt} |`)].join('\n');
fs.writeFileSync(`${out}/summary.md`, md + '\n');
console.log('\n' + md);
