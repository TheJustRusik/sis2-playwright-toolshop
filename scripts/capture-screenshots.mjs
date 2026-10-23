/**
 * Captures the evidence screenshots used in the submission:
 *  - report-overview.png    (Playwright HTML report, all suites)
 *  - report-test-detail.png (one checkout test with its attachment)
 *  - ai-session.png         (rendered AI session excerpt)
 *
 * Usage: PLAYWRIGHT_CHANNEL=chrome node scripts/capture-screenshots.mjs
 */
import { chromium } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const root = process.cwd();
const browser = await chromium.launch({
  channel: process.env.PLAYWRIGHT_CHANNEL || undefined,
  headless: true,
});

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });

  await page.goto(pathToFileURL(path.join(root, 'playwright-report/index.html')).href);
  await page.getByText('Passed', { exact: false }).first().waitFor({ timeout: 15_000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'screenshots/report-overview.png', fullPage: true });

  await page.getByText('TC-CHK-01', { exact: false }).first().click();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'screenshots/report-test-detail.png', fullPage: true });

  await page.goto(pathToFileURL(path.join(root, 'screenshots/ai-session.html')).href);
  await page.waitForTimeout(800);
  await page.screenshot({ path: 'screenshots/ai-session.png', fullPage: true });

  console.log('Captured report-overview.png, report-test-detail.png, ai-session.png');
} finally {
  await browser.close();
}
