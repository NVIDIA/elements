// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, describe, expect, it } from 'vitest';
import { createFixture, elementIsStable, removeFixture, required } from '@internals/testing';
import { MARKER, MarkerBuffer } from '@nvidia-elements/scene';
import { SceneCubes } from './cubes.js';
import './define.js';

describe(SceneCubes.metadata.tag, () => {
  let fixture: HTMLElement | undefined;

  afterEach(() => fixture && removeFixture(fixture));

  it('should expose declarative and streamed marker sources', async () => {
    fixture = await createFixture(html`
      <nve-scene-cubes><nve-scene-marker position="[0,0,0]"></nve-scene-marker></nve-scene-cubes>
    `);
    const layer = required(fixture.querySelector<SceneCubes>(SceneCubes.metadata.tag), 'Expected cubes fixture.');
    await elementIsStable(layer);

    expect(customElements.get(SceneCubes.metadata.tag)).toBe(SceneCubes);
    expect(SceneCubes.layout).toBe(MARKER);
    expect(layer.source).toBeNull();
    expect(layer.interactive).toBe(false);
    expect(layer.featureIds).toBeNull();

    const featureIds = new Uint32Array([1842]);
    layer.featureIds = featureIds;
    await elementIsStable(layer);
    expect(layer.featureIds).toBe(featureIds);
    expect(layer.hasAttribute('featureids')).toBe(false);
    expect(layer.hasAttribute('feature-ids')).toBe(false);

    layer.setAttribute('interactive', 'false');
    await elementIsStable(layer);
    expect(layer.interactive).toBe(true);
    layer.interactive = false;
    await elementIsStable(layer);
    expect(layer.interactive).toBe(false);
    expect(layer.hasAttribute('interactive')).toBe(true);
    layer.removeAttribute('interactive');

    layer.replaceChildren();
    const records = new MarkerBuffer({ capacity: 1 });
    records.add({ position: [1, 2, 3] });
    layer.source = records;
    layer.countLimit = 1;
    expect(layer.source).toBe(records);
    expect(layer.countLimit).toBe(1);
    expect(() => layer.publish({ count: 1, start: 0 })).not.toThrow();
  });
});
