// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, describe, expect, it } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';
import { ViewportMinimap } from './index.js';
import './define.js';

describe(ViewportMinimap.metadata.tag, () => {
  let fixture: HTMLElement;
  afterEach(() => removeFixture(fixture));

  it('should pass axe check for an external command control', async () => {
    fixture = await createFixture(html`
      <nve-viewport id="target" behavior-pan behavior-zoom style="width: 400px; height: 300px">
        <div style="width: 800px; height: 600px">Content</div>
      </nve-viewport>
      <nve-viewport-minimap commandfor="target" style="position: relative; inset: auto"></nve-viewport-minimap>
    `);
    const minimap = fixture.querySelector(ViewportMinimap.metadata.tag);
    await elementIsStable(minimap);
    expect(minimap.tabIndex).toBe(-1);
    expect(minimap.getAttribute('aria-hidden')).toBe('true');
    const results = await runAxe(['nve-viewport', ViewportMinimap.metadata.tag]);
    expect(results.violations.length).toBe(0);
  });
});
