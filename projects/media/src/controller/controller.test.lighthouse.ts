// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, test } from 'vitest';
import { lighthouseRunner } from '@internals/vite';

describe('media controller lighthouse report', () => {
  test('media controller should meet lighthouse benchmarks', async () => {
    const report = await lighthouseRunner.getReport('nve-media-controller', /* html */`
      <nve-media-controller>
        <video aria-label="recording"></video>
      </nve-media-controller>
      <script type="module">
        import '@nvidia-elements/media/controller/define.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(30);
  });
});
