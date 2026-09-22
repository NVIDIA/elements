// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, describe, expect, it } from 'vitest';
import { createFixture, elementIsStable, removeFixture, required } from '@internals/testing';
import { MARKER } from '@nvidia-elements/scene';
import { ConeBuffer, SceneCones } from './cones.js';
import './define.js';

describe(SceneCones.metadata.tag, () => {
  let fixture: HTMLElement | undefined;

  afterEach(() => fixture && removeFixture(fixture));

  it('should resolve JSON and matching buffer sources', async () => {
    fixture = await createFixture(html`
      <nve-scene-cones source='[{"position":[0,0,0]}]'></nve-scene-cones>
    `);
    const layer = required(fixture.querySelector<SceneCones>(SceneCones.metadata.tag), 'Expected cones fixture.');
    await elementIsStable(layer);

    expect(customElements.get(SceneCones.metadata.tag)).toBe(SceneCones);
    expect(SceneCones.layout).toBe(MARKER);
    expect(layer.source).toBeInstanceOf(ConeBuffer);

    const records = new ConeBuffer({ capacity: 1 });
    records.add({ position: [1, 2, 3] });
    layer.source = records;
    layer.countLimit = 1;
    expect(layer.source).toBe(records);
    expect(layer.countLimit).toBe(1);
    expect(() => layer.publish({ count: 1, start: 0 })).not.toThrow();
  });
});
