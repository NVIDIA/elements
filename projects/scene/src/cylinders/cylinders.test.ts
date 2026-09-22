// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, describe, expect, it } from 'vitest';
import { createFixture, elementIsStable, removeFixture, required } from '@internals/testing';
import { MARKER } from '@nvidia-elements/scene';
import { CylinderBuffer, SceneCylinders } from './cylinders.js';
import './define.js';

describe(SceneCylinders.metadata.tag, () => {
  let fixture: HTMLElement | undefined;

  afterEach(() => fixture && removeFixture(fixture));

  it('should resolve JSON and matching buffer sources', async () => {
    fixture = await createFixture(html`
      <nve-scene-cylinders source='[{"position":[0,0,0]}]'></nve-scene-cylinders>
    `);
    const layer = required(
      fixture.querySelector<SceneCylinders>(SceneCylinders.metadata.tag),
      'Expected cylinders fixture.'
    );
    await elementIsStable(layer);

    expect(customElements.get(SceneCylinders.metadata.tag)).toBe(SceneCylinders);
    expect(SceneCylinders.layout).toBe(MARKER);
    expect(layer.source).toBeInstanceOf(CylinderBuffer);

    const records = new CylinderBuffer({ capacity: 1 });
    records.add({ position: [1, 2, 3] });
    layer.source = records;
    layer.countLimit = 1;
    expect(layer.source).toBe(records);
    expect(layer.countLimit).toBe(1);
    expect(() => layer.publish({ count: 1, start: 0 })).not.toThrow();
  });
});
