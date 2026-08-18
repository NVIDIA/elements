// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0
import { html } from 'lit';
import { afterEach, describe, expect, it } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { TRI_VERTEX, writeTriVertex } from '@nvidia-elements/scene';
import { TRIANGLES_COUNT } from '../errors.js';
import type { SceneErrorDetail } from '../scene/scene.js';
import { takeStreamingLayerRenderData } from '../internal/streaming-layer-state.js';
import { SceneTriangles } from './triangles.js';
import './define.js';
describe(SceneTriangles.metadata.tag, () => {
  let fixture: HTMLElement | undefined;
  afterEach(() => fixture && removeFixture(fixture));
  it('exposes the vertex stream contract', async () => {
    fixture = await createFixture(html`<nve-scene-triangles></nve-scene-triangles>`);
    const layer = fixture.querySelector<SceneTriangles>(SceneTriangles.metadata.tag);
    await elementIsStable(layer);
    const bytes = new Uint8Array(TRI_VERTEX.stride * 3);
    writeTriVertex(bytes, 0, { position: [0, 0, 0] });
    writeTriVertex(bytes, 1, { position: [1, 0, 0] });
    writeTriVertex(bytes, 2, { position: [0, 1, 0] });
    expect(SceneTriangles.layout).toBe(TRI_VERTEX);
    if (!layer) throw new Error('Expected triangle layer.');
    layer.vertices = bytes;
    layer.count = 3;
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

  it('reports and recovers from a non-triangular count', async () => {
    fixture = await createFixture(html`<nve-scene-triangles></nve-scene-triangles>`);
    const layer = fixture.querySelector<SceneTriangles>(SceneTriangles.metadata.tag);
    if (!layer) throw new Error('Expected triangle layer.');
    const errors: SceneErrorDetail[] = [];
    layer.addEventListener('nve-scene-error', event => errors.push((event as CustomEvent<SceneErrorDetail>).detail));
    const bytes = new Uint8Array(TRI_VERTEX.stride * 3);
    writeTriVertex(bytes, 0, { position: [0, 0, 0] });
    writeTriVertex(bytes, 1, { position: [1, 0, 0] });
    writeTriVertex(bytes, 2, { position: [0, 1, 0] });
    layer.vertices = bytes;
    layer.count = 1;
    expect(errors.at(-1)).toMatchObject({ code: TRIANGLES_COUNT, severity: 'error', element: layer });
    layer.count = 3;
    expect(errors.filter(error => error.code === TRIANGLES_COUNT)).toHaveLength(1);
    expect(takeStreamingLayerRenderData(layer).ready).toBe(true);
  });
});
