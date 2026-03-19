// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { IconButton } from '@nvidia-elements/core/icon-button';
import { Icon } from '@nvidia-elements/core/icon';
import '@nvidia-elements/core/icon-button/define.js';

/* eslint-disable @nvidia-elements/lint/no-missing-icon-name */

describe(IconButton.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: IconButton;
  let elementWithAnchor: IconButton;
  let elementWithCustomIcon: IconButton;
  let anchor: HTMLAnchorElement;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-icon-button></nve-icon-button>
      <nve-icon-button>
        <a href="#" aria-label="link to page"></a>
      </nve-icon-button>
      <nve-icon-button>
        <span>🎉</span>
      </nve-icon-button>
    `);
    element = fixture.querySelectorAll<IconButton>(IconButton.metadata.tag)[0];
    elementWithAnchor = fixture.querySelectorAll<IconButton>(IconButton.metadata.tag)[1];
    elementWithCustomIcon = fixture.querySelectorAll<IconButton>(IconButton.metadata.tag)[2];
    anchor = fixture.querySelector('[href]');
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get(IconButton.metadata.tag)).toBeDefined();
  });

  it('should provide a aria role of button', async () => {
    await elementIsStable(element);
    expect(element._internals.role).toBe('button');
  });

  it('should use aria-hidden to semantically hide the SVG in favor of the host element role', async () => {
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector('[internal-host]').getAttribute('aria-hidden')).toBe('true');
    expect(element.shadowRoot.querySelector(Icon.metadata.tag).getAttribute('aria-hidden')).toBe('true');
  });

  it('should have a default interaction unset', () => {
    expect(element.interaction).eq(undefined);
  });

  it('should update "name" on child nve-icon when "icon" is updated on parent', async () => {
    expect(element.iconName).eq(undefined);
    element.iconName = 'cancel';
    await elementIsStable(element);

    expect(element.iconName).toBe('cancel');
    element.iconName = 'cancel';
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector<Icon>(Icon.metadata.tag).name).toBe('cancel');
  });

  it('should allow anchor to be slotted', async () => {
    await elementIsStable(elementWithAnchor);
    expect(anchor.slot).toBe('anchor');
  });

  it('should allow custom icon to be slotted', async () => {
    await elementIsStable(elementWithAnchor);
    expect(elementWithCustomIcon.shadowRoot.querySelector<HTMLSlotElement>('slot').assignedElements()[0]).toBe(
      fixture.querySelector('span')
    );
  });
});
