// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0
import { html } from 'lit';
import { afterEach, describe, expect, it } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import type { ScenePart } from './part.js';
import type { SceneModel } from './model.js';
import './define.js';
import { getModelLayerTopologyVersion } from '../internal/layers/model/layer-state.js';

let fixture: HTMLElement;
afterEach(() => {
  if (fixture) removeFixture(fixture);
});
describe('scene part declarations', () => {
  it('updates its owning model synchronously and skips equivalent vectors', async () => {
    fixture = await createFixture(
      html`<nve-scene-model><nve-scene-part position="[1,2,3]"></nve-scene-part></nve-scene-model>`
    );
    const part = fixture.querySelector<ScenePart>('nve-scene-part')!;
    const model = fixture.querySelector<SceneModel>('nve-scene-model')!;
    await elementIsStable(part);
    await elementIsStable(model);
    const topology = getModelLayerTopologyVersion(model);
    part.position = [1, 2, 3];
    expect(getModelLayerTopologyVersion(model)).toBe(topology);
    part.position = [4, 5, 6];
    expect(model.geometry?.[0]?.position).toEqual([4, 5, 6]);
    part.removeAttribute('position');
    await elementIsStable(part);
    expect(part.position).toEqual([0, 0, 0]);
    expect(part.shadowRoot?.textContent).toBe('');
  });

  it('keeps orphan declarations inert and restores vector defaults when cleared', async () => {
    fixture = await createFixture(html`<nve-scene-part></nve-scene-part>`);
    const part = fixture.querySelector<ScenePart>('nve-scene-part')!;
    await elementIsStable(part);
    part.orientation = [0, 0, 1, 0];
    part.scale = [2, 3, 4];
    part.orientation = null;
    part.scale = null;
    expect(part.orientation).toEqual([0, 0, 0, 1]);
    expect(part.scale).toEqual([1, 1, 1]);
  });
});
