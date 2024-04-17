import { expect, test, describe } from 'vitest';
import { runner } from '@nvidia-elements/lighthouse';

describe('lighthouse report', () => {
  test('CSS bundles should remain within compressed bundle limits', async () => {
    const report = await runner.getReport('css-bundles', /* html */`
      <script type="module">
        import('@nvidia-elements/themes/index.css');
        import('@nvidia-elements/themes/compact.css');
        import('@nvidia-elements/themes/dark.css');
        import('@nvidia-elements/themes/high-contrast.css');
        import('@nvidia-elements/themes/reduced-motion.css');
        import('@nvidia-elements/themes/ddb-dark.css');
        import('@elements/elements/css/module.layout.css');
        import('@elements/elements/css/module.typography.css');
      </script>
    `);

    expect(report.payload.css.kb).toBeLessThan(14.8); // total
    expect(report.payload.css.requests['index.css'].kb).toBeLessThan(5.1); // @nvidia-elements/themes/index.css
    expect(report.payload.css.requests['compact.css'].kb).toBeLessThan(0.4); // @nvidia-elements/themes/compact.css
    expect(report.payload.css.requests['dark.css'].kb).toBeLessThan(4.1); // @nvidia-elements/themes/dark.css
    expect(report.payload.css.requests['high.css'].kb).toBeLessThan(1); // @nvidia-elements/themes/high-contrast.css
    expect(report.payload.css.requests['reduced.css'].kb).toBeLessThan(0.6); // @nvidia-elements/themes/reduced-motion.css
    expect(report.payload.css.requests['ddb.css'].kb).toBeLessThan(0.75); // @nvidia-elements/themes/ddb-dark.css
    expect(report.payload.css.requests['module.css'].kb).toBeLessThan(1.6); // @elements/elements/css/module.layout.css
    expect(report.payload.css.requests['module2.css'].kb).toBeLessThan(1.3); // @elements/elements/css/module.typography.css
  });

  test('JS Bundles should remain within compressed bundle limits', async () => {
    const report = await runner.getReport('all-js-bundle', /* html */`
      <script type="module">
        import '@elements/elements/accordion/define.js';
        import '@elements/elements/alert/define.js';
        import '@elements/elements/app-header/define.js';
        import '@elements/elements/badge/define.js';
        import '@elements/elements/breadcrumb/define.js';
        import '@elements/elements/button/define.js';
        import '@elements/elements/card/define.js';
        import '@elements/elements/checkbox/define.js';
        import '@elements/elements/color/define.js';
        import '@elements/elements/combobox/define.js';
        import '@elements/elements/date/define.js';
        import '@elements/elements/datetime/define.js';
        import '@elements/elements/dialog/define.js';
        import '@elements/elements/divider/define.js';
        import '@elements/elements/dot/define.js';
        import '@elements/elements/drawer/define.js';
        import '@elements/elements/dropdown/define.js';
        import '@elements/elements/file/define.js';
        import '@elements/elements/forms/define.js';
        import '@elements/elements/grid/define.js';
        import '@elements/elements/icon/define.js';
        import '@elements/elements/icon-button/define.js';
        import '@elements/elements/input/define.js';
        import '@elements/elements/logo/define.js';
        import '@elements/elements/menu/define.js';
        import '@elements/elements/month/define.js';
        import '@elements/elements/notification/define.js';
        import '@elements/elements/pagination/define.js';
        import '@elements/elements/panel/define.js';
        import '@elements/elements/password/define.js';
        import '@elements/elements/progress-bar/define.js';
        import '@elements/elements/progress-ring/define.js';
        import '@elements/elements/radio/define.js';
        import '@elements/elements/range/define.js';
        import '@elements/elements/search/define.js';
        import '@elements/elements/select/define.js';
        import '@elements/elements/sort-button/define.js';
        import '@elements/elements/steps/define.js';
        import '@elements/elements/switch/define.js';
        import '@elements/elements/tabs/define.js';
        import '@elements/elements/tag/define.js';
        import '@elements/elements/toast/define.js';
        import '@elements/elements/time/define.js';
        import '@elements/elements/textarea/define.js';
        import '@elements/elements/tooltip/define.js';
        import '@elements/elements/week/define.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(61.4);
  });
});
