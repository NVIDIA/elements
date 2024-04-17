import { expect, test, describe } from 'vitest';
import { runner } from '@nvidia-elements/lighthouse';

describe('input lighthouse report', () => {
  test('input should meet lighthouse benchmarks', async () => {
    const report = await runner.getReport('nve-input', /* html */`
      <nve-input>
        <label>label</label>
        <input type="text" />
      </nve-input>
      <script type="module">
        import '@elements/elements/input/define.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(25.5);
  });
});
