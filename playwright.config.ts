import { defineConfig, devices } from '@playwright/test';

const PORT = 4322;
export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'reports/playwright' }]],
  use: { baseURL: `http://127.0.0.1:${PORT}/teaching/` },
  webServer: {
    command: `npx astro preview --port ${PORT} --host 127.0.0.1`,
    url: `http://127.0.0.1:${PORT}/teaching/`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 860 } } },
    { name: 'mobile', use: { ...devices['Desktop Chrome'], viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true } },
  ],
});
