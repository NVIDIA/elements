// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, test } from 'vitest';
import { lighthouseRunner } from '@internals/vite';

describe('media volume range lighthouse report', () => {
  test('media volume range should meet lighthouse benchmarks', async () => {
    const report = await lighthouseRunner.getReport('nve-media-volume-range', /* html */`
      <nve-media-volume-range aria-label="volume" value="0.5"></nve-media-volume-range>
      <script type="module">
        import '@nvidia-elements/media/volume-range/define.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(25);
  });
});
