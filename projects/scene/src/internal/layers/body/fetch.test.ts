// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, describe, expect, it, vi } from 'vitest';
import { captureGeometryBytes, fetchGeometryBytes } from './fetch.js';
import { MAX_GEOMETRY_BYTES } from './limits.js';

afterEach(() => vi.unstubAllGlobals());

describe('geometry bytes', () => {
  it('copies only the selected view bytes and owns ArrayBuffer captures', () => {
    const source = new Uint8Array([9, 1, 2, 8]);
    const selected = captureGeometryBytes(new DataView(source.buffer, 1, 2));
    const whole = captureGeometryBytes(source.buffer);
    source.fill(0);
    expect(selected).toEqual(new Uint8Array([1, 2]));
    expect(whole).toEqual(new Uint8Array([9, 1, 2, 8]));
    expect(captureGeometryBytes(new Uint8Array(0))).toEqual(new Uint8Array(0));
  });

  it('rejects invalid input and observes cancellation before capture or fetch', async () => {
    // @ts-expect-error Validate malformed callers at the runtime boundary.
    expect(() => captureGeometryBytes(null)).toThrow(TypeError);
    const controller = new AbortController();
    controller.abort();
    const fetchFile = vi.fn<typeof fetch>();
    vi.stubGlobal('fetch', fetchFile);
    expect(() => captureGeometryBytes(new Uint8Array(1), controller.signal)).toThrow(DOMException);
    await expect(fetchGeometryBytes('/cancelled.stl', controller.signal)).rejects.toMatchObject({ name: 'AbortError' });
    expect(fetchFile).not.toHaveBeenCalled();
  });

  it('concatenates stream chunks in order and passes the request signal', async () => {
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new Uint8Array([1, 2]));
        controller.enqueue(new Uint8Array([3]));
        controller.close();
      }
    });
    const fetchFile = vi.fn<typeof fetch>().mockResolvedValue(new Response(stream));
    vi.stubGlobal('fetch', fetchFile);
    const controller = new AbortController();
    expect(await fetchGeometryBytes('/arm.stl', controller.signal)).toEqual(new Uint8Array([1, 2, 3]));
    expect(fetchFile).toHaveBeenCalledWith('/arm.stl', { signal: controller.signal });
    expect(stream.locked).toBe(false);
  });

  it('rejects HTTP errors, absent bodies, and oversized declared responses', async () => {
    const cancel = vi.fn();
    const stream = new ReadableStream<Uint8Array>({ cancel });
    const fetchFile = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(new Response('missing', { status: 404 }))
      .mockResolvedValueOnce(new Response(null))
      .mockResolvedValueOnce(new Response(stream, { headers: { 'content-length': String(MAX_GEOMETRY_BYTES + 1) } }));
    vi.stubGlobal('fetch', fetchFile);
    await expect(fetchGeometryBytes('/missing.stl')).rejects.toThrow('404');
    await expect(fetchGeometryBytes('/empty.stl')).rejects.toThrow('no body');
    await expect(fetchGeometryBytes('/large.stl')).rejects.toThrow(RangeError);
    expect(cancel).toHaveBeenCalledOnce();
  });

  it('cancels and unlocks a stream when cancellation interrupts reading', async () => {
    const controller = new AbortController();
    const cancel = vi.fn();
    const stream = new ReadableStream<Uint8Array>({
      pull(reader) {
        reader.enqueue(new Uint8Array([1]));
        controller.abort();
      },
      cancel
    });
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockResolvedValue(new Response(stream)));
    await expect(fetchGeometryBytes('/arm.stl', controller.signal)).rejects.toMatchObject({ name: 'AbortError' });
    expect(cancel).toHaveBeenCalledOnce();
    expect(stream.locked).toBe(false);
  });
});
