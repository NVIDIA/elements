import { expect, test, describe } from 'vitest';
import { lighthouseRunner } from '@internals/vite';

describe('lighthouse report', () => {
  test('@nvidia-elements/media JS Bundles should remain within compressed bundle limits', async () => {
    const report = await lighthouseRunner.getReport('bundles', /* html */`
      <script type="module">
        import('@nvidia-elements/media');
      </script>
    `);

    expect(report.payload.javascript.kb).toBeLessThan(2);
  });
});
