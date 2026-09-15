// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { registerHeightfieldLayer } from '../heightfield/layer-state.js';
import { POINT, LINE_VERTEX, TRIANGLE_VERTEX } from '../layouts/built-ins.js';
import { registerLabelLayer } from '../labels/layer-state.js';
import { LineVertexBuffer } from '../lines/buffer.js';
import { registerMarkerLayer } from '../markers/layer-state.js';
import { registerMeshLayer } from '../mesh/layer-state.js';
import { registerModelLayer } from '../model/layer-state.js';
import { registerPolygonLayer } from '../polygon/layer-state.js';
import { publishStreamingLayer, registerStreamingLayer, setStreamingLayerSource } from '../streaming-layer-state.js';
import { publishSceneFeatureIds, registerSceneFeatureIdSource, resolveSceneFeatureId } from '../feature-ids.js';
import { PointBuffer } from '../points/buffer.js';
import { TriangleVertexBuffer } from '../triangles/buffer.js';
import {
  createSceneLayerRenderItem,
  isTechnicallyPickableLayer,
  resolveSceneLayer,
  type SceneLayerKind
} from './layer-record.js';

describe('resolveSceneLayer', () => {
  it.each([
    ['nve-scene-labels', 'label'],
    ['nve-scene-points', 'point'],
    ['nve-scene-triangles', 'triangle'],
    ['nve-scene-lines', 'line']
  ] as const)('keeps an unregistered %s stream closed as a pending %s record', (tag, kind) => {
    const layer = createUnregisteredElement(tag);

    expect(resolveSceneLayer(layer)).toEqual({ kind, layer, status: 'pending' });
  });

  it('ignores elements outside the Scene layer vocabulary', () => {
    expect(resolveSceneLayer(document.createElement('div'))).toBeUndefined();
  });

  it.each([
    ['nve-scene-labels', 'label', 'label'],
    ['nve-scene-cones', 'marker', 'marker'],
    ['nve-scene-cubes', 'marker', 'marker'],
    ['nve-scene-cylinders', 'marker', 'marker'],
    ['nve-scene-pyramids', 'marker', 'marker'],
    ['nve-scene-spheres', 'marker', 'marker'],
    ['nve-scene-axes', 'line', 'line'],
    ['nve-scene-gridlines', 'line', 'line'],
    ['nve-scene-lines', 'line', 'line'],
    ['nve-scene-points', 'point', 'point'],
    ['nve-scene-triangles', 'triangle', 'triangle'],
    ['nve-scene-mesh', 'mesh', 'mesh'],
    ['nve-scene-model', 'model', 'mesh'],
    ['nve-scene-polygon', 'polygon', 'mesh'],
    ['nve-scene-heightfield', 'heightfield', 'mesh']
  ] as const)('resolves and builds the registered %s family', (tag, kind, renderType) => {
    const layer = document.createElement(tag);
    registerLayer(layer, kind);
    const record = resolveSceneLayer(layer);

    expect(record).toEqual(expect.objectContaining({ kind, layer, status: 'registered' }));
    if (!record || record.status !== 'registered') throw new Error('The layer must resolve as registered.');
    expect(isTechnicallyPickableLayer(record)).toBe(true);
    expect(createSceneLayerRenderItem(record)).toEqual(expect.objectContaining({ layer, type: renderType }));
  });

  it('captures source feature identity only at publication boundaries', () => {
    const layer = document.createElement('nve-scene-points');
    registerStreamingLayer(layer, { kind: 'point', layout: POINT });
    const source = new PointBuffer({ capacity: 1 });
    const point = source.add({ featureId: 1842 });
    setStreamingLayerSource(layer, source);
    const record = resolveSceneLayer(layer);
    if (!record || record.status !== 'registered') throw new Error('The point layer must resolve as registered.');

    const item = createSceneLayerRenderItem(record);
    expect(item?.type).toBe('point');
    expect(resolveSceneFeatureId(item?.featureIds, 0)).toBe(1842);

    point.featureId = 2710;
    expect(resolveSceneFeatureId(createSceneLayerRenderItem(record)?.featureIds, 0)).toBe(1842);
    publishStreamingLayer(layer);
    expect(resolveSceneFeatureId(createSceneLayerRenderItem(record)?.featureIds, 0)).toBe(2710);
  });

  it('reuses one published identity snapshot across layers sharing a source', () => {
    const source = new PointBuffer({ capacity: 1 });
    source.add();
    source.featureIds = new Uint32Array([1842]);
    const layers = [document.createElement('nve-scene-points'), document.createElement('nve-scene-points')];
    layers.forEach(layer => {
      registerStreamingLayer(layer, { kind: 'point', layout: POINT });
      setStreamingLayerSource(layer, source);
    });
    const items = layers.map(layer => {
      const record = resolveSceneLayer(layer);
      if (!record) throw new Error('Expected a registered point layer.');
      return createSceneLayerRenderItem(record);
    });

    expect(items[0]?.featureIds).toBe(items[1]?.featureIds);
  });

  it.each([
    ['strip', 4, 3],
    ['loop', 3, 3],
    ['segments', 4, 2]
  ] as const)('maps %s line identities by logical segment', (topology, vertexCount, segmentCount) => {
    const layer = document.createElement('nve-scene-lines');
    registerStreamingLayer(layer, { kind: 'line', layout: LINE_VERTEX, topology });
    const source = new LineVertexBuffer({ capacity: vertexCount });
    for (let index = 0; index < vertexCount; index += 1) source.add({ position: [index, 0, 0] });
    source.featureIds = Uint32Array.from({ length: segmentCount }, (_, index) => 1842 + index);
    setStreamingLayerSource(layer, source);
    const record = resolveSceneLayer(layer);
    if (!record) throw new Error('Expected a registered line layer.');

    const item = createSceneLayerRenderItem(record);

    expect(Array.from({ length: segmentCount }, (_, index) => resolveSceneFeatureId(item?.featureIds, index))).toEqual(
      Array.from({ length: segmentCount }, (_, index) => 1842 + index)
    );
  });

  it('maps triangle identities by logical triangle', () => {
    const layer = document.createElement('nve-scene-triangles');
    registerStreamingLayer(layer, { kind: 'triangle', layout: TRIANGLE_VERTEX });
    const source = new TriangleVertexBuffer({ capacity: 6 });
    for (let index = 0; index < 6; index += 1) source.add({ position: [index, 0, 0] });
    source.featureIds = new Uint32Array([1842, 2710]);
    setStreamingLayerSource(layer, source);
    const record = resolveSceneLayer(layer);
    if (!record) throw new Error('Expected a registered triangle layer.');

    const item = createSceneLayerRenderItem(record);

    expect([0, 1].map(index => resolveSceneFeatureId(item?.featureIds, index))).toEqual([1842, 2710]);
  });
});

