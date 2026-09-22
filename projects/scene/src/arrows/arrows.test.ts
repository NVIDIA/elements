// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, describe, expect, it } from 'vitest';
import { createFixture, elementIsStable, removeFixture, required } from '@internals/testing';
import { MARKER } from '@nvidia-elements/scene';
import { ArrowBuffer, SceneArrows } from './arrows.js';
import './define.js';

describe(SceneArrows.metadata.tag, () => {
  let fixture: HTMLElement | undefined;

  afterEach(() => fixture && removeFixture(fixture));

  it('should resolve JSON and matching buffer sources', async () => {
    fixture = await createFixture(html`
      <nve-scene-arrows source='[{"origin":[0,0,0],"vector":[0,0,1]}]'></nve-scene-arrows>
    `);
    const layer = required(fixture.querySelector<SceneArrows>(SceneArrows.metadata.tag), 'Expected arrows fixture.');
    await elementIsStable(layer);

    expect(customElements.get(SceneArrows.metadata.tag)).toBe(SceneArrows);
    expect(SceneArrows.layout).toBe(MARKER);
    expect(layer.source).toBeInstanceOf(ArrowBuffer);

    const records = new ArrowBuffer({
      records: [{ featureId: 17, origin: [1, 2, 3], shaftDiameter: 0.1, vector: [0, 0, 2] }]
    });
    layer.source = records;
    layer.countLimit = 1;
    expect(layer.source).toBe(records);
    expect(layer.countLimit).toBe(1);
    expect(records.at(0).featureId).toBe(17);
    expect(() => layer.publish({ count: 1, start: 0 })).not.toThrow();
  });
});
