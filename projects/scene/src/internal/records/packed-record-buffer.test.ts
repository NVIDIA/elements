// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it, vi } from 'vitest';
import { MarkerBuffer } from '../layers/markers/buffer.js';
import { getPackedRecordState } from './packed-record-source.js';
import {
  MutableVector3View,
  readPackedColor,
  resolveRecordBufferOptions,
  resolveSceneColor,
  writePackedColor
} from './packed-record-buffer.js';

describe('packed record buffer ownership', () => {
  it('keeps handles stable across active-prefix edits and invalidates caching when mutable bytes escape', () => {
    const buffer = new MarkerBuffer({ capacity: 2 });
    buffer.add();
    const handle = buffer.at(0);
    const version = buffer.version;
    expect(buffer.at(0)).toBe(handle);
    expect(getPackedRecordState(buffer)?.cacheable).toBe(true);
    handle.position.x = 2;
    expect(buffer.version).toBeGreaterThan(version);
    buffer.setCount(0);
    expect(() => buffer.at(0)).toThrow(RangeError);
    buffer.setCount(1);
    expect(buffer.at(0)).toBe(handle);
    expect(handle.position.x).toBe(2);
    buffer.mutableBytes[0] = 0;
    expect(getPackedRecordState(buffer)?.cacheable).toBe(false);
    expect(() => buffer.set(2, {})).toThrow(RangeError);
  });

  it('bounds inferred and explicit capacities without allocating them', () => {
    expect(resolveRecordBufferOptions({ records: [1, 2] }, 4)).toEqual({ capacity: 2, records: [1, 2] });
    for (const capacity of [-1, 0.5, Infinity, Number.MAX_SAFE_INTEGER]) {
      expect(() => resolveRecordBufferOptions({ capacity }, 48)).toThrow(RangeError);
    }
    expect(() => resolveRecordBufferOptions({ capacity: 1, records: [1, 2] }, 4)).toThrow(RangeError);
  });

  it('validates vectors before changing any component or notifying observers', () => {
    const view = new DataView(new ArrayBuffer(24));
    const notifyMutation = vi.fn();
    const vector = new MutableVector3View(view, 8, {
      notifyMutation,
      validate: value => {
        if (value[0] < 0) throw new RangeError('negative x');
      }
    });
    vector.set(1, 2, 3);
    expect(vector.toArray()).toEqual([1, 2, 3]);
    expect(view.getFloat32(8, true)).toBe(1);
    expect(() => vector.set(-1, 9, 9)).toThrow();
    expect(() => {
      vector.y = NaN;
    }).toThrow();
    expect(vector.toArray()).toEqual([1, 2, 3]);
    expect(notifyMutation).toHaveBeenCalledOnce();
  });

  it('packs CSS and numeric colors with bounded channels and rejects invalid input before writing', () => {
    const view = new DataView(new ArrayBuffer(8));
    writePackedColor(view, 4, [1, 0.5, 0, 1]);
    expect(readPackedColor(view, 4)).toEqual([1, 128 / 255, 0, 1]);
    expect(resolveSceneColor('#ff000080')).toEqual([1, 0, 0, 128 / 255]);
    expect(() => writePackedColor(view, 4, [2, 0, 0, 1])).toThrow();
    expect(readPackedColor(view, 4)).toEqual([1, 128 / 255, 0, 1]);
    expect(() => resolveSceneColor('invalid')).toThrow();
  });
});
