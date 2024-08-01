import { expect, test, describe } from 'vitest';
import { lighthouseRunner } from '@internals/vite';
import packageJson from '../package.json';

describe('lighthouse report', () => {
  test('CSS bundles should remain within compressed bundle limits', async () => {
    const report = await lighthouseRunner.getReport(`bundles/index.${packageJson.version}.css`, /* html */`
      <script type="module">
        import('@nvidia-elements/core/bundles/index.${packageJson.version}.css');
      </script>
    `);

    
    expect(report.payload.css.requests[Object.keys(report.payload.css.requests)[0]].kb).toBeLessThan(13); // @nvidia-elements/core/bundles/index.VERSION.css
  });

  test('JS Bundles should remain within compressed bundle limits', async () => {
    const report = await lighthouseRunner.getReport(`bundles/index.${packageJson.version}.js`, /* html */`
      <script type="module">
      import '@nvidia-elements/core/bundles/index.${packageJson.version}.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.requests[Object.keys(report.payload.javascript.requests)[0]].kb).toBeLessThan(109); // @nvidia-elements/core/bundles/index.VERSION.js
  });
});
