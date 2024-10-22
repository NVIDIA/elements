import { expect, test, describe } from 'vitest';
import { lighthouseRunner } from '@nve-internals/vite';

describe('switch lighthouse report', () => {
  test('switch should meet lighthouse benchmarks', async () => {
    const report = await lighthouseRunner.getReport('nve-switch', /* html */`
      <nve-switch>
        <label>label</label>
        <input type="checkbox" />
      </nve-switch>
      <script type="module">
        import '@nvidia-elements/core/switch/define.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(18);
  });
});
