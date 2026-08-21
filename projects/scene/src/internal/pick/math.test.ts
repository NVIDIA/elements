// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { identityMat4 } from '../../internal/math/mat4.js';
import {
  createPickHit,
  createPickHitFromId,
  mapClientToDevicePixel,
  reconstructWorldPosition,
  type ClientToDevicePixelOptions
} from './math.js';

const viewport: ClientToDevicePixelOptions = {
  clientX: 50,
  clientY: 25,
  left: 10,
  top: 5,
  width: 100,
  height: 50,
  deviceWidth: 200,
  deviceHeight: 100
};

describe('pick math', () => {
  it('maps CSS client coordinates to device pixels and reports outside points', () => {
    expect(mapClientToDevicePixel(viewport)).toEqual({ outside: false, x: 80, y: 40 });
    expect(mapClientToDevicePixel({ ...viewport, clientX: 10 })).toEqual({ outside: false, x: 0, y: 40 });
    expect(mapClientToDevicePixel({ ...viewport, clientX: 110 })).toEqual({ outside: true });
    expect(mapClientToDevicePixel({ ...viewport, clientY: 4.99 })).toEqual({ outside: true });
  });

  it('validates finite coordinates and positive CSS/device dimensions', () => {
    expect(() => mapClientToDevicePixel({ ...viewport, clientX: Number.NaN })).toThrow(RangeError);
    expect(() => mapClientToDevicePixel({ ...viewport, left: Number.POSITIVE_INFINITY })).toThrow(RangeError);
    expect(() => mapClientToDevicePixel({ ...viewport, top: Number.NaN })).toThrow(RangeError);
    expect(() => mapClientToDevicePixel({ ...viewport, width: 0 })).toThrow(RangeError);
    expect(() => mapClientToDevicePixel({ ...viewport, height: -1 })).toThrow(RangeError);
    expect(() => mapClientToDevicePixel({ ...viewport, deviceWidth: 2.5 })).toThrow(RangeError);
    expect(() => mapClientToDevicePixel({ ...viewport, deviceHeight: 0 })).toThrow(RangeError);
    expect(() => mapClientToDevicePixel({ ...viewport, clientY: Number.POSITIVE_INFINITY })).toThrow(RangeError);
  });

  it('reconstructs a depth sample through the inverse view-projection', () => {
    const world = reconstructWorldPosition({
      ...viewport,
      clientX: 60,
      clientY: 30,
      depth: 0.25,
      inverseViewProjection: identityMat4(),
      pixelCenter: false
    });
    expect(world).toEqual([0, 0, 0.25]);
    expect(
      reconstructWorldPosition({ ...viewport, clientX: 9, depth: 0, inverseViewProjection: identityMat4() })
    ).toBeNull();
    expect(() => reconstructWorldPosition({ ...viewport, depth: 1.1, inverseViewProjection: identityMat4() })).toThrow(
      RangeError
    );
    expect(() => reconstructWorldPosition({ ...viewport, depth: -0.1, inverseViewProjection: identityMat4() })).toThrow(
      RangeError
    );
    expect(() =>
      reconstructWorldPosition({ ...viewport, depth: Number.NaN, inverseViewProjection: identityMat4() })
    ).toThrow(RangeError);
    expect(() =>
      reconstructWorldPosition({ ...viewport, depth: 0, inverseViewProjection: new Float32Array(15) })
    ).toThrow(RangeError);
    const zeroW = identityMat4();
    zeroW[15] = 0;
    expect(() => reconstructWorldPosition({ ...viewport, depth: 0, inverseViewProjection: zeroW })).toThrow(RangeError);
  });

  it('creates a fresh deeply immutable hit and maps ID zero to a miss', () => {
    const layer = document.createElement('div');
    const marker = document.createElement('span');
    const table = new Map([[7, { layer, marker, instanceIndex: 3 }]]);
    const first = createPickHit({ layer, marker, instanceIndex: 3 }, [1, 2, 3]);
    const second = createPickHitFromId(7, table, [1, 2, 3]);

    expect(second).not.toBe(first);
    expect(second).toMatchObject({ element: marker, layer, instanceIndex: 3, worldPosition: [1, 2, 3] });
    expect(Object.isFrozen(second)).toBe(true);
    expect(Object.isFrozen(second?.worldPosition)).toBe(true);
    expect(createPickHitFromId(0, table, [1, 2, 3])).toBeNull();
    expect(createPickHitFromId(8, table, [1, 2, 3])).toBeNull();
    expect(() => createPickHitFromId(-1, table, [1, 2, 3])).toThrow(RangeError);
    expect(() => createPickHitFromId(1.2, table, [1, 2, 3])).toThrow(RangeError);
    expect(() => createPickHit({ layer, instanceIndex: -1 }, [1, 2, 3])).toThrow(RangeError);
    expect(() => createPickHit({ layer: {} as HTMLElement, instanceIndex: 0 }, [1, 2, 3])).toThrow(TypeError);
    expect(() => createPickHit({ layer, marker: {} as HTMLElement, instanceIndex: 0 }, [1, 2, 3])).toThrow(TypeError);
    expect(() => createPickHit({ layer, instanceIndex: 0 }, [1, Number.NaN, 3])).toThrow(RangeError);
  });
});
