// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { expect, test, describe } from 'vitest';
import { lighthouseRunner } from '@internals/vite';

describe('resize-handle lighthouse report', () => {
  test('resize-handle should meet lighthouse benchmarks', async () => {
    const report = await lighthouseRunner.getReport('nve-resize-handle', /* html */`
      <nve-resize-handle aria-label="resize"></nve-resize-handle>
      <script type="module">
        import '@nvidia-elements/core/resize-handle/define.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(12.6);
  });
});
