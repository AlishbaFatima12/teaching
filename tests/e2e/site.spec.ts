import { test, expect, type Page } from '@playwright/test';

const PAGES = [
  '', 'philosophy/', 'lab/', 'ai-lab/', 'courses/', 'experience/', 'contact/',
  'lab/secant-tangent/', 'lab/riemann-sums/', 'lab/taylor/', 'lab/linear-maps/', 'lab/root-finding/', 'lab/foundations/',
];

function trackErrors(page: Page) {
  const errors: string[] = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('requestfailed', (r) => errors.push(`request failed: ${r.url()}`));
  page.on('response', (r) => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });
  return errors;
}

for (const p of PAGES) {
  test(`/${p} loads with no console errors, one h1, no horizontal scroll`, async ({ page }) => {
    const errors = trackErrors(page);
    const res = await page.goto(p, { waitUntil: 'networkidle' });
    expect(res?.status()).toBe(200);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('main#main')).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
    // footer statement required by the brief
    await expect(page.locator('footer')).toContainText('built with the help of an AI coding assistant; every result was checked for mathematical accuracy');
    expect(errors).toEqual([]);
  });
}

test('every internal link resolves', async ({ page, request }) => {
  const seen = new Set<string>();
  for (const p of PAGES) {
    await page.goto(p);
    const hrefs = await page.$$eval('a[href]', (as) => as.map((a) => (a as HTMLAnchorElement).href));
    for (const h of hrefs) if (h.includes('/teaching/') && !h.includes('#')) seen.add(h);
  }
  for (const h of seen) expect((await request.get(h)).status(), h).toBe(200);
});

test('theme toggle switches to dark and persists across pages', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('');
  await expect(page.locator('html')).not.toHaveClass(/dark/);
  await page.getByRole('button', { name: 'Switch to dark theme' }).click();
  await expect(page.locator('html')).toHaveClass(/dark/);
  await page.goto('philosophy/');
  await expect(page.locator('html')).toHaveClass(/dark/);
  await expect(page.getByRole('button', { name: 'Switch to light theme' })).toBeVisible();
});

test('respects prefers-color-scheme: dark', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('');
  await expect(page.locator('html')).toHaveClass(/dark/);
});

test('mobile menu opens and closes with Escape', async ({ page }, info) => {
  test.skip(info.project.name !== 'mobile', 'mobile only');
  await page.goto('');
  const btn = page.getByRole('button', { name: 'Open menu' });
  await btn.click();
  await expect(page.locator('#mobile-nav')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Close menu' })).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Escape');
  await expect(page.locator('#mobile-nav')).toBeHidden();
});

test('home hero: h slider changes the secant slope', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await hydrated(page, '');
  const slider = page.locator('#hero-h');
  await slider.waitFor();
  const before = await slider.getAttribute('aria-valuetext');
  await slider.focus();
  for (let i = 0; i < 40; i++) await page.keyboard.press('ArrowLeft');
  await expect.poll(() => slider.getAttribute('aria-valuetext')).not.toBe(before);
});

/** Scroll the first island into view and wait until Astro has hydrated it. */
async function hydrated(page: Page, path: string) {
  await page.goto(path);
  const island = page.locator('astro-island').first();
  await island.scrollIntoViewIfNeeded();
  await expect(island).not.toHaveAttribute('ssr', /.*/, { timeout: 15_000 });
}

const readout = (page: Page, label: string) => page.locator('dt', { hasText: label }).first().locator('xpath=following-sibling::dd[1]');

test('A secant→tangent: shrinking h moves the secant slope to f′(a)', async ({ page }) => {
  await hydrated(page, 'lab/secant-tangent/');
  const s = page.getByLabel('Shrink h (log scale)');
  await s.waitFor();
  await s.fill('1');
  await expect(readout(page, 'secant slope')).toHaveText('2.0001');
  await expect(page.getByText('Graph state').first().locator('..')).toContainText('derivative f′(a) = 2.0000');
  await page.getByRole('button', { name: 'Reset' }).click();
  await expect(readout(page, 'secant slope')).not.toHaveText('2.0001');
});

