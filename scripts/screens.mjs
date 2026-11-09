// Full-page screenshots of each page at 390 px and 1280 px, light and dark.
// Usage: node scripts/screens.mjs [baseURL] [outDir] [paths...]
import { chromium } from '@playwright/test';
import fs from 'node:fs';

const base = process.argv[2] ?? 'http://127.0.0.1:4321/teaching/';
const out = process.argv[3] ?? 'screenshots';
const paths = process.argv.slice(4).length ? process.argv.slice(4) : [''];
fs.mkdirSync(out, { recursive: true });

const browser = await chromium.launch();
const errors = [];
for (const scheme of ['light', 'dark']) {
  for (const width of [390, 1280]) {
    const ctx = await browser.newContext({ viewport: { width, height: width < 600 ? 844 : 860 }, colorScheme: scheme, reducedMotion: 'reduce', deviceScaleFactor: width < 600 ? 2 : 1 });
    const page = await ctx.newPage();
    page.on('console', (m) => { if (m.type() === 'error') errors.push(`${m.text()}`); });
    page.on('pageerror', (e) => errors.push(String(e)));
    for (const p of paths) {
      await page.goto(base + p, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);
      const sw = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      if (sw > 0) errors.push(`horizontal overflow ${sw}px on /${p} at ${width}`);
      const name = (p.replace(/\/$/, '').replace(/\//g, '_') || 'home') + `-${width}-${scheme}.png`;
      await page.screenshot({ path: `${out}/${name}`, fullPage: true });
      console.log('saved', name);
    }
    await ctx.close();
  }
}
await browser.close();
console.log(errors.length ? 'ISSUES:\n' + errors.join('\n') : 'No console errors, no horizontal overflow.');
