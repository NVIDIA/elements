import fs from 'fs';
import path from 'path';
import { globSync } from 'glob';
import { chromium } from 'playwright';
import { preview, build } from 'vite';

const resolve = rel => path.resolve(process.cwd(), rel);
const DEFAULT_PORT = 4176;
export const VIEWPORT_WIDTH = 1180;
export const VIEWPORT_HEIGHT = 820;

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

  get browserVersion() {
    return this.#browser?.version();
  }

  get port() {
    return this.#serverPort ?? this.#storedPort ?? DEFAULT_PORT;
  }

  get #root() {
    return `.${this.#runnerID}`;
  }

  get #dist() {
    return `.${this.#runnerID}/dist`;
  }

  get #portFile() {
    return `.${this.#runnerID}/port`;
  }

  get #serverPort() {
    const address = this.#server?.httpServer?.address();
    return typeof address === 'object' ? address?.port : undefined;
  }

  get #storedPort() {
    try {
      const port = Number(fs.readFileSync(this.#portFile, 'utf-8').trim());
      return Number.isInteger(port) && port > 0 && port <= 65535 ? port : undefined;
    } catch {
      return undefined;
    }
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
      this.#page = await (
        await this.#browser.newContext({ viewport: { width: VIEWPORT_WIDTH, height: VIEWPORT_HEIGHT } })
      ).newPage();
      this.#page.on('crash', data => console.error('playwright-runner: browser crashed', data));
      console.log('playwright-runner: creating server');
      this.#server = await preview({
        root: this.#root,
        preview: { port: this.#storedPort ?? DEFAULT_PORT, open: false }
      });
      fs.writeFileSync(this.#portFile, String(this.port));
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
  html = replaceInlineModuleScripts(html, content => {
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

/** Replaces inline module scripts with a forward-only scan of the HTML. */
export function replaceInlineModuleScripts(html, replaceScript) {
  const parts = [];
  let copiedUntil = 0;
  let searchFrom = 0;

  while (searchFrom < html.length) {
    const scriptStart = html.indexOf('<script', searchFrom);
    if (scriptStart === -1) break;

    const contentStart = getInlineModuleScriptContentStart(html, scriptStart);
    if (contentStart === undefined) {
      searchFrom = scriptStart + '<script'.length;
      continue;
    }

    const scriptEnd = html.indexOf('</script>', contentStart);
    if (scriptEnd === -1) break;

    parts.push(html.slice(copiedUntil, scriptStart));
    parts.push(replaceScript(html.slice(contentStart, scriptEnd)));
    copiedUntil = scriptEnd + '</script>'.length;
    searchFrom = copiedUntil;
  }

  parts.push(html.slice(copiedUntil));
  return parts.join('');
}

function getInlineModuleScriptContentStart(html, scriptStart) {
  let cursor = scriptStart + '<script'.length;
  if (!isWhitespace(html[cursor])) return undefined;

  while (isWhitespace(html[cursor])) cursor += 1;
  if (!html.startsWith('type=', cursor)) return undefined;
  cursor += 'type='.length;

  const quote = html[cursor];
  if (quote !== '"' && quote !== "'") return undefined;

  const moduleStart = cursor + 1;
  const moduleEnd = moduleStart + 'module'.length;
  if (!html.startsWith('module', moduleStart) || html[moduleEnd] !== quote || html[moduleEnd + 1] !== '>') {
    return undefined;
  }

  return moduleEnd + 2;
}

function isWhitespace(character) {
  return character !== undefined && character.trim() === '';
}
