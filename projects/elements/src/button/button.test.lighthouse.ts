import { expect, test, describe } from 'vitest';
import { lighthouseRunner } from '@nve-internals/vite';

describe('button lighthouse report', () => {
  test('button should meet lighthouse benchmarks', async () => {
    const report = await lighthouseRunner.getReport('nve-button', /* html */`
      <nve-button>button</nve-button>
      <nve-button interaction="emphasis">button</nve-button>
      <nve-button interaction="destructive">button</nve-button>
      <script type="module">
        import '@nvidia-elements/core/button/define.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(11.6);
  });
});
