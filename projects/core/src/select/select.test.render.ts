import type { TemplateResult } from 'lit';
import { html } from 'lit';
import { beforeEach, describe, expect, it } from 'vitest';
import { renderRunner } from '@internals/vite';

describe('nve-select: rendering', () => {
  // getReport owns browser/CDP/server cleanup, including assertion failures.
  for (const optionCount of [20, 1000]) {
    const selectedCount = 4;
    // Calibrated layout/style counts:
    // selection/reconnect 3/4, resize 2/2, close 1/5 (layout/style).
    // Opening includes focus, scrolling, and top-layer layout: 11/16 at 20 options, 13/18 at 1000.
    // Budgets allow a few follow-up passes; durations remain diagnostic.
    const scenarios = [
      {
        operation: 'select-tags',
        workload: 'batch native option selection changes in a narrow field',
        budgets: { layoutCount: 5, styleRecalcCount: 6 }
      },
      {
        operation: 'collapse',
        workload: 'shrink the selected tags container from 960px to 240px',
        budgets: { layoutCount: 4, styleRecalcCount: 4 }
      },
      {
        operation: 'expand',
        workload: 'expand the selected tags container from 240px to 960px',
        budgets: { layoutCount: 4, styleRecalcCount: 4 }
      },
      {
        operation: 'reconnect',
        workload: 'reconnect and shrink after three prior reconnect/resize cycles',
        budgets: { layoutCount: 5, styleRecalcCount: 6 }
      },
      {
        operation: 'open',
        workload: 'open the dropdown with the native select keyboard trigger',
        budgets: { layoutCount: 16, styleRecalcCount: 22 }
      },
      {
        operation: 'close',
        workload: 'dismiss the open dropdown with Escape',
        budgets: { layoutCount: 3, styleRecalcCount: 7 }
      }
    ];
    for (const { operation, workload, budgets } of scenarios) {
      describe(`${operation} with ${optionCount} options`, () => {
        let content: TemplateResult;

        beforeEach(() => {
          content = createTemplate(optionCount, selectedCount, operation);
        });

        it('preserves selection, overflow, and dropdown layout with bounded rendering', async () => {
          await renderRunner.getReport({
            name: `select-${operation}-${optionCount}`,
            workload,
            metadata: {
              optionCount,
              selectedCount,
              operation,
              priorReconnects: operation === 'reconnect' ? 3 : 0,
              popoverDurationMs: 0,
              caretTransition: false
            },
            content,
            prepare: async page => {
              await page.evaluate('window.renderWorkload.ready()');
              if (operation === 'close') {
                await page.evaluate('window.renderWorkload.arm(true)');
                await page.locator('select').press('ArrowDown');
                await page.evaluate('window.renderWorkload.finishToggle()');
              }
              await page.evaluate('window.renderWorkload.start()');
              if (operation === 'open' || operation === 'close')
                await page.evaluate(`window.renderWorkload.arm(${operation === 'open'})`);
            },
            interact: async page => {
              if (operation === 'open') await page.locator('select').press('ArrowDown');
              else if (operation === 'close') await page.keyboard.press('Escape');
              else await page.evaluate('window.renderWorkload.run()');
            },
            complete: page => page.evaluate('window.renderWorkload.complete()'),
            observe: page => page.evaluate('window.renderWorkload.observe()'),
            budgets,
            validate(report) {
              const { before, after, reconnects, cycleSnapshots, errors } = report.observations!;
              const selected = Array.from({ length: selectedCount }, (_, index) => `option-${index}`);
              expect(errors).toEqual([]);
              expect(after).toMatchObject({ optionCount, menuCount: optionCount, selected, tagValues: selected });
              expect(before).toHaveProperty('selected.length', operation === 'select-tags' ? 1 : selectedCount);
              expect(before).toHaveProperty('overflow', operation === 'expand');
              expect(before).toHaveProperty('dropdown.open', operation === 'close');
              if (operation === 'open') {
                expect(after).toMatchObject({
                  dropdown: { popover: 'auto', open: true, rects: 1 },
                  popupMatchesField: true
                });
              } else {
                expect(after).toMatchObject({ dropdown: { popover: 'auto', open: false, rects: 0, display: 'none' } });
              }
              const collapsed = ['select-tags', 'collapse', 'reconnect'].includes(operation);
              expect(after).toMatchObject({
                panelWidth: collapsed ? 240 : 960,
                overflow: collapsed,
                tagsExceedField: collapsed,
                tagsOpacity: collapsed ? '0' : '1',
                tagsPosition: collapsed ? 'absolute' : 'static',
                labelDisplay: collapsed ? 'block' : 'none',
                labelText: `${selectedCount} selected`
              });
              expect(reconnects).toBe(operation === 'reconnect' ? 4 : 0);
              expect(cycleSnapshots).toMatchObject(
                operation === 'reconnect'
                  ? Array.from({ length: 3 }, () => [
                      { panelWidth: 240, overflow: true },
                      { panelWidth: 960, overflow: false }
                    ]).flat()
                  : []
              );
            }
          });
        });
      });
    }
  }
});

