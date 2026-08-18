// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, describe, expect, it } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';
import { SceneCamera } from './camera.js';
import './define.js';

describe(SceneCamera.metadata.tag, () => {
  let fixture: HTMLElement;
  afterEach(() => removeFixture(fixture));

  it('is semantically transparent for every behavior', async () => {
    fixture = await createFixture(html`
      <nve-scene-camera behavior="orbit"></nve-scene-camera>
      <nve-scene-camera behavior="follow" frame="robot"></nve-scene-camera>
      <nve-scene-camera behavior="top"></nve-scene-camera>
    `);
    const camera = fixture.querySelector<SceneCamera>(SceneCamera.metadata.tag);
    if (!camera) throw new Error('Expected scene camera.');
    await elementIsStable(camera);
    expect((await runAxe([SceneCamera.metadata.tag])).violations).toHaveLength(0);
  });
});
