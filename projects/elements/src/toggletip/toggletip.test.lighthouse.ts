import { expect, test, describe } from 'vitest';
import { lighthouseRunner } from '@internals/vite';

describe('toggletip lighthouse report', () => {
  test('toggletip should meet lighthouse benchmarks', async () => {
    const report = await lighthouseRunner.getReport('nve-toggletip', /* html */`
      <button id="btn">button</button>
      <nve-toggletip trigger="btn" anchor="btn" closable>hello</nve-toggletip>
      <script type="module">
        import '@nvidia-elements/core/toggletip/define.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(24.8);
  });
});
