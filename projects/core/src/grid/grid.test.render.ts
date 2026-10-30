import type { TemplateResult } from 'lit';
import { html } from 'lit';
import { beforeEach, describe, expect, it } from 'vitest';
import { renderRunner } from '@internals/vite';

describe('nve-grid: rendering', () => {
  // getReport owns browser/CDP/server teardown, including failures from validate().
  for (const rows of [25, 100]) {
    describe(`${rows * 20} grid cells`, () => {
      let content: TemplateResult;

      beforeEach(() => {
        content = createTextTemplate(rows);
      });

      it('batches text mutations', async () => {
        const report = await renderRunner.getReport({
          name: `grid-text-${rows * 20}`,
          workload: `cold batch: ${rows} rows × 20 columns; update every cell text`,
          content,
          prepare: async page => {
            await page.evaluate('window.renderWorkload.ready');
            await page.waitForTimeout(250);
          },
          interact: page => page.evaluate('window.renderWorkload.mutate()'),
          complete: page => page.evaluate('window.renderWorkload.complete()'),
          budgets: { layoutCount: 4, styleRecalcCount: 4 }
        });
        expect(report.exceededBudgets).toEqual([]);
      });
    });
  }

  for (const columns of [8, 32]) {
    describe(`column layout across ${columns} columns`, () => {
      let content: TemplateResult;

      beforeEach(() => {
        content = createColumnTemplate(columns);
      });

      it.each(['column-widths', 'container-resize', 'fixed-columns'])(
        `grid %s across ${columns} columns`,
        async operation => {
          await renderRunner.getReport({
            name: `grid-${operation}-${columns}`,
            workload:
              operation === 'column-widths'
                ? 'batch updates to half the column widths'
                : operation === 'container-resize'
                  ? 'resize container from 960px to 720px'
                  : 'activate fixed edge columns and scroll horizontally by 100px',
            metadata: { columns, rows: 8, operation },
            content,
            prepare: page => page.evaluate(`window.renderWorkload.prepare(${JSON.stringify(operation)})`),
            interact: page => page.evaluate(`window.renderWorkload.run(${JSON.stringify(operation)})`),
            complete: page => page.evaluate('window.renderWorkload.settle()'),
            observe: page => page.evaluate('window.renderWorkload.observe()'),
            // Calibration: widths 2/2, container resize 3/3, fixed columns 2/6 (layout/style).
            // Allow follow-up rendering without permitting one layout per auto-sized column.
            budgets:
              operation === 'fixed-columns'
                ? { layoutCount: 4, styleRecalcCount: 8 }
                : operation === 'container-resize'
                  ? { layoutCount: 5, styleRecalcCount: 5 }
                  : { layoutCount: 4, styleRecalcCount: 4 },
            validate(report) {
              const { before, after, widths, cellCount } = report.observations!;
              expect(cellCount).toBe(columns * 8);
              expect(before).toHaveProperty('mismatches', []);
              expect(after).toHaveProperty('mismatches', []);
              // Geometry is collected only after ending counters, so these assertions do not manufacture measured layouts.
              if (typeof after !== 'object' || after === null || !('headers' in after) || !Array.isArray(after.headers))
                throw new Error('Missing grid geometry');
              expect(after.headers.every((header: { width: number }) => header.width > 0)).toBe(true);
              if (operation === 'column-widths') {
                expect(Array.isArray(widths) && widths.slice(0, columns / 2)).toEqual(
                  Array.from({ length: columns / 2 }, (_, index) => `${192 + (index % 2) * 16}px`)
                );
                after.headers
                  .slice(0, columns / 2)
                  .forEach((header: { width: number }, index: number) =>
                    expect(Math.abs(header.width - (192 + (index % 2) * 16))).toBeLessThanOrEqual(1)
                  );
              } else if (operation === 'container-resize') {
                expect(before).toHaveProperty('panelWidth', 960);
                expect(after).toHaveProperty('panelWidth', 720);
              } else {
                expect(after).toHaveProperty('scrollLeft', 100);
                const first = after.headers[0];
                const last = after.headers[columns - 1];
                expect(first).toMatchObject({ position: 'sticky', insetLeft: '0px' });
                expect(last).toMatchObject({ position: 'sticky', insetRight: '0px' });
                const viewport = viewportEdges(after);
                expect(Math.abs(first.left - viewport.left)).toBeLessThanOrEqual(1);
                expect(Math.abs(last.right - viewport.right)).toBeLessThanOrEqual(1);
              }
            }
          });
        }
      );
    });
  }
});

