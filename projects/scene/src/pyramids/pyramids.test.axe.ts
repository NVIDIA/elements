// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @nvidia-elements/lint/no-unexpected-slot-value -- These files exercise scene-owned composition and components introduced together. */

import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';
import { ScenePyramids } from './pyramids.js';
import './define.js';

describe(ScenePyramids.metadata.tag, () => {
  it('should pass axe in a labeled scene composition', async () => {
    const fixture = await createFixture(html`
      <nve-scene aria-label="Pyramids scene">
        <nve-scene-pyramids><nve-scene-marker position="[0,0,0]"></nve-scene-marker></nve-scene-pyramids>
      </nve-scene>
    `);
    await elementIsStable(fixture.querySelector(ScenePyramids.metadata.tag));
    const results = await runAxe(['nve-scene']);
    expect(results.violations).toHaveLength(0);
    removeFixture(fixture);
  });
});
