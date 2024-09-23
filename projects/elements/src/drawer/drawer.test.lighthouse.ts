import { expect, test, describe } from 'vitest';
import { lighthouseRunner } from '@internals/vite';

describe('drawer lighthouse report', () => {
  test('drawer should meet lighthouse benchmarks', async () => {
    const report = await lighthouseRunner.getReport('nve-drawer', /* html */`
      <style>
        body {
          height: 800px;
          width: 1024px;
        }
      </style>
      <nve-drawer closable position="left" style="width: 400px; height: 800px">hello</nve-drawer>
      <script type="module">
        import '@nvidia-elements/core/drawer/define.js';
      </script>
    `);

    expect(report.scores.performance).toBeGreaterThan(98); // bfcache
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(22);
  });
});
