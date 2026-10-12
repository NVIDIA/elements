// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';

describe('zoom range registration', () => {
  let fixture: HTMLElement;

  beforeEach(async () => {
    fixture = await createFixture();
  });

  afterEach(() => removeFixture(fixture));

  it('synchronizes existing markup when the zoom range entrypoint loads before the viewport entrypoint', async () => {
    fixture.innerHTML = `
      <nve-viewport id="target" behavior-zoom min-scale="0.25" max-scale="4" scale="2"></nve-viewport>
      <nve-viewport-zoom-range commandfor="target" aria-label="Zoom"></nve-viewport-zoom-range>
    `;
    expect(customElements.get('nve-viewport')).toBeUndefined();

    await import(/* @vite-ignore */ new URL('../../dist/zoom-range/define.js', import.meta.url).href);

    expect(customElements.get('nve-viewport')).toBeDefined();
    expect(customElements.get('nve-viewport-minimap')).toBeUndefined();
    expect(customElements.get('nve-viewport-gridlines')).toBeUndefined();
    const viewport = fixture.querySelector('nve-viewport');
    const range = fixture.querySelector('nve-viewport-zoom-range');
    if (!viewport || !range) throw new Error('Viewport and zoom range are missing.');
    await elementIsStable(viewport);
    await elementIsStable(range);
    expect(range.min).toBe(0.25);
    expect(range.max).toBe(4);
    expect(range.scale).toBe(2);
    expect(range.shadowRoot?.querySelector('input')?.disabled).toBe(false);
  });
});
