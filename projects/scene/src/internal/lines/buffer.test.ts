// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { LINE_VERTEX } from '../layouts/built-ins.js';
import { readLineVertex } from '../layouts/helpers.js';
import { LineVertexBuffer } from './buffer.js';

describe('line vertex buffer', () => {
  it('should expose defaults and atomically validate styles', () => {
    const vertices = new LineVertexBuffer({ capacity: 2 });
    const vertex = vertices.add({ color: 'rgba(0, 160, 255, 0.22)', position: [1, 2, 3] });

    expect(vertices.bytes).toHaveLength(2 * LINE_VERTEX.stride);
    expect(vertex.normal.toArray()).toEqual([0, 0, 1]);
    expect(vertex.width).toBeCloseTo(0.1);
    expect(vertex.dash).toBe(0);
    expect(vertex.gap).toBe(0);

    const initialVersion = vertices.version;
    vertex.setStyle({ dash: 2, gap: 1, normal: [0, 1, 0], width: 0.5 });
    expect(vertices.version).toBe(initialVersion);
    expect(readLineVertex(vertices.bytes, 0)).toMatchObject({
      color: [0, 159 / 255, 1, 56 / 255],
      dash: 2,
      gap: 1,
      normal: [0, 1, 0],
      position: [1, 2, 3],
      width: 0.5
    });

    vertex.width = 0.75;
    vertex.normal.set(1, 0, 0);
    expect(vertices.version).toBe(initialVersion);
    vertices.commit(0, 1);
    expect(vertices.version).toBe(initialVersion + 1);

    const validVersion = vertices.version;
    expect(() => vertex.setStyle({ dash: 0 })).toThrow(RangeError);
    expect(vertices.version).toBe(validVersion);
    expect(vertex.dash).toBe(2);
    expect(vertex.gap).toBe(1);
    expect(() => vertex.normal.set(0, 0, 0)).toThrow(RangeError);
    expect(vertices.version).toBe(validVersion);
  });

  it('should support direct color, dash, and gap accessors', () => {
    const vertices = new LineVertexBuffer({ capacity: 1 });
    const vertex = vertices.add();

    vertex.color = 'rgba(0, 160, 255, 0.22)';
    vertex.dash = 2;
    vertex.gap = 1;

    expect(vertex.color).toEqual([0, 159 / 255, 1, 56 / 255]);
    expect(vertex.dash).toBe(2);
    expect(vertex.gap).toBe(1);
    expect(readLineVertex(vertices.bytes, 0)).toMatchObject({
      color: [0, 159 / 255, 1, 56 / 255],
      dash: 2,
      gap: 1
    });

    expect(() => {
      vertex.dash = -1;
    }).toThrow(RangeError);
    expect(() => {
      vertex.gap = -1;
    }).toThrow(RangeError);
    expect(() => {
      vertex.dash = 0;
    }).toThrow(RangeError);
  });
});
