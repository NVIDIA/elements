// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, describe, expect, it } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { LINE_VERTEX, writeLineVertex } from '@nvidia-elements/scene';
import { SceneLines } from './lines.js';
import './define.js';
describe(SceneLines.metadata.tag, () => {
  let fixture: HTMLElement | undefined;
  afterEach(() => fixture && removeFixture(fixture));

  it('exposes vertices, count, commit, and line options', async () => {
    fixture = await createFixture(html`<nve-scene-lines topology="loop"></nve-scene-lines>`);
    const layer = fixture.querySelector<SceneLines>(SceneLines.metadata.tag);
    await elementIsStable(layer);
    const bytes = new Uint8Array(LINE_VERTEX.stride * 3);
    writeLineVertex(bytes, 0, { position: [0, 0, 0] });
    writeLineVertex(bytes, 1, { position: [1, 0, 0] });
    writeLineVertex(bytes, 2, { position: [0, 1, 0] });
    expect(SceneLines.layout).toBe(LINE_VERTEX);
    expect(layer?.topology).toBe('loop');
    expect(layer?.widthUnit).toBe('world');
    if (!layer) throw new Error('Expected line layer.');
    layer.vertices = bytes;
    layer.count = 3;
    expect(layer.instances).toBe(bytes);
    expect(layer.vertices).toBe(bytes);
    expect(() => layer.commit()).not.toThrow();
    layer.vertices = null;
    expect(layer.vertices).toBeNull();
    expect(() => layer.commit()).not.toThrow();
    layer.vertices = bytes;
    layer.count = 3;
    expect(() => (layer.count = 4)).toThrow(RangeError);
    expect(layer.count).toBe(3);
  });

  it('normalizes invalid topology and width-unit values', async () => {
    fixture = await createFixture(html`<nve-scene-lines topology="invalid" width-unit="invalid"></nve-scene-lines>`);
    const layer = fixture.querySelector<SceneLines>(SceneLines.metadata.tag);
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
    const layer = fixture.querySelector<SceneLines>(SceneLines.metadata.tag);
    await elementIsStable(layer);
    if (!layer) throw new Error('Expected line layer.');
    const errors: string[] = [];
    layer.addEventListener('nve-scene-error', event =>
      errors.push((event as CustomEvent<{ code: string }>).detail.code)
    );
    const bytes = new Uint8Array(LINE_VERTEX.stride * 3);

    layer.count = 0;
    layer.vertices = bytes;
    writeLineVertex(bytes, 0, { position: [0, 0, 0] });
    layer.commit(0, 1);
    layer.count = 1;

    expect(errors).toEqual([]);
  });
});
