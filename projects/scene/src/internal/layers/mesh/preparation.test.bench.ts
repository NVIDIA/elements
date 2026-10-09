// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, test, type BenchRunOptions } from 'vitest';
import { createMeshItem } from '../../../../test/rendering.js';
import { retainGeometryUploadRanges } from './preparation.js';
import type { MeshGeometryUploadRange } from './render-data.js';

const options = { iterations: 10, throws: true, time: 750, warmupTime: 200 } satisfies BenchRunOptions;

describe('mesh preparation range history', () => {
  for (const count of [0, 1, 64, 1_024]) {
    const batch = count <= 1 ? 4_096 : count === 64 ? 128 : 8;
    for (const mode of ['continuous', 'missing generation', 'unchanged'] as const) {
      test(`retains ${mode} history with ${count} ranges per attribute, batch ${batch}`, async ({ bench }) => {
        const item = createMeshItem();
        const positions = new Float32Array(Math.max(9, count * 9));
        const colors = new Float32Array(Math.max(12, count * 12));
        const previous = {
          ...item,
          data: {
            ...item.data,
            positions,
            colors,
            geometryVersions: { ...item.data.geometryVersions, positions: 1, colors: 1 },
            geometryUploadBaseVersions: { positions: 0, colors: 0 },
            geometryUploadRanges: ranges(count, 0)
          }
        };
        const current = {
          ...previous,
          data: {
            ...previous.data,
            geometryVersions: {
              ...previous.data.geometryVersions,
              positions: mode === 'unchanged' ? 1 : mode === 'continuous' ? 2 : 4,
              colors: 2
            },
            geometryUploadBaseVersions: {
              ...(mode === 'unchanged' ? {} : { positions: mode === 'continuous' ? 1 : 3 }),
              colors: 1
            },
            geometryUploadRanges:
              mode === 'unchanged' ? ranges(count, 1).filter(range => range.attribute === 'colors') : ranges(count, 1)
          }
        };
        await bench('combines pending publication windows', () => {
          let checksum = 0;
          for (let index = 0; index < batch; index += 1) {
            const result = retainGeometryUploadRanges(current, previous);
            checksum +=
              result.data.geometryUploadRanges.length + (result.data.geometryUploadBaseVersions?.positions ?? 0);
          }
          return checksum;
        }).run(options);
      });
    }
  }
});

function ranges(count: number, vertexOffset: number): MeshGeometryUploadRange[] {
  return (['positions', 'colors'] as const).flatMap(attribute => {
    const stride = attribute === 'positions' ? 12 : 16;
    return Array.from({ length: count }, (_, index) => ({
      attribute,
      offset: (index * 3 + vertexOffset) * stride,
      size: stride
    }));
  });
}
