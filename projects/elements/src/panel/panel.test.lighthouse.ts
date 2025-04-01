import { expect, test, describe } from 'vitest';
import { lighthouseRunner } from '@internals/vite';

describe('panel lighthouse report', () => {
  test('panel should meet lighthouse benchmarks', async () => {
    const report = await lighthouseRunner.getReport('nve-panel', /* html */`
      <nve-panel behavior-expand expanded style="width:280px; height:100vh">
        <nve-panel-header>
          <div slot="title">Title</div>
          <div slot="subtitle"></div>
        </nve-panel-header>

        <nve-panel-content nve-layout="column gap:md">
          <p nve-text="body">content</p>
        </nve-panel-content>
      </nve-panel>
      <script type="module">
        import '@nvidia-elements/core/panel/define.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(19.2);
  });
});
