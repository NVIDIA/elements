// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { MESH_SRC } from '../internal/diagnostics/errors.js';
import { takeMarkerLayerRenderData } from '../internal/layers/markers/layer-state.js';
import { getMeshRenderData } from '../internal/layers/mesh/layer-state.js';
import { MarkerBuffer } from '../internal/layers/markers/buffer.js';
import { MAX_GEOMETRY_BYTES } from '../internal/layers/body/limits.js';
import type { SceneErrorDetail } from '../scene/scene.js';
import { registerGeometryDecoder, decodeGeometry, loadGeometry } from '../index.js';
import type { SceneBodyGeometry } from '../body/index.js';
import { SceneMesh } from './mesh.js';
import './define.js';

const ASCII_STL =
  'solid triangle\nfacet normal 0 0 1\nouter loop\nvertex 0 0 0\nvertex 2 0 0\nvertex 0 3 0\nendloop\nendfacet\nendsolid triangle\n';

describe(`${SceneMesh.metadata.tag} src`, () => {
  let fixture: HTMLElement | undefined;
  afterEach(() => {
    if (fixture) removeFixture(fixture);
    fixture = undefined;
    vi.unstubAllGlobals();
  });

  it('loads declarative URLs, exposes decoded geometry, and clears geometry when src clears', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>().mockImplementation(async () => new Response(ASCII_STL))
    );
    fixture = await createFixture(html`<nve-scene-mesh src="/arm.stl"></nve-scene-mesh>`);
    const mesh = fixture.querySelector(SceneMesh.metadata.tag) as SceneMesh;
    await mesh.loadComplete;
    expect(mesh.src).toBe('/arm.stl');
    expect(mesh.geometry?.positions).toEqual(new Float32Array([0, 0, 0, 2, 0, 0, 0, 3, 0]));
    expect(getMeshRenderData(mesh).ready).toBe(true);
    mesh.src = '';
    await elementIsStable(mesh);
    expect(mesh.hasAttribute('src')).toBe(false);
    expect(mesh.geometry).toBeNull();
  });

  it('waits for connection and dispatches by extension ignoring query and fragment', async () => {
    const fetchGeometry = vi.fn<typeof fetch>().mockImplementation(async () => new Response(ASCII_STL));
    vi.stubGlobal('fetch', fetchGeometry);
    fixture = await createFixture(html`<div></div>`);
    const mesh = document.createElement('nve-scene-mesh');
    mesh.src = '/download.STL?file=ignored.obj#part';
    expect(fetchGeometry).not.toHaveBeenCalled();
    fixture.append(mesh);
    await mesh.loadComplete;
    expect(fetchGeometry).toHaveBeenCalledTimes(1);
    expect(mesh.geometry?.positions).toBeDefined();
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
    fixture = await createFixture(html`<nve-scene-mesh></nve-scene-mesh>`);
    const mesh = fixture.querySelector(SceneMesh.metadata.tag) as SceneMesh;
    mesh.source = new MarkerBuffer({ records: [{}] });
    mesh.src = '/first.stl';
    const first = mesh.loadComplete;
    expect(mesh.geometry).toBeNull();
    mesh.src = '/second.stl';
    await expect(first).rejects.toMatchObject({ name: 'AbortError' });
    expect(pending[0]?.signal?.aborted).toBe(true);
    pending[1]?.resolve(new Response(ASCII_STL));
    await mesh.loadComplete;
    const accepted = mesh.geometry;
    pending[0]?.resolve(new Response(ASCII_STL.replace('vertex 2', 'vertex 9')));
    await elementIsStable(mesh);
    expect(mesh.geometry).toBe(accepted);
    mesh.src = '/third.stl';
    const third = mesh.loadComplete;
    const positions = new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]);
    mesh.geometry = { positions };
    await expect(third).rejects.toMatchObject({ name: 'AbortError' });
    await elementIsStable(mesh);
    expect(mesh.src).toBe('');
    expect(mesh.hasAttribute('src')).toBe(false);
    expect(mesh.geometry?.positions).toBe(positions);
    expect(takeMarkerLayerRenderData(mesh).count).toBe(1);
  });

  it('cancels pending loads on disconnection and retries on reconnection', async () => {
    const pending: ((response: Response) => void)[] = [];
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>().mockImplementation(() => new Promise(resolve => pending.push(resolve)))
    );
    fixture = await createFixture(html`<nve-scene-mesh></nve-scene-mesh>`);
    const mesh = fixture.querySelector(SceneMesh.metadata.tag) as SceneMesh;
    mesh.src = '/arm.stl';
    const first = mesh.loadComplete;
    mesh.remove();
    await expect(first).rejects.toMatchObject({ name: 'AbortError' });
    fixture.append(mesh);
    pending[1]?.(new Response(ASCII_STL));
    await mesh.loadComplete;
    expect(mesh.geometry?.positions).toBeDefined();
    pending[0]?.(new Response(ASCII_STL));
    await elementIsStable(mesh);
  });

  it('reports file failures locally and recovers when direct geometry selects another input', async () => {
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockResolvedValue(new Response('missing', { status: 404 })));
    fixture = await createFixture(html`<nve-scene-mesh></nve-scene-mesh>`);
    const mesh = fixture.querySelector(SceneMesh.metadata.tag) as SceneMesh;
    const errors: CustomEvent<SceneErrorDetail>[] = [];
    mesh.addEventListener('nve-scene-error', event => errors.push(event));
    mesh.src = '/missing.stl';
    await expect(mesh.loadComplete).rejects.toThrow('404');
    expect(errors.at(-1)?.detail).toMatchObject({ code: MESH_SRC, element: mesh, severity: 'error' });
    expect(mesh.geometry).toBeNull();
    expect(getMeshRenderData(mesh).ready).toBe(false);
    mesh.geometry = { positions: new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]) };
    expect(getMeshRenderData(mesh).ready).toBe(true);
  });

  it.each(['/download', '/arm.obj', '/arm.stl/download', 'https://host.stl/download?name=arm.stl#part.stl'])(
    'rejects unsupported URLs before fetching: %s',
    async src => {
      const fetchGeometry = vi.fn<typeof fetch>();
      vi.stubGlobal('fetch', fetchGeometry);
      fixture = await createFixture(html`<nve-scene-mesh></nve-scene-mesh>`);
      const mesh = fixture.querySelector(SceneMesh.metadata.tag) as SceneMesh;
      const errors: CustomEvent<SceneErrorDetail>[] = [];
      mesh.addEventListener('nve-scene-error', event => errors.push(event));
      mesh.src = src;
      await expect(mesh.loadComplete).rejects.toThrow(src);
      expect(fetchGeometry).not.toHaveBeenCalled();
      expect(errors.at(-1)?.detail).toMatchObject({ code: MESH_SRC, element: mesh });
      expect(errors.at(-1)?.detail.message).toContain(src);
      expect(getMeshRenderData(mesh).ready).toBe(false);
    }
  );

  it('loads registered decoders lazily and preserves fragments, bytes, and cancellation signals', async () => {
    const positions = new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]);
    const decode = vi.fn().mockResolvedValue([{ geometry: { positions } }]);
    const loader = vi.fn().mockResolvedValue({ decode });
    registerGeometryDecoder('.FAKE', loader);
    expect(loader).not.toHaveBeenCalled();
    expect(() => registerGeometryDecoder('fake', loader)).toThrow('already registered');
    expect(() => registerGeometryDecoder('.STL', loader)).toThrow('already registered');
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>().mockImplementation(async () => new Response('fake geometry'))
    );
    fixture = await createFixture(html`<nve-scene-mesh src="x.fake#part"></nve-scene-mesh>`);
    const mesh = fixture.querySelector(SceneMesh.metadata.tag) as SceneMesh;
    await mesh.loadComplete;
    expect(loader).toHaveBeenCalledOnce();
    expect(decode).toHaveBeenLastCalledWith(new TextEncoder().encode('fake geometry'), {
      fragment: '#part',
      signal: expect.any(AbortSignal)
    });
    expect(mesh.geometry?.positions).toEqual(positions);
    expect(getMeshRenderData(mesh).ready).toBe(true);
    mesh.src = 'x.fake#part%2Fone with space#two';
    await mesh.loadComplete;
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
    fixture = await createFixture(html`<nve-scene-mesh></nve-scene-mesh>`);
    const mesh = fixture.querySelector(SceneMesh.metadata.tag) as SceneMesh;
    const errors: CustomEvent<SceneErrorDetail>[] = [];
    mesh.addEventListener('nve-scene-error', event => errors.push(event));
    mesh.src = '/bad.stl';
    await expect(mesh.loadComplete).rejects.toThrow();
    expect(errors.at(-1)?.detail.code).toBe(MESH_SRC);
    expect(getMeshRenderData(mesh).ready).toBe(false);
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
    fixture = await createFixture(html`<nve-scene-mesh></nve-scene-mesh>`);
    const mesh = fixture.querySelector(SceneMesh.metadata.tag) as SceneMesh;
    mesh.src = '/first.deferred';
    const first = mesh.loadComplete;
    await vi.waitFor(() => expect(pending).toHaveLength(1));
    mesh.src = '/second.deferred';
    await expect(first).rejects.toMatchObject({ name: 'AbortError' });
    expect(pending[0]?.signal?.aborted).toBe(true);
    await vi.waitFor(() => expect(pending).toHaveLength(2));
    const newest = new Float32Array([0, 0, 0, 2, 0, 0, 0, 2, 0]);
    pending[1]?.resolve([{ geometry: { positions: newest } }]);
    await mesh.loadComplete;
    pending[0]?.resolve([{ geometry: { positions: new Float32Array([0, 0, 0, 9, 0, 0, 0, 9, 0]) } }]);
    await elementIsStable(mesh);
    expect(mesh.geometry?.positions).toEqual(newest);
  });

  it.each([
    ['primitives', [{ type: 'cube' }]],
    ['transformed meshes', [{ geometry: { positions: new Float32Array(9) }, position: [1, 0, 0] }]],
    [
      'several meshes',
      [{ geometry: { positions: new Float32Array(9) } }, { geometry: { positions: new Float32Array(9) } }]
    ]
  ] as const)('reports decoder %s that a single mesh cannot hold', async (_name, geometry) => {
    registerGeometryDecoder(`tree${_name.length}`, async () => ({ decode: async () => geometry }));
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>().mockImplementation(async () => new Response('geometry'))
    );
    fixture = await createFixture(html`<nve-scene-mesh></nve-scene-mesh>`);
    const mesh = fixture.querySelector(SceneMesh.metadata.tag) as SceneMesh;
    const errors: CustomEvent<SceneErrorDetail>[] = [];
    mesh.addEventListener('nve-scene-error', event => errors.push(event));
    mesh.src = `/robot.tree${_name.length}`;
    await expect(mesh.loadComplete).rejects.toThrow('body geometry');
    expect(errors.at(-1)?.detail).toMatchObject({ code: MESH_SRC, element: mesh });
    expect(mesh.geometry).toBeNull();
  });
});
