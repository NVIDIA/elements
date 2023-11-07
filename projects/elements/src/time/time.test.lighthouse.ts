import { expect, test, describe } from 'vitest';
import { runner } from 'elements-lighthouse';

describe('time lighthouse report', () => {
  test('time should meet lighthouse benchmarks', async () => {
    const report = await runner.getReport('mlv-time', /* html */`
      <mlv-time>
        <label>label</label>
        <input type="time" />
      </mlv-time>
      <script type="module">
        import '@elements/elements/time/define.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(25.5);
  });
});
