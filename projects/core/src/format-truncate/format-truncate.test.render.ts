import type { TemplateResult } from 'lit';
import { html } from 'lit';
import { beforeEach, describe, expect, it } from 'vitest';
import { renderRunner } from '@internals/vite';

const longText = '/models/checkpoints/production/vision-transformer/training/run-0001/model.bin';
const shortText = 'model.bin';
const scenarios = [
  {
    operation: 'shrink',
    position: 'start',
    strategy: 'character',
    width: 960,
    text: longText,
    result: longText,
    resultWidth: 160
  },
  {
    operation: 'expand',
    position: 'end',
    strategy: 'character',
    width: 160,
    text: longText,
    result: longText,
    resultWidth: 960
  },
  {
    operation: 'replace-short',
    position: 'center',
    strategy: 'word',
    width: 160,
    text: longText,
    result: shortText,
    resultWidth: 160
  },
  {
    operation: 'replace-long',
    position: 'center',
    strategy: 'path',
    width: 160,
    text: shortText,
    result: longText,
    resultWidth: 160
  },
  {
    operation: 'reconnect',
    position: 'end',
    strategy: 'character',
    width: 960,
    text: longText,
    result: longText,
    resultWidth: 160
  },
  {
    operation: 'idle',
    position: 'start',
    strategy: 'character',
    width: 160,
    text: longText,
    result: longText,
    resultWidth: 160
  }
] as const;

describe('nve-format-truncate: rendering', () => {
  // getReport owns browser/CDP/server cleanup, including assertion failures.
  for (const count of [1, 64]) {
    for (const scenario of scenarios) {
      const { operation, position, strategy, width, text, result, resultWidth } = scenario;
      describe(`${operation} with ${count} instances`, () => {
        let content: TemplateResult;

        beforeEach(() => {
          content = createTemplate(count, scenario);
        });

        it('updates fitting text, preserves the accessible source, and settles rendering', async () => {
          await renderRunner.getReport({
            name: `truncate-${operation}-${count}`,
            workload:
              operation === 'idle'
                ? 'eight rendering opportunities after three shrink/expand cycles'
                : `${operation} a batch of ${count} text truncation components`,
            metadata: {
              count,
              operation,
              position,
              strategy,
              width,
              resultWidth,
              priorCycles: operation === 'reconnect' || operation === 'idle' ? 3 : 0,
              observationFrames: operation === 'idle' ? 8 : undefined
            },
            content,
            prepare: page => page.evaluate('window.renderWorkload.ready()'),
            interact: page => page.evaluate('window.renderWorkload.run()'),
            complete: page => page.evaluate('window.renderWorkload.complete()'),
            observe: page => page.evaluate('window.renderWorkload.observe()'),
            // Content-width snapshots keep layouts bounded independently of instance count.
            // Font style resolution still scales per instance: 2/33 style recalculations at 1/64 instances.
            // Reconnecting adds one style/layout pass. The idle window permits at most one incidental pass.
            budgets:
              operation === 'idle'
                ? { layoutCount: 1, styleRecalcCount: 1 }
                : { layoutCount: operation === 'reconnect' ? 5 : 4, styleRecalcCount: count === 64 ? 36 : 5 },
            validate(report) {
              const { before, after, cycles, reconnects, errors } = report.observations!;
              expect(errors).toEqual([]);
              assertSnapshot(before, { count, source: text, panelWidth: width, position });
              assertSnapshot(after, { count, source: result, panelWidth: resultWidth, position });
              expect(reconnects).toBe(operation === 'reconnect' ? 4 : 0);
              if (!Array.isArray(cycles)) throw new Error('Missing resize history');
              expect(cycles).toHaveLength(operation === 'reconnect' || operation === 'idle' ? 6 : 0);
              cycles.forEach((snapshot, index) =>
                assertSnapshot(snapshot, { count, source: longText, panelWidth: index % 2 ? 960 : 160, position })
              );
              if (operation === 'idle') expect(after).toEqual(before);
              else expect(after).not.toEqual(before);
            }
          });
        });
      });
    }
  }
});

interface TruncateState {
  source: string;
  visible: string;
  title: string | null;
  width: number;
  textWidth: number;
}

