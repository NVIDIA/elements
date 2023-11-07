import { expect, test, describe } from 'vitest';
import { runner } from 'elements-lighthouse';

describe('app-header lighthouse report', () => {
  test('app-header should meet lighthouse benchmarks', async () => {
    const report = await runner.getReport('nve-app-header', /* html */`
      <nve-app-header>
        <nve-logo size="lg" aria-label="NV Logo">NV</nve-logo>
        <h2 slot="title">header</h2>
        <nve-button slot="nav-items">item</nve-button>
        <nve-icon-button icon-name="person" slot="nav-actions" aria-label="profile"></nve-icon-button>
      </nve-app-header>
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
