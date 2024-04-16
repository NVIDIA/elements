import { expect, test, describe } from 'vitest';
import { runner } from 'elements-lighthouse';

describe('steps lighthouse report', () => {
  test('steps should meet lighthouse benchmarks', async () => {
    const report = await runner.getReport('mlv-steps', /* html */`
      <mlv-steps>
        <mlv-steps-item>Step 1</mlv-steps-item>
        <mlv-steps-item selected>Step 2</mlv-steps-item>
        <mlv-steps-item disabled>Step 3</mlv-steps-item>
      </mlv-steps>
      <script type="module">
        import '@elements/elements/steps/define.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(20);
  });
});
