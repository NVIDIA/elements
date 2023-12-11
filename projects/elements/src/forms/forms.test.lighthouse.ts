import { expect, test, describe } from 'vitest';
import { runner } from 'elements-lighthouse';

describe('forms lighthouse report', () => {
  test('forms should meet lighthouse benchmarks', async () => {
    const report = await runner.getReport('mlv-forms', /* html */`
      <mlv-control>
        <label>label</label>
        <input />
        <mlv-control-message>message</mlv-control-message>
      </mlv-control>
      <mlv-control-group layout="vertical-inline">
        <label>vertical-inline</label>
        <mlv-control>
          <label>local</label>
          <input type="checkbox" name="checkbox-group" value="1" checked />
        </mlv-control>
        <mlv-control>
          <label>staging</label>
          <input type="checkbox" name="checkbox-group" value="2" />
        </mlv-control>
        <mlv-control>
          <label>production</label>
          <input type="checkbox" name="checkbox-group" value="3" />
        </mlv-control>
      </mlv-control-group>
      <script type="module">
        import '@elements/elements/forms/define.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(25.5);
  });
});
