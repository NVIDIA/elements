// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { registerHeightfieldLayer } from '../heightfield/layer-state.js';
import { POINT, LINE_VERTEX, TRIANGLE_VERTEX } from '../layouts/built-ins.js';
import { registerLabelLayer } from '../labels/layer-state.js';
import { registerMarkerLayer } from '../markers/layer-state.js';
import { registerMeshLayer } from '../mesh/layer-state.js';
import { registerModelLayer } from '../model/layer-state.js';
import { registerPolygonLayer } from '../polygon/layer-state.js';
import { registerStreamingLayer } from '../streaming-layer-state.js';
import { registerSceneFeatureIdLayer, resolveSceneFeatureId, setSceneFeatureIds } from '../feature-ids.js';
import {
  createSceneLayerRenderItem,
  isTechnicallyPickableLayer,
  resolveSceneLayer,
  trackSceneLayerChanges,
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
  ] as const)('resolves, tracks, and builds the registered %s family', (tag, kind, renderType) => {
    const layer = document.createElement(tag);
    registerLayer(layer, kind);
    const record = resolveSceneLayer(layer);

    expect(record).toEqual(expect.objectContaining({ kind, layer, status: 'registered' }));
    if (!record || record.status !== 'registered') throw new Error('The layer must resolve as registered.');
    expect(isTechnicallyPickableLayer(record)).toBe(true);
    expect(trackSceneLayerChanges(record)).toBe(true);
    expect(trackSceneLayerChanges(record)).toBe(false);
    expect(createSceneLayerRenderItem(record)).toEqual(expect.objectContaining({ layer, type: renderType }));
  });

  it('tracks feature identity independently and captures it with render items', () => {
    const layer = document.createElement('nve-scene-points');
    registerStreamingLayer(layer, { kind: 'point', layout: POINT });
    registerSceneFeatureIdLayer(layer);
    setSceneFeatureIds(layer, new Uint32Array([1842]));
    const record = resolveSceneLayer(layer);
    if (!record || record.status !== 'registered') throw new Error('The point layer must resolve as registered.');

    expect(trackSceneLayerChanges(record)).toBe(true);
    expect(trackSceneLayerChanges(record)).toBe(false);
    const item = createSceneLayerRenderItem(record);
    expect(item?.type).toBe('point');
    expect(resolveSceneFeatureId(item?.featureIds, 0)).toBe(1842);

    setSceneFeatureIds(layer, 2710);
    expect(trackSceneLayerChanges(record)).toBe(true);
    expect(trackSceneLayerChanges(record)).toBe(false);
    expect(resolveSceneFeatureId(createSceneLayerRenderItem(record)?.featureIds, 0)).toBe(2710);
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
    registerMeshLayer(layer);
    return;
  }
  if (kind === 'model') {
    registerMarkerLayer(layer, 'cube');
    registerModelLayer(layer);
    return;
  }
  if (kind === 'polygon') {
    registerMarkerLayer(layer, 'cube');
    registerPolygonLayer(layer, [1, 1, 1, 1]);
    return;
  }
  registerHeightfieldLayer(layer, [1, 1, 1, 1]);
}
