import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { expect, test, describe, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import lighthouse, { type RunnerResult } from 'lighthouse';
import config from 'lighthouse/core/config/desktop-config.js';
import { preview, type PreviewServer } from 'vite';
import type { Page } from 'playwright';
import { chromium } from 'playwright';
import type { AddressInfo } from 'net';

const viewport = { width: 1728, height: 1117 };
const WRITE_REPORT = false; // set to true to write the last run test report to the .lighthouse directory

interface LighthouseRequest {
  mimeType: string;
  transferSize: number;
  url: string;
}

function round(num: number) {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

function getPayload(lighthouseRequests: LighthouseRequest[]) {
  const requests = lighthouseRequests
    .filter(r => r.mimeType === 'text/javascript' || r.mimeType === 'text/css')
    .map(r => {
      return {
        kb: round(r.transferSize / 1000),
        mimeType: r.mimeType,
        name: !r.url.includes('/assets/')
          ? r.url
          : r.url
              .split('/assets/')[1]
              .replace(/-\w+\.css$/, '.css')
              .replace(/-\w+\.js$/, '.js')
      };
    });

  // value in kb
  return {
    js: requests.filter(r => r.mimeType === 'text/javascript').reduce((p, n) => p + n.kb, 0),
    css: requests.filter(r => r.mimeType === 'text/css').reduce((p, n) => p + n.kb, 0)
  };
}

async function getLighthouseScores(path: string) {
  const customConfig = { ...config };
  customConfig.settings!.screenEmulation!.width = viewport.width;
  customConfig.settings!.screenEmulation!.height = viewport.height;
  const result = await lighthouse(path, { output: ['json', 'html'], logLevel: 'error', port: 9222 }, customConfig) as RunnerResult;

  if (WRITE_REPORT && !existsSync(`.lighthouse`)) {
    mkdirSync(`.lighthouse`);
    writeFileSync(`.lighthouse/report.html`, result.report[1]);
  }

  return {
    performance: (result.lhr.categories.performance.score ?? 0) * 100,
    accessibility: (result.lhr.categories.accessibility.score ?? 0) * 100,
    seo: (result.lhr.categories.seo.score ?? 0) * 100,
    bestPractices: (result.lhr.categories['best-practices']?.score ?? 0) * 100,
    payload: getPayload((result.lhr.audits['network-requests'] as unknown as { details: { items: LighthouseRequest[] } }).details.items)
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
    expect(scores.payload.js).toBeLessThan(410);
    expect(scores.payload.css).toBe(0); // css should be 0 as we inline all css
  });

  test('getting started page', async () => {
    const scores = await getLighthouseScores(`${base}/elements/docs/about/getting-started/`);
    expect(scores.performance).toBeGreaterThanOrEqual(85);
    expect(scores.accessibility).toBeGreaterThanOrEqual(90);
    expect(scores.bestPractices).toBeGreaterThanOrEqual(90);
    expect(scores.seo).toBeGreaterThanOrEqual(90);
    expect(scores.payload.js).toBeLessThan(170);
    expect(scores.payload.css).toBe(0);
  });

  test('minimal template page', async () => {
    const scores = await getLighthouseScores(`${base}/elements/404`);
    expect(scores.performance).toBeGreaterThanOrEqual(90);
    expect(scores.accessibility).toBeGreaterThanOrEqual(90);
    expect(scores.bestPractices).toBeGreaterThanOrEqual(90);
    expect(scores.seo).toBeGreaterThanOrEqual(90);
    expect(scores.payload.js).toBeLessThan(135);
    expect(scores.payload.css).toBe(0);
  });

  test('component docs overview page', async () => {
    const scores = await getLighthouseScores(`${base}/elements/docs/elements/badge/`);
    expect(scores.performance).toBeGreaterThanOrEqual(90);
    expect(scores.accessibility).toBeGreaterThanOrEqual(90);
    expect(scores.bestPractices).toBeGreaterThanOrEqual(90);
    expect(scores.seo).toBeGreaterThanOrEqual(90);
    expect(scores.payload.js).toBeLessThan(200);
    expect(scores.payload.css).toBe(0);
  });

  test('component docs API page', async () => {
    const scores = await getLighthouseScores(`${base}/elements/docs/elements/badge/api/`);
    expect(scores.performance).toBeGreaterThanOrEqual(85);
    expect(scores.accessibility).toBeGreaterThanOrEqual(90);
    expect(scores.bestPractices).toBeGreaterThanOrEqual(90);
    expect(scores.seo).toBeGreaterThanOrEqual(90);
    expect(scores.payload.js).toBeLessThan(185);
    expect(scores.payload.css).toBe(0);
  });

  test('static content docs page', async () => {
    const scores = await getLighthouseScores(`${base}/elements/docs/api-design/`);
    expect(scores.performance).toBeGreaterThanOrEqual(90);
    expect(scores.accessibility).toBeGreaterThanOrEqual(90);
    expect(scores.bestPractices).toBeGreaterThanOrEqual(90);
    expect(scores.seo).toBeGreaterThanOrEqual(90);
    expect(scores.payload.js).toBeLessThan(171);
    expect(scores.payload.css).toBe(0);
  });
});
