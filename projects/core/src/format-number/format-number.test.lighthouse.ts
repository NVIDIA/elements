// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { expect, test, describe } from 'vitest';
import { lighthouseRunner } from '@internals/vite';

describe('format-number lighthouse report', () => {
  test('format-number should meet lighthouse benchmarks', async () => {
    const report = await lighthouseRunner.getReport('nve-format-number', /* html */`
      <nve-format-number format-style="currency" currency="USD">1234.56</nve-format-number>
      <script type="module">
        import '@nvidia-elements/core/format-number/define.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(12);
  });
});