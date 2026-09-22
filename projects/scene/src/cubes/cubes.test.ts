// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createFixture, elementIsStable, removeFixture, required } from '@internals/testing';
import { MARKER } from '@nvidia-elements/scene';
import { CubeBuffer, SceneCubes } from './cubes.js';
import { MarkerBuffer } from '../internal/markers/buffer.js';
import { createMarkerSource } from '../internal/external-record-sources.js';
import { SphereBuffer } from '../internal/markers/semantic-buffer.js';
import { MarkerLayerElement } from '../internal/markers/layer-element.js';
import './define.js';

class ThrowingMarkerLayer extends MarkerLayerElement<CubeBuffer, object> {
  constructor() {
    super('cube', {
      create: () => {
        // eslint-disable-next-line @typescript-eslint/only-throw-error -- Verifies defensive handling of foreign adapters.
        throw 'non-error failure';
      },
      kind: 'cube'
    });
  }
}

customElements.define('test-throwing-marker-layer', ThrowingMarkerLayer);

describe(SceneCubes.metadata.tag, () => {
  let fixture: HTMLElement | undefined;

  afterEach(() => fixture && removeFixture(fixture));

  it('should resolve JSON and matching buffer sources', async () => {
    fixture = await createFixture(html`
      <nve-scene-cubes source='[{"position":[0,0,0]}]'></nve-scene-cubes>
    `);
    const layer = required(fixture.querySelector<SceneCubes>(SceneCubes.metadata.tag), 'Expected cubes fixture.');
    await elementIsStable(layer);

    expect(customElements.get(SceneCubes.metadata.tag)).toBe(SceneCubes);
    expect(SceneCubes.layout).toBe(MARKER);
    expect(layer.source).toBeInstanceOf(CubeBuffer);
    expect(layer.interactive).toBe(false);

    layer.setAttribute('interactive', 'false');
    await elementIsStable(layer);
    expect(layer.interactive).toBe(true);
    layer.interactive = false;
    await elementIsStable(layer);
    expect(layer.interactive).toBe(false);
    expect(layer.hasAttribute('interactive')).toBe(true);
    layer.removeAttribute('interactive');

    const records = new CubeBuffer({ capacity: 1 });
    const record = records.add({ featureId: 1842, position: [1, 2, 3] });
    expect(record.featureId).toBe(1842);
    layer.source = records;
    layer.countLimit = 1;
    expect(layer.source).toBe(records);
    expect(layer.countLimit).toBe(1);
    expect(() => layer.publish({ count: 1, start: 0 })).not.toThrow();
  });

  it('rejects arrays and mismatched local buffers while accepting external marker sources', async () => {
    fixture = await createFixture(html`<nve-scene-cubes></nve-scene-cubes>`);
    const layer = required(fixture.querySelector<SceneCubes>(SceneCubes.metadata.tag), 'Expected cubes fixture.');
    const generic = new MarkerBuffer({ records: [{}] });
    const external = createMarkerSource({ bytes: generic.mutableBytes, count: generic.count });

    expect(() => Reflect.set(layer, 'source', [])).toThrow(TypeError);
    expect(() => Reflect.set(layer, 'source', generic)).toThrow(TypeError);
    expect(() => Reflect.set(layer, 'source', new SphereBuffer({ records: [{}] }))).toThrow(TypeError);
    layer.source = external;
    expect(layer.source).toBe(external);
  });

  it('reports malformed attributes, recovers atomically, and clears on removal', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    fixture = await createFixture(html`<nve-scene-cubes></nve-scene-cubes>`);
    const layer = required(fixture.querySelector<SceneCubes>(SceneCubes.metadata.tag), 'Expected cubes fixture.');
    const diagnostics: CustomEvent[] = [];
    layer.addEventListener('nve-scene-error', event => diagnostics.push(event as CustomEvent));

    layer.setAttribute('source', '{}');
    expect(layer.source).toBeNull();
    layer.setAttribute('source', 'not json');
    expect(layer.source).toBeNull();
    layer.setAttribute('source', '[{"position":[1,2,3]}]');
    expect(layer.source).toBeInstanceOf(CubeBuffer);
    expect((layer.source as CubeBuffer).at(0).position.toArray()).toEqual([1, 2, 3]);
    layer.removeAttribute('source');
    expect(layer.source).toBeNull();
    expect(error).toHaveBeenCalledOnce();
    expect(diagnostics).toHaveLength(1);
  });

  it('does not reflect property-assigned buffers into the source attribute', async () => {
    fixture = await createFixture(html`<nve-scene-cubes></nve-scene-cubes>`);
    const layer = required(fixture.querySelector<SceneCubes>(SceneCubes.metadata.tag), 'Expected cubes fixture.');
    layer.source = new CubeBuffer({ records: [{}] });
    await elementIsStable(layer);
    expect(layer.hasAttribute('source')).toBe(false);
  });

  it('reports non-error failures from a source adapter', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    fixture = await createFixture(html`<test-throwing-marker-layer></test-throwing-marker-layer>`);
    const layer = required(
      fixture.querySelector<ThrowingMarkerLayer>('test-throwing-marker-layer'),
      'Expected throwing marker layer.'
    );
    layer.setAttribute('source', '[]');
    expect(layer.source).toBeNull();
    expect(error).toHaveBeenCalledOnce();
  });
});
