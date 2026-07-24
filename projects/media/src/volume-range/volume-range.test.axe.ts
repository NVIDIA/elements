// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';
import { MediaVolumeRange } from './volume-range.js';
import './define.js';

describe(MediaVolumeRange.metadata.tag, () => {
  it('should pass axe check', async () => {
    const fixture = await createFixture(html`
      <nve-media-volume-range aria-label="volume" value="0.5"></nve-media-volume-range>
      <nve-media-volume-range aria-label="disabled volume" disabled></nve-media-volume-range>
    `);
    await elementIsStable(fixture.querySelector(MediaVolumeRange.metadata.tag));

    const results = await runAxe([MediaVolumeRange.metadata.tag]);
    expect(results.violations.length).toBe(0);
    removeFixture(fixture);
  });
});
