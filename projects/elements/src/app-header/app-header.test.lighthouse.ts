import { expect, test, describe } from 'vitest';
import { lighthouseRunner } from '@internals/vite';

/* eslint-disable @nvidia-elements/lint/no-deprecated-tags */

describe('app-header lighthouse report', () => {
  test('app-header should meet lighthouse benchmarks', async () => {
    const report = await lighthouseRunner.getReport('nve-app-header', /* html */`
      <nve-app-header>
        <nve-logo size="lg" aria-label="NV Logo">NV</nve-logo>
        <h2 slot="title">header</h2>
        <nve-button slot="nav-items">item</nve-button>
        <nve-icon-button icon-name="person" slot="nav-actions" aria-label="profile"></nve-icon-button>
      </nve-app-header>
      <script type="module">
        import '@nvidia-elements/core/app-header/define.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(18.5);
  });
});
