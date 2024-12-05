import { expect, test, describe } from 'vitest';
import { lighthouseRunner } from '@nve-internals/vite';

describe('pulse lighthouse report', () => {
  test('pulse should meet lighthouse benchmarks', async () => {
    const report = await lighthouseRunner.getReport('nve-pulse', /* html */`
      <nve-pulse></nve-pulse>
      <script type="module">
        import '@nvidia-elements/core/pulse/define.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(13.3);
  });
});
