import type { TemplateResult } from 'lit';
import { html, nothing } from 'lit';
import { beforeEach, describe, expect, it } from 'vitest';
import { renderRunner } from '@internals/vite';
import type { PopoverObservation } from '@internals/testing/render';

describe('nve-dropdown: rendering', () => {
  // getReport owns browser/CDP/server teardown, including failures from validate().
  for (const count of [1, 64]) {
    for (const customDisplay of [false, true]) {
      describe(`${count} ${customDisplay ? 'flex' : 'ordinary'} popovers`, () => {
        let content: TemplateResult;

        beforeEach(() => {
          content = createTemplate(count, customDisplay);
        });

        it.each(['fresh', 'used'])(
          `closed popovers: ${count} %s ${customDisplay ? 'flex' : 'ordinary'}`,
          async history => {
            await renderRunner.getReport({
              name: `popover-${count}-${history}-${customDisplay ? 'flex' : 'ordinary'}`,
              workload: '120 alternating 480/800px panel writes and intentional synchronous geometry reads',
              metadata: {
                menuCount: count,
                iterations: 120,
                history,
                customDisplay,
                cycles: history === 'used' ? 2 : 0
              },
              content,
              timeoutMs: 30000,
              prepare: page => page.evaluate(`window.renderWorkload.prepare(${JSON.stringify(history)}, 2, false)`),
              interact: page => page.evaluate('window.renderWorkload.resize()'),
              observe: page => page.evaluate('window.renderWorkload.observe()'),
              budgets: { layoutCount: 122, styleRecalcCount: 122 },
              validate(report) {
                const observations = report.observations!;
                expect(observations.checksum).toBe(120 * 640);
                expect(observations.inline).toEqual({ popover: false, rects: 1 });
                expect(observations.openedIds).toHaveLength(history === 'used' ? count : 0);
                // This oracle must fail even when count budgets pass. Save every observed ID in the runner report.
                const snapshots = observations.snapshots;
                if (!Array.isArray(snapshots)) throw new Error('Missing popover snapshots');
                for (const snapshot of snapshots) {
                  const failures = snapshot.states.filter(
                    (state: PopoverObservation) =>
                      state.popover === null || state.open || state.rects !== 0 || state.display !== 'none'
                  );
                  if (failures.length)
                    throw new Error(
                      `closed-popover-layout-box invariant: ${snapshot.label}: ${failures.length}/${count} closed popovers violate layout contract: ${JSON.stringify(failures)}`
                    );
                }
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

    it('closed popovers: real-motion repeated use', async () => {
      await renderRunner.getReport({
        name: 'popover-motion',
        workload: 'two open/close cycles; measure final six-frame observation window',
        content,
        reducedMotion: 'no-preference',
        metadata: { menuCount: 1, cycles: 2, observationFrames: 6 },
        prepare: page => page.evaluate(`window.renderWorkload.prepare('used', 2, true)`),
        interact: page => page.evaluate('window.renderWorkload.waitForFrames(6)'),
        observe: page => page.evaluate('window.renderWorkload.observe()'),
        budgets: { layoutCount: 2, styleRecalcCount: 2 },
        validate(report) {
          const observations = report.observations!;
          if (observations.anchoredTransitions) expect(observations.animationCount).toBeGreaterThan(0);
          const snapshots = observations.snapshots;
          if (!Array.isArray(snapshots)) throw new Error('Missing popover snapshots');
          for (const snapshot of snapshots) {
            if (
              snapshot.states.some(
                (state: PopoverObservation) => state.rects !== 0 || state.open || state.display !== 'none'
              )
            )
              throw new Error('closed-popover-layout-box invariant: real-motion cycle retained boxes');
          }
          expect(observations.openedIds).toHaveLength(1);
        }
      });
    });
  });
});

function createTemplate(count: number, customDisplay: boolean) {
  return html`
    <style>
      #panel { width:640px; min-width:320px; max-width:100%; height:360px; overflow:auto; }
      .row { display:flex; justify-content:flex-end; }
    </style>
    <div id="panel" data-custom-display=${String(customDisplay)}>
      ${Array.from(
        { length: count },
        (_, i) => html`
        <div class="row"><nve-button popovertarget=${`menu-${i}`}>Menu ${i}</nve-button>
          <nve-dropdown id=${`menu-${i}`} style=${customDisplay ? 'display:flex' : nothing}>
            <button>First action</button><button>Second action</button><p nve-text="body">Deterministic menu content</p>
          </nve-dropdown>
        </div>`
      )}
    </div>
    <nve-notification id="inline" container="flat">Inline notification remains in layout</nve-notification>
    <script type="module">
      import '@nvidia-elements/core/button/define.js';
      import '@nvidia-elements/core/dropdown/define.js';
      import '@nvidia-elements/core/notification/define.js';
      import { elementIsStable, waitForAnimationFrames } from '@internals/testing';
      import { observePopover, resizeWithGeometryReads, waitForEvent, waitForLitAnimations } from '@internals/testing/render';
      const panel = document.getElementById('panel');
      const customDisplay = panel.dataset.customDisplay === 'true';
      const menus = [...document.querySelectorAll('nve-dropdown')];
      const triggers = [...document.querySelectorAll('nve-button')];
      const opened = new Set();
      const snapshots = [];
      let checksum = 0;
      let animationCount = 0;
      function snapshot(label) {
        const states = menus.map(observePopover);
        snapshots.push({ label, states });
      }
      async function toggle(menu, source, open) {
        const event = waitForEvent(menu, open ? 'open' : 'close', { label: menu.id + ': native' });
        if (open) menu.showPopover({ source }); else menu.hidePopover();
        await event;
        animationCount += await waitForLitAnimations(menu, { label: menu.id + ': ' + (open ? 'open' : 'closed') });
      }
      async function useAll(cycle) {
        for (const [i, menu] of menus.entries()) {
          await toggle(menu, triggers[i], true);
          if (!menu.matches(':popover-open') || !menu.getClientRects().length) throw new Error(menu.id + ': did not open in cycle ' + cycle);
          if (customDisplay && getComputedStyle(menu).display !== 'flex') throw new Error(menu.id + ': author flex lost on reopen');
          opened.add(menu.id);
          await toggle(menu, triggers[i], false);
        }
        snapshot('closed-cycle-' + cycle);
      }
      window.renderWorkload = {
        waitForFrames: waitForAnimationFrames,
        async prepare(history, cycles, realMotion) {
          await Promise.all([...menus, ...triggers, document.getElementById('inline')].map(elementIsStable));
          await waitForAnimationFrames(2); // Includes the controller's deferred native-trigger setup.
          for (const menu of menus) menu.style.setProperty('--nve-ref-animation-duration-200', realMotion ? '0.04s' : '0s');
          if (history === 'used') for (let cycle = 0; cycle < cycles; cycle++) await useAll(cycle);
          snapshot('before-resize');
          for (const width of [480,800,640]) {
            panel.style.width = width + 'px';
            if (Math.abs(panel.getBoundingClientRect().width - width) > 0.5) throw new Error('Panel width clamped: ' + width);
          }
        },
        resize() {
          checksum += resizeWithGeometryReads(panel, { widths:[480,800], iterations:120 });
        },
        observe() {
          snapshot('after-resize');
          const inline = document.getElementById('inline');
          return {
            snapshots, openedIds:[...opened], checksum, animationCount,
            anchoredTransitions: CSS.supports('container-type','anchored'),
            inline: { popover:inline.hasAttribute('popover'), rects:inline.getClientRects().length }
          };

        }
      };
    </script>`;
}
