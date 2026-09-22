// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, describe, expect, it } from 'vitest';
import { createFixture, elementIsStable, removeFixture, required } from '@internals/testing';
import { MARKER } from '@nvidia-elements/scene';
import { PyramidBuffer, ScenePyramids } from './pyramids.js';
import './define.js';

describe(ScenePyramids.metadata.tag, () => {
  let fixture: HTMLElement | undefined;

  afterEach(() => fixture && removeFixture(fixture));

  it('should resolve JSON and matching buffer sources', async () => {
    fixture = await createFixture(html`
      <nve-scene-pyramids source='[{"position":[0,0,0]}]'></nve-scene-pyramids>
    `);
    const layer = required(
      fixture.querySelector<ScenePyramids>(ScenePyramids.metadata.tag),
      'Expected pyramids fixture.'
    );
    await elementIsStable(layer);

    expect(customElements.get(ScenePyramids.metadata.tag)).toBe(ScenePyramids);
    expect(ScenePyramids.layout).toBe(MARKER);
    expect(layer.source).toBeInstanceOf(PyramidBuffer);

    const records = new PyramidBuffer({ capacity: 1 });
    records.add({ position: [1, 2, 3] });
    layer.source = records;
    layer.countLimit = 1;
    expect(layer.source).toBe(records);
    expect(layer.countLimit).toBe(1);
    expect(() => layer.publish({ count: 1, start: 0 })).not.toThrow();
  });
});
