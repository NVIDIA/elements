import { expect, test, describe } from 'vitest';
import { runner } from 'elements-lighthouse';

describe('alert lighthouse report', () => {
  test('alert should meet lighthouse benchmarks', async () => {
    const report = await runner.getReport('nve-alert', /* html */`
      <nve-alert>alert</nve-alert>
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
    const report = await runner.getReport('nve-alert-banner', /* html */`
      <nve-alert-banner>
        <nve-alert closable>
          <span slot="prefix">default</span> banner message <a href="#" nve-text="link" slot="actions">view details</a>
        </nve-alert>
      </nve-alert-banner>
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
    const report = await runner.getReport('nve-alert-group', /* html */`
      <nve-alert-group>
        <nve-alert>default</nve-alert>
        <nve-alert>default</nve-alert>
      </nve-alert-group>
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
