import { expect, test, describe } from 'vitest';
import { lighthouseRunner } from '@nve-internals/vite';

describe('breadcrumb lighthouse report', () => {
  test('breadcrumb should meet lighthouse benchmarks', async () => {
    const report = await lighthouseRunner.getReport('nve-breadcrumb', /* html */`
      <nve-breadcrumb>
        <nve-icon-button icon-name="home" aria-label="link to first page"></nve-icon-button>
        <nve-button>Item</nve-button>
        <span>Static item</span>
      </nve-breadcrumb>
      <script type="module">
        import '@nvidia-elements/core/breadcrumb/define.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(15.8);
  });
});
