import { expect, test, describe } from 'vitest';
import { lighthouseRunner } from '@internals/vite';

describe('preferences-input lighthouse report', () => {
  test('preferences-input should meet lighthouse benchmarks', async () => {
    const report = await lighthouseRunner.getReport('nve-preferences-input', /* html */`
      <nve-preferences-input></nve-preferences-input>
      <script type="module">
        import '@nvidia-elements/core/preferences-input/define.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(26.10);
  });
});

