// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, describe, expect, it } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';
import { ViewportMinimap } from '@nvidia-elements/viewport/minimap';
import '@nvidia-elements/viewport/viewport/define.js';
import '@nvidia-elements/viewport/minimap/define.js';

describe(ViewportMinimap.metadata.tag, () => {
  let fixture: HTMLElement;
  afterEach(() => removeFixture(fixture));

  it('should pass axe check with interactive viewport content', async () => {
    fixture = await createFixture(html`
      <nve-viewport behavior-pan behavior-zoom style="width: 400px; height: 300px">
        <nve-viewport-minimap></nve-viewport-minimap>
        <form>
          <label>Project name <input name="name" /></label>
          <button type="submit">Save</button>
        </form>
      </nve-viewport>
    `);
    const viewport = fixture.querySelector('nve-viewport');
    const minimap = fixture.querySelector('nve-viewport-minimap');
    if (!viewport || !minimap) throw new Error('Minimap fixture is missing.');
    await elementIsStable(viewport);
    await elementIsStable(minimap);

    const results = await runAxe(['nve-viewport']);
    expect(results.violations.length).toBe(0);
  });

  it('should pass axe check for an external command control', async () => {
    fixture = await createFixture(html`
      <nve-viewport id="target" behavior-pan behavior-zoom style="width: 400px; height: 300px">
        <div style="width: 800px; height: 600px">Content</div>
      </nve-viewport>
      <nve-viewport-minimap commandfor="target" style="position: relative; inset: auto"></nve-viewport-minimap>
    `);
    const minimap = fixture.querySelector('nve-viewport-minimap');
    if (!minimap) throw new Error('Minimap fixture is missing.');
    await elementIsStable(minimap);
    expect(minimap.tabIndex).toBe(-1);
    expect(minimap.getAttribute('aria-hidden')).toBe('true');
    const results = await runAxe(['nve-viewport', ViewportMinimap.metadata.tag]);
    expect(results.violations.length).toBe(0);
  });
});
