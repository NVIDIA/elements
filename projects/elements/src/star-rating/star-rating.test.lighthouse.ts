import { expect, test, describe } from 'vitest';
import { lighthouseRunner } from '@nve-internals/vite';

describe('star-rating lighthouse report', () => {
  test('star-rating should meet lighthouse benchmarks', async () => {
    const report = await lighthouseRunner.getReport(
      'nve-star-rating',
      /* html */ `
    <nve-star-rating>
        <label>label</label>
        <input type="range" />
        <nve-control-message>message</nve-control-message>
    </nve-star-rating>
      <script type="module">
        import '@nvidia-elements/core/star-rating/define.js';
      </script>
    `
    );

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(22.1);
  });
});
