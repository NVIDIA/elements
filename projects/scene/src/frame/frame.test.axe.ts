// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createFixture, elementIsStable, removeFixture, required } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';
import { Scene } from '@nvidia-elements/scene/scene';
import { SceneFrame } from '@nvidia-elements/scene/frame';
import '@nvidia-elements/scene/frame/define.js';

describe(SceneFrame.metadata.tag, () => {
  let fixture: HTMLElement;
  let consoleError: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    fixture = await createFixture(html`<nve-scene aria-label="Robot visualization"></nve-scene>`);
    const scene = required(fixture.querySelector<Scene>(Scene.metadata.tag), 'Expected scene fixture.');
    const fallback = document.createElement('p');
    fallback.slot = 'fallback';
    fallback.textContent = 'The 3D scene is unavailable.';
    const frame = document.createElement(SceneFrame.metadata.tag) as SceneFrame;
    frame.name = 'base-link';
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
