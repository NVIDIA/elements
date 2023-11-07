import { expect, test, describe } from 'vitest';
import { runner } from 'elements-lighthouse';

describe('combobox lighthouse report', () => {
  test('combobox should meet lighthouse benchmarks', async () => {
    const report = await runner.getReport('mlv-combobox', /* html */`
      <mlv-combobox>
        <label>combobox</label>
        <input type="search" />
        <datalist>
          <option value="Option 1"></option>
          <option value="Option 2"></option>
          <option value="Option 3"></option>
        </datalist>
        <mlv-control-message>message</mlv-control-message>
      </mlv-combobox>
      <script type="module">
        import '@elements/elements/combobox/define.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(41);
  });
});
