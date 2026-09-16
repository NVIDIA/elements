// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, describe, expect, it } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { MODEL_DUAL_SOURCE, PART_SHAPE } from '../errors.js';
import { takeMarkerLayerRenderData } from '../internal/markers/layer-state.js';
import { getModelLayerTopologyVersion, takeModelLayerRenderData } from '../internal/model/layer-state.js';
import type { Quaternion, RGBA, Vec3 } from '../internal/types.js';
import type { SceneErrorDetail } from '../scene/scene.js';
import { compileParts, type ModelPart } from '../internal/model/compile.js';
import { MarkerBuffer } from '../internal/markers/buffer.js';
import { SceneModel } from './model.js';
import { ScenePart } from './part.js';
import './define.js';

describe(SceneModel.metadata.tag, () => {
  let fixture: HTMLElement | undefined;
  afterEach(() => fixture && removeFixture(fixture));

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
    fixture.addEventListener('nve-scene-error', event => errors.push(event as CustomEvent<SceneErrorDetail>));
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

  it('warns once per geometry dual-source episode while keeping instance sources live', async () => {
    fixture = await createFixture(html`<nve-scene-model><nve-scene-part></nve-scene-part></nve-scene-model>`);
    const model = fixture.querySelector(SceneModel.metadata.tag) as SceneModel;
    model.source = new MarkerBuffer({ records: [{}] });
    const warnings: CustomEvent<SceneErrorDetail>[] = [];
    model.addEventListener('nve-scene-error', event => warnings.push(event as CustomEvent<SceneErrorDetail>));
    const parts: ModelPart[] = [{ shape: 'sphere' }];

    model.parts = parts;
    model.parts = parts;
    await elementIsStable(model);
    const dualSource = () => warnings.filter(event => event.detail.code === MODEL_DUAL_SOURCE);
    expect(dualSource()).toHaveLength(1);
    expect(dualSource()[0]).toMatchObject({
      bubbles: true,
      cancelable: false,
      composed: true,
      detail: { code: MODEL_DUAL_SOURCE, element: model, severity: 'warning' }
    });
    expect(takeModelLayerRenderData(model).positions).toEqual(compileParts(parts).positions);
    expect(takeMarkerLayerRenderData(model)).toMatchObject({ count: 1, ready: true });

    model.querySelector('nve-scene-part')?.remove();
    await elementIsStable(model);
    expect(takeMarkerLayerRenderData(model)).toMatchObject({ count: 1, ready: true });
    model.append(document.createElement('nve-scene-part'));
    await elementIsStable(model);
    expect(dualSource()).toHaveLength(2);
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
    model.parts = parts;
    await elementIsStable(model);
    const before = takeModelLayerRenderData(model).positions;

    position.splice(0, 1, 3);
    color.splice(0, 1, 0);
    orientation.splice(2, 1, 1);
    scale.splice(1, 1, 2);
    expect(takeModelLayerRenderData(model).positions).toEqual(before);
    model.parts = parts;
    await elementIsStable(model);
    expect(takeModelLayerRenderData(model).positions).toEqual(compileParts(parts).positions);

    model.parts = null;
    await elementIsStable(model);
    expect(takeModelLayerRenderData(model).positions).toEqual(compileParts([{ shape: 'sphere' }]).positions);
  });

  it('skips invalid declarative parts once per error episode and recovers their siblings', async () => {
    fixture = await createFixture(
      html`<nve-scene-model><nve-scene-part shape="cube"></nve-scene-part><nve-scene-part shape="cube"></nve-scene-part></nve-scene-model>`
    );
    const model = fixture.querySelector(SceneModel.metadata.tag) as SceneModel;
    const bad = model.querySelectorAll('nve-scene-part')[1] as HTMLElement;
    const errors: CustomEvent<SceneErrorDetail>[] = [];
    model.addEventListener('nve-scene-error', event => errors.push(event as CustomEvent<SceneErrorDetail>));

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
    model.addEventListener('nve-scene-error', event => errors.push(event as CustomEvent<SceneErrorDetail>));
    const orphan = document.createElement('nve-scene-part');
    const orphanErrors: CustomEvent<SceneErrorDetail>[] = [];
    orphan.addEventListener('nve-scene-error', event => orphanErrors.push(event as CustomEvent<SceneErrorDetail>));
    document.body.append(orphan);
    await elementIsStable(orphan);
    orphan.remove();
    expect(orphanErrors).toEqual([]);

    model.append(document.createElement('span'));
    await elementIsStable(model);
    expect(takeModelLayerRenderData(model).geometryError).toBe(true);
    expect(errors.at(-1)?.detail.message).toBe('Scene models allow only direct scene part children.');
  });
});
