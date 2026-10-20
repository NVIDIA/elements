// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, test, type BenchRunOptions } from 'vitest';
import { Scene } from '../../../scene/scene.js';
import { SceneMesh } from '../../../mesh/mesh.js';
import { SceneHeightfield } from '../../../heightfield/heightfield.js';
import '../../../scene/define.js';
import '../../../mesh/define.js';
import '../../../heightfield/define.js';

const options = { iterations: 10, throws: true, time: 750, warmupTime: 200 } satisfies BenchRunOptions;
const QUERY_BATCH = 64;

describe('published geometry bounds', () => {
  for (const side of [64, 256]) {
    const count = side * side;
    for (const kind of ['indexed mesh', 'heightfield'] as const) {
      test(`queries ${count} ${kind} samples ${QUERY_BATCH} times`, async ({ bench }) => {
        let scene: Scene;
        await bench('unchanged scene bounds', () => {
          let checksum = 0;
          for (let query = 0; query < QUERY_BATCH; query += 1) {
            const bounds = scene.getBounds({ content: [scene] })!;
            checksum += bounds.maximum[0] + bounds.maximum[2];
          }
          return checksum;
        }).run({
          ...options,
          setup() {
            scene = new Scene();
            const heights = Float32Array.from({ length: count }, (_, index) => (index % 127) - 63);
            if (kind === 'heightfield') {
              const terrain = new SceneHeightfield();
              terrain.grid = { columns: side, rows: side, spacing: 0.25, heights };
              scene.append(terrain);
            } else {
              const mesh = new SceneMesh();
              mesh.geometry = {
                positions: Float32Array.from({ length: count * 3 }, (_, index) =>
                  index % 3 === 0
                    ? Math.floor(index / 3) % side
                    : index % 3 === 1
                      ? Math.floor(index / 3 / side)
                      : heights[Math.floor(index / 3)]!
                ),
                indices: Uint32Array.from({ length: Math.floor(count / 3) * 3 }, (_, index) => index)
              };
              scene.append(mesh);
            }
            if (!scene.getBounds({ content: [scene] })) throw new Error('Expected captured geometry bounds.');
          }
        });
      });
    }
  }
});
