// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { decodeStl } from '../layers/model/stl.js';
import { prepareMeshGeometry, processMeshGeometry } from '../layers/mesh/processing.js';

const MAX_FLOAT32 = 3.4028234663852886e38;

describe('flat triangle normals', () => {
  it.each([
    {
      name: 'slanted',
      positions: [0, 0, 0, 1, 0, 1, 0, 1, 2],
      normal: [-0.40824830532073975, -0.8164966106414795, 0.40824830532073975]
    },
    {
      name: 'reversed',
      positions: [0, 0, 0, 0, 1, 2, 1, 0, 1],
      normal: [0.40824830532073975, 0.8164966106414795, -0.40824830532073975]
    },
    {
      name: 'extreme',
      positions: [-MAX_FLOAT32, 0, 0, MAX_FLOAT32, 0, MAX_FLOAT32, 0, MAX_FLOAT32, 0],
      normal: [-0.40824830532073975, 0.40824830532073975, 0.8164966106414795]
    },
    { name: 'degenerate', positions: [0, 0, 0, 1, 0, 0, 1, 0, -0], normal: [0, 0, 1], meshNormal: [-0, 0, 1] }
  ])('preserves STL and synchronous/asynchronous mesh output for $name triangles', async test => {
    // Two records exercise nonzero output offsets as well as the normal arithmetic.
    const positions = new Float32Array([...test.positions, ...test.positions]);
    const normal = new Float32Array([...test.normal, ...test.normal, ...test.normal]);
    const meshNormal = test.meshNormal ?? test.normal;
    const expectedMesh = new Float32Array([...meshNormal, ...meshNormal, ...meshNormal]);
    const input = { positions, colors: null, indices: null, normals: null, uvs: null };
    const synchronous = processMeshGeometry(input)!;
    const asynchronous = await prepareMeshGeometry(input, { isCurrent: () => true, yield: async () => undefined });
    expect(synchronous.normals).toEqual(new Float32Array([...expectedMesh, ...expectedMesh]));
    expect(Object.is(synchronous.normals[0], meshNormal[0])).toBe(true);
    expect(asynchronous?.normals).toEqual(synchronous.normals);
    expect(Object.is(asynchronous?.normals[0], meshNormal[0])).toBe(true);

    for (const bytes of [binaryStl(positions), asciiStl(positions)]) {
      const geometry = (await decodeStl(bytes))[0]?.geometry;
      expect(geometry?.positions).toEqual(positions);
      expect(geometry?.normals).toEqual(new Float32Array([...normal, ...normal]));
      expect(Object.is(geometry?.normals?.[0], test.normal[0])).toBe(true);
    }
  });
});

function binaryStl(positions: Float32Array): Uint8Array {
  const bytes = new Uint8Array(84 + (positions.length / 9) * 50);
  const view = new DataView(bytes.buffer);
  view.setUint32(80, positions.length / 9, true);
  positions.forEach((value, component) =>
    view.setFloat32(84 + Math.floor(component / 9) * 50 + 12 + (component % 9) * 4, value, true)
  );
  return bytes;
}

function asciiStl(positions: Float32Array): Uint8Array {
  const facets: string[] = [];
  for (let offset = 0; offset < positions.length; offset += 9) {
    const vertices: string[] = [];
    for (let vertex = 0; vertex < 3; vertex += 1) {
      const values = positions.subarray(offset + vertex * 3, offset + vertex * 3 + 3);
      vertices.push(`vertex ${Array.from(values, value => (Object.is(value, -0) ? '-0' : String(value))).join(' ')}`);
    }
    facets.push(`facet normal 0 0 0\nouter loop\n${vertices.join('\n')}\nendloop\nendfacet`);
  }
  return new TextEncoder().encode(`solid triangles\n${facets.join('\n')}\nendsolid triangles\n`);
}
