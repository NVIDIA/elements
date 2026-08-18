// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, describe, expect, it } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { MARKER, writeMarker } from '@nvidia-elements/scene';
import { SceneArrows } from './arrows.js';
import './define.js';

describe(SceneArrows.metadata.tag, () => {
  let fixture: HTMLElement | undefined;

  afterEach(() => fixture && removeFixture(fixture));

  it('should expose declarative and streamed marker sources', async () => {
    fixture = await createFixture(html`
      <nve-scene-arrows><nve-scene-marker from="0 0 0" to="0 0 1"></nve-scene-marker></nve-scene-arrows>
    `);
    const layer = fixture.querySelector<SceneArrows>(SceneArrows.metadata.tag);
    await elementIsStable(layer);

    expect(customElements.get(SceneArrows.metadata.tag)).toBe(SceneArrows);
    expect(SceneArrows.layout).toBe(MARKER);
    expect(layer.instances).toBeNull();

    layer.replaceChildren();
    const records = new Uint8Array(MARKER.stride);
    writeMarker(records, 0, { position: [1, 2, 3] });
    layer.instances = records;
    layer.count = 1;
    expect(layer.instances).toBe(records);
    expect(layer.count).toBe(1);
    expect(() => layer.commit(0, 1)).not.toThrow();
  });
});
