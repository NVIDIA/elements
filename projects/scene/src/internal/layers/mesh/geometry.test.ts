// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { MeshGeometryValidationError, validateMeshGeometry } from './geometry.js';

const empty = { positions: null, normals: null, uvs: null, colors: null, indices: null } as const;
const positions = new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]);

describe('mesh geometry validation', () => {
  it('accepts the empty input and complete planar triangle', () => {
    expect(() => validateMeshGeometry(empty)).not.toThrow();
    expect(() => validateMeshGeometry({ ...empty, positions })).not.toThrow();
    expect(() =>
      validateMeshGeometry({
        ...empty,
        colors: new Float32Array([0, 1, 0.5, 1, 1, 0, 0.5, 0, 0, 1, 0.5, 1]),
        indices: new Uint32Array([0, 1, 2]),
        positions
      })
    ).not.toThrow();
  });

  it.each([
    ['missing positions', { ...empty, indices: new Uint32Array([0, 1, 2]) }],
    ['empty positions', { ...empty, positions: new Float32Array() }],
    ['nonfinite positions', { ...empty, positions: new Float32Array([0, 0, Number.NaN]) }],
    ['bad normals count', { ...empty, positions, normals: new Float32Array(2) }],
    ['bad uv count', { ...empty, positions, uvs: new Float32Array(2) }],
    [
      'nonfinite color',
      {
        ...empty,
        positions,
        colors: new Float32Array([Number.NaN, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1])
      }
    ],
    ['bad color range', { ...empty, positions, colors: new Float32Array([2, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1]) }],
    ['bad index count', { ...empty, positions, indices: new Uint32Array([0, 1]) }],
    ['out of range index', { ...empty, positions, indices: new Uint32Array([0, 1, 3]) }]
  ])('rejects %s', (_name, input) => {
    expect(() => validateMeshGeometry(input)).toThrow(MeshGeometryValidationError);
  });

  it('rejects wrong typed arrays', () => {
    expect(() => validateMeshGeometry({ ...empty, positions: new Float64Array(9) as unknown as Float32Array })).toThrow(
      TypeError
    );
    expect(() =>
      validateMeshGeometry({ ...empty, positions, indices: new Uint16Array([0, 1, 2]) as unknown as Uint32Array })
    ).toThrow(TypeError);
  });
});
