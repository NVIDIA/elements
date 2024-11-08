import { expect, test, describe } from 'vitest';
import { lighthouseRunner } from '@internals/vite';

describe('forms lighthouse report', () => {
  test('form control should meet lighthouse benchmarks', async () => {
    const report = await lighthouseRunner.getReport('nve-control', /* html */`
      <nve-control>
        <label>label</label>
        <input />
      </nve-control>
      <script type="module">
        import '@nvidia-elements/core/forms/define.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(18);
  });

  test('form control message should meet lighthouse benchmarks', async () => {
    const report = await lighthouseRunner.getReport('nve-control', /* html */`
      <nve-control>
        <label>label</label>
        <input />
        <nve-control-message>message</nve-control-message>
      </nve-control>
      <script type="module">
        import '@nvidia-elements/core/forms/define.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(23.5);
  });

  test('form control group should meet lighthouse benchmarks', async () => {
    const report = await lighthouseRunner.getReport('nve-forms', /* html */`
      <nve-control-group layout="vertical-inline">
        <label>vertical-inline</label>
        <nve-control>
          <label>local</label>
          <input type="checkbox" name="checkbox-group" value="1" checked />
        </nve-control>
        <nve-control>
          <label>staging</label>
          <input type="checkbox" name="checkbox-group" value="2" />
        </nve-control>
      </nve-control-group>
      <script type="module">
        import '@nvidia-elements/core/forms/define.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(17.5);
  });
});
