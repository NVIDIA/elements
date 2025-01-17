import fs from 'fs';
import path from 'path';
import { globSync } from 'glob';
import { chromium } from 'playwright';
import { preview, build } from 'vite';
import virtualHtml from 'vite-plugin-virtual-html';

const resolve = rel => path.resolve(process.cwd(), rel);

process.env.NODE_ENV = 'production';

/** Creates a Vite preview server and Playwright/Chromium instance for test runner environments. */
export class VitePlaywrightRunner {
  #page;
  #server;
  #browser;
  #runnerID;
  #chromiumArgs;

  get page() {
    return this.#page;
  }

  get port() {
    return this.#server?.httpServer?.address()?.port ?? 4176;
  }

  get #root() {
    return `.${this.#runnerID}`;
  }

  get #dist() {
    return `.${this.#runnerID}/dist`;
  }

  constructor(config = {}) {
    this.#runnerID = config.runnerID ?? 'playwright';
    this.#chromiumArgs = config.chromiumArgs ?? ['--headless', '--remote-debugging-port=9222'];
  }

  async open() {
    if (!this.#server) {
      if (!fs.existsSync(this.#root)) {
        fs.mkdirSync(this.#root);
      }

      if (!fs.existsSync(this.#dist)) {
        fs.mkdirSync(this.#dist);
      }

      this.#browser = await chromium.launch({ args: this.#chromiumArgs });
      this.#page = await (await this.#browser.newContext({ viewport: { width: 1180, height: 820 } })).newPage();
      this.#server = await preview({ root: this.#root, preview: { port: this.port, open: false } });
      console.log(`Server running at port ${this.port}`);
    }
  }

  async close() {
    const report = globSync(resolve(`${this.#root}/**/report.json`)).reduce((p, n) => {
      const file = JSON.parse(fs.readFileSync(n));
      return { ...p, [file.name]: file };
    }, {});

    fs.writeFileSync(`${this.#dist}/report.json`, JSON.stringify(report, null, 2));
    this.#server.close();
    await this.#browser.close();
  }
}

/** Builds a given test fixture/template for test runner environments. */
export function buildPage(testName, runnerID, render) {
  return build({
    configFile: false,
    logLevel: 'error',
    base: `/${testName}`,
    build: {
      target: 'esnext',
      cssCodeSplit: true,
      outDir: `.${runnerID}/dist/${testName}`,
      rollupOptions: {
        output: {
          entryFileNames: `assets/[name].js`,
          chunkFileNames: `assets/[name].js`,
          assetFileNames: assetInfo => `assets/${assetInfo.names}`
        }
      }
    },
    plugins: [
      virtualHtml({
        pages: {
          index: {
            template: `/vitest.${runnerID}.html`,
            render
          }
        }
      })
    ]
  });
}
