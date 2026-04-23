// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { expect, test, describe } from 'vitest';
import { lighthouseRunner } from '@internals/vite';

describe('format-relative-time lighthouse report', () => {
  test('format-relative-time should meet lighthouse benchmarks', async () => {
    const report = await lighthouseRunner.getReport('nve-format-relative-time', /* html */`
      <nve-format-relative-time date="2023-07-27T12:00:00.000Z"></nve-format-relative-time>
      <script type="module">
        import '@nvidia-elements/core/format-relative-time/define.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(12);
  });
});
