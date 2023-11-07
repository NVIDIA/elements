import { expect, test, describe } from 'vitest';
import { runner } from 'elements-lighthouse';

describe('password lighthouse report', () => {
  test('password should meet lighthouse benchmarks', async () => {
    const report = await runner.getReport('mlv-password', /* html */`
      <mlv-password>
        <label>label</label>
        <input type="password" />
      </mlv-password>
      <script type="module">
        import '@elements/elements/password/define.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(25);
  });
});
