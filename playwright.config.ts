import { defineConfig, devices } from '@playwright/test';

/**
 * The bundled Chromium download is blocked in some networks (e.g. the campus
 * proxy). Set PLAYWRIGHT_CHANNEL=chrome to drive the locally installed Google
 * Chrome instead. In a normal environment leave it unset and run
 * `npx playwright install chromium`.
 */
const channel = process.env.PLAYWRIGHT_CHANNEL;

const UI_BASE_URL = 'https://practicesoftwaretesting.com';
const API_BASE_URL = 'https://api.practicesoftwaretesting.com';

export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 1,
  workers: process.env.CI ? 2 : 3,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }],
  ],
  use: {
    headless: true,
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
    testIdAttribute: 'data-test',
  },
  projects: [
    {
      name: 'ui-chromium',
      testIgnore: /.*-api\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        ...(channel ? { channel } : {}),
        baseURL: UI_BASE_URL,
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: 'api',
      testMatch: /.*-api\.spec\.ts/,
      use: {
        baseURL: API_BASE_URL,
      },
    },
  ],
});