test('B Riemann: keyboard on n slider changes the sum; exact value is 8/3', async ({ page }) => {
  await hydrated(page, 'lab/riemann-sums/');
  const n = page.getByLabel('Number of subintervals n');
  await n.waitFor();
  await expect(readout(page, 'exact (FTC)')).toHaveText('2.666667');
  const before = await readout(page, 'S_6').textContent();
  await n.focus();
  await page.keyboard.press('ArrowRight');
  await expect(readout(page, 'S_7')).not.toHaveText(before!);
  await page.locator('label').filter({ hasText: /^Midpoint$/ }).click();
  await expect(page.getByRole('radio', { name: 'Midpoint' })).toBeChecked();
  await expect(page.getByText('Graph state').first().locator('..')).toContainText('Midpoint sum with n = 7');
});

test('C Taylor: higher degree widens the trusted interval', async ({ page }) => {
  await hydrated(page, 'lab/taylor/');
  const deg = page.getByLabel('Degree n');
  await deg.waitFor();
  const before = await readout(page, 'trusted on').textContent();
  await deg.fill('9');
  await expect(readout(page, 'trusted on')).not.toHaveText(before!);
  await expect(page.locator('p.num', { hasText: 'x − x³/6' })).toContainText('x⁹/362880');
});

test('D linear maps: presets change the determinant and eigenvalues', async ({ page }) => {
  await hydrated(page, 'lab/linear-maps/');
  await page.getByRole('button', { name: 'Reflect' }).click();
  await expect(readout(page, 'det A (signed area)')).toHaveText('-1.00');
  await expect(readout(page, 'orientation')).toHaveText('reversed');
  await page.getByRole('button', { name: 'Rotate 60°' }).click();
  await expect(readout(page, 'eigenvalues')).toContainText('complex');
  // keyboard drag of a basis-vector handle
  await page.getByRole('button', { name: 'Reset' }).click();
  const h = page.getByRole('button', { name: /Image of e1/ });
  await h.focus();
  await page.keyboard.press('ArrowRight');
  await expect(readout(page, 'det A (signed area)')).toHaveText('3.20');
});

test('E root-finding: Newton cycling and zero-derivative failures are reported', async ({ page }) => {
  await hydrated(page, 'lab/root-finding/');
  const sel = page.getByLabel('Problem');
  await sel.waitFor();
  await expect(page.locator('li').filter({ has: page.locator('strong', { hasText: 'Newton:' }) })).toContainText('converged in 6 steps');
  await sel.selectOption('flat');
  await expect(page.locator('li').filter({ has: page.locator('strong', { hasText: 'Newton:' }) })).toContainText('cycle');
  await sel.selectOption('zero-d');
  await expect(page.locator('li').filter({ has: page.locator('strong', { hasText: 'Newton:' }) })).toContainText('f′(x) = 0');
  await expect(page.getByRole('button', { name: 'Run in Python' })).toBeVisible();
});

test('F foundations: percent tab, tab keyboard navigation, break-even', async ({ page }) => {
  await hydrated(page, 'lab/foundations/');
  await expect(readout(page, 'actual net change')).toHaveText('−4.00%');
  const tab = page.getByRole('tab', { name: 'Percent change' });
  await tab.focus();
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('tab', { name: 'Break-even' })).toHaveAttribute('aria-selected', 'true');
  await expect(readout(page, 'break-even')).toHaveText('100.0 min');
});

test('AI lab: 17 items, filters, hint and reveal', async ({ page }) => {
  await page.goto('ai-lab/');
  await expect(page.locator('#item-list > li')).toHaveCount(17);
  await page.locator('#filters').getByRole('button', { name: 'Linear algebra' }).click();
  await expect(page.locator('#count')).toHaveText('Showing 3 of 17');
  await page.locator('#filters').getByRole('button', { name: 'Stretch' }).click();
  await expect(page.locator('#count')).toHaveText('Showing 1 of 17');
  const item = page.locator('#la-cancel');
  await item.getByText('Reveal the correction').click();
  await expect(item.getByText('How to catch this:')).toBeVisible();
  await expect(page.locator('#finding')).toContainText('17%');
});

test('PDF links appear only when the files exist', async ({ page, request }) => {
  await page.goto('courses/');
  const links = await page.$$eval('a[href*="/docs/"]', (as) => as.map((a) => (a as HTMLAnchorElement).href));
  for (const l of links) expect((await request.get(l)).status()).toBe(200);
});
