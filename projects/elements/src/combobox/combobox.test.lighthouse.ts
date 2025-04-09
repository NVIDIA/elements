import { expect, test, describe } from 'vitest';
import { lighthouseRunner } from '@nve-internals/vite';

describe('combobox lighthouse report', () => {
  test('combobox should meet lighthouse benchmarks', async () => {
    const report = await lighthouseRunner.getReport('nve-combobox', /* html */`
      <nve-combobox>
        <label>combobox</label>
        <input type="search" />
        <datalist>
          <option value="Option 1"></option>
          <option value="Option 2"></option>
          <option value="Option 3"></option>
        </datalist>
        <nve-control-message>message</nve-control-message>
      </nve-combobox>
      <script type="module">
        import '@nvidia-elements/core/combobox/define.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(33.5);
  });
});
