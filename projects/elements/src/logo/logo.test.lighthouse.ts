import { expect, test, describe } from 'vitest';
import { lighthouseRunner } from '@internals/vite';

describe('logo lighthouse report', () => {
  test('logo should meet lighthouse benchmarks', async () => {
    const report = await lighthouseRunner.getReport('nve-logo', /* html */`
      <nve-logo aria-label="logo"></nve-logo>
      <script type="module">
        import '@nvidia-elements/core/logo/define.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(9.6);
  });
});
