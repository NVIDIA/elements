// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { createFixture, elementIsStable, removeFixture, required } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';
import './define.js';
import { SceneBody } from './body.js';

describe(SceneBody.metadata.tag, () => {
  it('passes the accessibility baseline in a labelled scene composition', async () => {
    const fixture = await createFixture(html`
      <nve-scene aria-label="body scene">
        <nve-scene-body source="[{}]">
          <nve-scene-shape type="cube"></nve-scene-shape>
        </nve-scene-body>
      </nve-scene>
    `);
    await elementIsStable(required(fixture.querySelector(SceneBody.metadata.tag), 'Expected body fixture.'));
    expect((await runAxe(['nve-scene'])).violations).toHaveLength(0);
    removeFixture(fixture);
  });
});
