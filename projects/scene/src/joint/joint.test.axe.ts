// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createFixture, elementIsStable, removeFixture, required } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';
import { Scene } from '@nvidia-elements/scene/scene';
import { SceneJoint } from '@nvidia-elements/scene/joint';
import '@nvidia-elements/scene/joint/define.js';

describe(SceneJoint.metadata.tag, () => {
  let fixture: HTMLElement;
  let consoleError: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    fixture = await createFixture(html`<nve-scene aria-label="Robot visualization"></nve-scene>`);
    const scene = required(fixture.querySelector<Scene>(Scene.metadata.tag), 'Expected scene fixture.');
    const fallback = document.createElement('p');
    fallback.slot = 'fallback';
    fallback.textContent = 'The 3D scene is unavailable.';
    const frame = document.createElement(SceneJoint.metadata.tag) as SceneJoint;
    frame.name = 'mount';
    frame.parent = 'base';
    frame.child = 'sensor';
    const base = document.createElement('nve-scene-body');
    base.name = 'base';
    const sensor = document.createElement('nve-scene-body');
    sensor.name = 'sensor';
    scene.append(base, sensor);
    scene.append(fallback, frame);
    await Promise.all([elementIsStable(scene), elementIsStable(frame)]);
  });

  afterEach(() => {
    removeFixture(fixture);
    consoleError.mockRestore();
  });

  it('should remain semantically transparent inside an accessible scene', async () => {
    const results = await runAxe([Scene.metadata.tag]);

    expect(results.violations).toHaveLength(0);
  });
});
