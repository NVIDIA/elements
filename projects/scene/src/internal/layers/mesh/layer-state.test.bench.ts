// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, test, type BenchRunOptions } from 'vitest';
import { registerMarkerLayer } from '../markers/layer-state.js';
import {
  getMeshRenderData,
  publishMeshGeometry,
  registerMeshLayer,
  replaceMeshGeometry,
  takeMeshLayerRenderData
} from './layer-state.js';

const options = { iterations: 10, throws: true, time: 750, warmupTime: 200 } satisfies BenchRunOptions;

describe('mesh publication history snapshots', () => {
  for (const count of [0, 1, 64, 1_024]) {
    const batch = count <= 1 ? 8_192 : count === 64 ? 64 : 8;
    test(`reads pending history with ${count} disjoint ranges, batch ${batch}`, async ({ bench }) => {
      const layer = document.createElement('div');
      registerMarkerLayer(layer, 'cube');
      registerMeshLayer(layer);
      const positions = new Float32Array(Math.max(9, Math.ceil((count * 6) / 9) * 9));
      replaceMeshGeometry(layer, { positions });
      takeMeshLayerRenderData(layer);
      for (let index = 0; index < count; index += 1) {
        publishMeshGeometry(layer, { attribute: 'positions', source: positions, start: index * 2, count: 1 });
      }
      await bench('reads without consuming publication history', () => {
        let checksum = 0;
        for (let index = 0; index < batch; index += 1) {
          const data = getMeshRenderData(layer);
          checksum += data.geometryUploadRanges.length + data.geometryVersions.positions;
        }
        return checksum;
      }).run(options);
    });
  }
});
