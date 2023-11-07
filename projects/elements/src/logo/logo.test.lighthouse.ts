import { expect, test, describe } from 'vitest';
import { runner } from 'elements-lighthouse';

describe('logo lighthouse report', () => {
  test('logo should meet lighthouse benchmarks', async () => {
    const report = await runner.getReport('mlv-logo', /* html */`
      <mlv-logo aria-label="logo"></mlv-logo>
      <script type="module">
        import '@elements/elements/logo/define.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(9.5);
  });
});
