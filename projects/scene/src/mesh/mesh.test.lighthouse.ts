// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, test } from 'vitest';
import { webgpuLighthouseRunner } from '@internals/vite';

/* eslint-disable @nvidia-elements/lint/no-unexpected-slot-value */
describe('scene mesh lighthouse report', () => {
  test('meets representative scene benchmarks', async () => {
    const report = await webgpuLighthouseRunner.getReport(
      'nve-scene-mesh',
      /* html */ `
      <nve-scene aria-label="Mesh scene" style="width: 320px; height: 240px">
        <nve-scene-mesh id="mesh"></nve-scene-mesh>
      </nve-scene>
      <script type="module">
        import '@nvidia-elements/scene/mesh/define.js';
        const mesh = document.querySelector('#mesh');
        mesh.positions = new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]);
      </script>
    `
    );
    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
  });
});
