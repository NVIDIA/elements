import { expect, test, describe } from 'vitest';
import { lighthouseRunner } from '@internals/vite';

describe('dialog lighthouse report', () => {
  test('dialog should meet lighthouse benchmarks', async () => {
    const report = await lighthouseRunner.getReport('nve-dialog', /* html */`
      <button popovertarget="dialog">button</button>
      <nve-dialog id="dialog" closable modal>
        <nve-dialog-header>
          <h3 nve-text="heading">header</h3>
        </nve-dialog-header>
        <p nve-text="body">content</p>
        <nve-dialog-footer>
          <p nve-text="body">footer</p>
        </nve-dialog-footer>
      </nve-dialog>
      <script type="module">
        import '@nvidia-elements/core/dialog/define.js';
      </script>
    `);

    expect(report.scores.performance).toBeGreaterThan(97); // bfcache
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(24.5);
  });
});