function createUnregisteredElement(tag: string): HTMLElement {
  const parsed = new DOMParser().parseFromString(`<${tag}></${tag}>`, 'text/html');
  const layer = parsed.body.firstElementChild;
  if (!(layer instanceof HTMLElement)) throw new Error('The layer fixture must be an HTML element.');
  return layer;
}

function registerLayer(layer: HTMLElement, kind: SceneLayerKind): void {
  if (kind === 'label') {
    registerLabelLayer(layer);
    return;
  }
  if (kind === 'marker') {
    registerMarkerLayer(layer, 'cube');
    return;
  }
  if (kind === 'point') {
    registerStreamingLayer(layer, { kind, layout: POINT });
    return;
  }
  if (kind === 'line') {
    registerStreamingLayer(layer, { kind, layout: LINE_VERTEX });
    return;
  }
  if (kind === 'triangle') {
    registerStreamingLayer(layer, { kind, layout: TRIANGLE_VERTEX });
    return;
  }
  if (kind === 'mesh') {
    registerMarkerLayer(layer, 'cube');
    registerElementIdentity(layer);
    registerMeshLayer(layer);
    return;
  }
  if (kind === 'model') {
    registerMarkerLayer(layer, 'cube');
    registerElementIdentity(layer);
    registerModelLayer(layer);
    return;
  }
  if (kind === 'polygon') {
    registerMarkerLayer(layer, 'cube');
    registerElementIdentity(layer);
    registerPolygonLayer(layer, [1, 1, 1, 1]);
    return;
  }
  registerElementIdentity(layer);
  registerHeightfieldLayer(layer, [1, 1, 1, 1]);
}

function registerElementIdentity(layer: HTMLElement): void {
  registerSceneFeatureIdSource(layer, 1);
  publishSceneFeatureIds(layer);
}
