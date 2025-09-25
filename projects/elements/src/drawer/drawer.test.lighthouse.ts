import { expect, test, describe } from 'vitest';
import { lighthouseRunner } from '@nve-internals/vite';

describe('drawer lighthouse report', () => {
  test('drawer should meet lighthouse benchmarks', async () => {
    const report = await lighthouseRunner.getReport('nve-drawer', /* html */`
      <nve-drawer id="drawer" closable position="left">hello</nve-drawer>
      <button popovertarget="drawer">button</button>
      <script type="module">
        import '@nvidia-elements/core/drawer/define.js';
        document.querySelector('nve-drawer').showPopover();
      </script>
    `);

    expect(report.scores.performance).toBeGreaterThan(98); // bfcache
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(25);
  });
});
