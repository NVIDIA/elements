// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, test, type BenchRunOptions } from 'vitest';
import {
  registerHeightfieldLayer,
  setHeightfieldLayerGrid,
  takeHeightfieldLayerRenderData
} from '../heightfield/layer-state.js';
import { registerMarkerLayer } from '../markers/layer-state.js';
import { registerBodyLayer, setBodyLayerGeometry, takeBodyLayerRenderData } from '../body/layer-state.js';
import { getMeshRenderData, registerMeshLayer, replaceMeshGeometry } from './layer-state.js';

const options = { iterations: 10, throws: true, time: 750, warmupTime: 200 } satisfies BenchRunOptions;
const BATCH = 4096;

function geometry(vertexCount: number) {
  return {
    positions: new Float32Array(vertexCount * 3),
    normals: new Float32Array(vertexCount * 3).fill(1),
    colors: new Float32Array(vertexCount * 4).fill(1),
    indices: Uint32Array.from({ length: Math.floor(vertexCount / 3) * 3 }, (_, index) => index)
  };
}

function snapshotReader(kind: 'mesh' | 'body' | 'heightfield', side: number) {
  const layer = document.createElement('div');
  const vertexCount = side * side;
  if (kind === 'heightfield') {
    registerHeightfieldLayer(layer, [1, 1, 1, 1]);
    setHeightfieldLayerGrid(layer, {
      columns: side,
      rows: side,
      spacing: 1,
      heights: new Float32Array(vertexCount),
      colors: new Uint8Array(vertexCount * 4).fill(255)
    });
    return () => takeHeightfieldLayerRenderData(layer);
  }
  registerMarkerLayer(layer, 'cube');
  if (kind === 'body') {
    registerBodyLayer(layer);
    setBodyLayerGeometry(layer, [{ geometry: geometry(vertexCount) }]);
    return () => takeBodyLayerRenderData(layer);
  }
  registerMeshLayer(layer);
  replaceMeshGeometry(layer, geometry(vertexCount));
  return () => getMeshRenderData(layer);
}

describe('mesh color snapshot classification', () => {
  for (const side of [64, 256]) {
    for (const kind of ['mesh', 'body', 'heightfield'] as const) {
      test(`captures ${BATCH} unchanged ${kind} snapshots with ${side * side} opaque colors`, async ({ bench }) => {
        const snapshot = snapshotReader(kind, side);
        await bench('repeated snapshots', () => {
          let checksum = 0;
          for (let index = 0; index < BATCH; index += 1) {
            const data = snapshot();
            checksum += Number(data.transparent) + data.version;
          }
          return checksum;
        }).run(options);
      });
    }
  }
});
