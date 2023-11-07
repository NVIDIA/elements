import { expect, test, describe } from 'vitest';
import { runner } from 'elements-lighthouse';

describe('tooltip lighthouse report', () => {
  test('tooltip should meet lighthouse benchmarks', async () => {
    const report = await runner.getReport('nve-tooltip', /* html */`
      <button id="btn">button</button>
      <nve-tooltip trigger="btn" anchor="btn">tooltip</nve-tooltip>
      <script type="module">
        import '@elements/elements/tooltip/define.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(19);
  });
});
