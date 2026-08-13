// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, test } from 'vitest';
import { lighthouseRunner } from '@internals/vite';

describe('format-truncate lighthouse report', () => {
  test('format-truncate should meet lighthouse benchmarks', async () => {
    const report = await lighthouseRunner.getReport(
      'nve-format-truncate',
      /* html */ `
      <nve-format-truncate position="center" strategy="path" preserve="2">/models/checkpoints/production/model.bin</nve-format-truncate>
      <script type="module">
        import '@nvidia-elements/core/format-truncate/define.js';
      </script>
    `
    );

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(16);
  });
});
