import type { TemplateResult } from 'lit';
import { html } from 'lit';
import { readFile } from 'node:fs/promises';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderRunner } from '@internals/vite';

describe('render measurement runner', () => {
  // Each getReport call owns a fresh page and closes its browser/CDP/server in finally.
  let content: TemplateResult;

  beforeEach(() => {
    content = html`<div id="target" style="width:100px;height:10px"></div>`;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('preserves literal dollar sequences in fixture text and scripts', async () => {
    await renderRunner.getReport({
      name: 'literal-dollar-sequences',
      workload: 'preserve fixture text and module script behavior',
      content: html`
        <p id="target" nve-text="body">literal $& $$ $\` $'</p>
        <script type="module">
          window.renderWorkload = { fixtureText: 'literal'.replace(/literal/, '$&') };
        </script>
      `,
      interact: async page => {
        expect(await page.locator('#target').textContent()).toBe("literal $& $$ $` $'");
        expect(await page.evaluate('window.renderWorkload.fixtureText')).toBe('literal');
      },
      budgets: { layoutCount: 0, styleRecalcCount: 0 }
    });
  });

  for (const size of [16, 64]) {
    it(`detects repeated synchronous layout at size ${size}`, async () => {
      const control = await renderRunner.getReport({
        name: `batched-${size}`,
        workload: `${size} width writes, measurements before writes`,
        content,
        prepare: page =>
          page.evaluate(
            "window.renderWorkload = { initialWidth: document.querySelector('#target').getBoundingClientRect().width }"
          ),
        interact: page =>
          page.evaluate(count => {
            const target = document.getElementById('target')!;
            const width = target.getBoundingClientRect().width;
            for (let i = 0; i < count; i++) target.style.width = `${width + i + 1}px`;
          }, size),
        complete: async page => {
          expect(await page.locator('#target').evaluate(element => element.getBoundingClientRect().width)).toBe(
            100 + size
          );
        },
        budgets: { layoutCount: 2, styleRecalcCount: 2 }
      });
      await expect(
        renderRunner
          .getReport({
            name: `thrashing-${size}`,
            workload: `${size} alternating width writes and observable reads`,
            content,
            interact: page =>
              page.evaluate(count => {
                const target = document.getElementById('target')!;
                let sum = 0;
                for (let i = 0; i < count; i++) {
                  target.style.width = `${101 + i}px`;
                  sum += target.getBoundingClientRect().width;
                }
                if (sum <= 100 * count) throw new Error('Reads did not observe changed widths');
              }, size),
            budgets: { layoutCount: 2, styleRecalcCount: 2 }
          })
          .catch(error => {
            expect(error.report.layoutCount).toBeGreaterThanOrEqual(size);
            expect(error.report.styleRecalcCount).toBeGreaterThanOrEqual(size);
            throw error;
          })
      ).rejects.toThrow('budget exceeded');
      expect(control.layoutCount).toBeLessThanOrEqual(2);
    });
  }

  it('writes a usable original Chrome trace', async () => {
    const report = await renderRunner.getReport({
      name: 'trace-self-test',
      workload: 'one connected width mutation',
      content,
      trace: true,
      interact: page =>
        page.locator('#target').evaluate(element => {
          element.style.width = '200px';
        }),
      budgets: { layoutCount: 2, styleRecalcCount: 2 }
    });
    expect(report.diagnostics).toEqual([]);
    expect(report.artifacts.trace).toBeDefined();
    const trace = JSON.parse(await readFile(report.artifacts.trace!, 'utf8'));
    expect(trace.traceEvents.some((event: { name: string }) => event.name === 'render-operation')).toBe(true);
    expect(trace.traceEvents.some((event: { name: string }) => event.name === 'Layout')).toBe(true);
  });

  it('preserves interaction failure, times out completion, and isolates later pages', async () => {
    await expect(
      renderRunner.getReport({
        name: 'action-error',
        workload: 'failure cleanup',
        content,
        interact: async page => {
          await page.evaluate(() => {
            document.body.id = 'previous';
          });
          throw new Error('original interaction error');
        }
      })
    ).rejects.toThrow('original interaction error');
    await expect(
      renderRunner.getReport({
        name: 'completion-timeout',
        workload: 'completion never signals',
        content,
        timeoutMs: 1000,
        interact: async () => {},
        complete: page => page.evaluate(() => new Promise(() => {}))
      })
    ).rejects.toThrow('completion timed out');
    await expect(
      renderRunner.getReport({
        name: 'interaction-timeout',
        workload: 'interaction never signals',
        content,
        timeoutMs: 1000,
        interact: page => page.evaluate(() => new Promise(() => {}))
      })
    ).rejects.toThrow('interaction timed out');
    const report = await renderRunner.getReport({
      name: 'fresh-page',
      workload: 'independent document',
      content,
      interact: async page => {
        expect(await page.locator('body').getAttribute('id')).toBeNull();
      },
      budgets: { layoutCount: 0, styleRecalcCount: 0 }
    });
    expect(report.layoutCount).toBe(0);
  });

  it('retains original failure and JSON when trace diagnostics fail', async () => {
    let savedReport: { artifacts: { report: string }; diagnostics: string[] } | undefined;
    try {
      await renderRunner.getReport({
        name: 'diagnostic-error',
        workload: 'original action error with a broken trace stream',
        content,
        trace: true,
        prepare: async page => {
          const context = page.context();
          const createSession = context.newCDPSession.bind(context);
          vi.spyOn(context, 'newCDPSession').mockImplementation(async target => {
            const session = await createSession(target);
            const send = session.send.bind(session);
            vi.spyOn(session, 'send').mockImplementation(async (method, params) => {
              if (method === 'IO.read') throw new Error('diagnostic stream unavailable');
              return send(method, params);
            });
            return session;
          });
        },
        interact: async () => {
          throw new Error('primary action failure');
        }
      });
      throw new Error('Expected action rejection');
    } catch (error) {
      expect(error).toMatchObject({
        message: 'primary action failure',
        report: { diagnostics: [expect.stringContaining('diagnostic stream unavailable')] }
      });
      if (error instanceof Error && 'report' in error) savedReport = error.report as typeof savedReport;
    }
    expect(savedReport).toBeDefined();
    const persisted = JSON.parse(await readFile(savedReport!.artifacts.report, 'utf8'));
    expect(persisted.error).toContain('primary action failure');
    expect(persisted.diagnostics[0]).toContain('diagnostic stream unavailable');
  });

  it('persists structural observations and metrics when post-measurement validation fails', async () => {
    const report = await renderRunner
      .getReport({
        name: 'observation-boundary',
        workload: 'empty measured operation; diagnostic geometry work afterward',
        content,
        metadata: { boundary: 'after counters and trace marks' },
        interact: async () => {},
        observe: page =>
          page.locator('#target').evaluate(element => {
            element.style.width = '300px';
            return { width: element.getBoundingClientRect().width };
          }),
        validate() {
          throw new Error('structural validation rejection');
        },
        budgets: { layoutCount: 0, styleRecalcCount: 0 }
      })
      .catch(error => {
        expect(error.message).toBe('structural validation rejection');
        return error.report;
      });
    expect(report.observations).toEqual({ width: 300 });
    expect(report.layoutCount).toBe(0);
    expect(report.exceededBudgets).toEqual([]);
    const persisted = JSON.parse(await readFile(report.artifacts.report, 'utf8'));
    expect(persisted.observations).toEqual({ width: 300 });
    expect(persisted.error).toContain('structural validation rejection');
  });
});
