// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { expect, test, describe } from 'vitest';
import { lighthouseRunner } from '@internals/vite';

describe('code lighthouse report', () => {
  test('components and supported languages stay within a complete transfer budget', async () => {
    const report = await lighthouseRunner.getReport(
      'modular-components-and-languages',
      /* html */ `
      <script type="module">
      import('@nvidia-elements/code/languages/css.js');
      import('@nvidia-elements/code/languages/go.js');
      import('@nvidia-elements/code/languages/html.js');
      import('@nvidia-elements/code/languages/javascript.js');
      import('@nvidia-elements/code/languages/json.js');
      import('@nvidia-elements/code/languages/markdown.js');
      import('@nvidia-elements/code/languages/python.js');
      import('@nvidia-elements/code/languages/tsx.js');
      import('@nvidia-elements/code/languages/typescript.js');
      import('@nvidia-elements/code/languages/xml.js');
      import('@nvidia-elements/code/languages/yaml.js');
      import('@nvidia-elements/code/code-block/define.js');
      import('@nvidia-elements/code/code-textarea/define.js');
      </script>
    `
    );

    expect(report.payload.javascript.kb).toBeLessThan(180);
  });

  test('statically imported bundle meets Lighthouse scores and transfer budget', async () => {
    const report = await lighthouseRunner.getReport(
      'bundle-static',
      /* html */ `<script type="module">import '@nvidia-elements/code/bundles/index.js';</script>`
    );
    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(190);
  });

  test('dynamically imported bundle stays within its transfer budget', async () => {
    const report = await lighthouseRunner.getReport(
      'bundle-dynamic',
      /* html */ `<script type="module">import('@nvidia-elements/code/bundles/index.js');</script>`
    );
    expect(report.payload.javascript.kb).toBeLessThan(190);
  });
});
