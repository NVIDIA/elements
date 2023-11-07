import { expect, test, describe } from 'vitest';
import { runner } from 'elements-lighthouse';

describe('file lighthouse report', () => {
  test('file should meet lighthouse benchmarks', async () => {
    const report = await runner.getReport('mlv-file', /* html */`
      <mlv-file>
        <label>label</label>
        <input type="file" />
      </mlv-file>
      <script type="module">
        import '@elements/elements/file/define.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(24.5);
  });
});
