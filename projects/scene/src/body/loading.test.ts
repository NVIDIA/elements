// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { BODY_SRC } from '../internal/diagnostics/errors.js';
import { takeMarkerLayerRenderData } from '../internal/layers/markers/layer-state.js';
import { takeBodyLayerRenderData } from '../internal/layers/body/layer-state.js';
import { MarkerBuffer } from '../internal/layers/markers/buffer.js';
import type { SceneErrorDetail } from '../scene/scene.js';
import { SceneBody } from './body.js';
import { registerGeometryDecoder, decodeGeometry, loadGeometry, type SceneBodyGeometry } from './index.js';
import { MAX_GEOMETRY_BYTES } from '../internal/layers/body/limits.js';
import './define.js';

const ASCII_STL =
  'solid triangle\nfacet normal 0 0 1\nouter loop\nvertex 0 0 0\nvertex 2 0 0\nvertex 0 3 0\nendloop\nendfacet\nendsolid triangle\n';

describe(SceneBody.metadata.tag, () => {
  let fixture: HTMLElement | undefined;
  afterEach(() => {
    if (fixture) removeFixture(fixture);
    fixture = undefined;
    vi.unstubAllGlobals();
  });

  it('loads declarative URLs, exposes decoded geometry, and restores children when the asset clears', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>().mockImplementation(async () => new Response(ASCII_STL))
    );
    fixture = await createFixture(
      html`<nve-scene-body src="/arm.stl"><nve-scene-shape kind="sphere"></nve-scene-shape></nve-scene-body>`
    );
    const body = fixture.querySelector(SceneBody.metadata.tag) as SceneBody;
    await body.loadComplete;
    expect(body.src).toBe('/arm.stl');
    expect(body.geometry?.[0]?.geometry?.positions).toEqual(new Float32Array([0, 0, 0, 2, 0, 0, 0, 3, 0]));
    expect(body.querySelector('nve-scene-shape')).not.toBeNull();
    body.src = '';
    await elementIsStable(body);
    expect(body.hasAttribute('src')).toBe(false);
    expect(body.geometry?.[0]?.kind).toBe('sphere');
  });

  it('waits for connection and dispatches by extension ignoring query and fragment', async () => {
    const fetchGeometry = vi.fn<typeof fetch>().mockImplementation(async () => new Response(ASCII_STL));
    vi.stubGlobal('fetch', fetchGeometry);
    fixture = await createFixture(html`<div></div>`);
    const body = document.createElement('nve-scene-body');
    body.src = '/download.STL?file=ignored.obj#part';
    expect(fetchGeometry).not.toHaveBeenCalled();
    fixture.append(body);
    await body.loadComplete;
    expect(fetchGeometry).toHaveBeenCalledTimes(1);
    expect(body.geometry?.[0]?.geometry).toBeDefined();
  });

  it('rejects superseded loads and prevents stale results from replacing geometry or placements', async () => {
    const pending: { resolve: (response: Response) => void; signal?: AbortSignal | null }[] = [];
    vi.stubGlobal(
      'fetch',
      vi
        .fn<typeof fetch>()
        .mockImplementation(
          (_url, options) => new Promise(resolve => pending.push({ resolve, signal: options?.signal }))
        )
    );
    fixture = await createFixture(html`<nve-scene-body><nve-scene-shape></nve-scene-shape></nve-scene-body>`);
    const body = fixture.querySelector(SceneBody.metadata.tag) as SceneBody;
    body.source = new MarkerBuffer({ records: [{}] });
    body.src = '/first.stl';
    const first = body.loadComplete;
    expect(body.geometry).toBeNull();
    body.src = '/second.stl';
    await expect(first).rejects.toMatchObject({ name: 'AbortError' });
    expect(pending[0]?.signal?.aborted).toBe(true);
    pending[1]?.resolve(new Response(ASCII_STL));
    await body.loadComplete;
    const accepted = body.geometry;
    pending[0]?.resolve(new Response(ASCII_STL.replace('vertex 2', 'vertex 9')));
    await elementIsStable(body);
    expect(body.geometry).toBe(accepted);
    body.src = '/third.stl';
    const third = body.loadComplete;
    body.geometry = [];
    await expect(third).rejects.toMatchObject({ name: 'AbortError' });
    await elementIsStable(body);
    expect(body.src).toBe('');
    expect(body.hasAttribute('src')).toBe(false);
    expect(body.geometry).toEqual([]);
    expect(takeMarkerLayerRenderData(body).count).toBe(1);
    body.geometry = null;
    expect(fixture.querySelector<SceneBody>(SceneBody.metadata.tag)?.geometry?.[0]?.kind).toBe('cube');
  });

  it('cancels pending loads on disconnection and retries on reconnection', async () => {
    const pending: ((response: Response) => void)[] = [];
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>().mockImplementation(() => new Promise(resolve => pending.push(resolve)))
    );
    fixture = await createFixture(html`<nve-scene-body></nve-scene-body>`);
    const body = fixture.querySelector(SceneBody.metadata.tag) as SceneBody;
    body.src = '/arm.stl';
    const first = body.loadComplete;
    body.remove();
    await expect(first).rejects.toMatchObject({ name: 'AbortError' });
    fixture.append(body);
    pending[1]?.(new Response(ASCII_STL));
    await body.loadComplete;
    expect(body.geometry?.[0]?.geometry).toBeDefined();
    pending[0]?.(new Response(ASCII_STL));
    await elementIsStable(body);
  });

  it('reports file failures locally and recovers when direct geometry selects another input', async () => {
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockResolvedValue(new Response('missing', { status: 404 })));
    fixture = await createFixture(html`<nve-scene-body></nve-scene-body>`);
    const body = fixture.querySelector(SceneBody.metadata.tag) as SceneBody;
    const errors: CustomEvent<SceneErrorDetail>[] = [];
    body.addEventListener('nve-scene-error', event => errors.push(event));
    body.src = '/missing.stl';
    await expect(body.loadComplete).rejects.toThrow('404');
    expect(errors.at(-1)?.detail).toMatchObject({ code: BODY_SRC, element: body, severity: 'error' });
    expect(body.geometry).toBeNull();
    expect(takeBodyLayerRenderData(body)).toMatchObject({ ready: false, geometryError: true });
    body.geometry = [{ kind: 'cube' }];
    expect(takeBodyLayerRenderData(body)).toMatchObject({ ready: true, geometryError: false });
  });
  it.each(['/download', '/arm.obj', '/arm.stl/download', 'https://host.stl/download?name=arm.stl#part.stl'])(
    'rejects unsupported URLs before fetching: %s',
    async src => {
      const fetchGeometry = vi.fn<typeof fetch>();
      vi.stubGlobal('fetch', fetchGeometry);
      fixture = await createFixture(
        html`<nve-scene-body></nve-scene-body><nve-scene-body><nve-scene-shape></nve-scene-shape></nve-scene-body>`
      );
      const [body, unrelated] = fixture.querySelectorAll('nve-scene-body');
      if (!body || !unrelated) throw new Error('Expected two bodies.');
      const errors: CustomEvent<SceneErrorDetail>[] = [];
      body.addEventListener('nve-scene-error', event => errors.push(event));
      body.src = src;
      await expect(body.loadComplete).rejects.toThrow(src);
      expect(fetchGeometry).not.toHaveBeenCalled();
      expect(errors.at(-1)?.detail).toMatchObject({ code: BODY_SRC, element: body });
      expect(errors.at(-1)?.detail.message).toContain(src);
      expect(takeBodyLayerRenderData(body)).toMatchObject({ ready: false, geometryError: true });
      expect(takeBodyLayerRenderData(unrelated).ready).toBe(true);
    }
  );

  it('loads registered decoders lazily and preserves fragments, bytes, and cancellation signals', async () => {
    const decode = vi.fn().mockResolvedValue([{ kind: 'cube' }]);
    const loader = vi.fn().mockResolvedValue({ decode });
    registerGeometryDecoder('.FAKE', loader);
    expect(loader).not.toHaveBeenCalled();
    expect(() => registerGeometryDecoder('fake', loader)).toThrow('already registered');
    expect(() => registerGeometryDecoder('.STL', loader)).toThrow('already registered');
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>().mockImplementation(async () => new Response('fake geometry'))
    );
    fixture = await createFixture(html`<nve-scene-body src="x.fake#part"></nve-scene-body>`);
    const body = fixture.querySelector('nve-scene-body')!;
    await body.loadComplete;
    expect(loader).toHaveBeenCalledOnce();
    expect(decode).toHaveBeenLastCalledWith(new TextEncoder().encode('fake geometry'), {
      fragment: '#part',
      signal: expect.any(AbortSignal)
    });
    expect(body.geometry).toEqual([{ kind: 'cube' }]);
    expect(takeBodyLayerRenderData(body).ready).toBe(true);
    body.src = 'x.fake#part%2Fone with space#two';
    await body.loadComplete;
    expect(decode.mock.lastCall?.[1].fragment).toBe('#part%2Fone with space#two');
    await loadGeometry('x.FAKE?part=ignored#part%2Fone#two');
    expect(decode.mock.lastCall?.[1].fragment).toBe('#part%2Fone#two');
    await decodeGeometry(new Uint8Array([1, 2]), { format: 'fake' });
    expect(decode.mock.lastCall?.[1].fragment).toBe('');
  });

  it.each(['', '.', '../stl', 'stl?x', 'x/y'])('rejects invalid decoder extensions: %s', extension => {
    expect(() => registerGeometryDecoder(extension, async () => ({ decode: async () => [] }))).toThrow(TypeError);
  });

  it.each(['headers', 'stream', 'decode'] as const)('fails closed for %s failures on src', async failure => {
    const cancel = vi.fn();
    const response =
      failure === 'stream'
        ? new Response(
            new ReadableStream<Uint8Array>({
              pull: controller => controller.enqueue(new Uint8Array(1024 * 1024)),
              cancel
            })
          )
        : new Response(
            'invalid STL',
            failure === 'headers' ? { headers: { 'content-length': String(MAX_GEOMETRY_BYTES + 1) } } : undefined
          );
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockResolvedValue(response));
    fixture = await createFixture(html`<nve-scene-body></nve-scene-body>`);
    const body = fixture.querySelector('nve-scene-body')!;
    const errors: CustomEvent<SceneErrorDetail>[] = [];
    body.addEventListener('nve-scene-error', event => errors.push(event));
    body.src = '/bad.stl';
    await expect(body.loadComplete).rejects.toThrow();
    expect(errors.at(-1)?.detail.code).toBe(BODY_SRC);
    expect(takeBodyLayerRenderData(body)).toMatchObject({ ready: false, geometryError: true });
    if (failure === 'stream') expect(cancel).toHaveBeenCalledOnce();
  });
  it('keeps newest-request authority when an external decoder finishes after cancellation', async () => {
    const pending: { signal?: AbortSignal; resolve: (geometry: SceneBodyGeometry) => void }[] = [];
    registerGeometryDecoder('deferred', async () => ({
      decode: (_bytes, { signal }) => new Promise(resolve => pending.push({ signal, resolve }))
    }));
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>().mockImplementation(async () => new Response('geometry'))
    );
    fixture = await createFixture(html`<nve-scene-body></nve-scene-body>`);
    const body = fixture.querySelector('nve-scene-body')!;
    body.src = '/first.deferred';
    const first = body.loadComplete;
    await vi.waitFor(() => expect(pending).toHaveLength(1));
    body.src = '/second.deferred';
    await expect(first).rejects.toMatchObject({ name: 'AbortError' });
    expect(pending[0]?.signal?.aborted).toBe(true);
    await vi.waitFor(() => expect(pending).toHaveLength(2));
    pending[1]?.resolve([{ kind: 'sphere' }]);
    await body.loadComplete;
    pending[0]?.resolve([{ kind: 'cube' }]);
    await elementIsStable(body);
    expect(body.geometry).toEqual([{ kind: 'sphere' }]);
  });
});
