import lighthouse from 'lighthouse';
import { chromium } from 'playwright';
import { preview, build } from 'vite';
import virtualHtml from 'vite-plugin-virtual-html';
import fs from 'fs';
import path from 'path';
import { globSync } from 'glob';

process.env.NODE_ENV = 'production';

const resolve = rel => path.resolve(process.cwd(), rel);

const ROOT_DIR = '.lighthouse';
const DIST_DIR = `${ROOT_DIR}/dist`;
const CUSTOM_CONFIG_PATH = resolve('./vitest.lighthouse.build.ts');
const HAS_CUSTOM_BUILD_CONFIG = fs.existsSync(CUSTOM_CONFIG_PATH);

export class LighthouseRunner {
  #server;
  #browser;
  #port = 4176;
  #report = {};

  async open() {
    if (!fs.existsSync(DIST_DIR)) {
      fs.mkdirSync(ROOT_DIR);
      fs.mkdirSync(DIST_DIR);
    }

    console.log('Starting Chromium...');
    this.#browser = await chromium.launch({
      args: ['--headless', '--remote-debugging-port=9222']
    });

    console.log('Starting Vite Server...');
    this.#server = await preview({
      root: ROOT_DIR,
      preview: { port: this.#port, open: false }
    });

    this.#port = this.#server.httpServer.address().port;
    console.log(`Vite Server running at port ${this.#port}`);
  }

  async close() {
    if (!fs.existsSync(DIST_DIR)) {
      fs.mkdirSync(ROOT_DIR);
      fs.mkdirSync(DIST_DIR);
    }

    const report = globSync(resolve(`${DIST_DIR}/**/report.json`)).reduce((p, n) => {
      const file = JSON.parse(fs.readFileSync(n));
      return { ...p, [file.name]: file };
    }, {});

    fs.writeFileSync(`${ROOT_DIR}/report.json`, JSON.stringify(report, null, 2));
    console.log(`Lighthouse report written to ${ROOT_DIR}/report.json`);

    console.log('Stopping Chromium...');
    console.log('Stopping Vite Server...');
    this.#server.close();
    await this.#browser.close();
  }

  async getReport(name, content) {
    await this.#buildPage(name, content);
    const flags = { logLevel: 'error', output: ['json', 'html'] };

    // https://github.com/GoogleChrome/lighthouse/blob/main/core/config/default-config.js
    const config = {
      extends: 'lighthouse:default',
      settings: {
        onlyCategories: ['performance', 'accessibility', 'best-practices'],
        throttlingMethod: 'simulate',
        throttling: {
          cpuSlowdownMultiplier: 1
        }
      }
    };

    const runnerResult = await lighthouse(`http://localhost:${this.#port}/${name}/index.html`, flags, config);
    fs.writeFileSync(`${DIST_DIR}/${name}/report.html`, runnerResult.report[1]);

    const scores = {
      performance: runnerResult.lhr.categories.performance.score * 100,
      accessibility: runnerResult.lhr.categories.accessibility.score * 100,
      bestPractices: runnerResult.lhr.categories['best-practices'].score * 100
    };

    const requests = runnerResult.lhr.audits['network-requests'].details.items;
    const payload = {
      javascript: {
        kb:
          requests
            .filter(r => r.mimeType === 'text/javascript')
            .map(r => r.transferSize)
            .reduce((p, n) => p + n, 0) / 1000,
        requests: requests
          .filter(r => r.mimeType === 'text/javascript')
          .reduce((p, r) => {
            const name = r.url.split('/assets/')[1].replace(/-\w+\.js$/, '.js');
            return {
              ...p,
              [name]: {
                kb: r.transferSize / 1000,
                name
              }
            };
          }, {})
      },
      css: {
        kb:
          requests
            .filter(r => r.mimeType === 'text/css')
            .map(r => r.transferSize)
            .reduce((p, n) => p + n, 0) / 1000,
        requests: requests
          .filter(r => r.mimeType === 'text/css')
          .reduce((p, r) => {
            const name = r.url.split('/assets/')[1].replace(/-\w+\.css$/, '.css');
            return {
              ...p,
              [name]: {
                kb: r.transferSize / 1000,
                name
              }
            };
          }, {})
      }
    };

    this.#report[name] = {
      name,
      scores,
      payload
    };

    fs.writeFileSync(`${DIST_DIR}/${name}/report.json`, JSON.stringify(this.#report[name], null, 2));

    return this.#report[name];
  }

  #buildPage(name, content) {
    const hasCustomStyleLinks = [...content.matchAll('<link')].length;

    return build({
      configFile: HAS_CUSTOM_BUILD_CONFIG ? resolve('./vitest.lighthouse.build.ts') : false,
      logLevel: 'error',
      base: `/${name}`,
      build: {
        target: 'esnext',
        sourcemap: true,
        cssCodeSplit: !hasCustomStyleLinks,
        outDir: `${DIST_DIR}/${name}`,
        rollupOptions: {
          output: {
            entryFileNames: `assets/[name].js`,
            chunkFileNames: `assets/[name].js`,
            assetFileNames: assetInfo => {
              return `assets/${assetInfo.name}`;
            }
          }
        }
      },
      plugins: [
        virtualHtml({
          pages: {
            index: {
              template: `/vitest.lighthouse.html`,
              render(template) {
                return template.replace('</body>', `${content}</body>`);
              }
            }
          }
        })
      ]
    });
  }
}

export const lighthouseRunner = new LighthouseRunner();
