// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @nvidia-elements/lint/no-unexpected-slot-value -- These files exercise scene-owned composition and components introduced together. */

import { describe, expect, test } from 'vitest';
import { webgpuLighthouseRunner } from '@internals/vite';

describe('scene arrows lighthouse report', () => {
  test('should meet representative scene benchmarks', async () => {
    const report = await webgpuLighthouseRunner.getReport(
      'nve-scene-arrows',
      /* html */ `
        <nve-scene aria-label="arrows scene">
          <nve-scene-arrows><nve-scene-marker from="0 0 0" to="0 0 1"></nve-scene-marker></nve-scene-arrows>
        </nve-scene>
        <script type="module">import '@nvidia-elements/scene/arrows/define.js';</script>
      `
    );
    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
  });
});
