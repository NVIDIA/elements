// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, test } from 'vitest';
import { lighthouseRunner } from '@internals/vite';

describe('format-bytes lighthouse report', () => {
  test('format-bytes should meet lighthouse benchmarks', async () => {
    const report = await lighthouseRunner.getReport('nve-format-bytes', /* html */ `
      <nve-format-bytes locale="en-US">1048576</nve-format-bytes>
      <script type="module">
        import '@nvidia-elements/core/format-bytes/define.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(10.5);
  });
});
