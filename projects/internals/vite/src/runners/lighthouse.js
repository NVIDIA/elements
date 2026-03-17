import lighthouse from 'lighthouse';
import fs from 'fs';
import { resolve } from 'path';
import { VitePlaywrightRunner, buildPage } from './playwright.js';

const output = process.env.CI ? ['json'] : ['json', 'html'];
const RUNNER_ID = 'lighthouse';
const LIGHTHOUSE_FLAGS = { logLevel: 'error', output };
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
  #runner = new VitePlaywrightRunner({
    runnerID: RUNNER_ID,
    chromiumArgs: [
      '--headless',
      '--remote-debugging-port=9222',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-extensions',
      '--disable-background-networking',
      '--disable-default-apps',
      '--disable-sync',
      '--disable-translate',
      '--metrics-recording-only',
      '--mute-audio',
      '--no-first-run',
      '--safebrowsing-disable-auto-update'
    ]
  });

  async open() {
    await this.#runner.open();
  }

  async close() {
    await this.#runner.close();
  }

  async getReport(name, content) {
    console.log('lighthouse-runner: building test page...');
    await buildPage(name, RUNNER_ID, t => t.replace('</body>', `${content}</body>`));
    console.log('lighthouse-runner: running tests...');
    const runnerResult = await lighthouse(
      `http://localhost:${this.#runner.port}/${name}/index.html`,
      LIGHTHOUSE_FLAGS,
      LIGHTHOUSE_CONFIG
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

    const dist = resolve(`.${RUNNER_ID}/dist/${name}/`);

    if (!process.env.CI) {
      fs.writeFileSync(`${dist}/report.html`, runnerResult.report[1]);
    }

    console.log('lighthouse-runner: writing test report...');
    fs.writeFileSync(`${dist}/report.json`, JSON.stringify(report, null, 2));
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
