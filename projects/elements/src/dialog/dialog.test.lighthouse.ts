import { expect, test, describe } from 'vitest';
import { lighthouseRunner } from '@nve-internals/vite';

describe('dialog lighthouse report', () => {
  test('dialog should meet lighthouse benchmarks', async () => {
    const report = await lighthouseRunner.getReport('nve-dialog', /* html */`
      <nve-dialog closable modal>
        <nve-dialog-header>
          <h3>header</h3>
        </nve-dialog-header>
        <p>content</p>
        <nve-dialog-footer>
          <p>footer</p>
        </nve-dialog-footer>
      </nve-dialog>
      <script type="module">
        import '@nvidia-elements/core/dialog/define.js';
      </script>
    `);

    expect(report.scores.performance).toBeGreaterThan(97); // bfcache
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(23);
  });
});
