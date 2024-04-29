import { expect, test, describe } from 'vitest';
import { runner } from '@nvidia-elements/lighthouse';

describe('forms lighthouse report', () => {
  test('forms should meet lighthouse benchmarks', async () => {
    const report = await runner.getReport('nve-forms', /* html */`
      <nve-control>
        <label>label</label>
        <input />
        <nve-control-message>message</nve-control-message>
      </nve-control>
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
        <nve-control>
          <label>production</label>
          <input type="checkbox" name="checkbox-group" value="3" />
        </nve-control>
      </nve-control-group>
      <script type="module">
        import '@nvidia-elements/core/forms/define.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(25.5);
  });
});
