import type { TemplateResult } from 'lit';
import { html, nothing } from 'lit';
import { beforeEach, describe, expect, it } from 'vitest';
import type { RenderOptions, RenderReport } from '@internals/vite';
import { renderRunner } from '@internals/vite';
import type { PopoverObservation } from '@internals/testing/render';

describe('nve-tooltip: rendering', () => {
  // getReport owns browser/CDP/server teardown, including failures from validate().
  for (const count of [1, 64]) {
    for (const customDisplay of [false, true]) {
      describe(`${count} ${customDisplay ? 'flex' : 'ordinary'} tooltips`, () => {
        let content: TemplateResult;

        beforeEach(() => {
          content = createTemplate(count, customDisplay);
        });

        it.each(['fresh', 'used'])(
          `closed tooltips: ${count} %s ${customDisplay ? 'flex' : 'ordinary'}`,
          async history => {
            const used = history === 'used';
            await renderRunner.getReport({
              name: `tooltip-${count}-${used ? 'used' : 'fresh'}-${customDisplay ? 'flex' : 'ordinary'}`,
              workload: '120 alternating 480/800px width writes and intentional geometry reads with closed tooltips',
              metadata: {
                tooltipCount: count,
                iterations: 120,
                used,
                customDisplay,
                inputs: used ? ['hover', 'focus'] : []
              },
              content,
              timeoutMs: 30000,
              prepare: prepare(count, used),
              interact: page => page.evaluate('window.renderWorkload.resize()'),
              observe: page => page.evaluate('window.renderWorkload.observe()'),
              // One deliberate flush per resize, with allowance for the runner's completion frames.
              budgets: { layoutCount: 122, styleRecalcCount: 122 },
              validate(report) {
                expect(report.observations!.checksum).toBe(120 * 640);
                assertClosed(report, count, used);
              }
            });
          }
        );
      });
    }
  }

  describe('real motion', () => {
    let content: TemplateResult;

    beforeEach(() => {
      content = createTemplate(1, true);
    });

    it('closed tooltips: real-motion repeated hover and focus', async () => {
      await renderRunner.getReport({
        name: 'tooltip-motion',
        workload: 'six settled frames after hover and keyboard-focus opening/dismissal',
        metadata: { tooltipCount: 1, observationFrames: 6 },
        reducedMotion: 'no-preference',
        content,
        prepare: prepare(1, true, true),
        interact: page => page.evaluate('window.renderWorkload.waitForFrames(6)'),
        observe: page => page.evaluate('window.renderWorkload.observe()'),
        budgets: { layoutCount: 2, styleRecalcCount: 2 },
        validate(report) {
          assertClosed(report, 1, true);
          if (report.observations!.anchoredTransitions) expect(report.observations!.animationCount).toBeGreaterThan(0);
        }
      });
    });
  });
});

