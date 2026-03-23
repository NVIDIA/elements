import { expect, test, describe } from 'vitest';
import { lighthouseRunner } from '@internals/vite';

describe('card lighthouse report', () => {
  test('card should meet lighthhouse benchmarks', async () => {
    const report = await lighthouseRunner.getReport('nve-card', /* html */`
      <nve-card>
        <nve-card-header>
          <h2 nve-text="heading">header</h2>
        </nve-card-header>
        <nve-card-content>
          <p nve-text="body">content</p>
        </nve-card-content>
        <nve-card-footer>
          <p nve-text="body">footer</p>
        </nve-card-footer>
      </nve-card>
      <script type="module">
        import '@nvidia-elements/core/card/define.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(11.2);
  });
});
