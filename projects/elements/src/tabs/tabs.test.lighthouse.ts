import { expect, test, describe } from 'vitest';
import { lighthouseRunner } from '@nve-internals/vite';

describe('tabs lighthouse report', () => {
  test('tabs should meet lighthouse benchmarks', async () => {
    const report = await lighthouseRunner.getReport('nve-tabs', /* html */`
      <nve-tabs>
        <nve-tabs-item>Tab 1</nve-tabs-item>
        <nve-tabs-item selected>Tab 2</nve-tabs-item>
        <nve-tabs-item disabled>Tab 3</nve-tabs-item>
      </nve-tabs>
      <script type="module">
        import '@nvidia-elements/core/tabs/define.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(87);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(12.5);
  });
});
