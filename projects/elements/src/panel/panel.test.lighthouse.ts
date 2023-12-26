import { expect, test, describe } from 'vitest';
import { runner } from 'elements-lighthouse';

describe('panel lighthouse report', () => {
  test('panel should meet lighthouse benchmarks', async () => {
    const report = await runner.getReport('mlv-panel', /* html */`
      <mlv-panel behavior-expand expanded style="width:280px; height:100vh">
        <mlv-panel-header>
          <div slot="title">Title</div>
          <div slot="subtitle"></div>
        </mlv-panel-header>

        <mlv-panel-content mlv-layout="column gap:md">
          <p mlv-text="body">content</p>
        </mlv-panel-content>
      </mlv-panel>
      <script type="module">
        import '@elements/elements/panel/define.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(21);
  });
});
