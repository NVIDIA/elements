// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';
import { SceneArrows } from './arrows.js';
import './define.js';

describe(SceneArrows.metadata.tag, () => {
  it('should pass axe as scene data', async () => {
    const fixture = await createFixture(html`
      <nve-scene-arrows><nve-scene-marker from="0 0 0" to="0 0 1"></nve-scene-marker></nve-scene-arrows>
    `);
    await elementIsStable(fixture.querySelector(SceneArrows.metadata.tag));
    const results = await runAxe([SceneArrows.metadata.tag]);
    expect(results.violations).toHaveLength(0);
    removeFixture(fixture);
  });
});
