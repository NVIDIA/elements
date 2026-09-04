// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, describe, expect, it } from 'vitest';
import { createFixture, elementIsStable, removeFixture, required } from '@internals/testing';
import { MARKER, MarkerBuffer } from '@nvidia-elements/scene';
import { SceneSpheres } from './spheres.js';
import './define.js';

describe(SceneSpheres.metadata.tag, () => {
  let fixture: HTMLElement | undefined;

  afterEach(() => fixture && removeFixture(fixture));

  it('should expose declarative and streamed marker sources', async () => {
    fixture = await createFixture(html`
      <nve-scene-spheres><nve-scene-marker position="[0,0,0]"></nve-scene-marker></nve-scene-spheres>
    `);
    const layer = required(fixture.querySelector<SceneSpheres>(SceneSpheres.metadata.tag), 'Expected spheres fixture.');
    await elementIsStable(layer);

    expect(customElements.get(SceneSpheres.metadata.tag)).toBe(SceneSpheres);
    expect(SceneSpheres.layout).toBe(MARKER);
    expect(layer.source).toBeNull();

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
