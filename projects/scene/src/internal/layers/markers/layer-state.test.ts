// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { PointBuffer } from '../points/buffer.js';
import { MarkerBuffer } from './buffer.js';
import { readMarker } from '../../records/layouts/codecs.js';
import {
  getLayerCount,
  publishLayerInstances,
  registerMarkerLayer,
  setLayerCount,
  setLayerInstances,
  takeMarkerLayerRenderData
} from './layer-state.js';

describe('marker layer state', () => {
  it('keeps shared source captures isolated through empty publications and regrowth', () => {
    const first = document.createElement('div');
    const second = document.createElement('div');
    registerMarkerLayer(first, 'cube');
    registerMarkerLayer(second, 'cube');
    const source = new MarkerBuffer({ capacity: 2 });
    setLayerInstances(first, source);
    setLayerInstances(second, source);
    expect(takeMarkerLayerRenderData(first)).toMatchObject({ count: 0, ready: true });
    expect(takeMarkerLayerRenderData(second)).toMatchObject({ count: 0, ready: true });

    const record = source.add({ position: [1, 0, 0] });
    publishLayerInstances(first);
    expect(takeMarkerLayerRenderData(first).count).toBe(1);
    expect(takeMarkerLayerRenderData(second).count).toBe(0);
    source.setCount(0);
    publishLayerInstances(first, { count: 0 });
    record.position.x = 2;
    expect(takeMarkerLayerRenderData(first)).toMatchObject({ count: 0, ready: true, uploadRanges: [] });

    source.setCount(1);
    publishLayerInstances(second, { count: 0, start: 1 });
    const regrown = takeMarkerLayerRenderData(second);
    expect(regrown).toMatchObject({ count: 1, ready: true });
    if (!regrown.bytes) throw new Error('Expected a published marker snapshot.');
    expect(readMarker(regrown.bytes, 0).position).toEqual([2, 0, 0]);
    expect(takeMarkerLayerRenderData(first).count).toBe(0);
    expect(() => publishLayerInstances(first, { count: -1 })).toThrow(RangeError);
    expect(takeMarkerLayerRenderData(first)).toMatchObject({ count: 0, ready: true });
  });

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
