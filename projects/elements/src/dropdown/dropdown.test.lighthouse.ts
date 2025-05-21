import { expect, test, describe } from 'vitest';
import { lighthouseRunner } from '@nve-internals/vite';

describe('dropdown lighthouse report', () => {
  test('dropdown should meet lighthouse benchmarks', async () => {
    const report = await lighthouseRunner.getReport('nve-dropdown', /* html */`
      <button id="btn">button</button>
      <nve-dropdown trigger="btn" anchor="btn" closable>hello</nve-dropdown>
      <script type="module">
        import '@nvidia-elements/core/dropdown/define.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(24.2);
  });
});
