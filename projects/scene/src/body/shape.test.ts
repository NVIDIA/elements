// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0
import { html } from 'lit';
import { afterEach, describe, expect, it } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import type { SceneShape } from './shape.js';
import type { SceneBody } from './body.js';
import './define.js';
import { getBodyLayerTopologyVersion } from '../internal/layers/body/layer-state.js';

let fixture: HTMLElement;
afterEach(() => {
  if (fixture) removeFixture(fixture);
});
describe('scene shape declarations', () => {
  it('updates its owning body synchronously and skips equivalent vectors', async () => {
    fixture = await createFixture(
      html`<nve-scene-body><nve-scene-shape position="[1,2,3]"></nve-scene-shape></nve-scene-body>`
    );
    const shape = fixture.querySelector<SceneShape>('nve-scene-shape')!;
    const body = fixture.querySelector<SceneBody>('nve-scene-body')!;
    await elementIsStable(shape);
    await elementIsStable(body);
    const topology = getBodyLayerTopologyVersion(body);
    shape.position = [1, 2, 3];
    expect(getBodyLayerTopologyVersion(body)).toBe(topology);
    shape.position = [4, 5, 6];
    expect(body.geometry?.[0]?.position).toEqual([4, 5, 6]);
    shape.removeAttribute('position');
    await elementIsStable(shape);
    expect(shape.position).toEqual([0, 0, 0]);
    expect(shape.shadowRoot?.textContent).toBe('');
  });

  it('keeps orphan declarations inert and restores vector defaults when cleared', async () => {
    fixture = await createFixture(html`<nve-scene-shape></nve-scene-shape>`);
    const shape = fixture.querySelector<SceneShape>('nve-scene-shape')!;
    await elementIsStable(shape);
    shape.orientation = [0, 0, 1, 0];
    shape.scale = [2, 3, 4];
    shape.orientation = null;
    shape.scale = null;
    expect(shape.orientation).toEqual([0, 0, 0, 1]);
    expect(shape.scale).toEqual([1, 1, 1]);
  });
});
