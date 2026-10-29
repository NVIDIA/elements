import lighthouse from 'lighthouse';
import fs from 'fs';
import { resolve } from 'path';
import { VitePlaywrightRunner, buildPage } from './playwright.js';
import { withSoftwareWebGPUChromiumArgs } from './utils.js';
import { profilePhase } from './profile.js';
import { LIGHTHOUSE_WORKERS, MAX_LIGHTHOUSE_WORKERS } from './lighthouse-workers.js';

const output = process.env.CI ? ['json'] : ['json', 'html'];
const RUNNER_ID = 'lighthouse';
const LIGHTHOUSE_FLAGS = { logLevel: 'error', output };
const CHROMIUM_ARGS = withSoftwareWebGPUChromiumArgs([
  '--headless',
  '--remote-debugging-port=0',
  '--disable-dev-shm-usage',
  '--disable-extensions',
  '--disable-background-networking',
  '--disable-default-apps',
  '--disable-sync',
  '--disable-translate',
  '--metrics-recording-only',
  '--mute-audio',
  '--no-first-run',
  '--safebrowsing-disable-auto-update'
]);
const LIGHTHOUSE_CONFIG = {
  // https://github.com/GoogleChrome/lighthouse/blob/main/core/config/default-config.js
  extends: 'lighthouse:default',
  settings: {
    onlyCategories: ['performance', 'accessibility', 'best-practices'],
    throttlingMethod: 'simulate',
    throttling: {
      cpuSlowdownMultiplier: 1
    },
    skipAudits: [
      'aria-prohibited-attr' // axe does not support ElementInternals AOM yet https://github.com/dequelabs/axe-core/issues/4259
    ]
  }
};

export class LighthouseRunner {
  #runner;
  #pool = [];
  #chromiumArgs;

  constructor({ chromiumArgs = CHROMIUM_ARGS } = {}) {
    this.#chromiumArgs = chromiumArgs;
    this.#runner = new VitePlaywrightRunner({
      runnerID: RUNNER_ID,
      instanceID: process.env.VITEST_POOL_ID ?? '1',
      chromiumArgs
    });
  }

  async open({ workers = LIGHTHOUSE_WORKERS } = {}) {
    if (!Number.isInteger(workers) || workers < 1 || workers > MAX_LIGHTHOUSE_WORKERS) {
      throw new Error(`Lighthouse requires between 1 and ${MAX_LIGHTHOUSE_WORKERS} workers`);
    }
    // Global setup owns the browsers. Each Vitest worker reads only its own ports.
    // The project-wide browser lock bounds machine-wide audit concurrency.
    this.#pool = Array.from(
      { length: workers },
      (_, index) =>
        new VitePlaywrightRunner({
          runnerID: RUNNER_ID,
          instanceID: String(index + 1),
          chromiumArgs: this.#chromiumArgs
        })
    );
    try {
      for (const runner of this.#pool) {
        await profilePhase('browser-server-setup', () => runner.open());
      }
    } catch (error) {
      try {
        await this.close();
      } catch (cleanupError) {
        throw new AggregateError([error, cleanupError], 'Lighthouse setup and cleanup failed');
      }
      throw error;
    }
  }

  async close() {
    const results = await Promise.allSettled(
      this.#pool.map(runner => profilePhase('report-collection-cleanup', () => runner.close()))
    );
    this.#pool = [];
    const failures = results.filter(result => result.status === 'rejected').map(result => result.reason);
    if (failures.length) throw new AggregateError(failures, 'Failed to close Lighthouse browsers');
  }

  async getReport(name, content) {
    console.log('lighthouse-runner: building test page...');
    await profilePhase(
      'fixture-build',
      () => buildPage(name, RUNNER_ID, t => t.replace('</body>', `${content}</body>`)),
      { name }
    );
    console.log('lighthouse-runner: running tests...');
    const runnerResult = await profilePhase(
      'lighthouse-execution',
      () =>
        lighthouse(
          `http://localhost:${this.#runner.port}/${name}/index.html`,
          { ...LIGHTHOUSE_FLAGS, port: this.#runner.debuggingPort },
          LIGHTHOUSE_CONFIG
        ),
      {
        name,
        worker: process.env.VITEST_POOL_ID ?? '1',
        port: this.#runner.port,
        debuggingPort: this.#runner.debuggingPort
      }
    );

    const networkRequests = runnerResult.lhr.audits['network-requests']?.details?.items;
    if (!networkRequests) {
      throw new Error(`Lighthouse network requests not found ${JSON.stringify(runnerResult, null, 2)}`);
    }

    const report = {
      name,
      payload: getPayload(networkRequests),
      scores: {
        performance: runnerResult.lhr.categories.performance.score * 100,
        accessibility: runnerResult.lhr.categories.accessibility.score * 100,
        bestPractices: runnerResult.lhr.categories['best-practices'].score * 100
      }
    };

    if (report.scores.performance < 100) {
      console.log(
        `lighthouse-runner: performance diagnostics for ${name}`,
        JSON.stringify(
          {
            score: report.scores.performance,
            metrics: runnerResult.lhr.audits.metrics?.details?.items?.[0]
          },
          null,
          2
        )
      );
    }

    const dist = resolve(`.${RUNNER_ID}/dist/${name}/`);

    if (!process.env.CI) {
      fs.writeFileSync(`${dist}/report.html`, runnerResult.report[1]);
    }

    console.log('lighthouse-runner: writing test report...');
    await profilePhase(
      'report-write',
      async () => fs.writeFileSync(`${dist}/report.json`, JSON.stringify(report, null, 2)),
      { name }
    );
    console.log(`lighthouse-runner: test report written to ${dist}/report.json`);
    return report;
  }
}

function round(num) {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

function getPayload(lighthouseRequests) {
  const requests = lighthouseRequests
    .filter(r => r.mimeType === 'text/javascript' || r.mimeType === 'text/css')
    .map(r => {
      return {
        kb: round(r.transferSize / 1000),
        mimeType: r.mimeType,
        name: !r.url.includes('/assets/') ? r.url : r.url.split('/assets/')[1]
      };
    });

  const js = requests.filter(r => r.mimeType === 'text/javascript');
  const css = requests.filter(r => r.mimeType === 'text/css');

  return {
    javascript: {
      kb: round(js.reduce((p, n) => p + n.kb, 0)),
      requests: js.reduce((p, n) => ({ ...p, [n.name]: n }), {})
    },
    css: {
      kb: round(css.reduce((p, n) => p + n.kb, 0)),
      requests: css.reduce((p, n) => ({ ...p, [n.name]: n }), {})
    }
  };
}

export const lighthouseRunner = new LighthouseRunner();
