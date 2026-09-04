import fs from 'fs';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import { VitePlaywrightRunner, buildPage, VIEWPORT_WIDTH, VIEWPORT_HEIGHT } from './playwright.js';
import { withSoftwareWebGPUChromiumArgs } from './utils.js';

const RUNNER_ID = 'visual';
const CHROMIUM_ARGS = withSoftwareWebGPUChromiumArgs([
  '--headless',
  '--font-render-hinting=none',
  '--disable-skia-runtime-opts',
  '--disable-font-subpixel-positioning',
  '--disable-lcd-text'
]);

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

    return this.#compareSnapshot(name);
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
      const result = await inspectPage(this.#runner.page);
      const report = await this.#compareSnapshot(name);
      if (report.maxDiffPercentage >= 1) {
        throw new Error(`Visual snapshot "${name}" differs from its baseline by ${report.maxDiffPercentage}%.`);
      }
      return result;
    } finally {
      try {
        await session?.send('Emulation.clearDeviceMetricsOverride');
      } catch {
        // Cleanup failures must not replace the inspection result.
      }
      try {
        await session?.detach();
      } catch {
        // Cleanup failures must not replace the inspection result.
      }
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
      secureContext: false,
      adapterInfo: null,
      software: false,
      workCompleted: false,
      clearFrame: false
    };

    try {
      diagnostics.secureContext = await this.#runner.page.evaluate(() => window.isSecureContext);
      const result = await this.#runner.page.evaluate(async () => {
        if (!window.isSecureContext) {
          throw new Error('WebGPU requires a secure context');
        }

        if (!navigator.gpu) {
          throw new Error('navigator.gpu is unavailable');
        }

        const adapter = await navigator.gpu.requestAdapter();
        if (!adapter) {
          throw new Error('requestAdapter returned null');
        }

        const adapterInfo = {
          vendor: adapter.info.vendor,
          architecture: adapter.info.architecture,
          device: adapter.info.device,
          description: adapter.info.description,
          isFallbackAdapter: adapter.info.isFallbackAdapter
        };
        const device = await adapter.requestDevice();
        let readbackTexture;
        let readback;
        let hasReadbackMapping = false;
        let hasValidationErrorScope = false;
        let validationError;
        let clearPixel;
        let expectedPixel;
        let clearFrame;
        let format;

        try {
          device.pushErrorScope('validation');
          hasValidationErrorScope = true;
          const module = device.createShaderModule({
            code: '@compute @workgroup_size(1) fn main() {}'
          });
          const pipeline = await device.createComputePipelineAsync({
            layout: 'auto',
            compute: { module, entryPoint: 'main' }
          });
          const canvas = document.querySelector('#webgpu-smoke');
          const context = canvas?.getContext('webgpu');

          if (!context) {
            throw new Error('WebGPU canvas context is unavailable');
          }

          format = navigator.gpu.getPreferredCanvasFormat();
          context.configure({
            device,
            format,
            alphaMode: 'opaque',
            usage: GPUTextureUsage.RENDER_ATTACHMENT
          });

          const clearColor = { r: 0.25, g: 0.5, b: 0.75, a: 1 };
          // Use a copyable texture for deterministic readback after verifying that the canvas can be configured.
          readbackTexture = device.createTexture({
            size: { width: 1, height: 1, depthOrArrayLayers: 1 },
            format,
            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC
          });
          readback = device.createBuffer({
            size: 256,
            usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ
          });
          const encoder = device.createCommandEncoder();
          const computePass = encoder.beginComputePass();
          computePass.setPipeline(pipeline);
          computePass.dispatchWorkgroups(1);
          computePass.end();
          const pass = encoder.beginRenderPass({
            colorAttachments: [
              {
                view: readbackTexture.createView(),
                clearValue: clearColor,
                loadOp: 'clear',
                storeOp: 'store'
              }
            ]
          });
          pass.end();
          encoder.copyTextureToBuffer(
            { texture: readbackTexture },
            { buffer: readback, bytesPerRow: 256 },
            { width: 1, height: 1, depthOrArrayLayers: 1 }
          );
          device.queue.submit([encoder.finish()]);
          await device.queue.onSubmittedWorkDone();
          await readback.mapAsync(GPUMapMode.READ);
          hasReadbackMapping = true;

          clearPixel = [...new Uint8Array(readback.getMappedRange()).slice(0, 4)];
          const rgba = [64, 128, 191, 255];
          expectedPixel = format.startsWith('bgra') ? [rgba[2], rgba[1], rgba[0], rgba[3]] : rgba;
          clearFrame = clearPixel.every((value, index) => Math.abs(value - expectedPixel[index]) <= 1);
        } finally {
          if (hasValidationErrorScope) {
            validationError = await device.popErrorScope();
          }
          if (hasReadbackMapping) {
            readback?.unmap();
          }
          readback?.destroy();
          readbackTexture?.destroy();
          device.destroy();
        }

        return {
          secureContext: window.isSecureContext,
          adapterInfo,
          software:
            adapterInfo.isFallbackAdapter === true || adapterInfo.architecture.toLowerCase().includes('swiftshader'),
          workCompleted: true,
          clearFrame,
          clearPixel,
          expectedPixel,
          format,
          error: validationError?.message
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

  async #compareSnapshot(name) {
    const baselinePath = `./.${RUNNER_ID}/${name}.png`;

    if (!fs.existsSync(baselinePath)) {
      fs.writeFileSync(baselinePath, await captureBodyScreenshot(this.#runner.page));
      return { maxDiffPercentage: 0 };
    }

    const img1 = PNG.sync.read(fs.readFileSync(baselinePath));
    const img2 = PNG.sync.read(await captureBodyScreenshot(this.#runner.page));
    const imgDiff = new PNG({ width: img1.width, height: img1.height });
    const maxDiffPercentage = getImagePercentageDifference(img1, img2, imgDiff);

    if (maxDiffPercentage >= 1) {
      fs.writeFileSync(`./.${RUNNER_ID}/${name}.diff.png`, PNG.sync.write(imgDiff));
      if (!process.env.CI) {
        fs.writeFileSync(baselinePath, PNG.sync.write(img2));
      }
    }

    return { maxDiffPercentage };
  }
}

export async function captureBodyScreenshot(page) {
  const viewport = page.viewportSize();
  if (!viewport) {
    throw new Error('Visual screenshots require a fixed viewport');
  }

  const { bounds, scroll } = await page.evaluate(() => {
    const { left, top, right, bottom } = document.body.getBoundingClientRect();
    return {
      bounds: {
        left: left + window.scrollX,
        top: top + window.scrollY,
        right: right + window.scrollX,
        bottom: bottom + window.scrollY
      },
      scroll: { x: window.scrollX, y: window.scrollY }
    };
  });
  if (bounds.right - bounds.left <= viewport.width && bounds.bottom - bounds.top <= viewport.height) {
    return page.locator('body').screenshot();
  }

  // SwiftShader can stall when Chromium captures a surface larger than the viewport. Capture document-space
  // clips so fixed-position content stays in its original location instead of following a scrolling viewport.
  const initialViewportImage = PNG.sync.read(await page.screenshot());
  const scaleX = initialViewportImage.width / viewport.width;
  const scaleY = initialViewportImage.height / viewport.height;
  const bodyImage = new PNG({
    width: Math.ceil((bounds.right - bounds.left) * scaleX),
    height: Math.ceil((bounds.bottom - bounds.top) * scaleY)
  });
  const xTargets = createScreenshotTargets(bounds.left, bounds.right, viewport.width);
  const yTargets = createScreenshotTargets(bounds.top, bounds.bottom, viewport.height);
  const session = await page.context().newCDPSession(page);
  let fixedElements;

  try {
    fixedElements = await hideFixedElements(page);
    for (const y of yTargets) {
      for (const x of xTargets) {
        const right = Math.min(bounds.right, x + viewport.width);
        const bottom = Math.min(bounds.bottom, y + viewport.height);
        const { data } = await session.send('Page.captureScreenshot', {
          format: 'png',
          fromSurface: true,
          captureBeyondViewport: true,
          clip: {
            x,
            y,
            width: right - x,
            height: bottom - y,
            scale: 1
          }
        });
        const tileImage = PNG.sync.read(Buffer.from(data, 'base64'));
        const destinationX = Math.floor((x - bounds.left) * scaleX);
        const destinationY = Math.floor((y - bounds.top) * scaleY);
        const width = Math.min(Math.ceil((right - x) * scaleX), tileImage.width, bodyImage.width - destinationX);
        const height = Math.min(Math.ceil((bottom - y) * scaleY), tileImage.height, bodyImage.height - destinationY);

        PNG.bitblt(tileImage, bodyImage, 0, 0, width, height, destinationX, destinationY);
      }
    }
  } finally {
    try {
      await restoreFixedElements(fixedElements);
    } finally {
      await session.detach();
    }
  }

  const left = Math.max(bounds.left, scroll.x);
  const top = Math.max(bounds.top, scroll.y);
  const right = Math.min(bounds.right, scroll.x + viewport.width);
  const bottom = Math.min(bounds.bottom, scroll.y + viewport.height);
  const sourceX = Math.floor((left - scroll.x) * scaleX);
  const sourceY = Math.floor((top - scroll.y) * scaleY);
  const destinationX = Math.floor((left - bounds.left) * scaleX);
  const destinationY = Math.floor((top - bounds.top) * scaleY);
  const width = Math.min(
    Math.ceil((right - left) * scaleX),
    initialViewportImage.width - sourceX,
    bodyImage.width - destinationX
  );
  const height = Math.min(
    Math.ceil((bottom - top) * scaleY),
    initialViewportImage.height - sourceY,
    bodyImage.height - destinationY
  );

  PNG.bitblt(initialViewportImage, bodyImage, sourceX, sourceY, width, height, destinationX, destinationY);

  return PNG.sync.write(bodyImage);
}

function hideFixedElements(page) {
  return page.evaluateHandle(() => {
    const fixedElements = [];
    const roots = [document];

    for (const root of roots) {
      for (const element of root.querySelectorAll('*')) {
        if (element.shadowRoot) {
          roots.push(element.shadowRoot);
        }
        const styles = getComputedStyle(element);
        const isAnchorPositioned = styles.positionArea && styles.positionArea !== 'none';
        if (styles.position !== 'fixed' || isAnchorPositioned) {
          continue;
        }

        fixedElements.push({
          element,
          visibility: element.style.getPropertyValue('visibility'),
          priority: element.style.getPropertyPriority('visibility')
        });
        element.style.setProperty('visibility', 'hidden', 'important');
      }
    }

    return fixedElements;
  });
}

async function restoreFixedElements(fixedElements) {
  if (!fixedElements) {
    return;
  }

  try {
    await fixedElements.evaluate(elements => {
      for (const { element, visibility, priority } of elements) {
        if (visibility) {
          element.style.setProperty('visibility', visibility, priority);
        } else {
          element.style.removeProperty('visibility');
        }
      }
    });
  } finally {
    await fixedElements.dispose();
  }
}

function createScreenshotTargets(start, end, viewportSize) {
  const targets = [];
  for (let position = start; position < end; position += viewportSize) {
    targets.push(position);
  }
  return targets;
}

async function setDeviceScaleFactor(page, deviceScaleFactor) {
  if (deviceScaleFactor === undefined) {
    return undefined;
  }
  const session = await page.context().newCDPSession(page);
  const deviceMetrics = {
    width: VIEWPORT_WIDTH,
    height: VIEWPORT_HEIGHT,
    deviceScaleFactor,
    mobile: false
  };
  let setupComplete = false;
  try {
    await session.send('Emulation.setDeviceMetricsOverride', deviceMetrics);
    console.log('visual-runner: applied device metrics override', deviceMetrics);
    setupComplete = true;
    return session;
  } finally {
    if (!setupComplete) {
      await session.detach();
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
