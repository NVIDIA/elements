// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';
import { lighthouseRunner } from '@internals/vite';

describe('scene body lighthouse report', () => {
  test('meets representative scene benchmarks', async () => {
    const report = await lighthouseRunner.getReport(
      'nve-scene-body',
      `<nve-scene aria-label="body">
        <nve-scene-body></nve-scene-body>
      </nve-scene>
      <script type="module">
        import '@nvidia-elements/scene/body/define.js';
      </script>`
    );
    expect(Object.keys(report.payload.javascript.requests).some(name => /(?:^|\/)stl\.js$/.test(name))).toBe(false);
    const bundle = readFileSync(new URL('../../dist/bundles/index.js', import.meta.url), 'utf8');
    expect(bundle).not.toContain('STL must be a complete binary file');
    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
  });

  test('loads the STL decoder in its own budgeted chunk on first use', async () => {
    const stl =
      'solid triangle\nfacet normal 0 0 1\nouter loop\nvertex 0 0 0\nvertex 1 0 0\nvertex 0 1 0\nendloop\nendfacet\nendsolid triangle\n';
    const report = await lighthouseRunner.getReport(
      'nve-scene-body-file',
      `
      <nve-scene aria-label="Loaded body"><nve-scene-body id="loaded"></nve-scene-body></nve-scene>
      <script type="module">
        import '@nvidia-elements/scene/body/define.js';
        const originalFetch = globalThis.fetch;
        globalThis.fetch = (url, options) => new URL(url, document.baseURI).pathname === '/triangle.stl'
          ? Promise.resolve(new Response(${JSON.stringify(stl)})) : originalFetch(url, options);
        const body = document.querySelector('#loaded');
        body.src = '/triangle.stl';
        await body.loadComplete;
      </script>
    `
    );
    const decoder = Object.entries(report.payload.javascript.requests).find(([name]) => /(?:^|\/)stl\.js$/.test(name));
    expect(decoder).toBeDefined();
    expect(decoder?.[1].kb).toBeLessThan(4);
    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
  });
});
