// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import type { MeshRenderItem } from '../../rendering/render-items.js';
import { retainGeometryUploadRanges } from './preparation.js';
import {
  createConstructedMeshRenderData,
  createMeshGeometryAttributeVersions,
  type MeshGeometryUploadRange
} from './render-data.js';

describe(retainGeometryUploadRanges.name, () => {
  it('retains the oldest base only across continuous attribute generations', () => {
    const item = createItem([{ attribute: 'positions', offset: 0, size: 12 }]);
    const previous = {
      ...item,
      data: {
        ...item.data,
        geometryVersions: { ...item.data.geometryVersions, positions: 11 },
        geometryUploadBaseVersions: { positions: 10 }
      }
    };
    const contiguous = {
      ...item,
      data: {
        ...item.data,
        geometryVersions: { ...item.data.geometryVersions, positions: 12 },
        geometryUploadBaseVersions: { positions: 11 }
      }
    };
    expect(retainGeometryUploadRanges(contiguous, previous).data.geometryUploadBaseVersions).toEqual({ positions: 10 });
    const gap = {
      ...contiguous,
      data: {
        ...contiguous.data,
        geometryVersions: { ...contiguous.data.geometryVersions, positions: 14 },
        geometryUploadBaseVersions: { positions: 13 }
      }
    };
    expect(retainGeometryUploadRanges(gap, previous).data.geometryUploadBaseVersions).toEqual({ positions: 13 });
    const unchanged = {
      ...previous,
      data: { ...previous.data, geometryUploadBaseVersions: {}, geometryUploadRanges: [] }
    };
    expect(retainGeometryUploadRanges(unchanged, previous).data.geometryUploadBaseVersions).toEqual({ positions: 10 });
  });

  it('unions matching generations by attribute without changing either input snapshot', () => {
    const previous = createItem([
      { attribute: 'positions', offset: 0, size: 12 },
      { attribute: 'normals', offset: 0, size: 12 }
    ]);
    const current = {
      ...previous,
      data: {
        ...previous.data,
        geometryVersions: { ...previous.data.geometryVersions, positions: 2, colors: 1 },
        geometryUploadBaseVersions: { positions: 1, colors: 0 },
        geometryUploadRanges: [
          { attribute: 'positions' as const, offset: 12, size: 12 },
          { attribute: 'positions' as const, offset: 48, size: 12 },
          { attribute: 'colors' as const, offset: 0, size: 16 }
        ]
      }
    };
    const retained = retainGeometryUploadRanges(current, previous);
    expect(retained.data.geometryUploadRanges).toEqual([
      { attribute: 'positions', offset: 0, size: 24 },
      { attribute: 'positions', offset: 48, size: 12 },
      { attribute: 'normals', offset: 0, size: 12 },
      { attribute: 'colors', offset: 0, size: 16 }
    ]);
    expect(previous.data.geometryUploadRanges).toEqual([
      { attribute: 'positions', offset: 0, size: 12 },
      { attribute: 'normals', offset: 0, size: 12 }
    ]);
    expect(current.data.geometryUploadRanges).toHaveLength(3);
    expect(retained.data.positions).toBe(current.data.positions);
  });

  it('discards previous ranges when topology changes', () => {
    const previous = createItem([{ attribute: 'positions', offset: 0, size: 12 }]);
    const current = { ...previous, data: { ...previous.data, topologyVersion: 4, geometryUploadRanges: [] } };
    expect(retainGeometryUploadRanges(current, previous)).toBe(current);
    expect(current.data.geometryUploadRanges).toEqual([]);
  });

  it('drops obsolete ranges after a gap and retains unchanged attributes when current history is missing', () => {
    const previous = createItem([
      { attribute: 'positions', offset: 0, size: 12 },
      { attribute: 'colors', offset: 0, size: 16 }
    ]);
    const current = {
      ...previous,
      data: {
        ...previous.data,
        geometryVersions: { ...previous.data.geometryVersions, positions: 4 },
        geometryUploadBaseVersions: { positions: 3 },
        geometryUploadRanges: [{ attribute: 'positions' as const, offset: 24, size: 12 }]
      }
    };
    expect(retainGeometryUploadRanges(current, previous).data.geometryUploadRanges).toEqual([
      { attribute: 'positions', offset: 24, size: 12 },
      { attribute: 'colors', offset: 0, size: 16 }
    ]);
    const missing = { ...current, data: { ...current.data, geometryUploadBaseVersions: {} } };
    const result = retainGeometryUploadRanges(missing, previous).data;
    expect(result.geometryUploadBaseVersions).toEqual({ colors: 0 });
    expect(result.geometryUploadRanges).toEqual([{ attribute: 'colors', offset: 0, size: 16 }]);
  });

  it('returns the current item when there is no previous preparation', () => {
    const current = createItem([{ attribute: 'positions', offset: 0, size: 12 }]);
    expect(retainGeometryUploadRanges(current)).toBe(current);
  });
});

function createItem(geometryUploadRanges: readonly MeshGeometryUploadRange[]): MeshRenderItem {
  const geometryVersions = createMeshGeometryAttributeVersions();
  const geometryUploadBaseVersions: Partial<typeof geometryVersions> = {};
  for (const range of geometryUploadRanges) {
    geometryVersions[range.attribute] = 1;
    geometryUploadBaseVersions[range.attribute] = 0;
  }
  return {
    data: createConstructedMeshRenderData({
      color: [1, 1, 1, 1],
      colors: null,
      geometryError: false,
      geometryUploadRanges,
      geometryVersions,
      geometryUploadBaseVersions,
      identityInstance: true,
      indices: null,
      normals: null,
      positions: new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]),
      texture: null,
      topologyVersion: 3,
      uvs: null,
      version: 1
    }),
    frameMatrix: new Float64Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]),
    instances: undefined,
    interactive: false,
    layer: document.createElement('div'),
    type: 'mesh'
  };
}
