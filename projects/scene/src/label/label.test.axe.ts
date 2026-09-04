// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createFixture, elementIsStable, removeFixture, required } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';
import { Scene } from '../scene/scene.js';
import { SceneLabel } from './label.js';
import './define.js';

describe(SceneLabel.metadata.tag, () => {
  let fixture: HTMLElement | undefined;

  afterEach(() => {
    if (fixture) removeFixture(fixture);
    vi.restoreAllMocks();
  });

  it('should remain accessibility-transparent for its slotted content', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    fixture = await createFixture(html`
      <nve-scene aria-label="Robot visualization">
        <nve-scene-label><button>Open robot details</button></nve-scene-label>
      </nve-scene>
    `);
    const label = required(fixture.querySelector<SceneLabel>(SceneLabel.metadata.tag), 'Expected label fixture.');
    await elementIsStable(label);
    const results = await runAxe([Scene.metadata.tag]);

    expect(label.getAttribute('role')).toBeNull();
    expect(label.tabIndex).toBe(-1);
    expect(results.violations).toHaveLength(0);
  });
});
