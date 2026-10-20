// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, test } from 'vitest';
import { lighthouseRunner } from '@internals/vite';

describe('scene joint lighthouse report', () => {
  test('should meet representative scene benchmarks', async () => {
    const report = await lighthouseRunner.getReport(
      'nve-scene-joint',
      /* html */ `
      <nve-scene aria-label="Robot visualization">
        <nve-scene-body name="base"></nve-scene-body>
        <nve-scene-body name="sensor"></nve-scene-body>
        <nve-scene-joint name="mount" parent="base" child="sensor" type="fixed" position="[0,0,1]"></nve-scene-joint>
      </nve-scene>
      <script type="module">
        import '@nvidia-elements/scene/joint/define.js';
      </script>
    `
    );

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    const requests = Object.keys(report.payload.javascript.requests);
    expect(requests.some(name => /(?:^|\/)geometry-renderer\.js$/.test(name))).toBe(false);
    // Measured 69.03 KB with explicit body endpoints; allow about 5% headroom.
    expect(report.payload.javascript.kb).toBeLessThan(73);
  });
});
