// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { createFixture, elementIsStable, removeFixture, required } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';
import { ScenePolygon } from './polygon.js';
import './define.js';

describe(ScenePolygon.metadata.tag, () => {
  it('should pass axe as scene data', async () => {
    const fixture = await createFixture(html`
      <nve-scene-polygon geometry='{"outer":[[0,0],[2,0],[2,2],[0,2]]}'>
        <nve-scene-marker position="[0,0,0]"></nve-scene-marker>
      </nve-scene-polygon>
    `);
    await elementIsStable(required(fixture.querySelector(ScenePolygon.metadata.tag), 'Expected polygon fixture.'));
    const results = await runAxe([ScenePolygon.metadata.tag]);
    expect(results.violations).toHaveLength(0);
    removeFixture(fixture);
  });
});
