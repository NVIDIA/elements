import lighthouse from 'lighthouse';
import fs from 'fs';
import { VitePlaywrightRunner, buildPage } from './playwright.js';

const RUNNER_ID = 'lighthouse';
const LIGHTHOUSE_FLAGS = { logLevel: 'error', output: ['json', 'html'] };
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
  #runner = new VitePlaywrightRunner({ runnerID: RUNNER_ID });

  async open() {
    await this.#runner.open();
  }

  async close() {
    await this.#runner.close();
  }

  async getReport(name, content) {
    await buildPage(name, RUNNER_ID, t => t.replace('</body>', `${content}</body>`));
    const runnerResult = await lighthouse(
      `http://localhost:${this.#runner.port}/${name}/index.html`,
      LIGHTHOUSE_FLAGS,
      LIGHTHOUSE_CONFIG
    );
    fs.writeFileSync(`.${RUNNER_ID}/dist/${name}/report.html`, runnerResult.report[1]);

    const report = {
      name,
      payload: getPayload(runnerResult.lhr.audits['network-requests'].details.items),
      scores: {
        performance: runnerResult.lhr.categories.performance.score * 100,
        accessibility: runnerResult.lhr.categories.accessibility.score * 100,
        bestPractices: runnerResult.lhr.categories['best-practices'].score * 100
      }
    };

    fs.writeFileSync(`.${RUNNER_ID}/dist/${name}/report.json`, JSON.stringify(report, null, 2));
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
        name: !r.url.includes('/assets/')
          ? r.url
          : r.url
              .split('/assets/')[1]
              .replace(/-\w+\.css$/, '.css')
              .replace(/-\w+\.js$/, '.js')
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
