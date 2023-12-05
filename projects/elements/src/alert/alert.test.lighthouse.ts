import { expect, test, describe } from 'vitest';
import { runner } from 'elements-lighthouse';

describe('alert lighthouse report', () => {
  test('alert should meet lighthouse benchmarks', async () => {
    const report = await runner.getReport('mlv-alert', /* html */`
      <mlv-alert>alert</mlv-alert>
      <script type="module">
        import '@elements/elements/alert/define.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(21);
  });

  test('alert-banner should meet lighthouse benchmarks', async () => {
    const report = await runner.getReport('mlv-alert-banner', /* html */`
      <mlv-alert-banner>
        <mlv-alert closable>
          <span slot="prefix">default</span> banner message <a href="#" mlv-text="link" slot="actions">view details</a>
        </mlv-alert>
      </mlv-alert-banner>
      <script type="module">
        import '@elements/elements/alert/define.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(22);
  });

  test('alert-group should meet lighthouse benchmarks', async () => {
    const report = await runner.getReport('mlv-alert-group', /* html */`
      <mlv-alert-group>
        <mlv-alert>default</mlv-alert>
        <mlv-alert>default</mlv-alert>
      </mlv-alert-group>
      <script type="module">
        import '@elements/elements/alert/define.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(21);
  });
});
