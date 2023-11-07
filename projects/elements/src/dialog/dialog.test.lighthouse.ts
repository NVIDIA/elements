import { expect, test, describe } from 'vitest';
import { runner } from 'elements-lighthouse';

describe('dialog lighthouse report', () => {
  test('dialog should meet lighthouse benchmarks', async () => {
    const report = await runner.getReport('mlv-dialog', /* html */`
      <mlv-dialog closable modal>
        <mlv-dialog-header>
          <h3>header</h3>
        </mlv-dialog-header>
        <p>content</p>
        <mlv-dialog-footer>
          <p>footer</p>
        </mlv-dialog-footer>
      </mlv-dialog>
      <script type="module">
        import '@elements/elements/dialog/define.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(30);
  });
});
