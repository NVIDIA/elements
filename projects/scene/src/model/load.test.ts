// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, describe, expect, it, vi } from 'vitest';
import { decodeModel, loadModel } from './load.js';
import { MAX_MODEL_BYTES } from '../internal/layers/model/limits.js';

const ASCII_STL = `solid triangle
facet normal 0 0 0
outer loop
vertex 0 0 0
vertex 2 0 0
vertex 0 3 0
endloop
endfacet
endsolid triangle
`;

describe('model file loading', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('decodes ASCII and binary STL without changing coordinates and regenerates zero normals', async () => {
    const ascii = await decodeModel(new TextEncoder().encode(ASCII_STL), { format: 'stl' });
    const binary = await decodeModel(binaryStl(), { format: 'stl' });
    expect(binary).toEqual(ascii);
    expect(binary[0]?.geometry).toEqual({
      positions: new Float32Array([0, 0, 0, 2, 0, 0, 0, 3, 0]),
      normals: new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1])
    });
  });

  it('captures a byte view before yielding and handles binary headers beginning with solid', async () => {
    const data = binaryStl();
    data.set(new TextEncoder().encode('solid binary'));
    const envelope = new Uint8Array(data.length + 19);
    envelope.set(data, 7);
    const view = envelope.subarray(7, 7 + data.length);
    const decoded = decodeModel(view, { format: 'stl' });
    view.fill(255);
    expect((await decoded)[0]?.geometry?.positions[3]).toBe(2);
  });

  it('returns empty model geometry for empty binary STL', async () => {
    expect(await decodeModel(new ArrayBuffer(84), { format: 'stl' })).toEqual([]);
  });

  it.each([
    ASCII_STL.replace('endfacet', ''),
    ASCII_STL.replace('endsolid triangle', ''),
    ASCII_STL.replace('vertex 2', 'vertex NaN'),
    ASCII_STL.replace('vertex 2', 'vertex 1e99'),
    ASCII_STL + 'facet normal 0 0 1',
    'not an STL file'
  ])('rejects malformed ASCII data', async text => {
    await expect(decodeModel(new TextEncoder().encode(text), { format: 'stl' })).rejects.toThrow();
  });

  it('rejects truncated binary triangles and nonfinite binary values', async () => {
    await expect(decodeModel(binaryStl().subarray(0, 120), { format: 'stl' })).rejects.toThrow();
    const data = binaryStl();
    new DataView(data.buffer).setFloat32(96, Infinity, true);
    await expect(decodeModel(data, { format: 'stl' })).rejects.toThrow(RangeError);
  });

  it('infers a case-insensitive URL extension and accepts an explicit format for extensionless URLs', async () => {
    const fetchModel = vi.fn<typeof fetch>().mockImplementation(async () => new Response(ASCII_STL));
    vi.stubGlobal('fetch', fetchModel);
    expect(await loadModel('/arm.STL?download=1#part')).toHaveLength(1);
    expect(await loadModel('/download', { format: 'stl' })).toHaveLength(1);
    await expect(loadModel('/download')).rejects.toThrow(TypeError);
    await expect(loadModel('/arm.glb')).rejects.toThrow(TypeError);
    expect(fetchModel).toHaveBeenCalledTimes(2);
  });

  it('rejects unsuccessful and oversized responses', async () => {
    const fetchModel = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(new Response('missing', { status: 404 }))
      .mockResolvedValueOnce(new Response(ASCII_STL, { headers: { 'content-length': String(MAX_MODEL_BYTES + 1) } }));
    vi.stubGlobal('fetch', fetchModel);
    await expect(loadModel('/missing.stl')).rejects.toThrow('404');
    await expect(loadModel('/large.stl')).rejects.toThrow(RangeError);
  });

  it('supports cancellation before and during decoding', async () => {
    const aborted = AbortSignal.abort(new DOMException('Cancelled', 'AbortError'));
    await expect(loadModel('/arm.stl', { signal: aborted })).rejects.toMatchObject({ name: 'AbortError' });
    const controller = new AbortController();
    const pending = decodeModel(binaryStl(), { format: 'stl', signal: controller.signal });
    controller.abort();
    await expect(pending).rejects.toMatchObject({ name: 'AbortError' });
  });

  it('bounds streaming responses even without a content-length header and cancels the reader', async () => {
    const chunk = new Uint8Array(1024 * 1024);
    const cancel = vi.fn();
    const body = new ReadableStream<Uint8Array>({ pull: controller => controller.enqueue(chunk), cancel });
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockResolvedValue(new Response(body)));
    await expect(loadModel('/large.stl')).rejects.toThrow(RangeError);
    expect(cancel).toHaveBeenCalledOnce();
  });
});

function binaryStl(): Uint8Array {
  const bytes = new Uint8Array(134);
  const view = new DataView(bytes.buffer);
  view.setUint32(80, 1, true);
  [0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 3, 0].forEach((value, index) => view.setFloat32(84 + index * 4, value, true));
  return bytes;
}
