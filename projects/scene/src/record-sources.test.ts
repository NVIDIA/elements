// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { LABEL, LINE_VERTEX, MARKER, POINT, TRIANGLE_VERTEX } from './internal/layouts/built-ins.js';
import { writeLineVertex, writeMarker, writePoint, writeTriangleVertex } from './internal/layouts/helpers.js';
import {
  createLineVertexSource,
  createLabelSource,
  createMarkerSource,
  createPointSource,
  createTriangleVertexSource
} from './record-sources.js';

describe('external packed record sources', () => {
  it('borrows declared view bounds with an explicit kind and active count', () => {
    const allocation = new Uint8Array(POINT.stride * 3 + 7);
    const bytes = allocation.subarray(7, 7 + POINT.stride * 3);
    writePoint(bytes, 0, { position: [1, 2, 3] });
    const source = createPointSource({ bytes, count: 1 });

    expect(source).toMatchObject({ bytes, capacity: 3, count: 1, kind: 'point' });
    expect(source.bytes.buffer).toBe(allocation.buffer);
    expect(Object.isFrozen(source)).toBe(true);
  });

  it('creates each canonical source kind and rejects invalid descriptors', () => {
    const markerBytes = new Uint8Array(MARKER.stride);
    const labelBytes = new Uint8Array(LABEL.stride);
    const pointBytes = new Uint8Array(POINT.stride);
    const lineBytes = new Uint8Array(LINE_VERTEX.stride);
    const triangleBytes = new Uint8Array(TRIANGLE_VERTEX.stride * 3);
    writeMarker(markerBytes, 0, { position: [0, 0, 0] });
    new DataView(labelBytes.buffer).setFloat32(12, 16, true);
    writePoint(pointBytes, 0, { position: [0, 0, 0] });
    writeLineVertex(lineBytes, 0, { position: [0, 0, 0] });
    writeTriangleVertex(triangleBytes, 0, { position: [0, 0, 0] });
    writeTriangleVertex(triangleBytes, 1, { position: [1, 0, 0] });
    writeTriangleVertex(triangleBytes, 2, { position: [0, 1, 0] });

    expect(createMarkerSource({ bytes: markerBytes, count: 1 }).kind).toBe('marker');
    expect(createLabelSource({ bytes: labelBytes, count: 1, texts: ['label'] })).toMatchObject({
      capacity: 1,
      count: 1,
      kind: 'label',
      texts: ['label']
    });
    expect(createPointSource({ bytes: pointBytes, count: 1 }).kind).toBe('point');
    expect(createLineVertexSource({ bytes: lineBytes, count: 1 }).kind).toBe('line-vertex');
    expect(createTriangleVertexSource({ bytes: triangleBytes, count: 3 }).kind).toBe('triangle-vertex');

    expect(() => createPointSource({ bytes: new Uint8Array(POINT.stride - 1), count: 0 })).toThrow(RangeError);
    expect(() => createPointSource({ bytes: pointBytes, count: 2 })).toThrow(RangeError);
    expect(() => createLabelSource({ bytes: labelBytes, count: 1, texts: [] })).toThrow(RangeError);
    expect(() => Reflect.apply(createLabelSource, null, [{ bytes: labelBytes, count: 1, texts: null }])).toThrow(
      RangeError
    );
    expect(() => Reflect.apply(createLabelSource, null, [{ bytes: labelBytes, count: 1, texts: [1] }])).toThrow(
      RangeError
    );
    new DataView(labelBytes.buffer).setFloat32(12, 0, true);
    expect(() => createLabelSource({ bytes: labelBytes, count: 1, texts: ['invalid'] })).toThrow(RangeError);
    new DataView(pointBytes.buffer).setFloat32(0, Number.NaN, true);
    expect(() => createPointSource({ bytes: pointBytes, count: 1 })).toThrow(RangeError);
    expect(() => createMarkerSource({ bytes: new Uint8Array(MARKER.stride), count: 1 })).toThrow(RangeError);
  });

  it('rejects unreadable and incorrectly typed source descriptors', () => {
    expect(() => Reflect.apply(createPointSource, null, [null])).toThrow(TypeError);
    expect(() => Reflect.apply(createPointSource, null, [{ bytes: [], count: 0 }])).toThrow(TypeError);
    expect(() => Reflect.apply(createPointSource, null, [{ bytes: new Uint8Array(), count: '0' }])).toThrow(TypeError);
    expect(() =>
      Reflect.apply(createPointSource, null, [
        {
          get bytes() {
            throw new Error('unreadable');
          }
        }
      ])
    ).toThrowError(new TypeError('Packed source options must be readable.'));
    expect(() =>
      Reflect.apply(createPointSource, null, [
        {
          get bytes() {
            throw new TypeError('denied');
          }
        }
      ])
    ).toThrowError(new TypeError('denied'));
  });

  it.runIf(typeof SharedArrayBuffer !== 'undefined')('rejects shared producer memory', () => {
    const bytes = new Uint8Array(new SharedArrayBuffer(POINT.stride));
    expect(() => createPointSource({ bytes, count: 0 })).toThrow(TypeError);
  });

  it('rejects producer storage detached before source creation', () => {
    const bytes = new Uint8Array(POINT.stride);
    structuredClone(bytes.buffer, { transfer: [bytes.buffer] });

    expect(() => createPointSource({ bytes, count: 0 })).toThrow(TypeError);
  });
});
