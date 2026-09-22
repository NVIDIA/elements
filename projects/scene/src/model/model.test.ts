// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { MODEL_ASSET, MODEL_DUAL_SOURCE, PART_SHAPE } from '../internal/diagnostics/errors.js';
import { takeMarkerLayerRenderData } from '../internal/layers/markers/layer-state.js';
import { getModelLayerTopologyVersion, takeModelLayerRenderData } from '../internal/layers/model/layer-state.js';
import type { Quaternion, Vec3 } from '../internal/math/types.js';
import type { RGBA } from '../internal/color/types.js';
import type { SceneErrorDetail } from '../scene/scene.js';
import { compileParts, type ModelPart } from '../internal/layers/model/compile.js';
import { MarkerBuffer } from '../internal/layers/markers/buffer.js';
import { SceneModel } from './model.js';
import { ScenePart } from './part.js';
import './define.js';

const ASCII_STL =
  'solid triangle\nfacet normal 0 0 1\nouter loop\nvertex 0 0 0\nvertex 2 0 0\nvertex 0 3 0\nendloop\nendfacet\nendsolid triangle\n';

describe(SceneModel.metadata.tag, () => {
  let fixture: HTMLElement | undefined;
  afterEach(() => {
    if (fixture) removeFixture(fixture);
    vi.unstubAllGlobals();
  });

  it('compiles declarative parts exactly once for each same-task attribute or property edit', async () => {
    fixture = await createFixture(html`<nve-scene-model><nve-scene-part></nve-scene-part></nve-scene-model>`);
    const model = fixture.querySelector(SceneModel.metadata.tag) as SceneModel;
    await elementIsStable(model);
    const first = getModelLayerTopologyVersion(model);
    expect(takeModelLayerRenderData(model)).toMatchObject({ identityInstance: true, ready: true });
    const part = model.querySelector(ScenePart.metadata.tag) as ScenePart;
    part.setAttribute('position', '[1,0,0]');
    part.setAttribute('scale', '[2,2,2]');
    part.setAttribute('color', 'rgb(0 255 0)');
    expect(getModelLayerTopologyVersion(model)).toBe(first + 3);
    await elementIsStable(model);
    expect(getModelLayerTopologyVersion(model)).toBe(first + 3);
    const second = getModelLayerTopologyVersion(model);
    part.scale = [2, 2, 2];
    await elementIsStable(model);
    expect(getModelLayerTopologyVersion(model)).toBe(second);
    part.orientation = [0, 0, 1, 0];
    expect(getModelLayerTopologyVersion(model)).toBe(second + 1);
    await elementIsStable(model);
    expect(getModelLayerTopologyVersion(model)).toBe(second + 1);
  });

  it('exposes the complete compiled declarative planar geometry', async () => {
    fixture = await createFixture(
      html`<nve-scene-model>
        <nve-scene-part shape="cone" position="[1,2,3]" orientation="[0,0,1,0]" scale="[2,3,4]" color="#4080c0"></nve-scene-part>
      </nve-scene-model>`
    );
    const model = fixture.querySelector(SceneModel.metadata.tag) as SceneModel;
    await elementIsStable(model);
    const expected = compileParts([
      {
        color: [64 / 255, 128 / 255, 192 / 255, 1],
        position: [1, 2, 3],
        orientation: [0, 0, 1, 0],
        scale: [2, 3, 4],
        shape: 'cone'
      }
    ]);
    const actual = takeModelLayerRenderData(model);

    expect(actual.positions).toEqual(expected.positions);
    expect(actual.normals).toEqual(expected.normals);
    expect(actual.colors).toEqual(expected.colors);
    expect(actual.indices).toEqual(expected.indices);
  });

  it('reads declarative attributes while parser-created parts upgrade', async () => {
    fixture = document.createElement('div');
    const errors: CustomEvent<SceneErrorDetail>[] = [];
    fixture.addEventListener('nve-scene-error', event => errors.push(event));
    document.body.append(fixture);
    fixture.innerHTML = `<nve-scene-model>
      <nve-scene-part
        shape="cylinder"
        position="[-0.7,-0.77,0.34]"
        orientation="[0.7071,0,0,0.7071]"
        scale="[0.68,0.68,0.24]"
        color="#343946"
      ></nve-scene-part>
    </nve-scene-model>`;
    const model = fixture.querySelector(SceneModel.metadata.tag) as SceneModel;
    await elementIsStable(model);

    expect(errors.filter(event => event.detail.code === PART_SHAPE)).toEqual([]);
    expect(takeModelLayerRenderData(model).positions).toEqual(
      compileParts([
        {
          shape: 'cylinder',
          position: [-0.7, -0.77, 0.34],
          orientation: [0.7071, 0, 0, 0.7071],
          scale: [0.68, 0.68, 0.24],
          color: '#343946'
        }
      ]).positions
    );
  });

  it('should restore default part vectors when their attributes are removed', async () => {
    fixture = await createFixture(html`<nve-scene-model><nve-scene-part></nve-scene-part></nve-scene-model>`);
    const model = fixture.querySelector(SceneModel.metadata.tag) as SceneModel;
    const part = model.querySelector('nve-scene-part') as HTMLElement;

    part.setAttribute('position', '[1,2,3]');
    part.setAttribute('orientation', '[0,0,1,0]');
    part.setAttribute('scale', '[2,3,4]');
    await elementIsStable(model);
    part.removeAttribute('position');
    part.removeAttribute('orientation');
    part.removeAttribute('scale');
    await elementIsStable(model);

    expect(takeModelLayerRenderData(model).positions).toEqual(compileParts([{ shape: 'cube' }]).positions);
  });

  it('selects direct geometry without warnings while keeping children and instance sources live', async () => {
    fixture = await createFixture(html`<nve-scene-model><nve-scene-part></nve-scene-part></nve-scene-model>`);
    const model = fixture.querySelector(SceneModel.metadata.tag) as SceneModel;
    model.source = new MarkerBuffer({ records: [{}] });
    const warnings: CustomEvent<SceneErrorDetail>[] = [];
    model.addEventListener('nve-scene-error', event => warnings.push(event));
    const parts: ModelPart[] = [{ shape: 'sphere' }];

    model.geometry = parts;
    model.geometry = parts;
    await elementIsStable(model);
    const dualSource = () => warnings.filter(event => event.detail.code === MODEL_DUAL_SOURCE);
    expect(dualSource()).toHaveLength(0);
    expect(takeModelLayerRenderData(model).positions).toEqual(compileParts(parts).positions);
    expect(takeMarkerLayerRenderData(model)).toMatchObject({ count: 1, ready: true });

    model.querySelector('nve-scene-part')?.remove();
    await elementIsStable(model);
    expect(takeMarkerLayerRenderData(model)).toMatchObject({ count: 1, ready: true });
    model.append(document.createElement('nve-scene-part'));
    await elementIsStable(model);
    expect(dualSource()).toHaveLength(0);
  });

  it('snapshots bulk parts until the caller reassigns the source', async () => {
    fixture = await createFixture(
      html`<nve-scene-model><nve-scene-part shape="sphere"></nve-scene-part></nve-scene-model>`
    );
    const model = fixture.querySelector(SceneModel.metadata.tag) as SceneModel;
    const color: RGBA = [1, 0, 0, 1];
    const orientation: Quaternion = [0, 0, 0, 1];
    const position: Vec3 = [0, 0, 0];
    const scale: Vec3 = [1, 1, 1];
    const parts: ModelPart[] = [{ color, orientation, position, scale, shape: 'cube' }];
    model.geometry = parts;
    await elementIsStable(model);
    const before = takeModelLayerRenderData(model);
    const expected = {
      colors: before.colors?.slice(),
      indices: before.indices?.slice(),
      normals: before.normals?.slice(),
      positions: before.positions?.slice()
    };

    position.splice(0, 1, 3);
    color.splice(0, 1, 0);
    orientation.splice(2, 1, 1);
    scale.splice(1, 1, 2);
    expect(takeModelLayerRenderData(model)).toMatchObject(expected);
    model.geometry = parts;
    await elementIsStable(model);
    expect(takeModelLayerRenderData(model).positions).toEqual(compileParts(parts).positions);

    model.geometry = null;
    await elementIsStable(model);
    expect(takeModelLayerRenderData(model).positions).toEqual(compileParts([{ shape: 'sphere' }]).positions);
  });

  it('keeps an empty bulk source authoritative across child edits and reconnects until cleared', async () => {
    fixture = await createFixture(html`<nve-scene-model><nve-scene-part></nve-scene-part></nve-scene-model>`);
    const model = fixture.querySelector(SceneModel.metadata.tag) as SceneModel;
    const part = model.querySelector(ScenePart.metadata.tag) as ScenePart;
    const parts: ModelPart[] = [];
    model.geometry = parts;
    part.position = [1, 2, 3];
    await elementIsStable(model);
    expect(takeModelLayerRenderData(model)).toMatchObject({ positions: new Float32Array(), ready: false });

    model.remove();
    fixture.append(model);
    await elementIsStable(model);
    expect(model.geometry).toBe(parts);
    expect(takeModelLayerRenderData(model)).toMatchObject({ positions: new Float32Array(), ready: false });

    model.geometry = null;
    await elementIsStable(model);
    expect(takeModelLayerRenderData(model)).toMatchObject({
      positions: compileParts([{ position: [1, 2, 3], shape: 'cube' }]).positions,
      ready: true
    });
  });

  it.each<readonly ModelPart[] | null>([null, [{ shape: 'pyramid' }]])(
    'preserves the accepted %j source when a bulk assignment fails',
    async parts => {
      fixture = await createFixture(html`<nve-scene-model><nve-scene-part></nve-scene-part></nve-scene-model>`);
      const model = fixture.querySelector(SceneModel.metadata.tag) as SceneModel;
      const part = model.querySelector(ScenePart.metadata.tag) as ScenePart;
      model.geometry = parts;
      await elementIsStable(model);
      const before = takeModelLayerRenderData(model);
      const accepted = model.geometry;

      expect(() => {
        model.geometry = [{ scale: [1, 0, 1], shape: 'cube' }];
      }).toThrow(RangeError);
      expect(model.geometry).toBe(accepted);
      expect(takeModelLayerRenderData(model)).toMatchObject({ positions: before.positions, ready: before.ready });

      part.position = [1, 2, 3];
      await elementIsStable(model);
      const expected: readonly ModelPart[] = parts ?? [{ position: [1, 2, 3], shape: 'cube' }];
      expect(takeModelLayerRenderData(model).positions).toEqual(compileParts(expected).positions);
    }
  );

  it('skips invalid declarative parts once per error episode and recovers their siblings', async () => {
    fixture = await createFixture(
      html`<nve-scene-model><nve-scene-part shape="cube"></nve-scene-part><nve-scene-part shape="cube"></nve-scene-part></nve-scene-model>`
    );
    const model = fixture.querySelector(SceneModel.metadata.tag) as SceneModel;
    const bad = model.querySelectorAll('nve-scene-part')[1] as HTMLElement;
    const errors: CustomEvent<SceneErrorDetail>[] = [];
    model.addEventListener('nve-scene-error', event => errors.push(event));

    bad.setAttribute('scale', '[0,1,1]');
    await elementIsStable(bad);
    bad.setAttribute('scale', '[1,2]');
    await elementIsStable(bad);
    const partErrors = () => errors.filter(event => event.detail.code === PART_SHAPE);
    expect(partErrors()).toHaveLength(1);
    expect(partErrors()[0]).toMatchObject({
      bubbles: true,
      cancelable: false,
      composed: true,
      detail: { code: PART_SHAPE, element: bad, severity: 'error' }
    });
    expect(takeModelLayerRenderData(model).positions).toEqual(compileParts([{ shape: 'cube' }]).positions);

    bad.setAttribute('scale', '[1,1,1]');
    await elementIsStable(bad);
    bad.setAttribute('shape', 'also-nope');
    await elementIsStable(bad);
    expect(partErrors()).toHaveLength(2);
    bad.setAttribute('shape', 'sphere');
    await elementIsStable(bad);
    expect(takeModelLayerRenderData(model).positions?.length).toBeGreaterThan(
      compileParts([{ shape: 'cube' }]).positions.length
    );

    bad.setAttribute('color', 'not-a-color');
    await elementIsStable(bad);
    expect(partErrors()).toHaveLength(3);
    bad.setAttribute('color', '#ffffff');
    await elementIsStable(bad);
  });

  it('keeps orphan parts silent and becomes inert for other direct children', async () => {
    fixture = await createFixture(html`<nve-scene-model><nve-scene-part></nve-scene-part></nve-scene-model>`);
    const model = fixture.querySelector(SceneModel.metadata.tag) as SceneModel;
    const errors: CustomEvent<SceneErrorDetail>[] = [];
    model.addEventListener('nve-scene-error', event => errors.push(event));
    const orphan = document.createElement('nve-scene-part');
    const orphanErrors: CustomEvent<SceneErrorDetail>[] = [];
    orphan.addEventListener('nve-scene-error', event => orphanErrors.push(event));
    document.body.append(orphan);
    await elementIsStable(orphan);
    orphan.remove();
    expect(orphanErrors).toEqual([]);

    model.append(document.createElement('span'));
    await elementIsStable(model);
    expect(takeModelLayerRenderData(model).geometryError).toBe(true);
    expect(errors.at(-1)?.detail.message).toBe('Scene models allow only direct scene part children.');
  });

  it('exposes declarative geometry and preserves assigned hierarchy without exposing renderer arrays', async () => {
    fixture = await createFixture(
      html`<nve-scene-model><nve-scene-part shape="cylinder" position="[1,2,3]"></nve-scene-part></nve-scene-model>`
    );
    const model = fixture.querySelector(SceneModel.metadata.tag) as SceneModel;
    await elementIsStable(model);
    expect(model.geometry).toMatchObject([{ shape: 'cylinder', position: [1, 2, 3] }]);
    const positions = new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]);
    const nodes = [{ name: 'arm', children: [{ name: 'arm', geometry: { positions } }] }];
    model.geometry = nodes;
    expect(model.geometry).toBe(nodes);
    expect(takeModelLayerRenderData(model).positions).not.toBe(positions);
    positions[0] = 4;
    expect(takeModelLayerRenderData(model).positions?.[0]).toBe(0);
    model.geometry = nodes;
    expect(takeModelLayerRenderData(model).positions?.[0]).toBe(4);
    model.geometry = null;
    expect(fixture.querySelector<SceneModel>(SceneModel.metadata.tag)?.geometry?.[0]?.shape).toBe('cylinder');
    expect('parts' in model).toBe(false);
  });

  it('updates tint without recompiling node colors, UVs, geometry, or instance placement', async () => {
    fixture = await createFixture(html`<nve-scene-model></nve-scene-model>`);
    const model = fixture.querySelector(SceneModel.metadata.tag) as SceneModel;
    model.geometry = [
      {
        color: '#ff0000',
        geometry: {
          positions: new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]),
          uvs: new Float32Array([0, 0, 1, 0, 0, 1])
        }
      }
    ];
    const markers = new MarkerBuffer({ records: [{}] });
    model.source = markers;
    const before = takeModelLayerRenderData(model);
    expect(before.color).toEqual([1, 1, 1, 1]);
    model.setAttribute('tint', '#808080');
    await elementIsStable(model);
    const after = takeModelLayerRenderData(model);
    expect(after.color).toEqual([128 / 255, 128 / 255, 128 / 255, 1]);
    expect(after.positions).toBe(before.positions);
    expect(after.colors).toBe(before.colors);
    expect(after.uvs).toBe(before.uvs);
    expect(after.topologyVersion).toBe(before.topologyVersion);
    expect(model.source).toBe(markers);
    model.removeAttribute('tint');
    await elementIsStable(model);
    expect(model.tint).toBe('#ffffff');
    expect(takeModelLayerRenderData(model).color).toEqual([1, 1, 1, 1]);
  });

  it('loads declarative URLs, exposes decoded geometry, and restores children when the asset clears', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>().mockImplementation(async () => new Response(ASCII_STL))
    );
    fixture = await createFixture(
      html`<nve-scene-model asset="/arm.stl"><nve-scene-part shape="sphere"></nve-scene-part></nve-scene-model>`
    );
    const model = fixture.querySelector(SceneModel.metadata.tag) as SceneModel;
    await model.loadComplete;
    expect(model.asset).toBe('/arm.stl');
    expect(model.geometry?.[0]?.geometry?.positions).toEqual(new Float32Array([0, 0, 0, 2, 0, 0, 0, 3, 0]));
    expect(model.querySelector('nve-scene-part')).not.toBeNull();
    model.asset = '';
    await elementIsStable(model);
    expect(model.hasAttribute('asset')).toBe(false);
    expect(model.geometry?.[0]?.shape).toBe('sphere');
  });

  it('waits for connection and restarts loading when an explicit format changes', async () => {
    const fetchModel = vi.fn<typeof fetch>().mockImplementation(async () => new Response(ASCII_STL));
    vi.stubGlobal('fetch', fetchModel);
    fixture = await createFixture(html`<div></div>`);
    const model = document.createElement('nve-scene-model');
    model.asset = '/download';
    model.format = 'stl';
    expect(fetchModel).not.toHaveBeenCalled();
    fixture.append(model);
    await model.loadComplete;
    expect(fetchModel).toHaveBeenCalledTimes(1);
    model.format = undefined;
    await expect(model.loadComplete).rejects.toThrow(TypeError);
    expect(model.geometry).toBeNull();
    model.format = 'stl';
    await model.loadComplete;
    expect(fetchModel).toHaveBeenCalledTimes(2);
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
    fixture = await createFixture(html`<nve-scene-model><nve-scene-part></nve-scene-part></nve-scene-model>`);
    const model = fixture.querySelector(SceneModel.metadata.tag) as SceneModel;
    model.source = new MarkerBuffer({ records: [{}] });
    model.asset = '/first.stl';
    const first = model.loadComplete;
    expect(model.geometry).toBeNull();
    model.asset = '/second.stl';
    await expect(first).rejects.toMatchObject({ name: 'AbortError' });
    expect(pending[0]?.signal?.aborted).toBe(true);
    pending[1]?.resolve(new Response(ASCII_STL));
    await model.loadComplete;
    const accepted = model.geometry;
    pending[0]?.resolve(new Response(ASCII_STL.replace('vertex 2', 'vertex 9')));
    await elementIsStable(model);
    expect(model.geometry).toBe(accepted);
    model.asset = '/third.stl';
    const third = model.loadComplete;
    model.geometry = [];
    await expect(third).rejects.toMatchObject({ name: 'AbortError' });
    await elementIsStable(model);
    expect(model.asset).toBe('');
    expect(model.hasAttribute('asset')).toBe(false);
    expect(model.geometry).toEqual([]);
    expect(takeMarkerLayerRenderData(model).count).toBe(1);
    model.geometry = null;
    expect(fixture.querySelector<SceneModel>(SceneModel.metadata.tag)?.geometry?.[0]?.shape).toBe('cube');
  });

  it('cancels pending loads on disconnection and retries on reconnection', async () => {
    const pending: ((response: Response) => void)[] = [];
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>().mockImplementation(() => new Promise(resolve => pending.push(resolve)))
    );
    fixture = await createFixture(html`<nve-scene-model></nve-scene-model>`);
    const model = fixture.querySelector(SceneModel.metadata.tag) as SceneModel;
    model.asset = '/arm.stl';
    const first = model.loadComplete;
    model.remove();
    await expect(first).rejects.toMatchObject({ name: 'AbortError' });
    fixture.append(model);
    pending[1]?.(new Response(ASCII_STL));
    await model.loadComplete;
    expect(model.geometry?.[0]?.geometry).toBeDefined();
    pending[0]?.(new Response(ASCII_STL));
    await elementIsStable(model);
  });

  it('reports file failures locally and recovers when direct geometry selects another input', async () => {
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockResolvedValue(new Response('missing', { status: 404 })));
    fixture = await createFixture(html`<nve-scene-model></nve-scene-model>`);
    const model = fixture.querySelector(SceneModel.metadata.tag) as SceneModel;
    const errors: CustomEvent<SceneErrorDetail>[] = [];
    model.addEventListener('nve-scene-error', event => errors.push(event));
    model.asset = '/missing.stl';
    await expect(model.loadComplete).rejects.toThrow('404');
    expect(errors.at(-1)?.detail).toMatchObject({ code: MODEL_ASSET, element: model, severity: 'error' });
    expect(model.geometry).toBeNull();
    expect(takeModelLayerRenderData(model)).toMatchObject({ ready: false, geometryError: true });
    model.geometry = [{ shape: 'cube' }];
    expect(takeModelLayerRenderData(model)).toMatchObject({ ready: true, geometryError: false });
  });
});
