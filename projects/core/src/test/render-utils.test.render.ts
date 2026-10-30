import type { TemplateResult } from 'lit';
import { html } from 'lit';
import { beforeEach, describe, expect, it } from 'vitest';
import { renderRunner } from '@internals/vite';

describe('render fixture utilities', () => {
  // getReport owns browser/CDP/server teardown; only inert fixture construction happens in this hook.
  let content: TemplateResult;

  beforeEach(() => {
    content = createTemplate();
  });

  it.each(['events', 'animations', 'geometry'])('render utilities: %s', async operation => {
    const report = await renderRunner.getReport({
      name: `render-utilities-${operation}`,
      workload: `idle frames after browser helper ${operation} completion and failure cleanup checks`,
      content,
      prepare: async page => {
        await page.evaluate('window.renderWorkload.ready');
        await page.evaluate(`window.renderWorkload.${operation}()`);
      },
      interact: page => page.evaluate('window.renderWorkload.idle()'),
      budgets: { layoutCount: 2, styleRecalcCount: 2 }
    });
    expect(report.exceededBudgets).toEqual([]);
  });
});

function createTemplate() {
  return html`
  <div id="fixture"></div>
  <script type="module">
    import { LitElement } from 'lit';
    import { observePopover, resizeWithGeometryReads, waitForAnimationFrames, waitForEvent, waitForLitAnimations } from '@internals/testing/render';
    customElements.define('render-utility', class extends LitElement {});
    const element = document.createElement('render-utility');
    element.style.cssText = 'display:block;width:10px;height:10px';
    document.getElementById('fixture').append(element);
    window.renderWorkload = {
      ready: element.updateComplete,
      idle: () => waitForAnimationFrames(2),
      geometry() {
        const popover = document.createElement('div');
        popover.id = 'observation';
        popover.popover = 'manual';
        const panel = document.createElement('div');
        panel.style.cssText = 'box-sizing:border-box;border:5px solid;width:640px;height:10px';
        document.body.append(popover, panel);
        try {
          const fresh = observePopover(popover);
          if (fresh.id !== 'observation' || fresh.popover !== 'manual' || fresh.open || fresh.rects !== 0 || fresh.display !== 'none') throw new Error('Closed native popover observation incorrect');
          popover.showPopover();
          const opened = observePopover(popover);
          if (!opened.open || opened.rects !== 1 || opened.display === 'none') throw new Error('Open native popover observation incorrect');
          popover.hidePopover();
          if (observePopover(popover).rects !== 0) throw new Error('Dismissed native popover observation incorrect');
          const checksum = resizeWithGeometryReads(panel, { widths:[480,800], iterations:120 });
          if (checksum !== 120 * 640 || panel.style.width !== '800px') throw new Error('Resize workload did not apply and read the requested widths');
          let rejected = false;
          try { resizeWithGeometryReads(panel, { widths:[480,480], iterations:120 }); }
          catch (error) { rejected = error.message.includes('distinct'); }
          if (!rejected || panel.style.width !== '800px') throw new Error('Invalid resize input did not fail before writing');
        } finally {
          popover.remove();
          panel.remove();
        }
      },
      async events() {
        const target = new EventTarget();
        const remove = target.removeEventListener.bind(target);
        let removals = 0;
        target.removeEventListener = (...args) => { removals++; return remove(...args); };
        const pending = waitForEvent(target, 'done', { label:'success', timeoutMs:1000 });
        target.dispatchEvent(new Event('done'));
        if ((await pending).type !== 'done' || removals !== 1) throw new Error('Event success did not clean up');
        let error;
        try { await waitForEvent(target, 'missing', { label:'event deadline', timeoutMs:20 }); }
        catch (value) { error = value; }
        if (!error?.message.includes('event deadline: missing timed out') || removals !== 2) throw new Error('Event timeout did not clean up or retain context');
      },
      async animations() {
        const animation = element.animate([{opacity:0}, {opacity:1}], { duration:10000 });
        const pending = waitForLitAnimations(element, { label:'canceled transition' });
        await waitForAnimationFrames(2);
        animation.cancel();
        if (await pending !== 1) throw new Error('Canceled animation was not observed');
        if (getComputedStyle(element).opacity !== '1') throw new Error('Cancellation left unexpected rendering state');
        const unfinished = element.animate([{opacity:0}, {opacity:1}], { duration:10000 });
        let error;
        try { await waitForLitAnimations(element, { label:'animation deadline', timeoutMs:40 }); }
        catch (value) { error = value; }
        finally { unfinished.cancel(); }
        if (!error?.message.includes('animation deadline: animation settling timed out')) throw new Error('Animation timeout lost context');
        if (element.getAnimations().length) throw new Error('Test animation remained active');
      }
    };
  </script>`;
}
