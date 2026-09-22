// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0
import { html } from 'lit';
import { afterEach, describe, expect, it } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import type { SceneCubes } from '../../../cubes/cubes.js';
import '../../../cubes/define.js';
import { ConeBuffer } from './semantic-buffer.js';
import { takeMarkerLayerRenderData } from './layer-state.js';

let fixture: HTMLElement;
afterEach(() => {
  if (fixture) removeFixture(fixture);
});
describe('marker layer element contract', () => {
  it('initializes source attributes and exposes count and interaction capabilities', async () => {
    fixture = await createFixture(
      html`<nve-scene-cubes source=${JSON.stringify([{ position: [1, 2, 3] }, {}])} interactive></nve-scene-cubes>`
    );
    const cubes = fixture.querySelector<SceneCubes>('nve-scene-cubes')!;
    await elementIsStable(cubes);
    expect(cubes.source?.count).toBe(2);
    expect(cubes.interactive).toBe(true);
    cubes.countLimit = 1;
    cubes.publish();
    expect(takeMarkerLayerRenderData(cubes).count).toBe(1);
    expect(() => {
      cubes.countLimit = 3;
    }).toThrow(RangeError);
    cubes.removeAttribute('source');
    await elementIsStable(cubes);
    expect(cubes.source).toBeNull();
  });

  it('rejects the wrong semantic source atomically and recovers malformed declarative input', async () => {
    fixture = await createFixture(html`<nve-scene-cubes source=${JSON.stringify([{}])}></nve-scene-cubes>`);
    const cubes = fixture.querySelector<SceneCubes>('nve-scene-cubes')!;
    await elementIsStable(cubes);
    const accepted = cubes.source;
    expect(() => Reflect.set(cubes, 'source', new ConeBuffer({ records: [{}] }))).toThrow(TypeError);
    expect(cubes.source).toBe(accepted);
    cubes.setAttribute('source', '{invalid');
    await elementIsStable(cubes);
    expect(cubes.source).toBeNull();
    cubes.setAttribute('source', '[{}]');
    await elementIsStable(cubes);
    expect(cubes.source?.count).toBe(1);
  });
});
