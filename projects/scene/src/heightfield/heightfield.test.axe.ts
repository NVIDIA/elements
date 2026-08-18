// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';
import { SceneHeightfield } from './heightfield.js';
import './define.js';

describe(SceneHeightfield.metadata.tag, () => {
  it('passes the accessibility baseline', async () => {
    const fixture = await createFixture(html`<nve-scene-heightfield></nve-scene-heightfield>`);
    await elementIsStable(fixture.querySelector(SceneHeightfield.metadata.tag));
    expect((await runAxe([SceneHeightfield.metadata.tag])).violations).toHaveLength(0);
    removeFixture(fixture);
  });
});
