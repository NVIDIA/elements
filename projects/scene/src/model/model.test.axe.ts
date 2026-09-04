// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { createFixture, elementIsStable, removeFixture, required } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';
import './define.js';
import { SceneModel } from './model.js';

describe(SceneModel.metadata.tag, () => {
  it('passes the accessibility baseline in a labelled scene composition', async () => {
    const fixture = await createFixture(html`
      <nve-scene aria-label="Model scene">
        <nve-scene-model>
          <nve-scene-part shape="cube"></nve-scene-part>
          <nve-scene-marker></nve-scene-marker>
        </nve-scene-model>
      </nve-scene>
    `);
    await elementIsStable(required(fixture.querySelector(SceneModel.metadata.tag), 'Expected model fixture.'));
    expect((await runAxe(['nve-scene'])).violations).toHaveLength(0);
    removeFixture(fixture);
  });
});
