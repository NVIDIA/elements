import { expect, test, describe } from 'vitest';
import { runner } from '@nvidia-elements/testing-lighthouse';

describe('lighthouse report', () => {
  test('CSS bundles should remain within compressed bundle limits', async () => {
    const report = await runner.getReport('css-bundles', /* html */`
      <script type="module">
        import('@nvidia-elements/styles/layout.css');
        import('@nvidia-elements/styles/responsive.css');
        import('@nvidia-elements/styles/typography.css');
      </script>
    `);

    expect(report.payload.css.kb).toBeLessThan(4); // total
    expect(report.payload.css.requests['layout.css'].kb).toBeLessThan(1.7); // @nvidia-elements/styles/dist/layout.css
    expect(report.payload.css.requests['responsive.css'].kb).toBeLessThan(1.1); // @nvidia-elements/styles/dist/responsive.css
    expect(report.payload.css.requests['typography.css'].kb).toBeLessThan(1.4); // @nvidia-elements/styles/dist/typography.css
  });
});
