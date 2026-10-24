// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { MESH_PART, MESH_PROPERTY_INACTIVE } from '../internal/diagnostics/errors.js';
import { takeBodyLayerRenderData } from '../internal/layers/body/layer-state.js';
import { resolveSceneLayer } from '../internal/composition/scene/layer-record.js';
import { scenePlatform, restoreScenePlatform } from '../internal/gpu/platform.js';
import { PREPARATION_CHUNK_SIZE } from '../internal/rendering/preparation.js';
import type { SceneErrorDetail } from '../scene/scene.js';
import type { SceneMesh } from '../mesh/mesh.js';
import { SceneBody } from './body.js';
import './define.js';
import '../mesh/define.js';

const ASCII_STL =
  'solid triangle\nfacet normal 0 0 1\nouter loop\nvertex 0 0 0\nvertex 2 0 0\nvertex 0 3 0\nendloop\nendfacet\nendsolid triangle\n';
const TRIANGLE = new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]);

describe(`${SceneBody.metadata.tag} mesh parts`, () => {
  let fixture: HTMLElement | undefined;
  afterEach(() => {
    if (fixture) removeFixture(fixture);
    fixture = undefined;
    vi.unstubAllGlobals();
    restoreScenePlatform();
  });

  it('compiles loaded mesh children with their transforms and colors after the body load completes', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>().mockImplementation(async () => new Response(ASCII_STL))
    );
    fixture = await createFixture(html`
      <nve-scene-body>
        <nve-scene-shape type="sphere"></nve-scene-shape>
        <nve-scene-mesh src="/arm.stl" position="[0,0,1]" scale="[2,2,2]" color="#ff0000"></nve-scene-mesh>
      </nve-scene-body>
    `);
    const body = fixture.querySelector(SceneBody.metadata.tag) as SceneBody;
    const mesh = body.querySelector<SceneMesh>('nve-scene-mesh')!;
    await body.loadComplete;
    await elementIsStable(mesh);
    await elementIsStable(body);
    expect(body.geometry).toHaveLength(2);
    expect(body.geometry?.[0]?.type).toBe('sphere');
    expect(body.geometry?.[1]).toMatchObject({ color: [1, 0, 0, 1], position: [0, 0, 1], scale: [2, 2, 2] });
    expect(body.geometry?.[1]?.geometry?.positions).toEqual(new Float32Array([0, 0, 0, 2, 0, 0, 0, 3, 0]));
    expect(takeBodyLayerRenderData(body)).toMatchObject({ ready: true, geometryError: false });
    expect(resolveSceneLayer(mesh)).toBeUndefined();
    expect(resolveSceneLayer(body)).toMatchObject({ kind: 'body', status: 'registered' });
  });

  it('recompiles the body when a mesh part changes and releases the mesh when it leaves', async () => {
    fixture = await createFixture(html`<nve-scene-body><nve-scene-mesh></nve-scene-mesh></nve-scene-body>`);
    const body = fixture.querySelector(SceneBody.metadata.tag) as SceneBody;
    const mesh = body.querySelector<SceneMesh>('nve-scene-mesh')!;
    expect(body.geometry).toEqual([]);
    mesh.geometry = { positions: TRIANGLE };
    await elementIsStable(mesh);
    expect(body.geometry?.[0]?.geometry?.positions).toEqual(TRIANGLE);
    mesh.position = [3, 0, 0];
    mesh.color = '#00ff00';
    await elementIsStable(mesh);
    expect(body.geometry?.[0]).toMatchObject({ color: [0, 1, 0, 1], position: [3, 0, 0] });
    fixture.append(mesh);
    await vi.waitFor(() => expect(body.geometry).toEqual([]));
    expect(resolveSceneLayer(mesh)).toMatchObject({ kind: 'mesh' });
  });

  it('keeps the ready body until a large mesh publication finishes copying', async () => {
    scenePlatform.yieldForPreparation = async () => undefined;
    fixture = await createFixture(html`<nve-scene-body><nve-scene-mesh></nve-scene-mesh></nve-scene-body>`);
    const body = fixture.querySelector(SceneBody.metadata.tag) as SceneBody;
    const mesh = body.querySelector<SceneMesh>('nve-scene-mesh')!;
    const positions = new Float32Array(Math.ceil((PREPARATION_CHUNK_SIZE * 2) / 9) * 9);
    mesh.geometry = { positions, normals: new Float32Array(positions.length) };
    await mesh.loadComplete;
    await elementIsStable(mesh);
    await body.loadComplete;
    const before = takeBodyLayerRenderData(body);
    positions[0] = 4;
    mesh.publishGeometry({ attribute: 'positions', count: 1 });
    expect(takeBodyLayerRenderData(body).positions).toBe(before.positions);
    await vi.waitFor(() => expect(takeBodyLayerRenderData(body).positions?.[0]).toBe(4));
    expect(before.positions?.[0]).toBe(0);
  });

  it('resolves body loading after every mesh part and rejects when one fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn<typeof fetch>()
        .mockImplementation(async url =>
          (url instanceof Request ? url.url : url.toString()).includes('missing')
            ? new Response('missing', { status: 404 })
            : new Response(ASCII_STL)
        )
    );
    fixture = await createFixture(html`
      <nve-scene-body>
        <nve-scene-mesh src="/a.stl"></nve-scene-mesh>
        <nve-scene-mesh src="/missing.stl"></nve-scene-mesh>
      </nve-scene-body>
    `);
    const body = fixture.querySelector(SceneBody.metadata.tag) as SceneBody;
    await expect(body.loadComplete).rejects.toThrow('404');
    body.querySelector('nve-scene-mesh[src="/missing.stl"]')!.remove();
    await expect(body.loadComplete).resolves.toBeUndefined();
    await vi.waitFor(() => expect(body.geometry).toHaveLength(1));
  });

  it('reports invalid part transforms and keeps the remaining parts', async () => {
    fixture = await createFixture(html`
      <nve-scene-body>
        <nve-scene-shape></nve-scene-shape>
        <nve-scene-mesh></nve-scene-mesh>
      </nve-scene-body>
    `);
    const body = fixture.querySelector(SceneBody.metadata.tag) as SceneBody;
    const mesh = body.querySelector<SceneMesh>('nve-scene-mesh')!;
    const errors: SceneErrorDetail[] = [];
    fixture.addEventListener('nve-scene-error', event => errors.push(event.detail));
    mesh.geometry = { positions: TRIANGLE };
    await elementIsStable(mesh);
    expect(body.geometry).toHaveLength(2);
    mesh.scale = [0, 1, 1];
    await elementIsStable(mesh);
    expect(errors).toContainEqual(expect.objectContaining({ code: MESH_PART, element: mesh, severity: 'error' }));
    expect(body.geometry).toHaveLength(1);
    expect(takeBodyLayerRenderData(body).geometryError).toBe(false);
    mesh.scale = [1, 1, 1];
    await elementIsStable(mesh);
    expect(body.geometry).toHaveLength(2);
  });

  it('warns when properties do not apply to where the mesh is', async () => {
    fixture = await createFixture(html`
      <nve-scene-body><nve-scene-mesh feature-id="4"></nve-scene-mesh></nve-scene-body>
      <nve-scene-mesh id="standalone"></nve-scene-mesh>
    `);
    const part = fixture.querySelector<SceneMesh>('nve-scene-body nve-scene-mesh')!;
    const standalone = fixture.querySelector<SceneMesh>('#standalone')!;
    const warnings: SceneErrorDetail[] = [];
    fixture.addEventListener('nve-scene-error', event => warnings.push(event.detail));
    standalone.position = [1, 0, 0];
    await elementIsStable(standalone);
    expect(warnings).toContainEqual(
      expect.objectContaining({ code: MESH_PROPERTY_INACTIVE, element: standalone, severity: 'warning' })
    );
    part.interactive = true;
    await elementIsStable(part);
    standalone.position = [0, 0, 0];
    part.featureId = undefined;
    part.interactive = false;
    await elementIsStable(part);
    await elementIsStable(standalone);
    const count = warnings.length;
    standalone.scale = [2, 2, 2];
    part.interactive = true;
    await elementIsStable(part);
    await elementIsStable(standalone);
    expect(warnings.slice(count).map(warning => warning.element)).toEqual([standalone, part]);
  });
});
