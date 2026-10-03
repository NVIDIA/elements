// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { expect, test, describe } from 'vitest';
import { lighthouseRunner } from '@internals/vite';

describe('code lighthouse report', () => {
  test('components and language modules should remain within compressed bundle limits', async () => {
    const report = await lighthouseRunner.getReport(
      'modular-components-and-languages',
      /* html */ `
      <script type="module">
      import('@nvidia-elements/code/codeblock/languages/bash.js');
      import('@nvidia-elements/code/codeblock/languages/css.js');
      import('@nvidia-elements/code/codeblock/languages/go.js');
      import('@nvidia-elements/code/codeblock/languages/html.js');
      import('@nvidia-elements/code/codeblock/languages/javascript.js');
      import('@nvidia-elements/code/codeblock/languages/json.js');
      import('@nvidia-elements/code/codeblock/languages/markdown.js');
      import('@nvidia-elements/code/codeblock/languages/python.js');
      import('@nvidia-elements/code/codeblock/languages/shell.js');
      import('@nvidia-elements/code/codeblock/languages/toml.js');
      import('@nvidia-elements/code/codeblock/languages/tsx.js');
      import('@nvidia-elements/code/codeblock/languages/typescript.js');
      import('@nvidia-elements/code/codeblock/languages/xml.js');
      import('@nvidia-elements/code/codeblock/languages/yaml.js');
      import('@nvidia-elements/code/codeblock/define.js');
      import('@nvidia-elements/code/code-textarea/define.js');
      </script>
    `
    );

    // Lighthouse measures compressed transfer sizes, including request overhead, in decimal kB.
    const requests = report.payload.javascript.requests;
    const requestLimits = {
      'index.js': 1.9,
      'define.js': 12.9, // CodeTextarea
      'define2.js': 3.8, // CodeBlock
      'styles.js': 9.5, // Shared component dependencies
      'language-registry.js': 2.6, // Registry and scanner
      'bash.js': 2.3,
      'css.js': 1.6,
      'go.js': 1.8,
      'html.js': 6.4,
      'javascript.js': 5.5,
      'json.js': 1,
      'markdown.js': 19.5,
      'python.js': 3.6,
      'shell.js': 2.6,
      'toml.js': 1.4,
      'tsx.js': 5.5,
      'typescript.js': 5.1,
      'xml.js': 6.4,
      'yaml.js': 1.8
    };

    expect(report.payload.javascript.kb).toBeLessThan(110);
    for (const [name, limit] of Object.entries(requestLimits)) {
      expect(requests[name]?.kb, name).toBeLessThan(limit);
    }

    // Fragment names depend on grammar sharing; budget their combined transfer size.
    const fragments = Object.entries(requests).filter(([name]) => /^fragments-[\da-f]+\.js$/.test(name));
    expect(fragments.length).toBeGreaterThan(0);
    expect(fragments.reduce((total, [, request]) => total + request.kb, 0)).toBeLessThan(16);
    expect(Object.keys(requests).sort()).toEqual(
      [...Object.keys(requestLimits), ...fragments.map(([name]) => name)].sort()
    );
  });

  test('statically imported bundle should meet Lighthouse scores and compressed size limits', async () => {
    const report = await lighthouseRunner.getReport(
      'bundle-static',
      /* html */ `
      <script type="module">
      import '@nvidia-elements/code/bundles/index.js';
      </script>
    `
    );

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    const bundleKb = report.payload.javascript.requests[Object.keys(report.payload.javascript.requests)[0]!]!.kb;
    expect(bundleKb).toBeGreaterThan(30);
    expect(bundleKb).toBeLessThan(103.8);
  });
  test('dynamically imported bundle should remain within compressed bundle limits', async () => {
    const report = await lighthouseRunner.getReport(
      'bundle-dynamic',
      /* html */ `
      <script type="module">
      import('@nvidia-elements/code/bundles/index.js');
      </script>
    `
    );

    expect(report.payload.javascript.kb).toBeGreaterThan(31);
    expect(report.payload.javascript.kb).toBeLessThan(104.9);
  });
});
