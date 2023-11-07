import { expect, test, describe } from 'vitest';
import { runner } from 'elements-lighthouse';

describe('app-header lighthouse report', () => {
  test('app-header should meet lighthouse benchmarks', async () => {
    const report = await runner.getReport('mlv-app-header', /* html */`
      <mlv-app-header>
        <mlv-logo size="lg" aria-label="NV Logo">NV</mlv-logo>
        <h2 slot="title">header</h2>
        <mlv-button slot="nav-items">item</mlv-button>
        <mlv-icon-button icon-name="person" slot="nav-actions" aria-label="profile"></mlv-icon-button>
      </mlv-app-header>
      <script type="module">
        import '@elements/elements/alert/define.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(20.5);
  });
});
