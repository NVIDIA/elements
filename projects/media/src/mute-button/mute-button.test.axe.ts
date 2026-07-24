// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';
import { MediaMuteButton } from './mute-button.js';
import './define.js';

describe(MediaMuteButton.metadata.tag, () => {
  it('should pass axe check', async () => {
    const fixture = await createFixture(html`
      <nve-media-mute-button aria-label="mute media"></nve-media-mute-button>
      <nve-media-mute-button aria-label="unmute media" checked></nve-media-mute-button>
      <nve-media-mute-button aria-label="disabled mute media" disabled></nve-media-mute-button>
    `);
    await elementIsStable(fixture.querySelector(MediaMuteButton.metadata.tag));

    const results = await runAxe([MediaMuteButton.metadata.tag]);
    expect(results.violations.length).toBe(0);
    removeFixture(fixture);
  });
});