function createTemplate(optionCount: number, selectedCount: number, operation: string) {
  return html`
    <style>
      #panel { width:960px; max-width:100%; }
      nve-select { --min-width:0px; }
      /* Decorative caret motion is outside these selection and popup geometry workloads. */
      nve-select::part(caret) { transition:none; }
    </style>
    <div id="panel" data-operation=${operation} data-selected-count=${selectedCount}>
      <nve-select>
        <label>Options</label>
        <select multiple>${Array.from(
          { length: optionCount },
          (_, index) =>
            html`<option value=${`option-${index}`} ?selected=${index < (operation === 'select-tags' ? 1 : selectedCount)}>Option ${index}</option>`
        )}</select>
      </nve-select>
    </div>
    <script type="module">
      import '@nvidia-elements/core/select/define.js';
      import { elementIsStable, waitForAnimationFrames } from '@internals/testing';
      import { observePopover, waitForEvent, waitForLitAnimations } from '@internals/testing/render';
      const panel = document.getElementById('panel');
      const operation = panel.dataset.operation;
      const selectedCount = Number(panel.dataset.selectedCount);
      const component = panel.querySelector('nve-select');
      const select = component.querySelector('select');
      const options = [...select.options];
      const errors = [];
      const cycleSnapshots = [];
      window.addEventListener('error', event => errors.push(event.message));
      let root, field, dropdown, before, pending;
      let reconnects = 0;
      async function settle() {
        // Two bounded rounds include field ResizeObserver delivery, child Lit work, and follow-up rendering.
        for (let round = 0; round < 2; round++) {
          await elementIsStable(component);
          await Promise.all([...component.shadowRoot.querySelectorAll('*')].filter(element => 'updateComplete' in element).map(elementIsStable));
          await waitForAnimationFrames(2);
        }
      }
      function state() {
        const tags = root.querySelector('.tags');
        const label = root.querySelector('.tags-label');
        const fieldWidth = field.getBoundingClientRect().width;
        const tagWidth = tags.getBoundingClientRect().width;
        const popupWidth = dropdown.getBoundingClientRect().width;
        return {
          panelWidth:panel.getBoundingClientRect().width, hostWidth:component.getBoundingClientRect().width,
          fieldWidth, tagWidth, tagsExceedField:tagWidth > fieldWidth,
          popupWidth, popupMatchesField:Math.abs(popupWidth - fieldWidth) <= 1,
          optionCount:options.length, menuCount:root.querySelectorAll('nve-menu-item').length,
          selected:options.filter(option => option.selected).map(option => option.value),
          tagValues:[...root.querySelectorAll('nve-tag')].map(tag => tag.value),
          overflow:component.matches(':state(multiple-overflow)'),
          tagsOpacity:getComputedStyle(tags).opacity, tagsPosition:getComputedStyle(tags).position,
          labelDisplay:getComputedStyle(label).display, labelText:label.textContent.trim(),
          dropdown:observePopover(dropdown)
        };
      }
      async function reconnect() {
        component.remove();
        panel.append(component);
        reconnects++;
        await settle();
      }
      window.renderWorkload = {
        async ready() {
          await elementIsStable(component);
          root = component.shadowRoot;
          field = root.querySelector('[input]');
          dropdown = root.querySelector('nve-dropdown');
          dropdown.style.setProperty('--nve-ref-animation-duration-200','0s');
          if (operation === 'select-tags' || operation === 'expand') panel.style.width = '240px';
          await settle();
          if (operation === 'reconnect') {
            for (let cycle = 0; cycle < 3; cycle++) {
              await reconnect();
              panel.style.width = '240px'; await settle(); cycleSnapshots.push(state());
              panel.style.width = '960px'; await settle(); cycleSnapshots.push(state());
            }
          }
        },
        start() { before = state(); },
        arm(open) {
          pending = waitForEvent(dropdown, open ? 'open' : 'close', { label:'select dropdown' });
          pending.catch(() => {});
        },
        async finishToggle() {
          await pending;
          await waitForLitAnimations(dropdown, { label:'select dropdown' });
          await settle();
        },
        async run() {
          if (operation === 'select-tags') options.slice(1, selectedCount).forEach(option => option.selected = true);
          else {
            if (operation === 'reconnect') await reconnect();
            panel.style.width = operation === 'expand' ? '960px' : '240px';
          }
        },
        async complete() {
          if (operation === 'open' || operation === 'close') await this.finishToggle();
          else await settle();
        },
        observe() { return { before, after:state(), reconnects, cycleSnapshots, errors }; }
      };
    </script>`;
}