function assertSnapshot(
  value: unknown,
  { count, source, panelWidth, position }: { count: number; source: string; panelWidth: number; position: string }
) {
  if (!value || typeof value !== 'object' || !('states' in value) || !Array.isArray(value.states))
    throw new Error('Missing truncation snapshot');
  expect(value).toHaveProperty('panelWidth', panelWidth);
  expect(value.states).toHaveLength(count);
  const truncated = source === longText && panelWidth === 160;
  value.states.forEach((state: TruncateState) => {
    expect(state).toMatchObject({
      source,
      sizingText: source,
      accessibleSource: source,
      visualAriaHidden: 'true',
      sizingAriaHidden: 'true',
      slotAriaHidden: null,
      title: truncated ? source : null
    });
    expect(state.width).toBeGreaterThan(0);
    expect(state.width).toBeLessThanOrEqual(panelWidth + 1);
    expect(state.textWidth).toBeGreaterThan(0);
    expect(state.textWidth).toBeLessThanOrEqual(state.width + 1);
    if (!truncated) expect(state.visible).toBe(source);
    else {
      expect(state.visible).toContain('…');
      expect(state.visible.length).toBeLessThan(source.length);
      if (position === 'start') expect(state.visible.startsWith('…')).toBe(true);
      if (position === 'end') expect(state.visible.endsWith('…')).toBe(true);
    }
  });
}

function createTemplate(count: number, scenario: (typeof scenarios)[number]) {
  return html`
    <style>
      #panel { max-width:100%; }
      .row { min-width:0; }
      nve-format-truncate { font:14px/20px monospace; }
    </style>
    <div id="panel" style=${`width:${scenario.width}px`} data-operation=${scenario.operation} data-result=${scenario.result}>
      ${Array.from(
        { length: count },
        (_, index) => html`
        <div class="row"><nve-format-truncate id=${`text-${index}`} position=${scenario.position} strategy=${scenario.strategy} preserve="1">${scenario.text}</nve-format-truncate></div>`
      )}
    </div>
    <script type="module">
      import '@nvidia-elements/core/format-truncate/define.js';
      import { elementIsStable, waitForAnimationFrames } from '@internals/testing';
      const panel = document.getElementById('panel');
      const operation = panel.dataset.operation;
      const items = [...panel.querySelectorAll('nve-format-truncate')];
      const rows = items.map(item => item.parentElement);
      const errors = [], cycles = [];
      window.addEventListener('error', event => errors.push(event.message));
      let before, reconnects = 0;
      const stable = () => Promise.all(items.map(elementIsStable));
      async function settle() {
        // Slot changes and intrinsic sizing can each trigger a Lit update followed by ResizeObserver delivery.
        // Three bounded rounds cover these follow-ups; this is not a guarantee about arbitrary future work.
        for (let round = 0; round < 3; round++) {
          await stable();
          await waitForAnimationFrames(2);
        }
        await stable();
      }
      function snapshot() {
        return {
          panelWidth:panel.getBoundingClientRect().width,
          states:items.map(item => {
            const visual = item.shadowRoot.querySelector('[internal-host]');
            const sizing = item.shadowRoot.querySelector('[sizing-host]');
            const slot = item.shadowRoot.querySelector('slot');
            const range = document.createRange();
            range.selectNodeContents(visual);
            const textWidth = range.getBoundingClientRect().width;
            range.detach();
            return {
              id:item.id, source:item.textContent.trim(), visible:visual.textContent, title:item.getAttribute('title'),
              width:item.getBoundingClientRect().width, textWidth,
              sizingText:sizing.textContent, accessibleSource:slot.assignedNodes({flatten:true}).map(node => node.textContent).join(' ').trim(),
              visualAriaHidden:visual.getAttribute('aria-hidden'), sizingAriaHidden:sizing.getAttribute('aria-hidden'), slotAriaHidden:slot.getAttribute('aria-hidden')
            };
          })
        };
      }
      async function reconnect() {
        items.forEach(item => item.remove());
        items.forEach((item, index) => rows[index].append(item));
        reconnects++;
        // Complete the reconnection before resizing, so the following resize requires a working observer.
        await settle();
      }
      window.renderWorkload = {
        async ready() {
          await document.fonts.ready;
          await settle();
          if (operation === 'idle' || operation === 'reconnect') {
            for (let cycle = 0; cycle < 3; cycle++) {
              if (operation === 'reconnect') await reconnect();
              panel.style.width = '160px'; await settle(); cycles.push(snapshot());
              panel.style.width = '960px'; await settle(); cycles.push(snapshot());
            }
            if (operation === 'idle') { panel.style.width = '160px'; await settle(); }
          }
          before = snapshot();
        },
        async run() {
          if (operation === 'idle') await waitForAnimationFrames(6);
          else if (operation.startsWith('replace')) items.forEach(item => item.textContent = panel.dataset.result);
          else {
            if (operation === 'reconnect') await reconnect();
            panel.style.width = operation === 'expand' ? '960px' : '160px';
          }
        },
        async complete() { if (operation !== 'idle') await settle(); },
        observe() { return { before, after:snapshot(), cycles, reconnects, errors }; }
      };
    </script>`;
}
