// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';
import { MediaTimeRange } from './time-range.js';
import './define.js';

describe(MediaTimeRange.metadata.tag, () => {
  it('should pass axe check', async () => {
    const fixture = await createFixture(html`
      <nve-media-time-range aria-label="current time" min="0" max="100" value="50"></nve-media-time-range>
      <nve-media-time-range aria-label="disabled current time" disabled></nve-media-time-range>
    `);
    await elementIsStable(fixture.querySelector(MediaTimeRange.metadata.tag));

    const results = await runAxe([MediaTimeRange.metadata.tag]);
    expect(results.violations.length).toBe(0);
    removeFixture(fixture);
  });
});
