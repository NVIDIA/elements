// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, test } from 'vitest';
import { lighthouseRunner } from '@internals/vite';

describe('drag-handle lighthouse report', () => {
  test('should meet Lighthouse benchmarks', async () => {
    const report = await lighthouseRunner.getReport('nve-drag-handle', /* html */ `
      <nve-drag-handle aria-label="Move item"></nve-drag-handle>
      <script type="module">
        import '@nvidia-elements/core/drag-handle/define.js';
      </script>
    `);
    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(19.3);
  });
});
