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

  test('layout-labs-container.css should remain within compressed bundle limits', async () => {
    const report = await lighthouseRunner.getReport('layout-labs-container.css', /* html */`
      <script type="module">
        import('@nvidia-elements/styles/layout-labs-container.css');
      </script>
    `);

    expect(report.payload.css.kb).toBeLessThan(1.95); // total
    // Use the first CSS request key since it might have a version in the filename
    const cssRequestKey = Object.keys(report.payload.css.requests)[0];
    expect(report.payload.css.requests[cssRequestKey].kb).toBeLessThan(1.95);
  });

  test('layout-labs-viewport.css should remain within compressed bundle limits', async () => {
    const report = await lighthouseRunner.getReport('layout-labs-viewport.css', /* html */`
      <script type="module">
        import('@nvidia-elements/styles/layout-labs-viewport.css');
      </script>
    `);

    expect(report.payload.css.kb).toBeLessThan(1.7); // total
    // Use the first CSS request key since it might have a version in the filename
    const cssRequestKey = Object.keys(report.payload.css.requests)[0];
    expect(report.payload.css.requests[cssRequestKey].kb).toBeLessThan(1.7);
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
