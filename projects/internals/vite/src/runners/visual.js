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
  #browser;
  #page;
  #port = 4176;
  #report = {};

  async open() {
    if (!this.#browser) {
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

      this.#browser = await chromium.launch({
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

      const context = await this.#browser.newContext({ viewport: { width: 1180, height: 820 } });
      this.#page = await context.newPage();
    }
  }

  async close() {
    if (!fs.existsSync(ROOT_DIR)) {
      fs.mkdirSync(ROOT_DIR);
    }

    if (!fs.existsSync(DIST_DIR)) {
      fs.mkdirSync(DIST_DIR);
    }

    console.log('Stopping Vite Server...');
    this.#server.close();
    this.#browser.close();
  }

  async render(name, content, options = { network: false }) {
    await this.#buildPage(name, content);
    await this.open();

    await this.#page.goto(`http://localhost:${this.#port}/${name}/index.html`);
    await this.#page.evaluate(async () => {
      await document.fonts.ready;
    });

    if (options.network) {
      await this.#page.waitForLoadState('networkidle');
    }

    const baselinePath = `./${ROOT_DIR}/${name}.png`;
    const diffPath = `./${ROOT_DIR}/${name}.diff.png`;
    const hasBaseline = fs.existsSync(baselinePath);

    if (hasBaseline) {
      const img1 = PNG.sync.read(fs.readFileSync(baselinePath));
      const img2 = PNG.sync.read(await this.#page.locator('body').screenshot());
      const imgDiff = new PNG({ width: img1.width, height: img1.height });

      let maxDiffPercentage = 0;
      const imagesSameSize = img1.width === img2.width && img1.height === img2.height;
      if (imagesSameSize) {
        const maxDiffPixels = pixelmatch(img1.data, img2.data, imgDiff.data, img1.width, img1.height, {
          threshold: 0.1
        });
        maxDiffPercentage = Math.floor((maxDiffPixels / (img1.width * img1.height)) * 100);
      } else {
        const imgSize1 = img1.width * img1.height;
        const imgSize2 = img2.width * img2.height;
        maxDiffPercentage = 100 * Math.abs((imgSize1 - imgSize2) / ((imgSize1 + imgSize2) / 2));
      }

      if (maxDiffPercentage >= 1) {
        fs.writeFileSync(diffPath, PNG.sync.write(imgDiff));
        if (!process.env.CI) {
          fs.writeFileSync(baselinePath, PNG.sync.write(img2));
        }
      }

      this.#report[name] = { maxDiffPercentage };
    } else {
      await this.#page.locator('body').screenshot({ path: baselinePath });
      this.#report[name] = { maxDiffPercentage: 0 };
    }

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
