import fs from 'fs';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import { VitePlaywrightRunner, buildPage } from './playwright.js';

const RUNNER_ID = 'visual';
const CHROMIUM_ARGS = [
  '--headless',
  '--remote-debugging-port=9222',
  '--font-render-hinting=none',
  '--disable-skia-runtime-opts',
  '--disable-font-subpixel-positioning',
  '--disable-lcd-text',
  '--disable-gpu'
];

export class VisualRunner {
  #runner = new VitePlaywrightRunner({ runnerID: RUNNER_ID, chromiumArgs: CHROMIUM_ARGS });

  async open() {
    await this.#runner.open();
  }

  async close() {
    await this.#runner.close();
  }

  async render(name, content, options = { network: false }) {
    await buildPage(name, RUNNER_ID, template =>
      template
        .replace('</body>', `${content}</body>`)
        .replace(
          '</head>',
          `<style>body { width: fit-content; height: fit-content; font-synthesis: none; text-rendering: optimizeLegibility; }</style></head>`
        )
    );

    await this.#runner.page.goto(`http://localhost:${this.#runner.port}/${name}/index.html`);
    await this.#runner.page.evaluate(async () => {
      await document.fonts.ready;
      await new Promise(r => requestAnimationFrame(r));
    });

    if (options.network) {
      await this.#runner.page.waitForLoadState('networkidle');
    }

    const baselinePath = `./.${RUNNER_ID}/${name}.png`;

    if (fs.existsSync(baselinePath)) {
      const img1 = PNG.sync.read(fs.readFileSync(baselinePath));
      const img2 = PNG.sync.read(await this.#runner.page.locator('body').screenshot());
      const imgDiff = new PNG({ width: img1.width, height: img1.height });
      const maxDiffPercentage = getImagePercentageDifference(img1, img2, imgDiff);

      if (maxDiffPercentage >= 1) {
        fs.writeFileSync(`./.${RUNNER_ID}/${name}.diff.png`, PNG.sync.write(imgDiff));
        if (!process.env.CI) {
          fs.writeFileSync(baselinePath, PNG.sync.write(img2));
        }
      }

      return { maxDiffPercentage };
    } else {
      await this.#runner.page.locator('body').screenshot({ path: baselinePath });
      return { maxDiffPercentage: 0 };
    }
  }
}

function getImagePercentageDifference(img1, img2, imgDiff) {
  if (img1.width === img2.width && img1.height === img2.height) {
    const pixels = pixelmatch(img1.data, img2.data, imgDiff.data, img1.width, img1.height, { threshold: 0.1 });
    return Math.floor((pixels / (img1.width * img1.height)) * 100);
  } else {
    const imgSize1 = img1.width * img1.height;
    const imgSize2 = img2.width * img2.height;
    return 100 * Math.abs((imgSize1 - imgSize2) / ((imgSize1 + imgSize2) / 2));
  }
}

export const visualRunner = new VisualRunner();
