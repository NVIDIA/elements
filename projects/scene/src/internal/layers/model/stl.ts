// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { SceneModelGeometry } from './types.js';
import { MAX_MODEL_BYTES, MODEL_TRIANGLE_BYTES } from './limits.js';
import { writeTriangleNormal } from '../../math/triangle-normal.js';

interface StlGeometry {
  positions: Float32Array;
  normals: Float32Array;
}

/** Decodes standard STL surfaces and generates normals from triangle winding. */
export async function decodeStl(bytes: Uint8Array, signal?: AbortSignal): Promise<SceneModelGeometry> {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const count = bytes.length >= 84 ? view.getUint32(80, true) : -1;
  const geometry =
    count >= 0 && 84 + count * 50 === bytes.length
      ? await decodeBinary(view, count, signal)
      : await decodeAscii(bytes, signal);
  signal?.throwIfAborted();
  return geometry.positions.length === 0 ? [] : [{ geometry }];
}

function allocate(count: number): StlGeometry {
  if (count * MODEL_TRIANGLE_BYTES > MAX_MODEL_BYTES)
    throw new RangeError('STL exceeds the compiled allocation limit.');
  return { positions: new Float32Array(count * 9), normals: new Float32Array(count * 9) };
}

async function decodeBinary(view: DataView, count: number, signal?: AbortSignal): Promise<StlGeometry> {
  const geometry = allocate(count);
  for (let triangle = 0; triangle < count; triangle += 1) {
    const offset = 84 + triangle * 50;
    for (let component = 0; component < 12; component += 1) {
      const value = view.getFloat32(offset + component * 4, true);
      if (!Number.isFinite(value)) throw new RangeError('STL values must be finite.');
      if (component >= 3) geometry.positions[triangle * 9 + component - 3] = value;
    }
    writeTriangleNormal(geometry, triangle * 9, 'division');
    if ((triangle + 1) % 4096 === 0) await yieldDecode(signal);
  }
  return geometry;
}

async function decodeAscii(bytes: Uint8Array, signal?: AbortSignal): Promise<StlGeometry> {
  const text = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  const header = /^\s*solid[^\r\n]*(?:\r\n|\n|\r)/.exec(text);
  if (!header) throw new TypeError('STL must be a complete binary file or an ASCII solid.');
  const start = header[0].length;
  const count = await readFacets(text, start, { signal });
  const geometry = allocate(count);
  await readFacets(text, start, { geometry, signal });
  return geometry;
}

// eslint-disable-next-line max-statements -- The ordered grammar checks delimit each facet before counting or writing it.
async function readFacets(
  text: string,
  start: number,
  options: { geometry?: StlGeometry; signal?: AbortSignal }
): Promise<number> {
  const { geometry, signal } = options;
  const tokens = /\S+/g;
  tokens.lastIndex = start;
  const next = () => tokens.exec(text)?.[0];
  let count = 0;
  while (true) {
    const token = next();
    if (token === 'endsolid') {
      if (!/^[^\r\n]*(?:\r\n|\n|\r)?\s*$/.test(text.slice(tokens.lastIndex)))
        throw new TypeError('Unexpected data after STL endsolid.');
      return count;
    }
    if (token !== 'facet') throw new TypeError('Expected STL facet or endsolid.');
    requireToken(next, 'normal');
    for (let component = 0; component < 3; component += 1) readNumber(next);
    requireToken(next, 'outer');
    requireToken(next, 'loop');
    readVertices(next, count, geometry);
    requireToken(next, 'endloop');
    requireToken(next, 'endfacet');
    if (geometry) writeTriangleNormal(geometry, count * 9, 'division');
    if (++count * MODEL_TRIANGLE_BYTES > MAX_MODEL_BYTES)
      throw new RangeError('STL exceeds the compiled allocation limit.');
    if (count % 4096 === 0) await yieldDecode(signal);
  }
}

function requireToken(next: () => string | undefined, expected: string): void {
  if (next() !== expected) throw new TypeError(`Expected STL ${expected}.`);
}

function readNumber(next: () => string | undefined): number {
  const token = next();
  if (!token || !/^[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?$/.test(token))
    throw new TypeError('Expected an STL number.');
  const number = Math.fround(Number(token));
  if (!Number.isFinite(number)) throw new RangeError('STL values must fit the finite Float32 range.');
  return number;
}

function readVertices(next: () => string | undefined, triangle: number, geometry?: StlGeometry): void {
  for (let vertex = 0; vertex < 3; vertex += 1) {
    requireToken(next, 'vertex');
    for (let component = 0; component < 3; component += 1) {
      const value = readNumber(next);
      if (geometry) geometry.positions[triangle * 9 + vertex * 3 + component] = value;
    }
  }
}

async function yieldDecode(signal?: AbortSignal): Promise<void> {
  await new Promise<void>(resolve => setTimeout(resolve, 0));
  signal?.throwIfAborted();
}
