// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { identityMat4 } from '../../math/mat4.js';
import { mapClientToDevicePixel, reconstructWorldPosition } from './coordinates.js';

const viewport = {
  clientX: 50,
  clientY: 25,
  rect: { left: 10, top: 5, right: 110, bottom: 55, width: 100, height: 50 },
  size: { width: 200, height: 100 }
};

describe('pick math', () => {
  it('maps CSS client coordinates to device pixels and reports outside points', () => {
    expect(mapClientToDevicePixel(viewport)).toEqual({ x: 80, y: 40 });
    expect(mapClientToDevicePixel({ ...viewport, clientX: 10 })).toEqual({ x: 0, y: 40 });
    expect(mapClientToDevicePixel({ ...viewport, clientX: 109.9, clientY: 54.9 })).toEqual({ x: 199, y: 99 });
    expect(mapClientToDevicePixel({ ...viewport, clientX: 110 })).toBeUndefined();
    expect(mapClientToDevicePixel({ ...viewport, clientY: 55 })).toBeUndefined();
    expect(mapClientToDevicePixel({ ...viewport, clientY: 4.99 })).toBeUndefined();
    expect(mapClientToDevicePixel({ ...viewport, clientX: 9.99 })).toBeUndefined();
  });

  it('preserves routing behavior for empty canvases and nonfinite coordinates', () => {
    expect(mapClientToDevicePixel({ ...viewport, rect: { ...viewport.rect, width: 0 } })).toBeUndefined();
    expect(mapClientToDevicePixel({ ...viewport, rect: { ...viewport.rect, height: -1 } })).toBeUndefined();
    expect(mapClientToDevicePixel({ ...viewport, size: { width: 0, height: 0 } })).toEqual({ x: 0, y: 0 });
    expect(mapClientToDevicePixel({ ...viewport, clientX: Number.NaN })).toEqual({ x: Number.NaN, y: 40 });
    expect(mapClientToDevicePixel({ ...viewport, clientY: Number.POSITIVE_INFINITY })).toBeUndefined();
  });
});

describe(reconstructWorldPosition.name, () => {
  it('should divide by nonzero homogeneous w and retain double precision', () => {
    const matrix = new Float64Array(identityMat4());
    matrix[12] = 1 + 2 ** -40;
    matrix[15] = 2;
    expect(
      reconstructWorldPosition({
        depth: 1.5,
        inverseViewProjection: matrix,
        pixel: { x: 0, y: 0 },
        size: { height: 1, width: 1 }
      })
    ).toEqual([(1 + 2 ** -40) / 2, 0, 0.75]);
    matrix[15] = Number.EPSILON / 2;
    expect(
      reconstructWorldPosition({
        depth: -0.5,
        inverseViewProjection: matrix,
        pixel: { x: 0, y: 0 },
        size: { height: 1, width: 1 }
      })[2]
    ).toBe(-1 / Number.EPSILON);
    matrix[15] = 0;
    expect(
      reconstructWorldPosition({
        depth: 0.75,
        inverseViewProjection: matrix,
        pixel: { x: 0, y: 0 },
        size: { height: 1, width: 1 }
      })
    ).toEqual([1 + 2 ** -40, 0, 0.75]);
  });

  it('should convert a top-left texture pixel and WebGPU depth through inverse view projection', () => {
    expect(
      reconstructWorldPosition({
        depth: 0.75,
        inverseViewProjection: identityMat4(),
        pixel: { x: 0, y: 0 },
        size: { height: 2, width: 2 }
      })
    ).toEqual([-0.5, 0.5, 0.75]);
  });

  it('should preserve homogeneous coordinates whose w component is zero', () => {
    expect(
      reconstructWorldPosition({
        depth: 0.75,
        inverseViewProjection: new Float32Array(16),
        pixel: { x: 0, y: 0 },
        size: { height: 2, width: 2 }
      })
    ).toEqual([0, 0, 0]);
  });
});
