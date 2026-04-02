// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable, untilEvent } from '@internals/testing';
import { IconButton } from '@nvidia-elements/core/icon-button';
import { Color } from '@nvidia-elements/core/color';
import '@nvidia-elements/core/color/define.js';

describe(Color.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: Color;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-color style="--background: #dde1e4">
        <label>label</label>
        <input type="color" />
      </nve-color>
    `);
    element = fixture.querySelector(Color.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get(Color.metadata.tag)).toBeDefined();
  });

  it('should have a color picker button defined', () => {
    expect(element.shadowRoot.querySelector(IconButton.metadata.tag)).toBeDefined();
  });

  it('should default the color to the input background if not set', async () => {
    await elementIsStable(element);
    expect(fixture.querySelector('input').value).toBe('#dde1e4');
  });

  it('should apply default if custom default is provided', async () => {
    await elementIsStable(element);
    expect(fixture.querySelector('input').value).toBe('#dde1e4');
  });

  it('should not apply default if custom default is provided', async () => {
    const element = document.createElement(Color.metadata.tag) as Color;
    const input = document.createElement('input');
    input.value = '#fff';

    element.appendChild(input);
    document.body.appendChild(element);
    await element.updateComplete;
    expect(input.value).toBe('#fff');
    element.remove();
  });

  it('should update the color value if EyeDropper is used', async () => {
    const original = (window as any).EyeDropper; // eslint-disable-line @typescript-eslint/no-explicit-any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).EyeDropper = class {
      open() {
        return Promise.resolve({ sRGBHex: '#2d2d2d' });
      }
    };

    await elementIsStable(element);
    expect(fixture.querySelector('input').value).toBe('#dde1e4');

    const input = untilEvent(fixture.querySelector('input'), 'input');
    const change = untilEvent(fixture.querySelector('input'), 'change');
    element.shadowRoot.querySelector<IconButton>(IconButton.metadata.tag).click();

    expect(await input).toBeDefined();
    expect(await change).toBeDefined();
    expect(fixture.querySelector('input').value).toBe('#2d2d2d');

    (window as any).EyeDropper = original; // eslint-disable-line @typescript-eslint/no-explicit-any
  });

  it('should apply aria-label to the eye dropper icon button', async () => {
    await elementIsStable(element);
    const btn = element.shadowRoot.querySelector(IconButton.metadata.tag);
    expect(btn.ariaLabel).toBe('expand');
  });

  it('should have a flat container option', async () => {
    expect(element.container).toBe(undefined);
    element.container = 'flat';
    await elementIsStable(element);
    expect(element.container).toBe('flat');
    expect(element.hasAttribute('container')).toBe(true);
  });
});
