import { expect, test, describe } from 'vitest';
import { lighthouseRunner } from '@nve-internals/vite';

describe('lighthouse report', () => {
  test('@nvidia-elements/monaco JS bundle should remain within compressed bundle limits', async () => {
    const report = await lighthouseRunner.getReport('index', /* html */`
      <script type="module">
        import('@nvidia-elements/monaco');
      </script>
    `);

    expect(report.payload.javascript.kb).toBeLessThan(1023);
    expect(report.payload.javascript.requests['index2.js'].kb).toBeLessThan(1022);
  });
});