function createTemplate(count: number, customDisplay: boolean) {
  return html`
    <style>
      #panel { width:640px; max-width:100%; height:360px; overflow:auto; }
      .row { display:flex; justify-content:flex-end; }
    </style>
    <button id="parking">Outside tooltip triggers</button>
    <div id="panel" data-custom-display=${String(customDisplay)}>${Array.from(
      { length: count },
      (_, index) => html`
      <div class="row">
        <nve-button id=${`trigger-${index}`} interestfor=${`tooltip-${index}`}>Details ${index}</nve-button>
        <nve-tooltip id=${`tooltip-${index}`} style=${customDisplay ? 'display:flex' : nothing}>Context for item ${index}</nve-tooltip>
      </div>`
    )}</div>
    <script type="module">
      import '@nvidia-elements/core/button/define.js';
      import '@nvidia-elements/core/tooltip/define.js';
      import { elementIsStable, waitForAnimationFrames } from '@internals/testing';
      import { observePopover, resizeWithGeometryReads, waitForEvent, waitForLitAnimations } from '@internals/testing/render';
      const panel = document.getElementById('panel');
      const customDisplay = panel.dataset.customDisplay === 'true';
      const tooltips = [...document.querySelectorAll('nve-tooltip')];
      const snapshots = [];
      const opened = { hover:[], focus:[] };
      let pending;
      let checksum = 0;
      let animationCount = 0;
      function snapshot(label) {
        snapshots.push({ label, states:tooltips.map(observePopover) });
      }
      window.renderWorkload = {
        waitForFrames: waitForAnimationFrames,
        async ready(realMotion) {
          await Promise.all([...tooltips, ...document.querySelectorAll('nve-button')].map(elementIsStable));
          await waitForAnimationFrames(2);
          for (const tooltip of tooltips) {
            tooltip.style.setProperty('--nve-ref-animation-duration-200', realMotion ? '0.04s' : '0s');
            tooltip.style.setProperty('interest-delay-start','10ms');
          }
          snapshot('fresh');
        },
        arm(index, open, input) {
          const tooltip = tooltips[index];
          // Listeners precede actual Playwright pointer/focus actions. The runner bounds this preparation phase.
          const eventName = open ? 'open' : 'close';
          pending = waitForEvent(tooltip, eventName, { label: tooltip.id + ': ' + input }).then(async () => {
            animationCount += await waitForLitAnimations(tooltip, { label: tooltip.id + ': ' + input });
            if (tooltip.matches(':popover-open') !== open) throw new Error(tooltip.id + ': unexpected native state');
            if (open) {
              if (!tooltip.getClientRects().length) throw new Error(tooltip.id + ': open tooltip has no box');
              if (customDisplay && getComputedStyle(tooltip).display !== 'flex') throw new Error(tooltip.id + ': author flex lost');
              opened[input].push(tooltip.id);
            } else snapshot(input + '-dismissed-' + index);
          });
          // Attach a handler while the automation action is still running; wait() propagates the same failure.
          pending.catch(() => {});
        },
        wait() { return pending; },
        resetPanel() {
          for (const width of [480,800,640]) {
            panel.style.width = width + 'px';
            if (Math.abs(panel.getBoundingClientRect().width - width) > 0.5) throw new Error('Panel width clamped');
          }
        },
        resize() {
          checksum += resizeWithGeometryReads(panel, { widths:[480,800], iterations:120 });
        },
        observe() {
          snapshot('after-operation');
          return { snapshots, opened, checksum, animationCount, anchoredTransitions:CSS.supports('container-type','anchored') };
        }
      };
    </script>`;
}

type BrowserPage = Parameters<NonNullable<RenderOptions['prepare']>>[0];

async function useTrigger(page: BrowserPage, index: number, input: string) {
  const trigger = page.locator(`#trigger-${index}`);
  await page.evaluate(`window.renderWorkload.arm(${index}, true, ${JSON.stringify(input)})`);
  if (input === 'hover') await trigger.hover();
  else {
    // Establish keyboard modality so the real focus event satisfies the invoker's :focus-visible contract.
    await page.keyboard.press('ArrowRight');
    await trigger.focus();
  }
  await page.evaluate('window.renderWorkload.wait()');
  await page.evaluate(`window.renderWorkload.arm(${index}, false, ${JSON.stringify(input)})`);
  if (input === 'hover') await page.mouse.move(0, 0);
  else await page.locator('#parking').focus();
  await page.evaluate('window.renderWorkload.wait()');
}

function prepare(count: number, used: boolean, realMotion = false): RenderOptions['prepare'] {
  return async page => {
    await page.evaluate(`window.renderWorkload.ready(${realMotion})`);
    if (used) {
      for (const input of ['hover', 'focus']) {
        for (let index = 0; index < count; index++) {
          await useTrigger(page, index, input);
        }
      }
    }
    await page.evaluate('window.renderWorkload.resetPanel()');
  };
}

function assertClosed(report: RenderReport, count: number, used: boolean) {
  const observations = report.observations!;
  expect(observations.opened).toEqual({
    hover: used ? Array.from({ length: count }, (_, index) => `tooltip-${index}`) : [],
    focus: used ? Array.from({ length: count }, (_, index) => `tooltip-${index}`) : []
  });
  if (!Array.isArray(observations.snapshots)) throw new Error('Missing tooltip snapshots');
  for (const snapshot of observations.snapshots) {
    const failures = snapshot.states.filter(
      (state: PopoverObservation) =>
        state.popover !== 'hint' || state.open || state.rects !== 0 || state.display !== 'none'
    );
    if (failures.length)
      throw new Error(`closed-tooltip-layout-box invariant: ${snapshot.label}: ${JSON.stringify(failures)}`);
  }
}
