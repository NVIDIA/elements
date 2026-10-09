// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, test, type BenchRunOptions } from 'vitest';
import { registerMarkerLayer } from '../markers/layer-state.js';
import { publishMeshGeometry, registerMeshLayer, replaceMeshGeometry, takeMeshLayerRenderData } from './layer-state.js';
import { prepareMeshGeometry, processMeshGeometry, updateFlatGeometry } from './processing.js';

const options = { iterations: 10, throws: true, time: 750, warmupTime: 200 } satisfies BenchRunOptions;

function grid(side: number) {
  const positions = new Float32Array(side * side * 3);
  const colors = new Float32Array(side * side * 4).fill(1);
  const indices = new Uint32Array((side - 1) ** 2 * 6);
  let corner = 0;
  for (let y = 0; y < side; y += 1) {
    for (let x = 0; x < side; x += 1) {
      const vertex = y * side + x;
      positions[vertex * 3] = x;
      positions[vertex * 3 + 1] = y;
      if (x < side - 1 && y < side - 1) {
        indices.set([vertex, vertex + 1, vertex + side, vertex + 1, vertex + side + 1, vertex + side], corner);
        corner += 6;
      }
    }
  }
  return { positions, indices, colors, normals: null, uvs: null };
}

describe('indexed flat mesh publication and processing', () => {
  for (const side of [32, 128, 256]) {
    const vertexCount = side * side;
    const batch = side === 32 ? 64 : side === 128 ? 4 : 1;
    for (const mode of ['one position', 'one percent positions', 'all positions', 'one color'] as const) {
      test(`publishes ${mode} in ${vertexCount} vertices, batch ${batch}`, async ({ bench }) => {
        const source = grid(side);
        const layer = document.createElement('div');
        registerMarkerLayer(layer, 'cube');
        registerMeshLayer(layer);
        replaceMeshGeometry(layer, source);
        let processed = processMeshGeometry(takeMeshLayerRenderData(layer))!;
        const attribute = mode === 'one color' ? 'colors' : 'positions';
        const count =
          mode === 'all positions' ? vertexCount : mode === 'one percent positions' ? Math.ceil(vertexCount / 100) : 1;
        const start = mode === 'all positions' ? 0 : Math.floor(vertexCount / 2);
        let iteration = 0;
        await bench('publication and generated attributes', () => {
          let checksum = 0;
          for (let item = 0; item < batch; item += 1) {
            iteration += 1;
            source[attribute][start * (attribute === 'colors' ? 4 : 3) + 2] = iteration % 2 ? 0.25 : 0.75;
            publishMeshGeometry(layer, { attribute, source: source[attribute], start, count });
            processed = updateFlatGeometry(takeMeshLayerRenderData(layer), processed)!;
            checksum += processed.positions.length + processed.normals[2]!;
          }
          return checksum;
        }).run(options);
      });
    }
    test(`builds indexed flat geometry for ${vertexCount} vertices, batch ${batch}`, async ({ bench }) => {
      const source = grid(side);
      await bench('initial processing', () => {
        let checksum = 0;
        for (let item = 0; item < batch; item += 1) checksum += processMeshGeometry(source)!.positions.length;
        return checksum;
      }).run(options);
    });
  }
});

describe('nonindexed mesh generated attributes', () => {
  for (const vertexCount of [4_098, 65_538]) {
    const batch = vertexCount === 4_098 ? 16 : 2;
    const source = {
      colors: null,
      indices: null,
      normals: null,
      positions: Float32Array.from({ length: vertexCount * 3 }, (_, index) =>
        index % 9 === 3 || index % 9 === 7 ? 1 : 0
      ),
      uvs: null
    };
    for (const mode of ['synchronous', 'scheduled'] as const) {
      test(`${mode} normals and defaults for ${vertexCount} vertices, batch ${batch}`, async ({ bench }) => {
        const context = { isCurrent: () => true, yield: async () => {} };
        const synchronous = () => {
          let checksum = 0;
          for (let index = 0; index < batch; index += 1) {
            const result = processMeshGeometry(source)!;
            checksum += result.normals[2]! + result.uploadColors.length;
          }
          return checksum;
        };
        const scheduled = async () => {
          let checksum = 0;
          for (let index = 0; index < batch; index += 1) {
            const result = (await prepareMeshGeometry(source, context))!;
            checksum += result.normals[2]! + result.uploadColors.length;
          }
          return checksum;
        };
        await bench('generated normals and default attributes', mode === 'synchronous' ? synchronous : scheduled).run(
          options
        );
      });
    }
  }
});

describe('indexed flat mesh publication history', () => {
  for (const side of [32, 128]) {
    const vertexCount = side * side;
    for (const publications of [0, 8, 64, 1_024]) {
      const batch = publications === 0 ? (side === 32 ? 64 : 4) : publications === 8 ? 4 : 1;
      test(`processes ${publications} edits before draining ${vertexCount} vertices, batch ${batch}`, async ({
        bench
      }) => {
        const source = grid(side);
        const layer = document.createElement('div');
        registerMarkerLayer(layer, 'cube');
        registerMeshLayer(layer);
        replaceMeshGeometry(layer, source);
        let processed = processMeshGeometry(takeMeshLayerRenderData(layer))!;
        let iteration = 0;
        await bench('publication burst and generated attributes', () => {
          let checksum = 0;
          for (let item = 0; item < batch; item += 1) {
            iteration += 1;
            for (let edit = 0; edit < Math.max(1, publications); edit += 1) {
              const start = Math.floor(vertexCount / 2) + (edit % 4) * 2;
              source.positions[start * 3 + 2] = iteration % 2 ? 0.25 : 0.75;
              publishMeshGeometry(layer, {
                attribute: 'positions',
                source: source.positions,
                start,
                count: publications === 0 ? 0 : 1
              });
            }
            processed = updateFlatGeometry(takeMeshLayerRenderData(layer), processed)!;
            checksum += processed.positions.length + processed.normals[2]!;
          }
          return checksum;
        }).run(options);
      });
    }
  }
});
