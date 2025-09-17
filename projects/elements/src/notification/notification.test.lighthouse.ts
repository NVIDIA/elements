import { expect, test, describe } from 'vitest';
import { lighthouseRunner } from '@internals/vite';

describe('notification lighthouse report', () => {
  test('notification should meet lighthouse benchmarks', async () => {
    const report = await lighthouseRunner.getReport('nve-notification', /* html */`
      <nve-notification>hello</nve-notification>
      <script type="module">
        import '@nvidia-elements/core/notification/define.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(24.3);
  });
});
