// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { createFixture, elementIsStable, removeFixture, required } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';
import { SceneLabels } from './labels.js';
import './define.js';

describe(SceneLabels.metadata.tag, () => {
  it('passes the accessibility baseline as visual scene data', async () => {
    const fixture = await createFixture(html`<nve-scene-labels></nve-scene-labels>`);
    await elementIsStable(required(fixture.querySelector(SceneLabels.metadata.tag), 'Expected labels fixture.'));
    const results = await runAxe([SceneLabels.metadata.tag]);
    expect(results.violations).toHaveLength(0);
    removeFixture(fixture);
  });
});
