// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, test } from 'vitest';
import { visualRunner } from '@internals/vite';

describe('scene marker visual runtime', () => {
  test('should preserve declarative values in the WebGPU profile', async () => {
    const result = await visualRunner.inspect(
      'scene-marker-data',
      /* html */ `<nve-scene aria-label="marker scene" style="width: 512px; height: 512px; background: rgb(0 0 0)">
          <nve-scene-camera behavior="orbit" target="[1,2,3]" distance="8" phi="0.9" theta="-0.75" projection="ortho" frustum-height="3.5"></nve-scene-camera>
          <nve-scene-cubes><nve-scene-marker position="[1,2,3]" color="#76b900"></nve-scene-marker></nve-scene-cubes>
        </nve-scene>
        <script type="module">
          import '@nvidia-elements/scene/camera/define.js';
          import '@nvidia-elements/scene/cubes/define.js';
        </script>`,
      page => page.locator('nve-scene-marker').getAttribute('position')
    );
    expect(result).toBe('[1,2,3]');
  });
});
