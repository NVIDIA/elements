import { expect, test, describe } from 'vitest';
import { lighthouseRunner } from '@internals/vite';

describe('lighthouse report', () => {
  test('index.css should remain within compressed bundle limits', async () => {
    const report = await lighthouseRunner.getReport('index.css', /* html */`
      <script type="module">
        import('@nvidia-elements/themes/index.css');
      </script>
    `);

    expect(report.payload.css.kb).toBeLessThan(6); // total
    expect(report.payload.css.requests['index.css'].kb).toBeLessThan(6);
  });

  test('compact.css should remain within compressed bundle limits', async () => {
    const report = await lighthouseRunner.getReport('compact.css', /* html */`
      <script type="module">
        import('@nvidia-elements/themes/compact.css');
      </script>
    `);

    expect(report.payload.css.kb).toBeLessThan(0.5); // total
    expect(report.payload.css.requests['compact.css'].kb).toBeLessThan(0.5);
  });

  test('dark.css should remain within compressed bundle limits', async () => {
    const report = await lighthouseRunner.getReport('dark.css', /* html */`
      <script type="module">
        import('@nvidia-elements/themes/dark.css');
      </script>
    `);

    expect(report.payload.css.kb).toBeLessThan(5); // total
    expect(report.payload.css.requests['dark.css'].kb).toBeLessThan(5);
  });

  test('high-contrast.css should remain within compressed bundle limits', async () => {
    const report = await lighthouseRunner.getReport('high-contrast.css', /* html */`
      <script type="module">
        import('@nvidia-elements/themes/high-contrast.css');
      </script>
    `);

    expect(report.payload.css.kb).toBeLessThan(1); // total
    expect(report.payload.css.requests['high.css'].kb).toBeLessThan(1);
  });

  test('reduced-motion.css should remain within compressed bundle limits', async () => {
    const report = await lighthouseRunner.getReport('reduced-motion.css', /* html */`
      <script type="module">
        import('@nvidia-elements/themes/reduced-motion.css');
      </script>
    `);

    expect(report.payload.css.kb).toBeLessThan(0.6); // total
    expect(report.payload.css.requests['reduced.css'].kb).toBeLessThan(0.6);
  });

  test('debug.css should remain within compressed bundle limits', async () => {
    const report = await lighthouseRunner.getReport('debug.css', /* html */`
      <script type="module">
        import('@nvidia-elements/themes/debug.css');
      </script>
    `);

    expect(report.payload.css.kb).toBeLessThan(0.75); // total
    expect(report.payload.css.requests['debug.css'].kb).toBeLessThan(0.75);
  });

  test('ddb-dark.css should remain within compressed bundle limits', async () => {
    const report = await lighthouseRunner.getReport('ddb-dark.css', /* html */`
      <script type="module">
        import('@nvidia-elements/themes/ddb-dark.css');
      </script>
    `);

    expect(report.payload.css.kb).toBeLessThan(0.85); // total
    expect(report.payload.css.requests['ddb.css'].kb).toBeLessThan(0.85);
  });

  test('brand.css should remain within compressed bundle limits', async () => {
    const report = await lighthouseRunner.getReport('brand.css', /* html */`
      <script type="module">
        import('@nvidia-elements/themes/brand.css');
      </script>
    `);

    expect(report.payload.css.kb).toBeLessThan(0.8); // total
    expect(report.payload.css.requests['brand.css'].kb).toBeLessThan(0.8);
  });

  test('brand-dark.css should remain within compressed bundle limits', async () => {
    const report = await lighthouseRunner.getReport('brand-dark.css', /* html */`
      <script type="module">
        import('@nvidia-elements/themes/brand-dark.css');
      </script>
    `);

    expect(report.payload.css.kb).toBeLessThan(0.85); // total
    expect(report.payload.css.requests['brand.css'].kb).toBeLessThan(0.85);
  });
});
