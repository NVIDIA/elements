// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, test } from 'vitest';
import { lighthouseRunner } from '@internals/vite';

describe('media time range lighthouse report', () => {
  test('media time range should meet lighthouse benchmarks', async () => {
    const report = await lighthouseRunner.getReport('nve-media-time-range', /* html */`
      <nve-media-time-range aria-label="current time" min="0" max="100" value="50"></nve-media-time-range>
      <script type="module">
        import '@nvidia-elements/media/time-range/define.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(25);
  });
});
