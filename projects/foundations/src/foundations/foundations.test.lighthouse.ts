// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { expect, test, describe } from 'vitest';
import { lighthouseRunner } from '@internals/vite';

describe('foundations lighthouse report', () => {
  test('foundations should meet lighthouse benchmarks', async () => {
    const report = await lighthouseRunner.getReport('nve-foundations', /* html */`
      <nve-foundations><p nve-text="body">Container content</p></nve-foundations>
      <script type="module">
        import '@nvidia-elements/foundations/foundations/define.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(10);
  });
});
