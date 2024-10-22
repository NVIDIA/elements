import { expect, test, describe } from 'vitest';
import { lighthouseRunner } from '@nve-internals/vite';

describe('menu lighthouse report', () => {
  test('menu should meet lighthouse benchmarks', async () => {
    const report = await lighthouseRunner.getReport('nve-menu', /* html */`
      <nve-menu>
        <nve-menu-item>item 1</nve-menu-item>
        <nve-menu-item>item 2</nve-menu-item>
        <nve-menu-item>item 3</nve-menu-item>
        <nve-menu-item>item 4</nve-menu-item>
      </nve-menu>
      <script type="module">
        import '@nvidia-elements/core/menu/define.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(12);
  });
});
