// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @nvidia-elements/lint/no-unexpected-slot-value -- These files exercise scene-owned composition and components introduced together. */

import { describe, expect, test } from 'vitest';
import { webgpuLighthouseRunner } from '@internals/vite';

describe('scene cones lighthouse report', () => {
  test('should meet representative scene benchmarks', async () => {
    const report = await webgpuLighthouseRunner.getReport(
      'nve-scene-cones',
      /* html */ `
        <nve-scene aria-label="cones scene">
          <nve-scene-cones><nve-scene-marker position="[0,0,0]"></nve-scene-marker></nve-scene-cones>
        </nve-scene>
        <script type="module">import '@nvidia-elements/scene/cones/define.js';</script>
      `
    );
    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
  });
});
