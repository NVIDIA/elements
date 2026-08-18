// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { expect, test, describe } from 'vitest';
import { webgpuLighthouseRunner } from '@internals/vite';

describe('scene lighthouse report', () => {
  test('scene should meet lighthouse benchmarks', async () => {
    const report = await webgpuLighthouseRunner.getReport(
      'nve-scene',
      /* html */ `
      <nve-scene aria-label="Scene"></nve-scene>
      <script type="module">
        import '@nvidia-elements/scene/scene/define.js';
      </script>
    `
    );

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    // M9 adds the accessible overlay label lifecycle; texture capture remains deferred.
    expect(report.payload.javascript.kb).toBeLessThan(35);
  });
});
