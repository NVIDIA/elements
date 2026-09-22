// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { createFixture, elementIsStable, removeFixture, required } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';
import { ScenePoints } from './points.js';
import './define.js';

describe(ScenePoints.metadata.tag, () => {
  it('passes the accessibility baseline as scene data', async () => {
    const fixture = await createFixture(html`<nve-scene-points></nve-scene-points>`);
    await elementIsStable(required(fixture.querySelector(ScenePoints.metadata.tag), 'Expected points fixture.'));
    const results = await runAxe([ScenePoints.metadata.tag]);
    expect(results.violations).toHaveLength(0);
    removeFixture(fixture);
  });
});
