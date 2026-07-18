// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';
import { MediaPauseButton } from './pause-button.js';
import './define.js';

describe(MediaPauseButton.metadata.tag, () => {
  it('should pass axe check', async () => {
    const fixture = await createFixture(html`
      <nve-media-pause-button aria-label="pause media"></nve-media-pause-button>
      <nve-media-pause-button aria-label="play media" checked></nve-media-pause-button>
      <nve-media-pause-button aria-label="disabled pause media" disabled></nve-media-pause-button>
    `);
    await elementIsStable(fixture.querySelector(MediaPauseButton.metadata.tag));

    const results = await runAxe([MediaPauseButton.metadata.tag]);
    expect(results.violations.length).toBe(0);
    removeFixture(fixture);
  });
});
