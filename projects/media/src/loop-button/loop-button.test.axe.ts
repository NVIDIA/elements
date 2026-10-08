// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';
import { MediaLoopButton } from './loop-button.js';
import './define.js';

describe(MediaLoopButton.metadata.tag, () => {
  it('should pass axe check', async () => {
    const fixture = await createFixture(html`
      <nve-media-loop-button aria-label="enable looping"></nve-media-loop-button>
      <nve-media-loop-button aria-label="disable looping" pressed></nve-media-loop-button>
      <nve-media-loop-button aria-label="disabled looping" disabled></nve-media-loop-button>
    `);
    const element = fixture.querySelector(MediaLoopButton.metadata.tag) as MediaLoopButton;
    await elementIsStable(element);

    const results = await runAxe([MediaLoopButton.metadata.tag]);
    expect(results.violations.length).toBe(0);
    removeFixture(fixture);
  });
});
