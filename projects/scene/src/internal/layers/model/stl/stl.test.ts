// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it } from 'vitest';
import { decodeStl } from './stl.js';

const ascii =
  'solid triangle\nfacet normal 0 0 0\nouter loop\nvertex -1e-3 0 0\nvertex 1 0 0\nvertex 0 1 0\nendloop\nendfacet\nendsolid triangle\n';
describe(decodeStl.name, () => {
  it('preserves signed coordinates and generates normals from winding rather than the supplied normal', async () => {
    const nodes = await decodeStl(new TextEncoder().encode(ascii));
    const geometry = nodes[0]?.geometry;
    expect(geometry?.positions[0]).toBeCloseTo(-0.001);
    expect(geometry?.normals).toEqual(new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1]));
  });

  it('recognizes binary headers beginning with solid and ignores binary attribute words', async () => {
    const bytes = binary(1);
    bytes.set(new TextEncoder().encode('solid binary'));
    new DataView(bytes.buffer).setUint16(132, 0xffff, true);
    const nodes = await decodeStl(bytes);
    expect(nodes[0]?.geometry?.positions).toEqual(new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]));
    expect(await decodeStl(binary(0))).toEqual([]);
    expect(await decodeStl(new TextEncoder().encode('solid empty\nendsolid empty'))).toEqual([]);
  });

  it.each([ascii.replace('endloop', 'endfacet'), ascii.replace('1e-3', '1e400'), ascii + 'garbage'])(
    'rejects malformed ASCII surfaces',
    async text => {
      await expect(decodeStl(new TextEncoder().encode(text))).rejects.toThrow();
    }
  );

  it('rejects truncated records and nonfinite binary coordinates', async () => {
    await expect(decodeStl(binary(1).subarray(0, 133))).rejects.toThrow();
    const bytes = binary(1);
    new DataView(bytes.buffer).setFloat32(96, Infinity, true);
    await expect(decodeStl(bytes)).rejects.toThrow();
  });

  it('honors cancellation before parsing and while yielding between binary chunks', async () => {
    const controller = new AbortController();
    const result = decodeStl(binary(5000), controller.signal);
    controller.abort();
    await expect(result).rejects.toMatchObject({ name: 'AbortError' });
    await expect(decodeStl(binary(1), controller.signal)).rejects.toMatchObject({ name: 'AbortError' });
  });
});

function binary(count: number): Uint8Array {
  const bytes = new Uint8Array(84 + count * 50);
  const view = new DataView(bytes.buffer);
  view.setUint32(80, count, true);
  for (let triangle = 0; triangle < count; triangle += 1) {
    view.setFloat32(84 + triangle * 50 + 24, 1, true);
    view.setFloat32(84 + triangle * 50 + 40, 1, true);
  }
  return bytes;
}
