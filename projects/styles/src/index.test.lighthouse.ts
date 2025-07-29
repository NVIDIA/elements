import { expect, test, describe } from 'vitest';
import { lighthouseRunner } from '@nve-internals/vite';

describe('lighthouse report', () => {
  test('layout.css should remain within compressed bundle limits', async () => {
    const report = await lighthouseRunner.getReport('layout.css', /* html */`
      <script type="module">
        import('@nvidia-elements/styles/layout.css');
      </script>
    `);

    expect(report.payload.css.kb).toBeLessThan(1.8); // total
    expect(report.payload.css.requests['layout.css'].kb).toBeLessThan(1.8);
  });

  test('responsive.css should remain within compressed bundle limits', async () => {
    const report = await lighthouseRunner.getReport('responsive.css', /* html */`
      <script type="module">
        import('@nvidia-elements/styles/responsive.css');
      </script>
    `);

    expect(report.payload.css.kb).toBeLessThan(2.9); // total
    expect(report.payload.css.requests['responsive.css'].kb).toBeLessThan(2.9);
  });

  test('typography.css should remain within compressed bundle limits', async () => {
    const report = await lighthouseRunner.getReport('typography.css', /* html */`
      <script type="module">
        import('@nvidia-elements/styles/typography.css');
      </script>
    `);

    expect(report.payload.css.kb).toBeLessThan(1.6); // total
    expect(report.payload.css.requests['typography.css'].kb).toBeLessThan(1.6);
  });
});
