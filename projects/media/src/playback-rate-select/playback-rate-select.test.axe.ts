// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';
import { MediaPlaybackRateSelect } from './playback-rate-select.js';
import './define.js';

describe(MediaPlaybackRateSelect.metadata.tag, () => {
  it('should pass axe check', async () => {
    const fixture = await createFixture(html`
      <nve-media-playback-rate-select aria-label="playback rate" value="1"></nve-media-playback-rate-select>
      <nve-media-playback-rate-select aria-label="disabled playback rate" disabled></nve-media-playback-rate-select>
      <nve-media-playback-rate-select aria-label="readonly playback rate" readonly></nve-media-playback-rate-select>
    `);
    await elementIsStable(fixture.querySelector(MediaPlaybackRateSelect.metadata.tag));

    const results = await runAxe([MediaPlaybackRateSelect.metadata.tag]);
    expect(results.violations.length).toBe(0);
    removeFixture(fixture);
  });
});
