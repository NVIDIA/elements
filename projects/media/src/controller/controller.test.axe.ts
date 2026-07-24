// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';
import { MediaController } from './controller.js';
import './define.js';
import '../pause-button/define.js';
import '../time-range/define.js';

describe(MediaController.metadata.tag, () => {
  it('should pass axe check', async () => {
    const fixture = await createFixture(html`
      <nve-media-controller id="axe-controller">
        <video aria-label="recording">
          <track kind="captions" src="captions.vtt" srclang="en" label="english" default />
        </video>
        <nve-media-pause-button commandfor="axe-controller" aria-label="play recording"></nve-media-pause-button>
        <div role="toolbar" aria-label="media controls">
          <nve-media-time-range commandfor="axe-controller" aria-label="current time"></nve-media-time-range>
        </div>
      </nve-media-controller>
    `);
    await elementIsStable(fixture.querySelector(MediaController.metadata.tag));

    const results = await runAxe([MediaController.metadata.tag]);
    expect(results.violations.length).toBe(0);
    removeFixture(fixture);
  });
});
