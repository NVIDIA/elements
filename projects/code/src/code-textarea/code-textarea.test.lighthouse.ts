// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { expect, test, describe } from 'vitest';
import { lighthouseRunner } from '@internals/vite';

describe('code-textarea lighthouse report', () => {
  test('code-textarea should meet lighthouse benchmarks', async () => {
    const report = await lighthouseRunner.getReport(
      'nve-code-textarea',
      /* html */ `
      <nve-code-textarea>
        <label>label</label>
        <textarea></textarea>
      </nve-code-textarea>
      <script type="module">
        import '@nvidia-elements/code/code-textarea/define.js';
      </script>
    `
    );

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    // The measured shell component is 26.22 kB including Lit and core.
    expect(report.payload.javascript.kb).toBeLessThan(28);
  });
});
