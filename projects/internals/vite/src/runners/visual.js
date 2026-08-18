import fs from 'fs';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import { VitePlaywrightRunner, buildPage } from './playwright.js';

const RUNNER_ID = 'visual';
const CHROMIUM_ARGS = [
  '--headless',
  '--font-render-hinting=none',
  '--disable-skia-runtime-opts',
  '--disable-font-subpixel-positioning',
  '--disable-lcd-text',
  '--disable-gpu'
];
const WEBGPU_CHROMIUM_ARGS = [
  ...CHROMIUM_ARGS.filter(argument => argument !== '--disable-gpu'),
  '--enable-unsafe-webgpu'
];

export class VisualRunner {
  #chromiumArgs;
  #runner;

  constructor({ chromiumArgs = CHROMIUM_ARGS } = {}) {
    this.#chromiumArgs = chromiumArgs;
    this.#runner = new VitePlaywrightRunner({ runnerID: RUNNER_ID, chromiumArgs });
  }

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

    if (options.waitFor) {
      await options.waitFor(this.#runner.page.waitForFunction.bind(this.#runner.page));
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

  async inspect(name, content, inspectPage, options = {}) {
    await buildPage(name, RUNNER_ID, template => template.replace('</body>', `${content}</body>`));
    const session = await setDeviceScaleFactor(this.#runner.page, options.deviceScaleFactor);
    try {
      await this.#runner.page.goto(`http://localhost:${this.#runner.port}/${name}/index.html`);
      await this.#runner.page.evaluate(async () => {
        await document.fonts.ready;
        await new Promise(resolve => requestAnimationFrame(resolve));
      });
      return await inspectPage(this.#runner.page);
    } finally {
      await session?.send('Emulation.clearDeviceMetricsOverride');
      await session?.detach();
    }
  }

  async runWebGPUSmoke(name) {
    await buildPage(name, RUNNER_ID, template =>
      template.replace('</body>', '<canvas id="webgpu-smoke" width="1" height="1"></canvas></body>')
    );

    await this.#runner.page.goto(`http://localhost:${this.#runner.port}/${name}/index.html`);

    const diagnostics = {
      browserVersion: this.#runner.browserVersion ?? 'unknown',
      chromiumArgs: [...this.#chromiumArgs],
      adapterInfo: null,
      software: false,
      clearFrame: false
    };

    try {
      const result = await this.#runner.page.evaluate(async () => {
        if (!navigator.gpu) {
          throw new Error('navigator.gpu is unavailable');
        }

        const adapter = await navigator.gpu.requestAdapter({ forceFallbackAdapter: true });
        if (!adapter) {
          throw new Error('requestAdapter returned null');
        }

        const adapterInfo = {
          vendor: adapter.info.vendor,
          architecture: adapter.info.architecture,
          device: adapter.info.device,
          description: adapter.info.description,
          isFallbackAdapter: adapter.isFallbackAdapter
        };
        const device = await adapter.requestDevice();
        const canvas = document.querySelector('#webgpu-smoke');
        const context = canvas?.getContext('webgpu');

        if (!context) {
          device.destroy();
          throw new Error('WebGPU canvas context is unavailable');
        }

        const format = navigator.gpu.getPreferredCanvasFormat();
        context.configure({
          device,
          format,
          alphaMode: 'opaque',
          usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC
        });

        const clearColor = { r: 0.25, g: 0.5, b: 0.75, a: 1 };
        const texture = context.getCurrentTexture();
        const readback = device.createBuffer({
          size: 256,
          usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ
        });
        const encoder = device.createCommandEncoder();
        const pass = encoder.beginRenderPass({
          colorAttachments: [
            {
              view: texture.createView(),
              clearValue: clearColor,
              loadOp: 'clear',
              storeOp: 'store'
            }
          ]
        });
        pass.end();
        encoder.copyTextureToBuffer(
          { texture },
          { buffer: readback, bytesPerRow: 256 },
          { width: 1, height: 1, depthOrArrayLayers: 1 }
        );
        device.queue.submit([encoder.finish()]);
        await readback.mapAsync(GPUMapMode.READ);

        const clearPixel = [...new Uint8Array(readback.getMappedRange()).slice(0, 4)];
        const rgba = [64, 128, 191, 255];
        const expectedPixel = format.startsWith('bgra') ? [rgba[2], rgba[1], rgba[0], rgba[3]] : rgba;
        const clearFrame = clearPixel.every((value, index) => Math.abs(value - expectedPixel[index]) <= 1);

        readback.unmap();
        readback.destroy();
        device.destroy();

        return {
          adapterInfo,
          software:
            adapterInfo.isFallbackAdapter === true || adapterInfo.architecture.toLowerCase().includes('swiftshader'),
          clearFrame,
          clearPixel,
          expectedPixel,
          format
        };
      });

      return { ...diagnostics, ...result };
    } catch (error) {
      return {
        ...diagnostics,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
}

async function setDeviceScaleFactor(page, deviceScaleFactor) {
  if (deviceScaleFactor === undefined) {
    return undefined;
  }
  const session = await page.context().newCDPSession(page);
  await session.send('Emulation.setDeviceMetricsOverride', {
    width: 1180,
    height: 820,
    deviceScaleFactor,
    mobile: false
  });
  return session;
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
export const webgpuVisualRunner = new VisualRunner({ chromiumArgs: WEBGPU_CHROMIUM_ARGS });
