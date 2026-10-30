import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { VitePlaywrightRunner, buildPage, VIEWPORT_WIDTH, VIEWPORT_HEIGHT } from './playwright.js';
import { metricDelta, validateBudgets, exceededBudgets } from './render-metrics.js';
import { serializeRenderContent } from '../template.js';

// This is a rendering opportunity, not proof of arbitrary asynchronous completion.
async function frames(page) {
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
}

export class RenderRunner {
  #busy = false;

  async getReport(options) {
    if (this.#busy) throw new Error('Render scenarios must run serially');
    validateBudgets(options.budgets);
    const timeoutMs = options.timeoutMs ?? 10000;
    if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) throw new Error('Invalid render timeoutMs');
    this.#busy = true;
    const id = `${options.name.replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 80)}-${randomUUID()}`;
    const outputDir = resolve(options.outputDir ?? '.render/reports');
    const report = {
      name: options.name,
      workload: options.workload,
      metadata: options.metadata,
      budgets: options.budgets ?? {},
      exceededBudgets: [],
      viewport: { width: VIEWPORT_WIDTH, height: VIEWPORT_HEIGHT },
      settings: {
        timeoutMs,
        headless: true,
        reducedMotion: options.reducedMotion ?? 'reduce',
        renderingFrames: 2,
        retries: 0
      },
      artifacts: { report: resolve(outputDir, `${id}.json`) },
      diagnostics: []
    };
    const runner = new VitePlaywrightRunner({ runnerID: 'render' });
    let session,
      primary,
      tracing = false,
      operationStarted = false;
    const bounded = async (phase, action) => {
      let timer;
      try {
        return await Promise.race([
          Promise.resolve().then(action),
          new Promise((_, reject) => {
            timer = setTimeout(
              () => reject(new Error(`${options.name}: ${phase} timed out after ${timeoutMs} ms`)),
              timeoutMs
            );
          })
        ]);
      } finally {
        clearTimeout(timer);
      }
    };
    try {
      await mkdir(outputDir, { recursive: true });
      const content = await serializeRenderContent(options.content);
      await buildPage(id, 'render', template => template.replace('</body>', () => `${content}</body>`));
      await runner.open();
      const page = runner.page;
      page.setDefaultTimeout(timeoutMs);
      await page.emulateMedia({ reducedMotion: options.reducedMotion ?? 'reduce' });
      await page.goto(`http://localhost:${runner.port}/${id}/`, { waitUntil: 'load', timeout: timeoutMs });
      report.chromiumVersion = runner.browserVersion;
      await bounded('preparation', async () => {
        await options.prepare?.(page);
        await page.evaluate(() => document.fonts.ready);
        await frames(page);
      });
      session = await page.context().newCDPSession(page);
      await session.send('Performance.enable');
      if (options.trace ?? process.env.RENDER_TRACE === '1') {
        await session.send('Tracing.start', {
          categories: 'devtools.timeline,v8.execute,blink.user_timing,disabled-by-default-devtools.timeline',
          transferMode: 'ReturnAsStream'
        });
        tracing = true;
        report.traceRun = 'original';
      }
      await page.evaluate(() => performance.mark('render-operation-start'));
      operationStarted = true;
      const before = await session.send('Performance.getMetrics');
      await bounded('interaction', () => options.interact(page));
      await bounded('completion', async () => {
        await options.complete?.(page);
        await frames(page);
      });
      const after = await session.send('Performance.getMetrics');
      Object.assign(report, metricDelta(before, after));
      report.exceededBudgets = exceededBudgets(report, report.budgets);
      await page.evaluate(() => {
        performance.mark('render-operation-end');
        performance.measure('render-operation', 'render-operation-start', 'render-operation-end');
      });
      operationStarted = false;
      if (options.observe) report.observations = await bounded('observation', () => options.observe(page));
      await bounded('validation', () => options.validate?.(report));
      if (report.exceededBudgets.length)
        throw new Error(`${options.name}: render budget exceeded: ${report.exceededBudgets.join('; ')}`);
    } catch (error) {
      primary = error instanceof Error ? error : new Error(String(error));
      report.error = String(error);
    } finally {
      if (operationStarted) {
        try {
          await bounded('trace markers', () =>
            runner.page.evaluate(() => {
              performance.mark('render-operation-end');
              performance.measure('render-operation', 'render-operation-start', 'render-operation-end');
            })
          );
        } catch (error) {
          report.diagnostics.push(`Markers: ${error}`);
        }
      }
      if (tracing) {
        try {
          await bounded('trace capture', async () => {
            const completed = new Promise(resolve => session.once('Tracing.tracingComplete', resolve));
            await session.send('Tracing.end');
            const { stream } = await completed;
            if (!stream) throw new Error('Chromium trace stream missing');
            let trace = '';
            try {
              while (true) {
                const chunk = await session.send('IO.read', { handle: stream });
                trace += chunk.base64Encoded ? Buffer.from(chunk.data, 'base64').toString() : chunk.data;
                if (chunk.eof) break;
              }
            } finally {
              await session.send('IO.close', { handle: stream });
            }
            const tracePath = resolve(outputDir, `${id}.trace.json`);
            await writeFile(tracePath, trace);
            report.artifacts.trace = tracePath;
          });
        } catch (error) {
          report.diagnostics.push(`Trace: ${error}`);
        }
      }
      for (const cleanup of [() => session?.detach(), () => runner.close()]) {
        try {
          await bounded('cleanup', cleanup);
        } catch (error) {
          report.diagnostics.push(`Cleanup: ${error}`);
          primary ??= error;
        }
      }
      this.#busy = false;
      try {
        await writeFile(report.artifacts.report, JSON.stringify(report, null, 2));
      } catch (error) {
        primary ??= error;
      }
    }
    if (primary) {
      primary.report = report;
      throw primary;
    }
    return report;
  }
}

export const renderRunner = new RenderRunner();
