import { expect, test, describe } from 'vitest';
import { runner } from 'elements-lighthouse';

describe('stepper lighthouse report', () => {
  test('stepper should meet lighthouse benchmarks', async () => {
    const report = await runner.getReport('mlv-stepper', /* html */`
      <mlv-stepper>
        <mlv-stepper-item>Step 1</mlv-stepper-item>
        <mlv-stepper-item selected>Step 2</mlv-stepper-item>
        <mlv-stepper-item disabled>Step 3</mlv-stepper-item>
      </mlv-stepper>
      <script type="module">
        import '@elements/elements/stepper/define.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(20);
  });
});
