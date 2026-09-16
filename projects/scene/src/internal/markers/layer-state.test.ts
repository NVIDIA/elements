// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { PointBuffer } from '../points/buffer.js';
import { MarkerBuffer } from './buffer.js';
import {
  getLayerCount,
  publishLayerInstances,
  registerMarkerLayer,
  setLayerCount,
  setLayerInstances,
  takeMarkerLayerRenderData
} from './layer-state.js';

describe('marker layer state', () => {
  it('validates registration, source kind, and count limits', () => {
    const unregistered = document.createElement('div');
    expect(() => getLayerCount(unregistered)).toThrow(TypeError);

    const layer = document.createElement('nve-scene-cubes');
    registerMarkerLayer(layer, 'cube');
    expect(() => setLayerInstances(layer, new PointBuffer({ capacity: 1 }) as never)).toThrow(TypeError);
    expect(() => setLayerCount(layer, -1)).toThrow(RangeError);

    const instances = takeMarkerLayerRenderData(layer);
    expect(instances.ready).toBe(false);

    const large = new MarkerBuffer({ capacity: 2 });
    large.add();
    large.add();
    setLayerInstances(layer, large);
    setLayerCount(layer, 2);
    setLayerCount(layer, 2);
    expect(getLayerCount(layer)).toBe(2);

    setLayerInstances(layer, new MarkerBuffer({ records: [{}] }));
    expect(getLayerCount(layer)).toBeUndefined();
  });

  it('handles empty, unchanged, changed, and invalid publications atomically', () => {
    const layer = document.createElement('nve-scene-cubes');
    registerMarkerLayer(layer, 'cube');
    expect(() => publishLayerInstances(layer)).not.toThrow();

    const source = new MarkerBuffer({ records: [{}] });
    setLayerInstances(layer, source);
    expect(() => setLayerCount(layer, 2)).toThrow(RangeError);
    publishLayerInstances(layer);
    expect(takeMarkerLayerRenderData(layer).ready).toBe(true);

    source.mutableBytes.fill(0, 12, 28);
    publishLayerInstances(layer);
    expect(takeMarkerLayerRenderData(layer)).toMatchObject({ count: 0, ready: false });
  });
});
