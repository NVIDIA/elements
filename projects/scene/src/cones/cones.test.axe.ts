// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';
import { SceneCones } from './cones.js';
import './define.js';

describe(SceneCones.metadata.tag, () => {
  it('should pass axe as scene data', async () => {
    const fixture = await createFixture(html`
      <nve-scene-cones><nve-scene-marker position="[0,0,0]"></nve-scene-marker></nve-scene-cones>
    `);
    await elementIsStable(fixture.querySelector(SceneCones.metadata.tag));
    const results = await runAxe([SceneCones.metadata.tag]);
    expect(results.violations).toHaveLength(0);
    removeFixture(fixture);
  });
});
