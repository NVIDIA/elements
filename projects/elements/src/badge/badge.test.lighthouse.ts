import { expect, test, describe } from 'vitest';
import { runner } from 'elements-lighthouse';

describe('badge lighthouse report', () => {
  test('badge should meet lighthouse benchmarks', async () => {
    const report = await runner.getReport('nve-badge', /* html */`
      <nve-badge>badge</nve-badge>
      <script type="module">
        import '@elements/elements/badge/define.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(17.5);
  });
});
