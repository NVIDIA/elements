import { expect, test, describe } from 'vitest';
import { runner } from '@nvidia-elements/lighthouse';

describe('button-group lighthouse report', () => {
  test('button-group should meet lighthouse benchmarks', async () => {
    const report = await runner.getReport('nve-button-group', /* html */`
      <nve-button-group>
        <nve-icon-button pressed icon-name="split-vertical" aria-label="split vertical"></nve-icon-button>
        <nve-icon-button icon-name="split-horizontal" aria-label="split horizontal"></nve-icon-button>
        <nve-icon-button icon-name="split-none" aria-label="split none"></nve-icon-button>
      </nve-button-group>
      <script type="module">
        import '@elements/elements/button-group/define.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(10.3);
  });
});
