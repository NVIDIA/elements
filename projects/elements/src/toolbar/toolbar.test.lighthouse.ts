import { expect, test, describe } from 'vitest';
import { lighthouseRunner } from '@internals/vite';

describe('toolbar lighthouse report', () => {
  test('toolbar should meet lighthouse benchmarks', async () => {
    const report = await lighthouseRunner.getReport('nve-toolbar', /* html */`
      <nve-toolbar>
        <nve-button container="flat"><nve-icon name="add"></nve-icon> create</nve-button>
        <nve-button container="flat"><nve-icon name="delete"></nve-icon> delete</nve-button>
        <nve-icon-button container="flat" icon-name="gear" slot="suffix" aria-label="settings"></nve-icon-button>
      </nve-toolbar>
      <script type="module">
        import '@nvidia-elements/core/toolbar/define.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(16.5);
  });
});
