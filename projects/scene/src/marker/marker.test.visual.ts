// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, test } from 'vitest';
import { webgpuVisualRunner } from '@internals/vite';

describe('scene marker visual runtime', () => {
  test('should preserve declarative values in the WebGPU profile', async () => {
    const result = await webgpuVisualRunner.inspect(
      'scene-marker-data',
      /* html */ `<nve-scene-cubes><nve-scene-marker position="[1,2,3]"></nve-scene-marker></nve-scene-cubes>
        <script type="module">import '@nvidia-elements/scene/cubes/define.js';</script>`,
      page => page.locator('nve-scene-marker').getAttribute('position')
    );
    expect(result).toBe('[1,2,3]');
  });
});
