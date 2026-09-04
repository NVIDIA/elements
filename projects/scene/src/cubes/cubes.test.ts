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
    expect(layer.instances).toBeNull();
    expect(layer.interactive).toBe(false);

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
    layer.instances = records;
    layer.count = 1;
    expect(layer.instances).toBe(records);
    expect(layer.count).toBe(1);
    expect(() => layer.commit(0, 1)).not.toThrow();
  });
});
