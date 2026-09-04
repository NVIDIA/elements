// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, describe, expect, it } from 'vitest';
import { createFixture, elementIsStable, removeFixture, required } from '@internals/testing';
import { LINE_VERTEX, LineVertexBuffer } from '@nvidia-elements/scene';
import { SceneLines } from './lines.js';
import './define.js';
describe(SceneLines.metadata.tag, () => {
  let fixture: HTMLElement | undefined;
  afterEach(() => fixture && removeFixture(fixture));

  it('exposes vertices, count, commit, and line options', async () => {
    fixture = await createFixture(html`<nve-scene-lines topology="loop"></nve-scene-lines>`);
    const layer = required(fixture.querySelector<SceneLines>(SceneLines.metadata.tag), 'Expected lines fixture.');
    await elementIsStable(layer);
    const vertices = new LineVertexBuffer({ capacity: 3 });
    vertices.add({ position: [0, 0, 0] });
    vertices.add({ position: [1, 0, 0] });
    vertices.add({ position: [0, 1, 0] });
    expect(SceneLines.layout).toBe(LINE_VERTEX);
    expect(layer?.topology).toBe('loop');
    expect(layer?.widthUnit).toBe('world');
    if (!layer) throw new Error('Expected line layer.');
    layer.vertices = vertices;
    layer.count = 3;
    expect(layer.instances).toBe(vertices);
    expect(layer.vertices).toBe(vertices);
    expect(() => layer.commit()).not.toThrow();
    layer.vertices = null;
    expect(layer.vertices).toBeNull();
    expect(() => layer.commit()).not.toThrow();
    layer.vertices = vertices;
    layer.count = 3;
    expect(() => (layer.count = 4)).toThrow(RangeError);
    expect(layer.count).toBe(3);
  });

  it('normalizes invalid topology and width-unit values', async () => {
    fixture = await createFixture(html`<nve-scene-lines></nve-scene-lines>`);
    const layer = required(fixture.querySelector<SceneLines>(SceneLines.metadata.tag), 'Expected lines fixture.');
    layer.setAttribute('topology', 'invalid');
    layer.setAttribute('width-unit', 'invalid');
    await elementIsStable(layer);
    expect(layer?.topology).toBe('strip');
    expect(layer?.widthUnit).toBe('world');
    if (!layer) throw new Error('Expected line layer.');
    layer.topology = 'segments';
    layer.widthUnit = 'pixel';
    await elementIsStable(layer);
    expect(layer.topology).toBe('segments');
    expect(layer.widthUnit).toBe('pixel');
    layer.setAttribute('topology', 'unknown');
    layer.setAttribute('width-unit', 'unknown');
    await elementIsStable(layer);
    expect(layer.topology).toBe('strip');
    expect(layer.widthUnit).toBe('world');
  });

  it('supports incrementally filling a preallocated vertex buffer without invalid-value diagnostics', async () => {
    fixture = await createFixture(html`<nve-scene-lines></nve-scene-lines>`);
    const layer = required(fixture.querySelector<SceneLines>(SceneLines.metadata.tag), 'Expected lines fixture.');
    await elementIsStable(layer);
    if (!layer) throw new Error('Expected line layer.');
    const errors: string[] = [];
    layer.addEventListener('nve-scene-error', event =>
      errors.push((event as CustomEvent<{ code: string }>).detail.code)
    );
    const vertices = new LineVertexBuffer({ capacity: 3 });

    layer.count = 0;
    layer.vertices = vertices;
    vertices.add({ position: [0, 0, 0] });
    layer.commit(0, 1);
    layer.count = 1;

    expect(errors).toEqual([]);
  });
});
