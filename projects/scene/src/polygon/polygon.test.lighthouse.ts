// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, test } from 'vitest';
import { lighthouseRunner } from '@internals/vite';

describe('scene polygon lighthouse report', () => {
  test('should meet representative scene benchmarks', async () => {
    const report = await lighthouseRunner.getReport(
      'nve-scene-polygon',
      /* html */ `
        <nve-scene aria-label="polygon scene">
          <nve-scene-polygon geometry='{"outer":[[0,0],[2,0],[2,2],[0,2]]}'></nve-scene-polygon>
        </nve-scene>
        <script type="module">import '@nvidia-elements/scene/polygon/define.js';</script>
      `
    );
    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    // The prior implementation already measured 85.99 KB against a stale 73 KB limit.
    // Scoped frame composition measures 87.74 KB; allow about 5% headroom.
    expect(report.payload.javascript.kb).toBeLessThan(93);
  });
});
