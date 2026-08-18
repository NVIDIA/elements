// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, test } from 'vitest';
import { webgpuVisualRunner } from '@internals/vite';

/* eslint-disable @nvidia-elements/lint/no-unexpected-slot-value -- This package defines Scene Frame and Scene discovery content. */

describe('scene frame visual runtime', () => {
  test('should resolve timestamped frame transforms in the real WebGPU scene profile', async () => {
    const result = await webgpuVisualRunner.inspect(
      'scene-frame-transform',
      /* html */ `
        <nve-scene aria-label="Scene" style="width: 16px; height: 10px">
          <nve-scene-frame></nve-scene-frame>
        </nve-scene>
        <script type="module">
          import '@nvidia-elements/scene/frame/define.js';
          const scene = document.querySelector('nve-scene');
          const frame = document.querySelector('nve-scene-frame');
          scene.time = 5;
          frame.setTransform({ stamp: 0, position: [0, 0, 0], orientation: [0, 0, 0, 1] });
          frame.setTransform({ stamp: 10, position: [10, 0, 0], orientation: [0, 0, 0, 1] });
        </script>
      `,
      page =>
        page.evaluate(async () => {
          const scene = document.querySelector('nve-scene');
          const frame = document.querySelector('nve-scene-frame');
          if (!scene || !frame) {
            throw new Error('Expected scene frame fixture.');
          }
          await scene.ready;
          const matrix = frame.getWorldMatrix();
          const explicitMatrix = frame.getWorldMatrix(5);
          return {
            defaultPosition: [matrix[12], matrix[13], matrix[14]],
            explicitPosition: [explicitMatrix[12], explicitMatrix[13], explicitMatrix[14]],
            sceneTime: scene.time,
            transform: frame.transform
          };
        })
    );

    expect(result).toEqual({
      defaultPosition: [5, 0, 0],
      explicitPosition: [5, 0, 0],
      sceneTime: 5,
      transform: { stamp: 10, position: [10, 0, 0], orientation: [0, 0, 0, 1] }
    });
  });
});
