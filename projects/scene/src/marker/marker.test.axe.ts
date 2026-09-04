// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { createFixture, elementIsStable, removeFixture, required } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';
import { SceneMarker } from './marker.js';
import '@nvidia-elements/scene/cubes/define.js';

describe(SceneMarker.metadata.tag, () => {
  it('should pass axe as declarative scene data', async () => {
    const fixture = await createFixture(html`
      <nve-scene-cubes><nve-scene-marker position="[0,0,0]"></nve-scene-marker></nve-scene-cubes>
    `);
    await elementIsStable(required(fixture.querySelector(SceneMarker.metadata.tag), 'Expected marker fixture.'));
    const results = await runAxe([SceneMarker.metadata.tag]);
    expect(results.violations).toHaveLength(0);
    removeFixture(fixture);
  });

  it('should pass axe for the documented named, focusable marker alternative', async () => {
    const fixture = await createFixture(html`
      <nve-scene-cubes><nve-scene-marker tabindex="0" aria-label="Select robot"></nve-scene-marker></nve-scene-cubes>
    `);
    await elementIsStable(required(fixture.querySelector(SceneMarker.metadata.tag), 'Expected linked marker fixture.'));
    const results = await runAxe([SceneMarker.metadata.tag]);
    expect(results.violations).toHaveLength(0);
    removeFixture(fixture);
  });
});
