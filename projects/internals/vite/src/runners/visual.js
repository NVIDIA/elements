import { chromium } from 'playwright';
import { preview, build } from 'vite';
import virtualHtml from 'vite-plugin-virtual-html';
import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

process.env.NODE_ENV = 'production';

const resolve = rel => path.resolve(process.cwd(), rel);

const ROOT_DIR = '.visual';
const DIST_DIR = `${ROOT_DIR}/dist`;
const CUSTOM_CONFIG_PATH = resolve('./vitest.visual.build.ts');
const HAS_CUSTOM_BUILD_CONFIG = fs.existsSync(CUSTOM_CONFIG_PATH);

export class VisualRunner {
  #server;
  #port = 4176;
  #report = {};

  async open() {
    if (!fs.existsSync(ROOT_DIR)) {
      fs.mkdirSync(ROOT_DIR);
    }

    if (!fs.existsSync(DIST_DIR)) {
      fs.mkdirSync(DIST_DIR);
    }

    console.log('Starting Vite Server...');
    this.#server = await preview({
      root: ROOT_DIR,
      preview: { port: this.#port, open: false }
    });

    this.#port = this.#server.httpServer.address().port;
    console.log(`Vite Server running at port ${this.#port}`);
  }

  async close() {
    if (!fs.existsSync(ROOT_DIR)) {
      fs.mkdirSync(ROOT_DIR);
    }

    if (!fs.existsSync(DIST_DIR)) {
      fs.mkdirSync(DIST_DIR);
    }

    console.log('Stopping Vite Server...');
    this.#server.httpServer.close();
  }

  async render(name, content, options = { network: false }) {
    await this.#buildPage(name, content);

    const browser = await chromium.launch({
      args: [
        '--headless',
        '--remote-debugging-port=9222',
        '--font-render-hinting=none',
        '--disable-skia-runtime-opts',
        '--disable-font-subpixel-positioning',
        '--disable-lcd-text',
        '--disable-gpu'
      ]
    });

    const context = await browser.newContext({ viewport: { width: 1180, height: 820 } });
    const page = await context.newPage();
    await page.goto(`http://localhost:${this.#port}/${name}/index.html`);
    await page.evaluate(async () => {
      await document.fonts.ready;
    });

    if (options.network) {
      await page.waitForLoadState('networkidle');
    }

    const baselinePath = `./${ROOT_DIR}/${name}.png`;
    const diffPath = `./${ROOT_DIR}/${name}.diff.png`;
    const hasBaseline = fs.existsSync(baselinePath);

    if (hasBaseline) {
      const img1 = PNG.sync.read(fs.readFileSync(baselinePath));
      const img2 = PNG.sync.read(await page.locator('body').screenshot());

      const { width, height } = img1;
      const diff = new PNG({ width, height });
      const maxDiffPixels = pixelmatch(img1.data, img2.data, diff.data, width, height, { threshold: 0.1 });
      const maxDiffPercentage = Math.floor((maxDiffPixels / (width * height)) * 100);

      if (maxDiffPixels > 0) {
        fs.writeFileSync(diffPath, PNG.sync.write(diff));
      }

      this.#report[name] = { maxDiffPixels, maxDiffPercentage };
    } else {
      await page.locator('body').screenshot({ path: baselinePath });
    }

    browser.close();
    return this.#report[name];
  }

  #buildPage(name, content) {
    const hasCustomStyleLinks = [...content.matchAll('<link')].length;

    return build({
      configFile: HAS_CUSTOM_BUILD_CONFIG ? resolve('./vitest.visual.build.ts') : false,
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
              template: `/vitest.visual.html`,
              render(template) {
                return template.replace('</body>', `${content}</body>`).replace(
                  '</head>',
                  `
                    <style>
                    body {
                      width: fit-content;
                      height: fit-content;
                      font-synthesis: none;
                      text-rendering: optimizeLegibility;
                    }
                    </style></head>`
                );
              }
            }
          }
        })
      ]
    });
  }
}

export const visualRunner = new VisualRunner();
