// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { expect, test, describe } from 'vitest';
import { lighthouseRunner } from '@internals/vite';

describe('codeblock lighthouse report', () => {
  test('codeblock should meet lighthouse benchmarks', async () => {
    const report = await lighthouseRunner.getReport(
      'nve-code-block',
      /* html */ `
      <nve-code-block language="json" line-numbers>
        <nve-code-block-header>inference.json</nve-code-block-header>
        <template>
{
  "model": "image-classifier",
  "gpu": "B200",
  "batchSize": 16,
  "precision": "fp16",
  "preprocess": {
    "imageSize": [224, 224],
    "normalize": true
  },
  "includeConfidence": true
}
        </template>
        <nve-code-block-footer>Inference configuration</nve-code-block-footer>
      </nve-code-block>
      <script type="module">
        import '@nvidia-elements/code/languages/json.js';
        import '@nvidia-elements/code/code-block/define.js';
      </script>
    `
    );

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(40);
  });
});
