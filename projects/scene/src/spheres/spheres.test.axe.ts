// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { createFixture, elementIsStable, removeFixture, required } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';
import { SceneSpheres } from './spheres.js';
import './define.js';

describe(SceneSpheres.metadata.tag, () => {
  it('should pass axe as scene data', async () => {
    const fixture = await createFixture(html`
      <nve-scene-spheres><nve-scene-marker position="[0,0,0]"></nve-scene-marker></nve-scene-spheres>
    `);
    await elementIsStable(required(fixture.querySelector(SceneSpheres.metadata.tag), 'Expected spheres fixture.'));
    const results = await runAxe([SceneSpheres.metadata.tag]);
    expect(results.violations).toHaveLength(0);
    removeFixture(fixture);
  });
});
