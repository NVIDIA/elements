// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { LINE_VERTEX } from '../../records/layouts/built-ins.js';
import { writeLineVertex } from '../../records/layouts/codecs.js';
import { createLineVertexSource } from './external-record-sources.js';

describe('external line vertex sources', () => {
  it('borrows declared view bounds with an explicit kind and active count', () => {
    const allocation = new Uint8Array(LINE_VERTEX.stride * 3 + 7);
    const bytes = allocation.subarray(7);
    writeLineVertex(bytes, 0, { position: [1, 2, 3] });
    const featureIds = new Uint32Array([0, 0xffffffff, 1842]);
    const source = createLineVertexSource({ bytes, count: 1, featureIds });

    expect(source).toMatchObject({ bytes, capacity: 3, count: 1, kind: 'line-vertex' });
    expect(source.bytes.buffer).toBe(allocation.buffer);
    expect(source.featureIds).toEqual(featureIds);
    expect(Object.isFrozen(source)).toBe(true);
  });

  it('rejects invalid byte bounds, active counts, and records', () => {
    const bytes = new Uint8Array(LINE_VERTEX.stride);
    writeLineVertex(bytes, 0, { position: [0, 0, 0] });
    expect(() => createLineVertexSource({ bytes: new Uint8Array(LINE_VERTEX.stride - 1), count: 0 })).toThrow(
      RangeError
    );
    expect(() => createLineVertexSource({ bytes, count: 2 })).toThrow(RangeError);
    new DataView(bytes.buffer).setFloat32(0, Number.NaN, true);
    expect(() => createLineVertexSource({ bytes, count: 1 })).toThrow(RangeError);
  });

  it('rejects unreadable and incorrectly typed source descriptors', () => {
    expect(() => Reflect.apply(createLineVertexSource, null, [null])).toThrow(TypeError);
    expect(() => Reflect.apply(createLineVertexSource, null, [{ bytes: [], count: 0 }])).toThrow(TypeError);
    expect(() => Reflect.apply(createLineVertexSource, null, [{ bytes: new Uint8Array(), count: '0' }])).toThrow(
      TypeError
    );
    expect(() =>
      Reflect.apply(createLineVertexSource, null, [
        {
          get bytes() {
            throw new Error('unreadable');
          }
        }
      ])
    ).toThrowError(new TypeError('Packed source options must be readable.'));
    expect(() =>
      Reflect.apply(createLineVertexSource, null, [
        {
          get bytes() {
            throw new TypeError('denied');
          }
        }
      ])
    ).toThrowError(new TypeError('denied'));
  });

  it.runIf(typeof SharedArrayBuffer !== 'undefined')('rejects shared producer memory', () => {
    const bytes = new Uint8Array(new SharedArrayBuffer(LINE_VERTEX.stride));
    expect(() => createLineVertexSource({ bytes, count: 0 })).toThrow(TypeError);
  });

  it('rejects producer storage detached before source creation', () => {
    const bytes = new Uint8Array(LINE_VERTEX.stride);
    structuredClone(bytes.buffer, { transfer: [bytes.buffer] });
    expect(() => createLineVertexSource({ bytes, count: 0 })).toThrow(TypeError);
  });
});
