import { expect, test, describe } from 'vitest';
import { lighthouseRunner } from '@nve-internals/vite';

describe('tree lighthouse report', () => {
  test('tree should meet lighthouse benchmarks', async () => {
    const report = await lighthouseRunner.getReport('nve-tree', /* html */`
      <nve-tree>
        <nve-tree-node expanded>
          node 1
          <nve-tree-node>node 1-1</nve-tree-node>
          <nve-tree-node>node 1-2</nve-tree-node>
        </nve-tree-node>
        <nve-tree-node>
          node 2
          <nve-tree-node>node 2-1</nve-tree-node>
          <nve-tree-node>node 2-2</nve-tree-node>
        </nve-tree-node>
      </nve-tree>
      <script type="module">
        import '@nvidia-elements/core/tree/define.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(25.7);
  });
});
