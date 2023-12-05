import lighthouse, { Flags } from 'lighthouse';
import { Browser, chromium } from 'playwright';
import { preview, build, PreviewServer } from 'vite';
import virtualHtml from 'vite-plugin-virtual-html';
import fs from 'fs';
import path from 'path';
import glob from 'glob';

const resolve = (rel) => path.resolve(process.cwd(), rel);

export class LighthouseRunner {
  #server: PreviewServer;
  #browser: Browser;
  #port = 4173;
  #report = { };

  async open() {
    this.#browser = await chromium.launch({ args: ['--headless', '--remote-debugging-port=9222'] });
    this.#server = await preview({
      root: './.lighthouse',
      preview: { port: this.#port, open: false }
    });
  }

  async close() {
    this.#server.httpServer.close();
    await this.#browser.close();

    const dist = '.lighthouse/dist';
    if (!fs.existsSync(dist)) {
      fs.mkdirSync(dist);
    }

    const report = glob.sync(resolve('.lighthouse/dist/**/report.json')).reduce((p, n) => {
      const file = JSON.parse(fs.readFileSync(n));
      return { ...p, [file.name]: file };
    }, { });

    fs.writeFileSync(`${dist}/report.json`, JSON.stringify(report, null, 2));
  }

  async getReport(name: string, content: string) {
    await this.#buildPage(name, content);
    const flags: Flags = { logLevel: 'error', output: ['json', 'html'] };
    const config = {
      extends: 'lighthouse:default',
      settings: {
        onlyCategories: ['performance', 'accessibility', 'best-practices'],
        throttlingMethod: 'simulate',
        throttling: {
          cpuSlowdownMultiplier: 1
        },
      },
    };

    const runnerResult = await lighthouse(`http://localhost:${this.#port}/${name}`, flags, config as any) as any;

    fs.writeFileSync(`.lighthouse/dist/${name}/report.html`, runnerResult.report[1]);

    const scores = {
      performance: runnerResult.lhr.categories.performance.score * 100,
      accessibility: runnerResult.lhr.categories.accessibility.score * 100,
      bestPractices: runnerResult.lhr.categories['best-practices'].score * 100
    };
    
    const requests = (runnerResult.lhr.audits['network-requests'].details as any).items;
    const payload = {
      javascript: {
        kb: requests.filter(r => r.mimeType === 'application/javascript').map(r => r.transferSize).reduce((p, n) => p + n, 0) / 1000,
        requests: requests
          .filter(r => r.mimeType === 'application/javascript')
          .reduce((p, r) => {
            const name = r.url.split('/assets/')[1].replace(/-\w+\.js$/, '.js');
            return {
              ...p,
              [name]: {
                kb: r.transferSize / 1000,
                name
              }
            }
          }, { })
      },
      css: {
        kb: requests.filter(r => r.mimeType === 'text/css').map(r => r.transferSize).reduce((p, n) => p + n, 0) / 1000,
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
            }
          }, { })
      }
    };

    this.#report[name] = {
      name,
      scores,
      payload
    };

    fs.writeFileSync(`./.lighthouse/dist/${name}/report.json`, JSON.stringify(this.#report[name], null, 2));

    return this.#report[name];
  }

  #buildPage(name: string, content: string) {
    const hasCustomStyleLinks = [...content.matchAll('<link')].length;

    return build({
      configFile: false,
      logLevel: 'error',
      base: `/${name}`,
      build: {
        target: 'esnext',
        sourcemap: true,
        cssCodeSplit: !hasCustomStyleLinks,
        outDir: `.lighthouse/dist/${name}`
      },
      resolve: {
        alias: {
          '@elements/elements': resolve('./dist')
        }
      },
      plugins: [virtualHtml({
        pages: {
          index: {
            template: 'lighthouse/index.html',
            render(template) {
              if (hasCustomStyleLinks) {
                return template.replace('</body>', `${content}</body>`).replace(`@import '@elements/elements/index.css';`, '');
              } else {
                return template.replace('</body>', `${content}</body>`);
              }
            }
          }
        }
      })]
    });
  }
}

export const runner = new LighthouseRunner();
