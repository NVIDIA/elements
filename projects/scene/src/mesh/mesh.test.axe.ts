// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';
import '@nvidia-elements/scene/mesh/define.js';

/* eslint-disable @nvidia-elements/lint/no-unexpected-slot-value */
describe('scene mesh accessibility', () => {
  it('has no scene-owned mesh violations', async () => {
    const fixture = await createFixture(html`
      <nve-scene aria-label="Mesh scene">
        <nve-scene-mesh></nve-scene-mesh>
      </nve-scene>
    `);
    await elementIsStable(fixture.querySelector('nve-scene-mesh'));
    expect((await runAxe(['nve-scene'])).violations).toHaveLength(0);
    removeFixture(fixture);
  });
});
