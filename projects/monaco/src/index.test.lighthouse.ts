import { expect, test, describe } from 'vitest';
import { lighthouseRunner } from '@nve-internals/vite';

describe('lighthouse report', () => {
  test('@nvidia-elements/monaco/editor JS Bundles should remain within compressed bundle limits', async () => {
    const report = await lighthouseRunner.getReport('bundles', /* html */`
      <script type="module">
        import('@nvidia-elements/monaco/editor/define.js');
        import('@nvidia-elements/monaco/input/define.js');
      </script>
    `);

    expect(report.payload.javascript.kb).toBeLessThan(15);
  });
});
