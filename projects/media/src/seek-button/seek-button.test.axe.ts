// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';
import { MediaSeekButton } from './seek-button.js';
import './define.js';

describe(MediaSeekButton.metadata.tag, () => {
  it('should pass axe check', async () => {
    const fixture = await createFixture(html`
      <nve-media-seek-button action="start" aria-label="seek to start"></nve-media-seek-button>
      <nve-media-seek-button action="backward" aria-label="seek backward"></nve-media-seek-button>
      <nve-media-seek-button action="forward" aria-label="seek forward"></nve-media-seek-button>
      <nve-media-seek-button action="end" aria-label="seek to end"></nve-media-seek-button>
    `);
    await elementIsStable(fixture.querySelector(MediaSeekButton.metadata.tag));

    const results = await runAxe([MediaSeekButton.metadata.tag]);
    expect(results.violations.length).toBe(0);
    removeFixture(fixture);
  });
});
