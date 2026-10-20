// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createFixture, removeFixture } from '@internals/testing';
import { MeshAssetLoader } from './asset-loader.js';
import { registerGeometryDecoder } from '../body/decoders.js';
import type { SceneMeshGeometry } from './types.js';

registerGeometryDecoder('testmeshasset', async () => ({
  decode: async bytes => {
    if (bytes[0] === 0) return [];
    const geometry = { positions: new Float32Array([bytes[0]!, 0, 0, 1, 0, 0, 0, 1, 0]) };
    return bytes[0] === 2 ? [{ geometry, position: [1, 0, 0] }] : [{ geometry }];
  }
}));

describe(MeshAssetLoader.name, () => {
  let fixture: HTMLElement | undefined;
  let current: MeshAssetLoader | undefined;
  afterEach(() => {
    current?.disconnect();
    current = undefined;
    if (fixture) removeFixture(fixture);
    fixture = undefined;
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  async function setup() {
    fixture = await createFixture(html`<div></div>`);
    const host = Object.assign(document.createElement('div'), { requestUpdate: vi.fn() });
    const apply = vi.fn<(geometry: SceneMeshGeometry | null) => void>();
    const loader = new MeshAssetLoader(host, apply);
    current = loader;
    return { container: fixture, host, loader, apply };
  }

  it('defers disconnected requests, resolves relative URLs, and retains completed loads on reconnection', async () => {
    const fetchFile = vi.fn<typeof fetch>().mockImplementation(async () => new Response(new Uint8Array([1])));
    vi.stubGlobal('fetch', fetchFile);
    const { container, host, loader, apply } = await setup();
    loader.src = './arm.testmeshasset#part%2Fone';
    expect(fetchFile).not.toHaveBeenCalled();
    container.append(host);
    loader.connect();
    await loader.loadComplete;
    expect(fetchFile.mock.calls[0]?.[0]).toBe(new URL('./arm.testmeshasset', host.baseURI).href + '#part%2Fone');
    expect(apply.mock.calls.at(-1)?.[0]?.positions[0]).toBe(1);
    const complete = loader.loadComplete;
    loader.src = loader.src;
    loader.disconnect();
    loader.connect();
    expect(loader.loadComplete).toBe(complete);
    expect(fetchFile).toHaveBeenCalledOnce();
    loader.src = '';
    await loader.loadComplete;
    expect(apply).toHaveBeenLastCalledWith(null);
  });

  it('aborts superseded requests and lets explicit geometry cancel the current load', async () => {
    const requests: { resolve: (response: Response) => void; signal?: AbortSignal | null }[] = [];
    vi.stubGlobal(
      'fetch',
      vi
        .fn<typeof fetch>()
        .mockImplementation(
          (_url, options) => new Promise(resolve => requests.push({ resolve, signal: options?.signal }))
        )
    );
    const { container, host, loader, apply } = await setup();
    container.append(host);
    loader.src = '/first.testmeshasset';
    const first = loader.loadComplete;
    loader.src = '/second.testmeshasset';
    await expect(first).rejects.toMatchObject({ name: 'AbortError' });
    expect(requests[0]?.signal?.aborted).toBe(true);
    requests[0]?.resolve(new Response(new Uint8Array([1])));
    requests[1]?.resolve(new Response(new Uint8Array([9])));
    await loader.loadComplete;
    expect(apply.mock.calls.at(-1)?.[0]?.positions[0]).toBe(9);
    loader.src = '/third.testmeshasset';
    const third = loader.loadComplete;
    loader.geometryAssigned();
    await expect(third).rejects.toMatchObject({ name: 'AbortError' });
    expect(requests[2]?.signal?.aborted).toBe(true);
    expect(loader.src).toBe('');
    await loader.loadComplete;
  });

  it('cancels on disconnect and retries unfinished loads on reconnection', async () => {
    const requests: ((response: Response) => void)[] = [];
    const fetchFile = vi.fn<typeof fetch>().mockImplementation(() => new Promise(resolve => requests.push(resolve)));
    vi.stubGlobal('fetch', fetchFile);
    const { container, host, loader } = await setup();
    container.append(host);
    loader.src = '/arm.testmeshasset';
    const first = loader.loadComplete;
    loader.disconnect();
    await expect(first).rejects.toMatchObject({ name: 'AbortError' });
    loader.connect();
    requests[1]?.(new Response(new Uint8Array([0])));
    await loader.loadComplete;
    expect(fetchFile).toHaveBeenCalledTimes(2);
  });

  it('reports failures and rejects hierarchical decoder output without installing it', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const fetchFile = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(new Response('missing', { status: 404 }))
      .mockResolvedValueOnce(new Response(new Uint8Array([2])))
      .mockResolvedValueOnce(new Response(new Uint8Array([1])));
    vi.stubGlobal('fetch', fetchFile);
    const { container, host, loader, apply } = await setup();
    container.append(host);
    const diagnostic = vi.fn();
    const controller = new AbortController();
    host.addEventListener('nve-scene-error', diagnostic, { signal: controller.signal });
    loader.src = '/missing.testmeshasset';
    await expect(loader.loadComplete).rejects.toThrow('404');
    expect(diagnostic).toHaveBeenCalledWith(
      expect.objectContaining({ detail: expect.objectContaining({ code: 'mesh-src' }) })
    );
    loader.src = '/hierarchy.testmeshasset';
    await expect(loader.loadComplete).rejects.toThrow('one untransformed triangle mesh');
    expect(apply).toHaveBeenLastCalledWith(null);
    loader.src = '/valid.testmeshasset';
    await loader.loadComplete;
    expect(apply.mock.calls.at(-1)?.[0]?.positions[0]).toBe(1);
    controller.abort();
  });
});
