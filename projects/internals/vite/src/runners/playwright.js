import fs from 'fs';
import path from 'path';
import { globSync } from 'glob';
import { chromium } from 'playwright';
import { preview, build } from 'vite';

const resolve = rel => path.resolve(process.cwd(), rel);

process.env.NODE_ENV = 'production';

/** Creates a Vite preview server and Playwright/Chromium instance for test runner environments. */
export class VitePlaywrightRunner {
  /** @type {import('playwright').Page} */
  #page;
  /** @type {import('vite').PreviewServer} */
  #server;
  /** @type {import('playwright').Browser} */
  #browser;
  /** @type {import('playwright').LaunchOptions} */
  #chromiumArgs;
  /** @type {string} */
  #runnerID;

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
    this.#chromiumArgs = config.chromiumArgs ?? [
      '--headless',
      '--disable-dev-shm-usage',
      '--disable-setuid-sandbox',
      '--disable-software-rasterizer',
      '--no-sandbox',
      '--disable-gpu',
      '--disable-extensions',
      '--disable-background-networking',
      '--disable-default-apps',
      '--disable-sync',
      '--disable-translate',
      '--metrics-recording-only',
      '--mute-audio',
      '--no-first-run',
      '--safebrowsing-disable-auto-update',
      '--disable-features=TranslateUI',
      '--disable-features=BlinkGenPropertyTrees',
      '--disable-ipc-flooding-protection'
    ];
  }

  async open() {
    if (!this.#server) {
      if (!fs.existsSync(this.#root)) {
        fs.mkdirSync(this.#root);
      }

      if (!fs.existsSync(this.#dist)) {
        fs.mkdirSync(this.#dist);
      }

      console.log('playwright-runner: launching browser');
      this.#browser = await chromium.launch({ args: this.#chromiumArgs }).catch(error => {
        console.error('playwright-runner: error launching browser', error);
        throw error;
      });
      console.log('playwright-runner: creating context');
      this.#page = await (await this.#browser.newContext({ viewport: { width: 1180, height: 820 } })).newPage();
      this.#page.on('crash', data => console.error('playwright-runner: browser crashed', data));
      console.log('playwright-runner: creating server');
      this.#server = await preview({ root: this.#root, preview: { port: this.port, open: false } });
      console.log(`playwright-runner: server running at port ${this.port}`);
    }
  }

  async close() {
    const report = globSync(resolve(`${this.#root}/**/report.json`)).reduce((p, n) => {
      const file = JSON.parse(fs.readFileSync(n));
      return { ...p, [file.name]: file };
    }, {});

    fs.writeFileSync(`${this.#dist}/report.json`, JSON.stringify(report, null, 2));
    await this.#page.close();
    await this.#browser.close();
    await this.#server.close();
  }
}

/**
 * Builds a given test fixture/template for test runner environments.
 *
 * Vite 8/Rolldown does not emit JS from inline `<script type="module">` in
 * HTML (html-proxy modules). This function works around the limitation by
 * reading the template, applying the render callback, extracting every inline
 * module script to a real temporary `.js` file, and building from real files.
 */
export async function buildPage(testName, runnerID, render) {
  const template = fs.readFileSync(resolve(`vitest.${runnerID}.html`), 'utf8');
  let html = render(template);

  const tmpDir = resolve(`.${runnerID}/.tmp-${testName}`);
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

  let scriptIdx = 0;
  const scriptRe = /<script\s+type=["']module["']>([\s\S]*?)<\/script>/g;
  html = html.replace(scriptRe, (_match, content) => {
    const name = `_entry${scriptIdx++}.js`;
    fs.writeFileSync(path.join(tmpDir, name), content.trim());
    return `<script type="module" src="./${name}"></script>`;
  });

  fs.writeFileSync(path.join(tmpDir, 'index.html'), html);

  const outDir = `.${runnerID}/dist/${testName}`;
  try {
    await build({
      configFile: false,
      logLevel: 'error',
      root: tmpDir,
      base: `/${testName}`,
      css: { postcss: {} },
      build: {
        target: 'esnext',
        cssCodeSplit: true,
        cssMinify: 'esbuild',
        outDir: resolve(outDir),
        emptyOutDir: true,
        rolldownOptions: {
          output: {
            entryFileNames: `assets/[name].js`,
            chunkFileNames: `assets/[name].js`,
            assetFileNames: assetInfo => {
              const original = assetInfo.originalFileNames?.[0];
              if (original) return `assets/${original.split('/').pop()}`;
              return `assets/${assetInfo.names?.[0] ?? 'asset'}`;
            }
          }
        }
      }
    });
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}
