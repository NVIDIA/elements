import { expect, test, describe } from 'vitest';
import { runner } from 'elements-lighthouse';

describe('lighthouse report', () => {
  test('CSS bundles should remain within compressed bundle limits', async () => {
    const report = await runner.getReport('css-bundles', /* html */`
      <script type="module">
        import('@elements/elements/css/module.layout.css');
        import('@elements/elements/css/module.reset.css');
        import('@elements/elements/css/module.tokens.css');
        import('@elements/elements/css/module.typography.css');
        import('@elements/elements/css/theme.compact.css');
        import('@elements/elements/css/theme.dark.css');
        import('@elements/elements/css/theme.high-contrast.css');
        import('@elements/elements/css/theme.reduced-motion.css');
      </script>
    `);

    expect(report.payload.css.kb).toBeLessThan(14.9); // total
    expect(report.payload.css.requests['module.layout.css'].kb).toBeLessThan(1.7);
    expect(report.payload.css.requests['module.reset.css'].kb).toBeLessThan(1.1);
    expect(report.payload.css.requests['module.tokens.css'].kb).toBeLessThan(4.9);
    expect(report.payload.css.requests['module.typography.css'].kb).toBeLessThan(1.3);
    expect(report.payload.css.requests['theme.compact.css'].kb).toBeLessThan(0.4);
    expect(report.payload.css.requests['theme.dark.css'].kb).toBeLessThan(4.1);
    expect(report.payload.css.requests['theme.high-contrast.css'].kb).toBeLessThan(1);
    expect(report.payload.css.requests['theme.reduced-motion.css'].kb).toBeLessThan(0.5);
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
    expect(report.payload.javascript.kb).toBeLessThan(66);
  });
});
