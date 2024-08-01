import { expect, test, describe } from 'vitest';
import { lighthouseRunner } from '@internals/vite';

describe('lighthouse report', () => {
  test('CSS bundles should remain within compressed bundle limits', async () => {
    const report = await lighthouseRunner.getReport('css-bundles', /* html */`
      <script type="module">
        import('@nvidia-elements/themes/index.css');
        import('@nvidia-elements/themes/compact.css');
        import('@nvidia-elements/themes/dark.css');
        import('@nvidia-elements/themes/high-contrast.css');
        import('@nvidia-elements/themes/reduced-motion.css');
        import('@nvidia-elements/themes/debug.css');
        import('@nvidia-elements/themes/ddb-dark.css');
        import('@nvidia-elements/themes/brand.css');
      </script>
    `);

    expect(report.payload.css.kb).toBeLessThan(15); // total
    expect(report.payload.css.requests['index.css'].kb).toBeLessThan(6); // @nvidia-elements/themes/index.css
    expect(report.payload.css.requests['compact.css'].kb).toBeLessThan(0.4); // @nvidia-elements/themes/compact.css
    expect(report.payload.css.requests['dark.css'].kb).toBeLessThan(5); // @nvidia-elements/themes/dark.css
    expect(report.payload.css.requests['high.css'].kb).toBeLessThan(1); // @nvidia-elements/themes/high-contrast.css
    expect(report.payload.css.requests['reduced.css'].kb).toBeLessThan(0.6); // @nvidia-elements/themes/reduced-motion.css
    expect(report.payload.css.requests['debug.css'].kb).toBeLessThan(0.7); // @nvidia-elements/themes/debug.css
    expect(report.payload.css.requests['ddb.css'].kb).toBeLessThan(0.8); // @nvidia-elements/themes/ddb-dark.css
    expect(report.payload.css.requests['brand.css'].kb).toBeLessThan(0.8); // @nvidia-elements/themes/brand.css
  });
});
