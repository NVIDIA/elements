// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, describe, expect, expectTypeOf, it } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { LAYER_CHILD, POLYGON_GEOMETRY } from '../errors.js';
import { MarkerBuffer } from '../internal/markers/buffer.js';
import { takeMarkerLayerRenderData } from '../internal/markers/layer-state.js';
import {
  getPolygonLayerGeometry,
  getPolygonLayerTopologyVersion,
  getPolygonLayerVersion,
  isPolygonLayerRegistered,
  takePolygonLayerRenderData
} from '../internal/polygon/layer-state.js';
import type { PolygonGeometry } from '../internal/polygon/types.js';
import { ScenePolygon } from './polygon.js';
import './define.js';

const square: PolygonGeometry = {
  outer: [
    [-2, -2],
    [2, -2],
    [2, 2],
    [-2, 2]
  ]
};

describe(ScenePolygon.metadata.tag, () => {
  let fixture: HTMLElement | undefined;

  afterEach(() => {
    if (fixture) removeFixture(fixture);
    fixture = undefined;
  });

  it('should expose the public geometry, color, layout, and registration contracts', () => {
    const polygon = new ScenePolygon();
    expect(isPolygonLayerRegistered(polygon)).toBe(true);
    expect(ScenePolygon.layout.name).toBe('nve.marker');
    expect(polygon.color).toBe('#ffffff');
    expect(polygon.geometry).toBeUndefined();
    expectTypeOf<ScenePolygon['geometry']>().toEqualTypeOf<PolygonGeometry | undefined>();
  });

  it('should snapshot assignments immediately and recompile the same object after edits', () => {
    const polygon = new ScenePolygon();
    const geometry = {
      outer: [
        [0, 0],
        [2, 0],
        [2, 2],
        [0, 2]
      ]
    } as PolygonGeometry;
    polygon.geometry = geometry;
    const snapshot = getPolygonLayerGeometry(polygon);
    const version = getPolygonLayerVersion(polygon);
    (geometry.outer[1] as [number, number])[0] = 3;
    expect(getPolygonLayerGeometry(polygon)).toEqual(snapshot);
    polygon.geometry = geometry;
    expect(getPolygonLayerGeometry(polygon)?.outer[1]).toEqual([3, 0]);
    expect(getPolygonLayerVersion(polygon)).toBeGreaterThan(version);
  });

  it('should compile indexed local xy geometry with positive z normals and unlit identity rendering', () => {
    const polygon = new ScenePolygon();
    polygon.geometry = square;
    const render = takePolygonLayerRenderData(polygon);
    expect(render).toMatchObject({ identityInstance: true, ready: true, shading: 'unlit', transparent: false });
    expect(render.indices?.length).toBe(6);
    expect([...render.positions!].filter((_, index) => index % 3 === 2)).toEqual([0, 0, 0, 0]);
    expect([...render.normals!].filter((_, index) => index % 3 === 2)).toEqual([1, 1, 1, 1]);
  });

  it('should preserve topology for coordinate-only recompiles and replace changed topology', () => {
    const polygon = new ScenePolygon();
    polygon.geometry = square;
    const initial = getPolygonLayerTopologyVersion(polygon);
    polygon.geometry = {
      outer: [
        [-3, -3],
        [3, -3],
        [3, 3],
        [-3, 3]
      ]
    };
    expect(getPolygonLayerTopologyVersion(polygon)).toBe(initial);
    polygon.geometry = {
      outer: [
        [-3, -3],
        [3, -3],
        [3, 3],
        [0, 1],
        [-3, 3]
      ]
    };
    expect(getPolygonLayerTopologyVersion(polygon)).toBeGreaterThan(initial);
  });

  it('should propagate base and marker alpha while supporting buffers, counts, and commits', () => {
    const polygon = new ScenePolygon();
    const markers = new MarkerBuffer({ capacity: 2 });
    const first = markers.add({ color: 'rgb(255 0 0 / 50%)' });
    markers.add({ color: 'cyan' });
    polygon.geometry = square;
    polygon.color = 'rgb(0 255 0 / 40%)';
    polygon.instances = markers;
    polygon.count = 1;
    expect(takePolygonLayerRenderData(polygon)).toMatchObject({ identityInstance: false, transparent: true });
    expect(takeMarkerLayerRenderData(polygon)).toMatchObject({ count: 1, ready: true, transparent: true });
    first.position.x = 2;
    polygon.commit(0, 1);
    expect(takeMarkerLayerRenderData(polygon).uploadRanges).toEqual([{ offset: 0, size: ScenePolygon.layout.stride }]);
  });

  it('should parse declarative geometry and marker children', async () => {
    fixture = await createFixture(html`
      <nve-scene-polygon color="white" geometry='{"outer":[[0,0],[2,0],[2,2],[0,2]]}'>
        <nve-scene-marker position="[1,2,3]" color="magenta"></nve-scene-marker>
      </nve-scene-polygon>
    `);
    const polygon = fixture.querySelector(ScenePolygon.metadata.tag) as ScenePolygon;
    await elementIsStable(polygon);
    await new Promise<void>(resolve => queueMicrotask(() => resolve()));
    expect(polygon.geometry?.outer).toHaveLength(4);
    expect(takeMarkerLayerRenderData(polygon)).toMatchObject({ count: 1, ready: true });
    expect(takePolygonLayerRenderData(polygon).identityInstance).toBe(false);
  });

  it('should emit one recoverable diagnostic episode and render nothing for invalid geometry', async () => {
    fixture = await createFixture(html`<nve-scene-polygon></nve-scene-polygon>`);
    const polygon = fixture.querySelector(ScenePolygon.metadata.tag) as ScenePolygon;
    const events: CustomEvent[] = [];
    polygon.addEventListener('nve-scene-error', event => events.push(event as CustomEvent));
    polygon.geometry = {
      outer: [
        [0, 0],
        [2, 2],
        [0, 2],
        [2, 0]
      ]
    };
    polygon.geometry = {
      outer: [
        [0, 0],
        [2, 2],
        [0, 2],
        [2, 0]
      ]
    };
    expect(takePolygonLayerRenderData(polygon)).toMatchObject({ geometryError: true, ready: false });
    expect(events.filter(event => event.detail.code === POLYGON_GEOMETRY)).toHaveLength(1);
    expect(events[0]).toMatchObject({ bubbles: true, cancelable: false, composed: true });
    polygon.geometry = square;
    polygon.geometry = {
      outer: [
        [0, 0],
        [2, 2],
        [0, 2],
        [2, 0]
      ]
    };
    expect(events.filter(event => event.detail.code === POLYGON_GEOMETRY)).toHaveLength(2);
  });

  it('should clear geometry with null or undefined and normalize invalid colors', () => {
    const polygon = new ScenePolygon();
    polygon.geometry = square;
    polygon.geometry = null;
    expect(takePolygonLayerRenderData(polygon).ready).toBe(false);
    polygon.geometry = square;
    polygon.geometry = undefined;
    expect(takePolygonLayerRenderData(polygon).ready).toBe(false);
    polygon.color = 'not-a-color';
    expect(polygon.color).toBe('#ffffff');
    expect(takePolygonLayerRenderData(polygon).color).toEqual([1, 1, 1, 1]);
  });

  it('should reject non-marker children and recover after their removal', async () => {
    fixture = await createFixture(
      html`<nve-scene-polygon geometry='{"outer":[[0,0],[2,0],[2,2],[0,2]]}'></nve-scene-polygon>`
    );
    const polygon = fixture.querySelector(ScenePolygon.metadata.tag) as ScenePolygon;
    const codes: string[] = [];
    polygon.addEventListener('nve-scene-error', event => codes.push((event as CustomEvent).detail.code));
    polygon.append(document.createElement('span'));
    await new Promise<void>(resolve => queueMicrotask(() => resolve()));
    expect(takeMarkerLayerRenderData(polygon).ready).toBe(false);
    expect(codes).toContain(LAYER_CHILD);
    polygon.replaceChildren();
    await elementIsStable(polygon);
    await new Promise<void>(resolve => queueMicrotask(() => resolve()));
    expect(takePolygonLayerRenderData(polygon)).toMatchObject({ identityInstance: true, ready: true });
  });
});
