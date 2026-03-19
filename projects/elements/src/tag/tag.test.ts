// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture, untilEvent } from '@internals/testing';
import { Icon } from '@nvidia-elements/core/icon';
import { Tag } from '@nvidia-elements/core/tag';
import '@nvidia-elements/core/tag/define.js';

describe(Tag.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: Tag;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-tag></nve-tag>
    `);
    element = fixture.querySelector(Tag.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get(Tag.metadata.tag)).toBeDefined();
  });

  it('should reflect a color', async () => {
    expect(element.color).toBe(undefined);
    expect(element.hasAttribute('color')).toBe(false);

    element.color = 'green-grass';
    await elementIsStable(element);
    expect(element.getAttribute('color')).toBe('green-grass');
  });

  it('should show close icon if closable', async () => {
    expect(element.closable).toBe(false);
    expect(element.shadowRoot.querySelector(Icon.metadata.tag)).toBeFalsy();

    element.closable = true;
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector(Icon.metadata.tag)).toBeTruthy();
  });

  it('should be an interctive button type', async () => {
    await elementIsStable(element);
    expect(element._internals.role).toBe('button');
  });

  it('should have a type default of button', async () => {
    await elementIsStable(element);
    expect(element.type).toBe('button');
  });

  it('should emit close event when close button clicked', async () => {
    element.closable = true;
    await elementIsStable(element);

    const event = untilEvent(element, 'close');
    element.shadowRoot.querySelector<Icon>(Icon.metadata.tag).click();
    expect(await event).toBeDefined();
  });
});
