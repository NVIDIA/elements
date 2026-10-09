// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';

describe('gridlines registration', () => {
  let fixture: HTMLElement;

  beforeEach(async () => {
    fixture = await createFixture();
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('renders existing markup when the gridlines entrypoint loads before the viewport entrypoint', async () => {
    fixture.innerHTML = `
      <nve-viewport style="width: 400px; height: 300px">
        <nve-viewport-gridlines></nve-viewport-gridlines>
      </nve-viewport>
    `;
    expect(customElements.get('nve-viewport')).toBeUndefined();

    await import(/* @vite-ignore */ new URL('../../dist/gridlines/define.js', import.meta.url).href);

    expect(customElements.get('nve-viewport')).toBeDefined();
    expect(customElements.get('nve-viewport-minimap')).toBeUndefined();
    const viewport = fixture.querySelector('nve-viewport');
    const gridlines = fixture.querySelector('nve-viewport-gridlines');
    if (!viewport || !gridlines) {
      throw new Error('Viewport and gridlines are missing.');
    }
    await elementIsStable(viewport);
    await elementIsStable(gridlines);
    await expect
      .poll(() => gridlines.shadowRoot?.querySelector('[data-gridline-pattern]'))
      .toBeInstanceOf(SVGPatternElement);

    viewport.scale = 2;
    await elementIsStable(viewport);
    expect(gridlines.style.getPropertyValue('--_scale')).toBe('2');
  });
});
