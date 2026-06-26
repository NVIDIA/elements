// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { expect, test, describe } from 'vitest';
import { lighthouseRunner } from '@internals/vite';

describe('progress-gauge lighthouse report', () => {
  test('progress-gauge should meet lighthouse benchmarks', async () => {
    const report = await lighthouseRunner.getReport('nve-progress-gauge', /* html */`
      <nve-progress-gauge aria-label="progress" value="50"></nve-progress-gauge>
      <script type="module">
        import '@nvidia-elements/core/progress-gauge/define.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(15);
  });
});
