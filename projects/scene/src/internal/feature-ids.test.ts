// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, describe, expect, it, vi } from 'vitest';
import { FEATURE_ID_MAP_INVALID } from '../errors.js';
import {
  getSceneFeatureId,
  getSceneFeatureIds,
  publishSceneFeatureIds,
  registerSceneFeatureIdSource,
  resolveSceneFeatureId,
  setSceneFeatureId,
  setSceneFeatureIds,
  takeSceneFeatureIdListSnapshot,
  takeSceneFeatureIdSnapshot,
  type SceneFeatureIds
} from './feature-ids.js';

describe('scene feature IDs', () => {
  afterEach(() => vi.restoreAllMocks());

  it('defaults to null and publishes scalar IDs including zero and uint32 max', () => {
    const source = createSource(10);
    expect(getSceneFeatureIds(source)).toBeNull();
    expect(takeSceneFeatureIdSnapshot(source, 10)).toBeUndefined();

    setSceneFeatureIds(source, 0);
    expect(getSceneFeatureIds(source)).toBe(0);
    expect(takeSceneFeatureIdSnapshot(source, 10)).toBeUndefined();
    publishSceneFeatureIds(source);
    const zero = takeSceneFeatureIdSnapshot(source, 10);
    expect(resolveSceneFeatureId(zero, 0)).toBe(0);
    expect(resolveSceneFeatureId(zero, 9)).toBe(0);

    setSceneFeatureIds(source, 0xffffffff);
    publishSceneFeatureIds(source);
    expect(resolveSceneFeatureId(takeSceneFeatureIdSnapshot(source, 10), 4)).toBe(0xffffffff);
  });

  it('captures producer arrays and keeps published generations immutable', () => {
    const source = createSource(2);
    const ids = new Uint32Array([10, 20]);
    setSceneFeatureIds(source, ids);
    publishSceneFeatureIds(source);
    const first = takeSceneFeatureIdSnapshot(source, 2);
    expect(takeSceneFeatureIdSnapshot(source, 2)).toBe(first);
    ids[0] = 30;

    expect(getSceneFeatureIds(source)).toEqual(new Uint32Array([10, 20]));
    expect(resolveSceneFeatureId(first, 0)).toBe(10);

    setSceneFeatureIds(source, ids);
    expect(resolveSceneFeatureId(takeSceneFeatureIdSnapshot(source, 2), 0)).toBe(10);
    publishSceneFeatureIds(source);
    expect(resolveSceneFeatureId(takeSceneFeatureIdSnapshot(source, 2), 0)).toBe(30);
    expect(resolveSceneFeatureId(first, 0)).toBe(10);
  });

  it('resolves offset, stride, repeat, and LSB-first validity bits', () => {
    const source = createSource(5);
    setSceneFeatureIds(source, {
      values: new Uint32Array([99, 1842, 99, 0, 99, 0xffffffff]),
      offset: 1,
      stride: 2,
      repeat: 2,
      validity: new Uint8Array([0b0010_1011])
    });
    publishSceneFeatureIds(source);
    const snapshot = takeSceneFeatureIdSnapshot(source, 5);

    expect(getSceneFeatureIds(source)).toEqual({
      values: new Uint32Array([99, 1842, 99, 0, 99, 0xffffffff]),
      offset: 1,
      stride: 2,
      repeat: 2,
      validity: new Uint8Array([0b0010_1011])
    });

    expect([0, 1, 2, 3, 4].map(index => resolveSceneFeatureId(snapshot, index))).toEqual([
      1842, 1842, 0, 0, 0xffffffff
    ]);
  });

  it('materializes bulk mappings for record edits and clears omitted identities', () => {
    const source = createSource(3);
    setSceneFeatureIds(source, 7);
    setSceneFeatureId(source, 1, 0xffffffff);
    setSceneFeatureId(source, 2, undefined);

    expect(getSceneFeatureId(source, 0)).toBe(7);
    expect(getSceneFeatureId(source, 1)).toBe(0xffffffff);
    expect(getSceneFeatureId(source, 2)).toBeUndefined();
    publishSceneFeatureIds(source);
    const snapshot = takeSceneFeatureIdSnapshot(source, 3);
    expect([0, 1, 2].map(index => resolveSceneFeatureId(snapshot, index))).toEqual([7, 0xffffffff, undefined]);
  });

  it('preserves missing, zero, and uint32-max identities in declarative lists', () => {
    const sources = [createSource(1), createSource(1), createSource(1)];
    setSceneFeatureId(sources[1]!, 0, 0);
    setSceneFeatureId(sources[2]!, 0, 0xffffffff);
    sources.forEach(publishSceneFeatureIds);

    const snapshot = takeSceneFeatureIdListSnapshot(sources);
    expect(takeSceneFeatureIdListSnapshot(sources)).toBe(snapshot);
    expect([0, 1, 2].map(index => resolveSceneFeatureId(snapshot, index))).toEqual([undefined, 0, 0xffffffff]);

    setSceneFeatureId(sources[1]!, 0, 42);
    publishSceneFeatureIds(sources[1]!);
    expect(takeSceneFeatureIdListSnapshot(sources)).not.toBe(snapshot);
  });

  it('treats unregistered objects as unidentified and rejects invalid capacities', () => {
    expect(resolveSceneFeatureId(takeSceneFeatureIdListSnapshot([{}]), 0)).toBeUndefined();
    expect(() => registerSceneFeatureIdSource({}, -1)).toThrow(RangeError);
    expect(() => registerSceneFeatureIdSource({}, 0.5)).toThrow(RangeError);
  });

  it('rejects malformed sources without replacing the accepted generation', () => {
    const source = createSource(1);
    const accepted = new Uint32Array([7]);
    setSceneFeatureIds(source, accepted);

    for (const invalid of [Number.NaN, -1, 0x1_0000_0000, 1.5, '7', undefined] as unknown[]) {
      expect(() => setSceneFeatureIds(source, invalid as SceneFeatureIds)).toThrow();
    }
    expect(() => setSceneFeatureIds(source, { values: [] } as unknown as SceneFeatureIds)).toThrow(TypeError);
    expect(() => setSceneFeatureIds(source, { values: accepted, offset: -1 })).toThrow(RangeError);
    expect(() => setSceneFeatureIds(source, { values: accepted, stride: 0 })).toThrow(RangeError);
    expect(() => setSceneFeatureIds(source, { values: accepted, repeat: 0 })).toThrow(RangeError);
    expect(() => setSceneFeatureIds(source, { values: accepted, validity: [] } as unknown as SceneFeatureIds)).toThrow(
      TypeError
    );
    expect(() => setSceneFeatureIds(source, { values: accepted, validity: new Uint8Array() })).toThrow(RangeError);
    expect(getSceneFeatureIds(source)).toEqual(accepted);
  });

  it('rejects detached typed arrays', () => {
    const source = createSource(1);
    const values = new Uint32Array([1]);
    structuredClone(values.buffer, { transfer: [values.buffer] });

    expect(() => setSceneFeatureIds(source, values)).toThrow(TypeError);
  });

  it('reports one warning per insufficient-coverage episode and keeps covered targets usable', () => {
    const element = document.createElement('div');
    registerSceneFeatureIdSource(element, 3);
    const warnings: string[] = [];
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    element.addEventListener('nve-scene-error', event => {
      warnings.push((event as CustomEvent<{ readonly code: string }>).detail.code);
    });
    setSceneFeatureIds(element, new Uint32Array([11, 12]));
    publishSceneFeatureIds(element);

    const short = takeSceneFeatureIdSnapshot(element, 3, element);
    takeSceneFeatureIdSnapshot(element, 4, element);
    expect(resolveSceneFeatureId(short, 0)).toBe(11);
    expect(resolveSceneFeatureId(short, 2)).toBeUndefined();
    expect(warnings).toEqual([FEATURE_ID_MAP_INVALID]);
    expect(warning).toHaveBeenCalledOnce();

    takeSceneFeatureIdSnapshot(element, 2, element);
    takeSceneFeatureIdSnapshot(element, 3, element);
    expect(warnings).toEqual([FEATURE_ID_MAP_INVALID, FEATURE_ID_MAP_INVALID]);
    expect(warning).toHaveBeenCalledTimes(2);
  });

  it('clears feature identity without changing an in-flight snapshot', () => {
    const source = createSource(1);
    setSceneFeatureIds(source, 42);
    publishSceneFeatureIds(source);
    const inFlight = takeSceneFeatureIdSnapshot(source, 1);
    setSceneFeatureIds(source, null);
    publishSceneFeatureIds(source);

    expect(getSceneFeatureIds(source)).toBeNull();
    expect(takeSceneFeatureIdSnapshot(source, 1)).toBeUndefined();
    expect(resolveSceneFeatureId(inFlight, 0)).toBe(42);
  });
});

function createSource(capacity: number): object {
  const source = {};
  registerSceneFeatureIdSource(source, capacity);
  return source;
}
