// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';
import { MediaFullscreenButton } from './fullscreen-button.js';
import './define.js';

describe(MediaFullscreenButton.metadata.tag, () => {
  it('should pass axe check', async () => {
    const fixture = await createFixture(html`
      <nve-media-fullscreen-button aria-label="enter full screen"></nve-media-fullscreen-button>
      <nve-media-fullscreen-button aria-label="exit full screen" pressed></nve-media-fullscreen-button>
      <nve-media-fullscreen-button aria-label="disabled full screen" disabled></nve-media-fullscreen-button>
    `);
    await elementIsStable(fixture.querySelector(MediaFullscreenButton.metadata.tag));

    const results = await runAxe([MediaFullscreenButton.metadata.tag]);
    expect(results.violations.length).toBe(0);
    removeFixture(fixture);
  });
});
