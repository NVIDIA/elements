import { expect, test, describe } from 'vitest';
import { runner } from 'elements-lighthouse';

describe('card lighthouse report', () => {
  test('card should meet lighthhouse benchmarks', async () => {
    const report = await runner.getReport('mlv-card', /* html */`
      <mlv-card>
        <mlv-card-header>
          <h2 slot="title">title</h2>
          <h3 slot="subtitle">subtitle</h3>
          <button slot="header-action">header action</button>
        </mlv-card-header>
        <mlv-card-content>
          <p>content</p>
        </mlv-card-content>
        <mlv-card-footer>
          <p>footer</p>
        </mlv-card-footer>
      </mlv-card>
      <script type="module">
        import '@elements/elements/card/define.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(8.5);
  });
});
