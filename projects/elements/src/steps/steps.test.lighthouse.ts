import { expect, test, describe } from 'vitest';
import { lighthouseRunner } from '@nve-internals/vite';

describe('steps lighthouse report', () => {
  test('steps should meet lighthouse benchmarks', async () => {
    const report = await lighthouseRunner.getReport('nve-steps', /* html */`
      <nve-steps>
        <nve-steps-item>Step 1</nve-steps-item>
        <nve-steps-item selected>Step 2</nve-steps-item>
        <nve-steps-item disabled>Step 3</nve-steps-item>
      </nve-steps>
      <script type="module">
        import '@nvidia-elements/core/steps/define.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(20.3);
  });
});
