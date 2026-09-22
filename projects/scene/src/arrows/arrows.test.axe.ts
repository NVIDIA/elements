// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { createFixture, elementIsStable, removeFixture, required } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';
import { SceneArrows } from './arrows.js';
import './define.js';

describe(SceneArrows.metadata.tag, () => {
  it('should pass axe as scene data', async () => {
    const fixture = await createFixture(html`
      <nve-scene-arrows source='[{"origin":[0,0,0]}]'></nve-scene-arrows>
    `);
    await elementIsStable(required(fixture.querySelector(SceneArrows.metadata.tag), 'Expected arrows fixture.'));
    const results = await runAxe([SceneArrows.metadata.tag]);
    expect(results.violations).toHaveLength(0);
    removeFixture(fixture);
  });
});
