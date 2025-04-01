import { expect, test, describe } from 'vitest';
import { lighthouseRunner } from '@internals/vite';

describe('password lighthouse report', () => {
  test('password should meet lighthouse benchmarks', async () => {
    const report = await lighthouseRunner.getReport('nve-password', /* html */`
      <nve-password>
        <label>label</label>
        <input type="password" />
      </nve-password>
      <script type="module">
        import '@nvidia-elements/core/password/define.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(23);
  });
});
