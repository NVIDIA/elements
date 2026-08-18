// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, test } from 'vitest';
import { webgpuLighthouseRunner } from '@internals/vite';

/* eslint-disable @nvidia-elements/lint/no-unexpected-slot-value -- This package defines Scene Frame and Scene discovery content. */

describe('scene frame lighthouse report', () => {
  test('should meet representative scene benchmarks', async () => {
    const report = await webgpuLighthouseRunner.getReport(
      'nve-scene-frame',
      /* html */ `
      <nve-scene aria-label="Robot visualization">
        <nve-scene-frame name="base-link" position="[1,0,0]">
          <nve-scene-frame name="sensor" position="[0,0,1]"></nve-scene-frame>
        </nve-scene-frame>
      </nve-scene>
      <script type="module">
        import '@nvidia-elements/scene/frame/define.js';
      </script>
    `
    );

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    // Frames import the owning Scene, including the M9 overlay label lifecycle.
    expect(report.payload.javascript.kb).toBeLessThan(36);
  });
});
