// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, test } from 'vitest';
import { lighthouseRunner } from '@internals/vite';

describe('media pause button lighthouse report', () => {
  test('media pause button should meet lighthouse benchmarks', async () => {
    const report = await lighthouseRunner.getReport('nve-media-pause-button', /* html */`
      <nve-media-pause-button aria-label="pause media"></nve-media-pause-button>
      <script type="module">
        import '@nvidia-elements/media/pause-button/define.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(35);
  });
});
