import { expect, test, describe } from 'vitest';
import { lighthouseRunner } from '@internals/vite';

describe('select lighthouse report', () => {
  test('select should meet lighthouse benchmarks', async () => {
    const report = await lighthouseRunner.getReport('nve-select', /* html */`
      <nve-select>
        <label>label</label>
        <select>
          <option value="1">Option 1</option>
          <option value="2">Option 2</option>
          <option value="3">Option 3</option>
        </select>
      </nve-select>
      <script type="module">
        import '@nvidia-elements/core/select/define.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(32);
  });
});
