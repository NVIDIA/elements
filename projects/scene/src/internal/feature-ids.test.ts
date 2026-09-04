// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, describe, expect, it, vi } from 'vitest';
import { FEATURE_ID_MAP_INVALID } from '../errors.js';
import {
  getSceneFeatureIds,
  getSceneFeatureIdVersion,
  registerSceneFeatureIdLayer,
  resolveSceneFeatureId,
  setSceneFeatureIds,
  takeSceneFeatureIdSnapshot,
  type SceneFeatureIds
} from './feature-ids.js';

describe('scene feature IDs', () => {
  afterEach(() => vi.restoreAllMocks());

  it('defaults to null and resolves scalar IDs including zero', () => {
    const layer = createLayer();
    expect(getSceneFeatureIds(layer)).toBeNull();
    expect(getSceneFeatureIdVersion(layer)).toBe(0);
    expect(takeSceneFeatureIdSnapshot(layer, 10)).toBeUndefined();

    setSceneFeatureIds(layer, 0);
    const snapshot = takeSceneFeatureIdSnapshot(layer, 10);
    expect(resolveSceneFeatureId(snapshot, 0)).toBe(0);
    expect(resolveSceneFeatureId(snapshot, 9)).toBe(0);
    expect(getSceneFeatureIdVersion(layer)).toBe(1);
  });

  it('captures direct arrays and captures the same producer again after mutation', () => {
    const layer = createLayer();
    const ids = new Uint32Array([10, 20]);
    setSceneFeatureIds(layer, ids);
    const first = takeSceneFeatureIdSnapshot(layer, 2);
    ids[0] = 30;

    expect(getSceneFeatureIds(layer)).toBe(ids);
    expect(resolveSceneFeatureId(first, 0)).toBe(10);
    expect(resolveSceneFeatureId(takeSceneFeatureIdSnapshot(layer, 2), 0)).toBe(10);

    setSceneFeatureIds(layer, ids);
    expect(resolveSceneFeatureId(takeSceneFeatureIdSnapshot(layer, 2), 0)).toBe(30);
    expect(getSceneFeatureIdVersion(layer)).toBe(2);
  });

  it('resolves offset, stride, repeat, null sentinels, and repeated IDs', () => {
    const layer = createLayer();
    const source: SceneFeatureIds = {
      values: new Uint32Array([99, 1842, 99, 0, 99, 1842]),
      offset: 1,
      stride: 2,
      repeat: 2,
      nullFeatureId: 0
    };
    setSceneFeatureIds(layer, source);
    const snapshot = takeSceneFeatureIdSnapshot(layer, 5);

    expect([0, 1, 2, 3, 4].map(index => resolveSceneFeatureId(snapshot, index))).toEqual([
      1842,
      1842,
      undefined,
      undefined,
      1842
    ]);
  });

  it('rejects malformed sources without replacing the accepted generation', () => {
    const layer = createLayer();
    const accepted = new Uint32Array([7]);
    setSceneFeatureIds(layer, accepted);

    for (const invalid of [Number.NaN, -1, 0x1_0000_0000, 1.5, '7', undefined] as unknown[]) {
      expect(() => setSceneFeatureIds(layer, invalid as SceneFeatureIds)).toThrow();
    }
    expect(() => setSceneFeatureIds(layer, { values: [] } as unknown as SceneFeatureIds)).toThrow(TypeError);
    expect(() => setSceneFeatureIds(layer, { values: accepted, offset: -1 })).toThrow(RangeError);
    expect(() => setSceneFeatureIds(layer, { values: accepted, stride: 0 })).toThrow(RangeError);
    expect(() => setSceneFeatureIds(layer, { values: accepted, repeat: 0 })).toThrow(RangeError);
    expect(() => setSceneFeatureIds(layer, { values: accepted, nullFeatureId: -1 })).toThrow(RangeError);
    expect(getSceneFeatureIds(layer)).toBe(accepted);
    expect(getSceneFeatureIdVersion(layer)).toBe(1);
  });

  it('rejects detached typed arrays', () => {
    const layer = createLayer();
    const values = new Uint32Array([1]);
    structuredClone(values.buffer, { transfer: [values.buffer] });

    expect(() => setSceneFeatureIds(layer, values)).toThrow(TypeError);
  });

  it('reports one warning per insufficient-coverage episode and keeps covered targets usable', () => {
    const layer = createLayer();
    const warnings: string[] = [];
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    layer.addEventListener('nve-scene-error', event => {
      warnings.push((event as CustomEvent<{ readonly code: string }>).detail.code);
    });
    setSceneFeatureIds(layer, new Uint32Array([11, 12]));

    const short = takeSceneFeatureIdSnapshot(layer, 3);
    takeSceneFeatureIdSnapshot(layer, 4);
    expect(resolveSceneFeatureId(short, 0)).toBe(11);
    expect(resolveSceneFeatureId(short, 2)).toBeUndefined();
    expect(warnings).toEqual([FEATURE_ID_MAP_INVALID]);
    expect(warning).toHaveBeenCalledOnce();

    takeSceneFeatureIdSnapshot(layer, 2);
    takeSceneFeatureIdSnapshot(layer, 3);
    expect(warnings).toEqual([FEATURE_ID_MAP_INVALID, FEATURE_ID_MAP_INVALID]);
    expect(warning).toHaveBeenCalledTimes(2);
  });

  it('clears feature identity without retaining the previous snapshot', () => {
    const layer = createLayer();
    setSceneFeatureIds(layer, 42);
    setSceneFeatureIds(layer, null);

    expect(getSceneFeatureIds(layer)).toBeNull();
    expect(takeSceneFeatureIdSnapshot(layer, 1)).toBeUndefined();
    expect(getSceneFeatureIdVersion(layer)).toBe(2);
  });
});

function createLayer(): HTMLElement {
  const layer = document.createElement('div');
  registerSceneFeatureIdLayer(layer);
  return layer;
}
