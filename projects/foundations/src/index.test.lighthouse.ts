// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { expect, test, describe } from 'vitest';
import { lighthouseRunner } from '@internals/vite';

describe('lighthouse report', () => {
  test('JS Bundles should remain within compressed bundle limits', async () => {
    const report = await lighthouseRunner.getReport(
      `bundles/index.js`,
      /* html */ `
      <script type="module">
      import '@nvidia-elements/foundations/bundles/index.js';
      </script>
    `
    );

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.requests['index.js'].kb).toBeLessThan(12);
  });

  test('JS imports should remain within compressed bundle limits', async () => {
    const report = await lighthouseRunner.getReport(
      'js-modules',
      /* html */ `
      <script type="module">
        import '@nvidia-elements/foundations/scroll-box/define.js';
        import '@nvidia-elements/foundations/virtual-list/define.js';
      </script>
    `
    );

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.requests[Object.keys(report.payload.javascript.requests)[0]].kb).toBeLessThan(12.5);
  });
});
