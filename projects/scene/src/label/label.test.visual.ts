// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, test } from 'vitest';
import { webgpuVisualRunner } from '@internals/vite';

describe('scene label visual contract', () => {
  test('should retain the label child while Scene projects its overlay', async () => {
    const result = await webgpuVisualRunner.inspect(
      'scene-label-overlay',
      `<nve-scene aria-label="Robot visualization" style="width:64px;height:64px"><nve-scene-label anchor="top-left" offset="[4,-8]" position="[1,2,3]"><span>Robot base</span></nve-scene-label></nve-scene><script type="module">import '@nvidia-elements/scene/label/define.js';</script>`,
      page => page.locator('nve-scene-label > span').textContent()
    );

    expect(result).toBe('Robot base');
  });
});
