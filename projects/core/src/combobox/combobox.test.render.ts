import type { TemplateResult } from 'lit';
import { html, nothing } from 'lit';
import { beforeEach, describe, expect, it } from 'vitest';
import { renderRunner } from '@internals/vite';

describe('nve-combobox: rendering', () => {
  // getReport owns browser/CDP/server teardown, including failures from validate().
  for (const { optionCount, selectedCount } of [
    { optionCount: 20, selectedCount: 4 },
    { optionCount: 50, selectedCount: 4 },
    { optionCount: 51, selectedCount: 4 },
    { optionCount: 100, selectedCount: 4 },
    { optionCount: 1000, selectedCount: 8 }
  ]) {
    const operations = ['select-tags', 'collapse', 'wrap', 'filter'];
    if (optionCount === 20 || optionCount === 1000) operations.push('reconnect', 'show-tags');
    for (const operation of operations) {
      describe(`combobox ${operation} with ${optionCount} options`, () => {
        let content: TemplateResult;

        beforeEach(() => {
          content = createTemplate(optionCount, selectedCount, operation);
        });

        it('completes the operation with correct state and bounded rendering', async () => {
          await renderRunner.getReport({
            name: `combobox-${operation}-${optionCount}`,
            workload:
              operation === 'reconnect'
                ? 'reconnect the same instance and shrink its container'
                : operation === 'show-tags'
                  ? 'enable initially hidden tags and shrink their container'
                  : operation === 'filter'
                    ? 'filter an open list to two matches'
                    : operation === 'select-tags'
                      ? 'batch selected-option property updates'
                      : `shrink ${operation === 'wrap' ? 'wrapping' : 'collapsed'} tags from 960px to 240px`,
            metadata: { optionCount, selectedCount: operation === 'filter' ? 0 : selectedCount, operation },
            content,
            prepare: async page => {
              await page.evaluate('window.renderWorkload.ready()');
              if (operation === 'filter') {
                await page.locator('input[type="search"]').click();
                await page.evaluate('window.renderWorkload.settle()');
              }
              await page.evaluate('window.renderWorkload.start()');
            },
            interact: page => page.evaluate('window.renderWorkload.run()'),
            complete: page => page.evaluate('window.renderWorkload.settle()'),
            observe: page => page.evaluate('window.renderWorkload.observe()'),
            // Calibrated layout/style counts: selection/lifecycle 3/4, resize 2/3, filtering 2/2.
            budgets: ['select-tags', 'reconnect', 'show-tags'].includes(operation)
              ? { layoutCount: 5, styleRecalcCount: 6 }
              : { layoutCount: 4, styleRecalcCount: 5 },
            validate(report) {
              const { before, after, errors } = report.observations!;
              expect(errors).toEqual([]);
              if (!isRecord(after)) throw new Error('Missing combobox observations');
              if (operation === 'filter') {
                expect(before).toHaveProperty('dropdown.open', true);
                expect(before).toHaveProperty('menuOptions.length', optionCount);
                expect(after).toMatchObject({
                  inputValue: 'match',
                  visibleOptions: ['option-0', 'option-1'],
                  menuOptions: ['match 0', 'match 1']
                });
                expect(after).toHaveProperty('dropdown.open', true);
                expect(after).toHaveProperty('dropdown.rects', 1);
                expect(Number(after.highlightedCharacters) > 0).toBe(optionCount <= 50);
              } else {
                expect(before).toHaveProperty('overflow', false);
                expect(after).toHaveProperty('panelWidth', 240);
                if (operation !== 'select-tags') expect(before).toHaveProperty('panelWidth', 960);
                expect(after.checkboxComponents).toBe(optionCount <= 50 ? optionCount : 0);
                expect(after.nativeMenuCheckboxes).toBe(optionCount > 50 ? optionCount : 0);
                if (operation === 'show-tags') expect(before).toHaveProperty('tagRects.length', 0);
                assertTags(after, selectedCount, operation === 'wrap' || operation === 'show-tags');
              }
            }
          });
        });
      });
    }
  }
});

