import { expect, test, describe } from 'vitest';
import { lighthouseRunner } from '@nve-internals/vite';

describe('lighthouse report', () => {
  test('CSS bundles should remain within compressed bundle limits', async () => {
    const report = await lighthouseRunner.getReport('css-bundles', /* html */`
      <script type="module">
        import('@nvidia-elements/core/index.css');
      </script>
    `);

    expect(report.payload.css.kb).toBeLessThan(18.5); // total
    expect(report.payload.css.requests['index.css'].kb).toBeLessThan(18.5); // @nvidia-elements/core/index.css
  });

  test('JS Bundles should remain within compressed bundle limits', async () => {
    const report = await lighthouseRunner.getReport('all-js-bundle', /* html */`
      <script type="module">
        import '@nvidia-elements/core/accordion/define.js';
        import '@nvidia-elements/core/alert/define.js';
        import '@nvidia-elements/core/app-header/define.js';
        import '@nvidia-elements/core/badge/define.js';
        import '@nvidia-elements/core/breadcrumb/define.js';
        import '@nvidia-elements/core/button/define.js';
        import '@nvidia-elements/core/card/define.js';
        import '@nvidia-elements/core/checkbox/define.js';
        import '@nvidia-elements/core/color/define.js';
        import '@nvidia-elements/core/combobox/define.js';
        import '@nvidia-elements/core/date/define.js';
        import '@nvidia-elements/core/datetime/define.js';
        import '@nvidia-elements/core/dialog/define.js';
        import '@nvidia-elements/core/divider/define.js';
        import '@nvidia-elements/core/dot/define.js';
        import '@nvidia-elements/core/drawer/define.js';
        import '@nvidia-elements/core/dropdown/define.js';
        import '@nvidia-elements/core/file/define.js';
        import '@nvidia-elements/core/forms/define.js';
        import '@nvidia-elements/core/grid/define.js';
        import '@nvidia-elements/core/icon/define.js';
        import '@nvidia-elements/core/icon-button/define.js';
        import '@nvidia-elements/core/input/define.js';
        import '@nvidia-elements/core/logo/define.js';
        import '@nvidia-elements/core/menu/define.js';
        import '@nvidia-elements/core/month/define.js';
        import '@nvidia-elements/core/notification/define.js';
        import '@nvidia-elements/core/pagination/define.js';
        import '@nvidia-elements/core/panel/define.js';
        import '@nvidia-elements/core/password/define.js';
        import '@nvidia-elements/core/progress-bar/define.js';
        import '@nvidia-elements/core/progress-ring/define.js';
        import '@nvidia-elements/core/radio/define.js';
        import '@nvidia-elements/core/range/define.js';
        import '@nvidia-elements/core/search/define.js';
        import '@nvidia-elements/core/select/define.js';
        import '@nvidia-elements/core/sort-button/define.js';
        import '@nvidia-elements/core/steps/define.js';
        import '@nvidia-elements/core/switch/define.js';
        import '@nvidia-elements/core/tabs/define.js';
        import '@nvidia-elements/core/tag/define.js';
        import '@nvidia-elements/core/toast/define.js';
        import '@nvidia-elements/core/toggletip/define.js';
        import '@nvidia-elements/core/time/define.js';
        import '@nvidia-elements/core/textarea/define.js';
        import '@nvidia-elements/core/tooltip/define.js';
        import '@nvidia-elements/core/week/define.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(65.6);
  });
});
