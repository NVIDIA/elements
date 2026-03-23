import { expect, test, describe } from 'vitest';
import { lighthouseRunner } from '@internals/vite';

describe('tooltip lighthouse report', () => {
  test('tooltip should meet lighthouse benchmarks', async () => {
    const report = await lighthouseRunner.getReport('nve-tooltip', /* html */`
      <button popovertarget="tooltip">button</button>
      <nve-tooltip id="tooltip">tooltip</nve-tooltip>
      <script type="module">
        import '@nvidia-elements/core/tooltip/define.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(14.4);
  });
});
