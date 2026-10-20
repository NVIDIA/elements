// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, describe, expect, it } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { BODY_DUAL_SOURCE, SHAPE_KIND } from '../internal/diagnostics/errors.js';
import { takeMarkerLayerRenderData } from '../internal/layers/markers/layer-state.js';
import { getBodyLayerTopologyVersion, takeBodyLayerRenderData } from '../internal/layers/body/layer-state.js';
import type { Quaternion, Vec3 } from '../internal/math/types.js';
import type { RGBA } from '../internal/color/types.js';
import type { SceneErrorDetail } from '../scene/scene.js';
import { compileShapes, type BodyShape } from '../internal/layers/body/compile.js';
import { MarkerBuffer } from '../internal/layers/markers/buffer.js';
import { SceneBody } from './body.js';
import { SceneShape } from './shape.js';
import './define.js';

describe(SceneBody.metadata.tag, () => {
  let fixture: HTMLElement | undefined;
  afterEach(() => {
    if (fixture) removeFixture(fixture);
  });

  it('compiles declarative shapes exactly once for each same-task attribute or property edit', async () => {
    fixture = await createFixture(html`<nve-scene-body><nve-scene-shape></nve-scene-shape></nve-scene-body>`);
    const body = fixture.querySelector(SceneBody.metadata.tag) as SceneBody;
    await elementIsStable(body);
    const first = getBodyLayerTopologyVersion(body);
    expect(takeBodyLayerRenderData(body)).toMatchObject({ identityInstance: true, ready: true });
    const shape = body.querySelector(SceneShape.metadata.tag) as SceneShape;
    shape.setAttribute('position', '[1,0,0]');
    shape.setAttribute('scale', '[2,2,2]');
    shape.setAttribute('color', 'rgb(0 255 0)');
    expect(getBodyLayerTopologyVersion(body)).toBe(first + 3);
    await elementIsStable(body);
    expect(getBodyLayerTopologyVersion(body)).toBe(first + 3);
    const second = getBodyLayerTopologyVersion(body);
    shape.scale = [2, 2, 2];
    await elementIsStable(body);
    expect(getBodyLayerTopologyVersion(body)).toBe(second);
    shape.orientation = [0, 0, 1, 0];
    expect(getBodyLayerTopologyVersion(body)).toBe(second + 1);
    await elementIsStable(body);
    expect(getBodyLayerTopologyVersion(body)).toBe(second + 1);
  });

  it('exposes the complete compiled declarative planar geometry', async () => {
    fixture = await createFixture(
      html`<nve-scene-body>
        <nve-scene-shape kind="cone" position="[1,2,3]" orientation="[0,0,1,0]" scale="[2,3,4]" color="#4080c0"></nve-scene-shape>
      </nve-scene-body>`
    );
    const body = fixture.querySelector(SceneBody.metadata.tag) as SceneBody;
    await elementIsStable(body);
    const expected = compileShapes([
      {
        color: [64 / 255, 128 / 255, 192 / 255, 1],
        position: [1, 2, 3],
        orientation: [0, 0, 1, 0],
        scale: [2, 3, 4],
        kind: 'cone'
      }
    ]);
    const actual = takeBodyLayerRenderData(body);

    expect(actual.positions).toEqual(expected.positions);
    expect(actual.normals).toEqual(expected.normals);
    expect(actual.colors).toEqual(expected.colors);
    expect(actual.indices).toEqual(expected.indices);
  });

  it('reads declarative attributes while parser-created shapes upgrade', async () => {
    fixture = document.createElement('div');
    const errors: CustomEvent<SceneErrorDetail>[] = [];
    fixture.addEventListener('nve-scene-error', event => errors.push(event));
    document.body.append(fixture);
    fixture.innerHTML = `<nve-scene-body>
      <nve-scene-shape
        kind="cylinder"
        position="[-0.7,-0.77,0.34]"
        orientation="[0.7071,0,0,0.7071]"
        scale="[0.68,0.68,0.24]"
        color="#343946"
      ></nve-scene-shape>
    </nve-scene-body>`;
    const body = fixture.querySelector(SceneBody.metadata.tag) as SceneBody;
    await elementIsStable(body);

    expect(errors.filter(event => event.detail.code === SHAPE_KIND)).toEqual([]);
    expect(takeBodyLayerRenderData(body).positions).toEqual(
      compileShapes([
        {
          kind: 'cylinder',
          position: [-0.7, -0.77, 0.34],
          orientation: [0.7071, 0, 0, 0.7071],
          scale: [0.68, 0.68, 0.24],
          color: '#343946'
        }
      ]).positions
    );
  });

  it('should restore default shape vectors when their attributes are removed', async () => {
    fixture = await createFixture(html`<nve-scene-body><nve-scene-shape></nve-scene-shape></nve-scene-body>`);
    const body = fixture.querySelector(SceneBody.metadata.tag) as SceneBody;
    const shape = body.querySelector('nve-scene-shape') as HTMLElement;

    shape.setAttribute('position', '[1,2,3]');
    shape.setAttribute('orientation', '[0,0,1,0]');
    shape.setAttribute('scale', '[2,3,4]');
    await elementIsStable(body);
    shape.removeAttribute('position');
    shape.removeAttribute('orientation');
    shape.removeAttribute('scale');
    await elementIsStable(body);

    expect(takeBodyLayerRenderData(body).positions).toEqual(compileShapes([{ kind: 'cube' }]).positions);
  });

  it('selects direct geometry without warnings while keeping children and instance sources live', async () => {
    fixture = await createFixture(html`<nve-scene-body><nve-scene-shape></nve-scene-shape></nve-scene-body>`);
    const body = fixture.querySelector(SceneBody.metadata.tag) as SceneBody;
    body.source = new MarkerBuffer({ records: [{}] });
    const warnings: CustomEvent<SceneErrorDetail>[] = [];
    body.addEventListener('nve-scene-error', event => warnings.push(event));
    const shapes: BodyShape[] = [{ kind: 'sphere' }];

    body.geometry = shapes;
    body.geometry = shapes;
    await elementIsStable(body);
    const dualSource = () => warnings.filter(event => event.detail.code === BODY_DUAL_SOURCE);
    expect(dualSource()).toHaveLength(0);
    expect(takeBodyLayerRenderData(body).positions).toEqual(compileShapes(shapes).positions);
    expect(takeMarkerLayerRenderData(body)).toMatchObject({ count: 1, ready: true });

    body.querySelector('nve-scene-shape')?.remove();
    await elementIsStable(body);
    expect(takeMarkerLayerRenderData(body)).toMatchObject({ count: 1, ready: true });
    body.append(document.createElement('nve-scene-shape'));
    await elementIsStable(body);
    expect(dualSource()).toHaveLength(0);
  });

  it('snapshots bulk shapes until the caller reassigns the source', async () => {
    fixture = await createFixture(
      html`<nve-scene-body><nve-scene-shape kind="sphere"></nve-scene-shape></nve-scene-body>`
    );
    const body = fixture.querySelector(SceneBody.metadata.tag) as SceneBody;
    const color: RGBA = [1, 0, 0, 1];
    const orientation: Quaternion = [0, 0, 0, 1];
    const position: Vec3 = [0, 0, 0];
    const scale: Vec3 = [1, 1, 1];
    const shapes: BodyShape[] = [{ color, orientation, position, scale, kind: 'cube' }];
    body.geometry = shapes;
    await elementIsStable(body);
    const before = takeBodyLayerRenderData(body);
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
    expect(takeBodyLayerRenderData(body)).toMatchObject(expected);
    body.geometry = shapes;
    await elementIsStable(body);
    expect(takeBodyLayerRenderData(body).positions).toEqual(compileShapes(shapes).positions);

    body.geometry = null;
    await elementIsStable(body);
    expect(takeBodyLayerRenderData(body).positions).toEqual(compileShapes([{ kind: 'sphere' }]).positions);
  });

  it('keeps an empty bulk source authoritative across child edits and reconnects until cleared', async () => {
    fixture = await createFixture(html`<nve-scene-body><nve-scene-shape></nve-scene-shape></nve-scene-body>`);
    const body = fixture.querySelector(SceneBody.metadata.tag) as SceneBody;
    const shape = body.querySelector(SceneShape.metadata.tag) as SceneShape;
    const shapes: BodyShape[] = [];
    body.geometry = shapes;
    shape.position = [1, 2, 3];
    await elementIsStable(body);
    expect(takeBodyLayerRenderData(body)).toMatchObject({ positions: new Float32Array(), ready: false });

    body.remove();
    fixture.append(body);
    await elementIsStable(body);
    expect(body.geometry).toBe(shapes);
    expect(takeBodyLayerRenderData(body)).toMatchObject({ positions: new Float32Array(), ready: false });

    body.geometry = null;
    await elementIsStable(body);
    expect(takeBodyLayerRenderData(body)).toMatchObject({
      positions: compileShapes([{ position: [1, 2, 3], kind: 'cube' }]).positions,
      ready: true
    });
  });

  it.each<readonly BodyShape[] | null>([null, [{ kind: 'pyramid' }]])(
    'preserves the accepted %j source when a bulk assignment fails',
    async shapes => {
      fixture = await createFixture(html`<nve-scene-body><nve-scene-shape></nve-scene-shape></nve-scene-body>`);
      const body = fixture.querySelector(SceneBody.metadata.tag) as SceneBody;
      const shape = body.querySelector(SceneShape.metadata.tag) as SceneShape;
      body.geometry = shapes;
      await elementIsStable(body);
      const before = takeBodyLayerRenderData(body);
      const accepted = body.geometry;

      expect(() => {
        body.geometry = [{ scale: [1, 0, 1], kind: 'cube' }];
      }).toThrow(RangeError);
      expect(body.geometry).toBe(accepted);
      expect(takeBodyLayerRenderData(body)).toMatchObject({ positions: before.positions, ready: before.ready });

      shape.position = [1, 2, 3];
      await elementIsStable(body);
      const expected: readonly BodyShape[] = shapes ?? [{ position: [1, 2, 3], kind: 'cube' }];
      expect(takeBodyLayerRenderData(body).positions).toEqual(compileShapes(expected).positions);
    }
  );

  it('skips invalid declarative shapes once per error episode and recovers their siblings', async () => {
    fixture = await createFixture(
      html`<nve-scene-body><nve-scene-shape kind="cube"></nve-scene-shape><nve-scene-shape kind="cube"></nve-scene-shape></nve-scene-body>`
    );
    const body = fixture.querySelector(SceneBody.metadata.tag) as SceneBody;
    const bad = body.querySelectorAll('nve-scene-shape')[1] as HTMLElement;
    const errors: CustomEvent<SceneErrorDetail>[] = [];
    body.addEventListener('nve-scene-error', event => errors.push(event));

    bad.setAttribute('scale', '[0,1,1]');
    await elementIsStable(bad);
    bad.setAttribute('scale', '[1,2]');
    await elementIsStable(bad);
    const shapeErrors = () => errors.filter(event => event.detail.code === SHAPE_KIND);
    expect(shapeErrors()).toHaveLength(1);
    expect(shapeErrors()[0]).toMatchObject({
      bubbles: true,
      cancelable: false,
      composed: true,
      detail: { code: SHAPE_KIND, element: bad, severity: 'error' }
    });
    expect(takeBodyLayerRenderData(body).positions).toEqual(compileShapes([{ kind: 'cube' }]).positions);

    bad.setAttribute('scale', '[1,1,1]');
    await elementIsStable(bad);
    bad.setAttribute('kind', 'also-nope');
    await elementIsStable(bad);
    expect(shapeErrors()).toHaveLength(2);
    bad.setAttribute('kind', 'sphere');
    await elementIsStable(bad);
    expect(takeBodyLayerRenderData(body).positions?.length).toBeGreaterThan(
      compileShapes([{ kind: 'cube' }]).positions.length
    );

    bad.setAttribute('color', 'not-a-color');
    await elementIsStable(bad);
    expect(shapeErrors()).toHaveLength(3);
    bad.setAttribute('color', '#ffffff');
    await elementIsStable(bad);
  });

  it('keeps orphan shapes silent and becomes inert for other direct children', async () => {
    fixture = await createFixture(html`<nve-scene-body><nve-scene-shape></nve-scene-shape></nve-scene-body>`);
    const body = fixture.querySelector(SceneBody.metadata.tag) as SceneBody;
    const errors: CustomEvent<SceneErrorDetail>[] = [];
    body.addEventListener('nve-scene-error', event => errors.push(event));
    const orphan = document.createElement('nve-scene-shape');
    const orphanErrors: CustomEvent<SceneErrorDetail>[] = [];
    orphan.addEventListener('nve-scene-error', event => orphanErrors.push(event));
    document.body.append(orphan);
    await elementIsStable(orphan);
    orphan.remove();
    expect(orphanErrors).toEqual([]);

    body.append(document.createElement('span'));
    await elementIsStable(body);
    expect(takeBodyLayerRenderData(body).geometryError).toBe(true);
    expect(errors.at(-1)?.detail.message).toBe('Scene bodies allow only direct scene shape children.');
  });

  it('exposes declarative geometry and preserves assigned hierarchy without exposing renderer arrays', async () => {
    fixture = await createFixture(
      html`<nve-scene-body><nve-scene-shape kind="cylinder" position="[1,2,3]"></nve-scene-shape></nve-scene-body>`
    );
    const body = fixture.querySelector(SceneBody.metadata.tag) as SceneBody;
    await elementIsStable(body);
    expect(body.geometry).toMatchObject([{ kind: 'cylinder', position: [1, 2, 3] }]);
    const positions = new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]);
    const nodes = [{ name: 'arm', children: [{ name: 'arm', geometry: { positions } }] }];
    body.geometry = nodes;
    expect(body.geometry).toBe(nodes);
    expect(takeBodyLayerRenderData(body).positions).not.toBe(positions);
    positions[0] = 4;
    expect(takeBodyLayerRenderData(body).positions?.[0]).toBe(0);
    body.geometry = nodes;
    expect(takeBodyLayerRenderData(body).positions?.[0]).toBe(4);
    body.geometry = null;
    expect(fixture.querySelector<SceneBody>(SceneBody.metadata.tag)?.geometry?.[0]?.kind).toBe('cylinder');
    expect('shapes' in body).toBe(false);
  });

  it('updates tint without recompiling node colors, UVs, geometry, or instance placement', async () => {
    fixture = await createFixture(html`<nve-scene-body></nve-scene-body>`);
    const body = fixture.querySelector(SceneBody.metadata.tag) as SceneBody;
    body.geometry = [
      {
        color: '#ff0000',
        geometry: {
          positions: new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]),
          uvs: new Float32Array([0, 0, 1, 0, 0, 1])
        }
      }
    ];
    const markers = new MarkerBuffer({ records: [{}] });
    body.source = markers;
    const before = takeBodyLayerRenderData(body);
    expect(before.color).toEqual([1, 1, 1, 1]);
    body.setAttribute('tint', '#808080');
    await elementIsStable(body);
    const after = takeBodyLayerRenderData(body);
    expect(after.color).toEqual([128 / 255, 128 / 255, 128 / 255, 1]);
    expect(after.positions).toBe(before.positions);
    expect(after.colors).toBe(before.colors);
    expect(after.uvs).toBe(before.uvs);
    expect(after.topologyVersion).toBe(before.topologyVersion);
    expect(body.source).toBe(markers);
    body.removeAttribute('tint');
    await elementIsStable(body);
    expect(body.tint).toBe('#ffffff');
    expect(takeBodyLayerRenderData(body).color).toEqual([1, 1, 1, 1]);
  });
});
