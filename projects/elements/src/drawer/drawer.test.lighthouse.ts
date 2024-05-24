import { expect, test, describe } from 'vitest';
import { runner } from '@nvidia-elements/testing-lighthouse';

describe('drawer lighthouse report', () => {
  test('drawer should meet lighthouse benchmarks', async () => {
    const report = await runner.getReport('nve-drawer', /* html */`
      <nve-drawer closable>hello</nve-drawer>
      <script type="module">
        import '@nvidia-elements/core/drawer/define.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(33.5);
  });
});