function createTextTemplate(rows: number) {
  return html`
      <nve-grid aria-label="render regression" style="width:1100px" data-rows=${rows}>
        <nve-grid-header>${Array.from({ length: 20 }, (_, i) => html`<nve-grid-column>${i}</nve-grid-column>`)}</nve-grid-header>
        ${Array.from({ length: rows }, () => html`<nve-grid-row>${Array.from({ length: 20 }, (_, i) => html`<nve-grid-cell>${i}</nve-grid-cell>`)}</nve-grid-row>`)}
      </nve-grid>
      <script type="module">
        import '@nvidia-elements/core/grid/define.js';
        import { elementIsStable } from '@internals/testing';
        const grid = document.querySelector('nve-grid');
        const cells = [...grid.querySelectorAll('nve-grid-cell')];
        if (cells.length !== Number(grid.dataset.rows) * 20) throw new Error('Unexpected grid fixture cell count');
        window.renderWorkload = {
          ready: Promise.all([...grid.querySelectorAll('*'), grid].map(elementIsStable)),
          mutate() { cells.forEach((cell, i) => cell.textContent = 'updated cell ' + i); },
          async complete() {
            await elementIsStable(grid);
            // Header ResizeObserver uses a 100 ms debounce. Include follow-up width updates.
            await new Promise(resolve => setTimeout(resolve, 200));
            await elementIsStable(grid);
            if (!cells.every((cell, i) => cell.textContent === 'updated cell ' + i)) throw new Error('Cell mutation incomplete');
          }
        };
      </script>`;
}

function createColumnTemplate(columnCount: number) {
  return html`
    <style>
      #panel { width:960px; max-width:100%; }
      nve-grid { --scroll-height:360px; }
      /* Scroll shadows are unrelated to column sizing and positioning. */
      nve-grid-column, nve-grid-cell { --min-width:80px; transition:none; }
    </style>
    <div id="panel"><nve-grid aria-label="column rendering">
      <nve-grid-header>${Array.from({ length: columnCount }, (_, i) => html`<nve-grid-column>H${i}</nve-grid-column>`)}</nve-grid-header>
      ${Array.from({ length: 8 }, (_, row) => html`<nve-grid-row>${Array.from({ length: columnCount }, (_, column) => html`<nve-grid-cell>${row}:${column}</nve-grid-cell>`)}</nve-grid-row>`)}
    </nve-grid></div>
    <script type="module">
      import '@nvidia-elements/core/grid/define.js';
      import { elementIsStable, waitForAnimationFrames } from '@internals/testing';
      const panel = document.getElementById('panel');
      const grid = panel.querySelector('nve-grid');
      const columns = [...grid.querySelectorAll('nve-grid-column')];
      const cells = [...grid.querySelectorAll('nve-grid-cell')];
      let scroller;
      const elements = [...grid.querySelectorAll('*'), grid];
      const stable = () => Promise.all(elements.map(elementIsStable));
      async function settle() {
        await stable();
        // Header width computation has a 100 ms ResizeObserver debounce. Include its follow-up Lit/render work.
        await new Promise(resolve => setTimeout(resolve, 250));
        await stable();
        await waitForAnimationFrames(2);
      }
      function geometry() {
        const headers = columns.map(column => {
          const rect = column.getBoundingClientRect();
          const style = getComputedStyle(column);
          return { left:rect.left, right:rect.right, width:rect.width, position:style.position, insetLeft:style.left, insetRight:style.right };
        });
        const mismatches = cells.flatMap((cell, index) => {
          const rect = cell.getBoundingClientRect();
          const header = headers[index % columns.length];
          return Math.abs(rect.left - header.left) > 1 || Math.abs(rect.width - header.width) > 1
            ? [{ index, left:rect.left, width:rect.width, header }] : [];
        });
        const scrollRect = scroller.getBoundingClientRect();
        return { headers, mismatches, panelWidth:panel.getBoundingClientRect().width,
          scrollLeft:scroller.scrollLeft, scrollWidth:scroller.scrollWidth, clientWidth:scroller.clientWidth,
          viewportLeft:scrollRect.left, viewportRight:scrollRect.left + scroller.clientWidth };
      }
      let before;
      window.renderWorkload = {
        async prepare(operation) {
          await stable();
          scroller = grid.shadowRoot.querySelector('[part="_scrollbox"]');
          if (!scroller) throw new Error('Grid scroll container did not render');
          if (operation === 'fixed-columns') panel.style.width = '480px';
          await settle();
          before = geometry();
          if (operation === 'fixed-columns' && scroller.scrollWidth <= scroller.clientWidth + 100) throw new Error('Fixed-column fixture must scroll horizontally');
        },
        async run(operation) {
          if (operation === 'column-widths') {
            columns.slice(0, columns.length / 2).forEach((column, index) => column.width = (192 + index % 2 * 16) + 'px');
          } else if (operation === 'container-resize') {
            panel.style.width = '720px';
          } else {
            columns[0].position = 'fixed';
            columns[columns.length - 1].position = 'fixed';
            await stable();
            scroller.scrollLeft = 100;
          }
        },
        settle,
        observe() { return { before, after:geometry(), widths:columns.map(column => column.width), cellCount:cells.length }; }
      };
    </script>`;
}

function viewportEdges(value: object) {
  if (
    !('viewportLeft' in value) ||
    typeof value.viewportLeft !== 'number' ||
    !('viewportRight' in value) ||
    typeof value.viewportRight !== 'number'
  )
    throw new Error('Missing scroll viewport geometry');
  return { left: value.viewportLeft, right: value.viewportRight };
}
