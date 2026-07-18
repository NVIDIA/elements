// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, test } from 'vitest';
import { lighthouseRunner } from '@internals/vite';

describe('media playback rate select lighthouse', () => {
  test('should pass lighthouse check', async () => {
    const report = await lighthouseRunner.getReport('media-playback-rate-select', /* html */ `
      <nve-media-playback-rate-select aria-label="playback rate"></nve-media-playback-rate-select>
      <script type="module">
        import '@nvidia-elements/media/playback-rate-select/define.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(35);
  });
});
