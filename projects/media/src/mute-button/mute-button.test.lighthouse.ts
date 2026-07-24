// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, test } from 'vitest';
import { lighthouseRunner } from '@internals/vite';

describe('media mute button lighthouse report', () => {
  test('media mute button should meet lighthouse benchmarks', async () => {
    const report = await lighthouseRunner.getReport('nve-media-mute-button', /* html */`
      <nve-media-mute-button aria-label="mute media"></nve-media-mute-button>
      <script type="module">
        import '@nvidia-elements/media/mute-button/define.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(35);
  });
});
