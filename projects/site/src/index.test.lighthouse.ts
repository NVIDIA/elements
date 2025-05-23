import { expect, test, describe, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import lighthouse, { type RunnerResult } from 'lighthouse';
import config from 'lighthouse/core/config/desktop-config.js';
import { preview, type PreviewServer } from 'vite';
import type { Page } from 'playwright';
import { chromium } from 'playwright';
import type { AddressInfo } from 'net';

const viewport = { width: 1728, height: 1117 };

async function getLighthouseScores(path: string) {
  const customConfig = { ...config };
  customConfig.settings!.screenEmulation!.width = viewport.width;
  customConfig.settings!.screenEmulation!.height = viewport.height;
  const result = await lighthouse(path, { logLevel: 'error', port: 9222 }, customConfig) as RunnerResult;
  return {
    performance: (result.lhr.categories.performance.score ?? 0) * 100,
    accessibility: (result.lhr.categories.accessibility.score ?? 0) * 100,
    seo: (result.lhr.categories.seo.score ?? 0) * 100,
    bestPractices: (result.lhr.categories['best-practices']?.score ?? 0) * 100
  }
}

/**
 * This runs a suite of tests on a subset of pages. Lighthouse tests are expensive.
 * We run against key common layout page types to help catch issues that would most
 * likely be present on other pages.
 */
describe.sequential('lighthouse', () => {
  let server: PreviewServer;
  let page: Page;
  let base: string;

  beforeAll(async () => {
    server = await preview({ base: '/elements/' });
    const address = server.httpServer.address() as AddressInfo;
    const browser = await chromium.launch({ args: ['--remote-debugging-port=9222'], headless: true });
    page = await (await browser.newContext({ viewport })).newPage();
    base = `http://localhost:${address.port}`;
  });

  beforeEach(async () => {
    await page.waitForLoadState('networkidle');
  });

  afterEach(async () => {
    await page.waitForLoadState('networkidle');
  });

  afterAll(async () => {
    await server.close();
  });

  test('landing page', async () => {
    const scores = await getLighthouseScores(`${base}/elements/`);
    expect(scores.performance).toBeGreaterThanOrEqual(85);
    expect(scores.accessibility).toBeGreaterThanOrEqual(90);
    expect(scores.bestPractices).toBeGreaterThanOrEqual(90);
    expect(scores.seo).toBeGreaterThanOrEqual(90);
  });

  test('getting started page', async () => {
    const scores = await getLighthouseScores(`${base}/elements/docs/about/getting-started/`);
    expect(scores.performance).toBeGreaterThanOrEqual(90);
    expect(scores.accessibility).toBeGreaterThanOrEqual(90);
    expect(scores.bestPractices).toBeGreaterThanOrEqual(90);
    expect(scores.seo).toBeGreaterThanOrEqual(90);
  });

  test('minimal template page', async () => {
    const scores = await getLighthouseScores(`${base}/elements/404`);
    expect(scores.performance).toBeGreaterThanOrEqual(90);
    expect(scores.accessibility).toBeGreaterThanOrEqual(90);
    expect(scores.bestPractices).toBeGreaterThanOrEqual(90);
    expect(scores.seo).toBeGreaterThanOrEqual(90);
  });

  test('component docs page', async () => {
    const scores = await getLighthouseScores(`${base}/elements/docs/elements/badge/`);
    expect(scores.performance).toBeGreaterThanOrEqual(90);
    expect(scores.accessibility).toBeGreaterThanOrEqual(90);
    expect(scores.bestPractices).toBeGreaterThanOrEqual(90);
    expect(scores.seo).toBeGreaterThanOrEqual(90);
  });

  test('static content docs page', async () => {
    const scores = await getLighthouseScores(`${base}/elements/docs/api-design/`);
    expect(scores.performance).toBeGreaterThanOrEqual(90);
    expect(scores.accessibility).toBeGreaterThanOrEqual(90);
    expect(scores.bestPractices).toBeGreaterThanOrEqual(90);
    expect(scores.seo).toBeGreaterThanOrEqual(90);
  });
});
