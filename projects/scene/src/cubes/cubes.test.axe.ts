// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';
import { SceneCubes } from './cubes.js';
import './define.js';

describe(SceneCubes.metadata.tag, () => {
  it('should pass axe as scene data', async () => {
    const fixture = await createFixture(html`
      <nve-scene-cubes><nve-scene-marker position="[0,0,0]"></nve-scene-marker></nve-scene-cubes>
    `);
    await elementIsStable(fixture.querySelector(SceneCubes.metadata.tag));
    const results = await runAxe([SceneCubes.metadata.tag]);
    expect(results.violations).toHaveLength(0);
    removeFixture(fixture);
  });
});
