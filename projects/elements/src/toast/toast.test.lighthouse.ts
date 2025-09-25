import { expect, test, describe } from 'vitest';
import { lighthouseRunner } from '@internals/vite';

describe('toast lighthouse report', () => {
  test('toast should meet lighthouse benchmarks', async () => {
    const report = await lighthouseRunner.getReport('nve-toast', /* html */`
      <button popovertarget="toast">button</button>
      <nve-toast id="toast">toast</nve-toast>
      <script type="module">
        import '@nvidia-elements/core/toast/define.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(24.3);
  });
});