function createTemplate(optionCount: number, selectedCount: number, operation: string) {
  const filtering = operation === 'filter';
  const initialSelection = operation === 'select-tags' ? 1 : selectedCount;
  const options = Array.from(
    { length: optionCount },
    (_, index) => html`
    <option value=${`option-${index}`} ?selected=${!filtering && index < initialSelection}>${filtering && index < 2 ? 'match' : 'Option'} ${index}</option>`
  );
  return html`
    <style>
      #panel { width:960px; max-width:100%; }
    </style>
    <div id="panel" data-operation=${operation} data-selected-count=${selectedCount}>
      <nve-combobox tag-layout=${operation === 'wrap' ? 'wrap' : operation === 'show-tags' ? 'hidden' : nothing}>
        <label>Options</label><input type="search" />
        ${filtering ? html`<datalist>${options}</datalist>` : html`<select multiple>${options}</select>`}
      </nve-combobox>
    </div>
    <script type="module">
      import '@nvidia-elements/core/combobox/define.js';
      import { elementIsStable, waitForAnimationFrames } from '@internals/testing';
      import { observePopover } from '@internals/testing/render';
      const panel = document.getElementById('panel');
      const operation = panel.dataset.operation;
      const selectedCount = Number(panel.dataset.selectedCount);
      const combobox = panel.querySelector('nve-combobox');
      const input = combobox.querySelector('input');
      const options = [...combobox.querySelectorAll('option')];
      const errors = [];
      window.addEventListener('error', event => errors.push(event.message));
      let root, dropdown, before;
      async function settle() {
        // Two rendering opportunities per round include ResizeObserver-driven state changes and child Lit updates.
        // This bounds this workload's follow-up rendering; it does not prove arbitrary asynchronous work has finished.
        for (let round = 0; round < 2; round++) {
          await elementIsStable(combobox);
          await Promise.all([...combobox.shadowRoot.querySelectorAll('*')].filter(element => 'updateComplete' in element).map(elementIsStable));
          await waitForAnimationFrames(2);
        }
      }
      function state() {
        const tags = root.querySelector('.tags');
        const label = root.querySelector('.tags-label');
        const field = root.querySelector('[input]');
        const fieldRect = field.getBoundingClientRect();
        const tagRects = [...root.querySelectorAll('nve-tag')].map(tag => {
          const rect = tag.getBoundingClientRect();
          return { left:rect.left, right:rect.right, top:rect.top, bottom:rect.bottom };
        });
        return {
          panelWidth:panel.getBoundingClientRect().width, fieldHeight:fieldRect.height,
          fieldLeft:fieldRect.left, fieldRight:fieldRect.right, fieldTop:fieldRect.top, fieldBottom:fieldRect.bottom,
          overflow:combobox.matches(':state(multiple-overflow)'), selected:options.filter(option => option.selected).map(option => option.value),
          tagRects, tagsOpacity:tags ? getComputedStyle(tags).opacity : null,
          tagsPosition:tags ? getComputedStyle(tags).position : null, tagsWrap:tags ? getComputedStyle(tags).flexWrap : null,
          labelDisplay:label ? getComputedStyle(label).display : null, labelText:label?.textContent.trim(),
          visibleOptions:options.filter(option => !option.hidden).map(option => option.value),
          menuOptions:[...root.querySelectorAll('nve-menu-item')].map(item => item.option),
          checkboxComponents:root.querySelectorAll('nve-checkbox').length,
          nativeMenuCheckboxes:root.querySelectorAll('nve-menu-item > input[type="checkbox"]').length,
          highlightedCharacters:root.querySelectorAll('nve-menu-item span[role="presentation"] span').length,
          inputValue:input.value, dropdown:observePopover(dropdown)
        };
      }
      window.renderWorkload = {
        async ready() {
          await elementIsStable(combobox);
          root = combobox.shadowRoot;
          dropdown = root.querySelector('nve-dropdown');
          dropdown.style.setProperty('--animation-duration','0s');
          if (operation === 'select-tags') panel.style.width = '240px';
          await settle();
        },
        start() { before = state(); },
        async run() {
          if (operation === 'filter') {
            input.value = 'match';
            input.dispatchEvent(new InputEvent('input', { bubbles:true }));
          } else if (operation === 'select-tags') {
            options.slice(1, selectedCount).forEach(option => option.selected = true);
          } else {
            if (operation === 'reconnect') {
              combobox.remove(); panel.append(combobox);
              await settle();
            } else if (operation === 'show-tags') {
              combobox.tagLayout = 'wrap';
              await settle();
            }
            panel.style.width = '240px';
          }
        },
        settle,
        observe() { return { before, after:state(), errors }; }
      };
    </script>`;
}

function assertTags(state: Record<string, unknown>, selectedCount: number, wrapping: boolean) {
  expect(state.overflow, 'combobox overflow must track the available input width').toBe(true);
  expect(state.selected).toEqual(Array.from({ length: selectedCount }, (_, index) => `option-${index}`));
  expect(state.tagRects).toHaveLength(selectedCount);
  expect(state.dropdown).toMatchObject({ popover: 'manual', open: false, rects: 0 });
  if (!wrapping) {
    expect(state).toMatchObject({
      tagsOpacity: '0',
      tagsPosition: 'absolute',
      labelDisplay: 'flex',
      labelText: `${selectedCount} selected`
    });
    return;
  }
  expect(state).toMatchObject({ tagsOpacity: '1', tagsPosition: 'static', tagsWrap: 'wrap', labelDisplay: 'none' });
  if (!Array.isArray(state.tagRects)) throw new Error('Missing tag geometry');
  const left = Number(state.fieldLeft),
    right = Number(state.fieldRight),
    bottom = Number(state.fieldBottom);
  expect(
    state.tagRects.every(rect => rect.left >= left - 1 && rect.right <= right + 1 && rect.bottom <= bottom + 1)
  ).toBe(true);
  expect(new Set(state.tagRects.map(rect => rect.top)).size).toBeGreaterThan(1);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
