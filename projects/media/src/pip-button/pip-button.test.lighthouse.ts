// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, test } from 'vitest';
import { lighthouseRunner } from '@internals/vite';

describe('media pip button lighthouse report', () => {
  test('media pip button should meet lighthouse benchmarks', async () => {
    const report = await lighthouseRunner.getReport('nve-media-pip-button', /* html */`
      <nve-media-pip-button aria-label="enter picture in picture"></nve-media-pip-button>
      <script type="module">
        import '@nvidia-elements/media/pip-button/define.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(21.5);
  });
});
