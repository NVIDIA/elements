// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { TRI_VERTEX } from '../layouts/built-ins.js';
import { readTriVertex } from '../layouts/helpers.js';
import { TriangleVertexBuffer } from './buffer.js';

describe('triangle vertex buffer', () => {
  it('should initialize added vertices with default position and color', () => {
    const vertices = new TriangleVertexBuffer({ capacity: 1 });
    const vertex = vertices.add();

    expect(vertex.position.toArray()).toEqual([0, 0, 0]);
    expect(vertex.color).toEqual([1, 1, 1, 1]);
    expect(readTriVertex(vertices.bytes, 0)).toEqual({ color: [1, 1, 1, 1], position: [0, 0, 0] });
  });

  it('should write vertices using the canonical layout', () => {
    const vertices = new TriangleVertexBuffer({ capacity: 3 });

    vertices
      .set(0, { color: 'red', position: [0, 0, 0] })
      .set(1, { color: 'green', position: [1, 0, 0] })
      .set(2, { color: 'blue', position: [0, 1, 0] });

    expect(vertices.bytes).toHaveLength(3 * TRI_VERTEX.stride);
    const vertex = vertices.at(1);
    expect(vertex).toBe(vertices.at(1));
    const initialVersion = vertices.version;
    vertex.position.x = 2;
    vertex.color = 'cyan';
    expect(vertices.version).toBe(initialVersion);
    vertices.commit(1, 1);
    expect(vertices.version).toBe(initialVersion + 1);
    expect(readTriVertex(vertices.bytes, 2)).toEqual({ color: [0, 0, 1, 1], position: [0, 1, 0] });
  });

  it('should reject gaps between written vertices', () => {
    const vertices = new TriangleVertexBuffer({ capacity: 2 });

    expect(() => vertices.set(1, {})).toThrow(RangeError);
  });
});
