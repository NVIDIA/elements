// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@internals/testing';
import { IconButton } from '@nvidia-elements/core/icon-button';
import { Time } from '@nvidia-elements/core/time';
import '@nvidia-elements/core/time/define.js';

describe(Time.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: Time;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-time>
        <label>label</label>
        <input type="time" />
      </nve-time>
    `);
    element = fixture.querySelector(Time.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get(Time.metadata.tag)).toBeDefined();
  });

  it('should render clock suffix icon', () => {
    expect(element.shadowRoot.querySelector(IconButton.metadata.tag).getAttribute('icon-name')).toBe('clock');
  });

  it('should trigger native UI', async () => {
    element.shadowRoot.querySelector<IconButton>(IconButton.metadata.tag).click();
    await elementIsStable(element);
    expect(element.input.matches(':focus')).toBe(false);
  });

  it('should find the slotted input as its input', async () => {
    await elementIsStable(element);
    expect(element.input).toBe(fixture.querySelector('input'));
  });

  it('should apply aria-label to the clock icon button', async () => {
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector(IconButton.metadata.tag).ariaLabel).toBe('expand');
  });

  it('should have a flat container option', async () => {
    expect(element.container).toBe(undefined);
    element.container = 'flat';
    await elementIsStable(element);
    expect(element.container).toBe('flat');
    expect(element.hasAttribute('container')).toBe(true);
  });
});
