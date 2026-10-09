// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';

describe('minimap registration', () => {
  let fixture: HTMLElement;

  beforeEach(async () => {
    fixture = await createFixture();
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('renders existing markup when the minimap entrypoint loads before the viewport entrypoint', async () => {
    fixture.innerHTML = `
      <nve-viewport behavior-pan style="width: 400px; height: 300px">
        <div style="position: absolute; width: 800px; height: 600px">content</div>
        <nve-viewport-minimap></nve-viewport-minimap>
      </nve-viewport>
    `;
    expect(customElements.get('nve-viewport')).toBeUndefined();

    await import(/* @vite-ignore */ new URL('../../dist/minimap/define.js', import.meta.url).href);

    expect(customElements.get('nve-viewport')).toBeDefined();
    expect(customElements.get('nve-viewport-gridlines')).toBeUndefined();
    const viewport = fixture.querySelector('nve-viewport');
    const minimap = fixture.querySelector('nve-viewport-minimap');
    if (!viewport || !minimap) {
      throw new Error('Viewport and minimap are missing.');
    }
    await elementIsStable(viewport);
    await elementIsStable(minimap);
    await expect.poll(() => minimap.shadowRoot?.querySelector('[data-visible-region]')).toBeInstanceOf(SVGRectElement);
    expect(minimap.shadowRoot?.querySelector('[data-item-key]')).toBeInstanceOf(SVGRectElement);
    expect(minimap.matches(':state(pan-eligible)')).toBe(true);
  });
});
