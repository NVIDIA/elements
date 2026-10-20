// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, describe, expect, it, vi } from 'vitest';
import { decodeGeometry, loadGeometry } from './load.js';
import { registerGeometryDecoder } from './decoders.js';
import type { SceneBodyGeometry } from './types.js';

afterEach(() => vi.unstubAllGlobals());

describe('geometry loading', () => {
  it('captures bytes before awaiting a decoder and forwards the fragment and signal', async () => {
    const geometry: SceneBodyGeometry = [{ type: 'cube' }];
    const decode = vi.fn(async () => geometry);
    const loader = vi.fn(async () => ({ decode }));
    registerGeometryDecoder('testcapture', loader);
    const source = new Uint8Array([9, 1, 2, 8]);
    const controller = new AbortController();
    const result = decodeGeometry(source.subarray(1, 3), {
      format: '.TESTCAPTURE',
      fragment: '#part%2Fone',
      signal: controller.signal
    });
    source.fill(0);
    expect(await result).toBe(geometry);
    expect(loader).toHaveBeenCalledOnce();
    expect(decode).toHaveBeenCalledWith(new Uint8Array([1, 2]), { fragment: '#part%2Fone', signal: controller.signal });
  });

  it('uses an explicit format for extensionless URLs and preserves encoded fragments', async () => {
    const decode = vi.fn(async () => []);
    registerGeometryDecoder('testurlformat', async () => ({ decode }));
    const fetchFile = vi.fn<typeof fetch>().mockImplementation(async () => new Response(new Uint8Array([1, 2])));
    vi.stubGlobal('fetch', fetchFile);
    const url = new URL('https://example.com/download?file=other.stl#part%2Fone');
    expect(await loadGeometry(url, { format: 'testurlformat' })).toEqual([]);
    expect(fetchFile).toHaveBeenCalledWith(url, { signal: undefined });
    expect(decode).toHaveBeenCalledWith(new Uint8Array([1, 2]), { fragment: '#part%2Fone', signal: undefined });
  });

  it('rejects unsupported formats before requesting bytes', async () => {
    const fetchFile = vi.fn<typeof fetch>();
    vi.stubGlobal('fetch', fetchFile);
    await expect(loadGeometry('/unknown.format')).rejects.toThrow(TypeError);
    await expect(loadGeometry('/arm.stl', { format: 'unregisteredformat' })).rejects.toThrow(TypeError);
    expect(fetchFile).not.toHaveBeenCalled();
  });

  it('stops before decoding when cancelled during module loading', async () => {
    const controller = new AbortController();
    const decode = vi.fn(async () => []);
    registerGeometryDecoder('testmoduleabort', async () => {
      controller.abort();
      return { decode };
    });
    await expect(
      decodeGeometry(new Uint8Array(), { format: 'testmoduleabort', signal: controller.signal })
    ).rejects.toMatchObject({ name: 'AbortError' });
    expect(decode).not.toHaveBeenCalled();
  });

  it('discards decoder results when cancelled during decoding', async () => {
    const controller = new AbortController();
    registerGeometryDecoder('testdecodeabort', async () => ({
      decode: async () => {
        controller.abort();
        return [];
      }
    }));
    await expect(
      decodeGeometry(new Uint8Array(), { format: 'testdecodeabort', signal: controller.signal })
    ).rejects.toMatchObject({ name: 'AbortError' });
  });
});
