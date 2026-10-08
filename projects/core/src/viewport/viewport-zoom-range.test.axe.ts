// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';
import { ViewportZoomRange } from './viewport-zoom-range.js';
import './define.js';

describe(ViewportZoomRange.metadata.tag, () => {
  it('should pass axe check', async () => {
    const fixture = await createFixture(html`
      <div hidden><nve-viewport id="target" behavior-zoom min-scale="0.25" max-scale="4"></nve-viewport></div>
      <nve-viewport-zoom-range commandfor="target" aria-label="zoom" value="1"></nve-viewport-zoom-range>
      <nve-viewport-zoom-range commandfor="target" orientation="vertical" aria-label="vertical zoom"></nve-viewport-zoom-range>
      <nve-viewport-zoom-range aria-label="disabled zoom" disabled></nve-viewport-zoom-range>
    `);
    const element = fixture.querySelector(ViewportZoomRange.metadata.tag) as ViewportZoomRange;
    await elementIsStable(element);

    const results = await runAxe([ViewportZoomRange.metadata.tag]);
    expect(results.violations.length).toBe(0);
    removeFixture(fixture);
  });
});
