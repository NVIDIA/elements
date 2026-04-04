// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable, untilEvent } from '@internals/testing';
import { IconButton } from '@nvidia-elements/core/icon-button';
import { Toggletip } from '@nvidia-elements/core/toggletip';
import '@nvidia-elements/core/toggletip/define.js';

describe(Toggletip.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: Toggletip;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-toggletip id="toggletip">toggletip</nve-toggletip>
      <button popovertarget="toggletip">button</button>
    `);
    element = fixture.querySelector(Toggletip.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get(Toggletip.metadata.tag)).toBeDefined();
  });

  it('should render close button when closable', async () => {
    expect(element.shadowRoot.querySelector(IconButton.metadata.tag)).toBe(null);
    element.closable = true;
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector(IconButton.metadata.tag).tagName.toLocaleLowerCase()).toBe(
      IconButton.metadata.tag
    );
  });

  it('should render arrow by default', async () => {
    expect(element.shadowRoot.querySelector('.arrow').tagName).toBe('DIV');
  });

  it('should remove arrow when arrow is set to false', async () => {
    expect(element.shadowRoot.querySelector('.arrow')).toBeTruthy();
    element.arrow = false;
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector('.arrow')).toBe(null);
  });

  // https://open-ui.org/components/popup.research.explainer#api-shape
  it('should default to auto behavior', async () => {
    await elementIsStable(element);
    expect(element.popoverType).toBe('auto');
  });

  it('should default to positioning on the top of an anchor', async () => {
    await elementIsStable(element);
    expect(element.position).toBe('top');
  });

  it('should default to alignment of center to the anchor', async () => {
    await elementIsStable(element);
    expect(element.alignment).toBe('center');
  });

  it('should apply an aria-label to the close button', async () => {
    element.closable = true;
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector(IconButton.metadata.tag).ariaLabel).toBe('close');
  });

  it('should initialize role of type toggletip', async () => {
    await elementIsStable(element);
    expect(element._internals.role).toBe('toggletip');
  });

  it('should emit open event when showPopover is called', async () => {
    element.closable = true;
    await elementIsStable(element);

    const event = untilEvent(element, 'open');
    element.showPopover();
    expect(await event).toBeDefined();
  });

  it('should emit close event when hidePopover is called', async () => {
    element.closable = true;
    await elementIsStable(element);

    const open = untilEvent(element, 'open');
    element.showPopover();
    expect(await open).toBeDefined();

    const close = untilEvent(element, 'close');
    element.hidePopover();
    expect(await close).toBeDefined();
  });

  it('should emit close event when close button clicked', async () => {
    element.hidePopover();
    element.closable = true;
    await elementIsStable(element);

    const open = untilEvent(element, 'open');
    element.showPopover();
    expect(await open).toBeDefined();

    const event = untilEvent(element, 'close');
    element.shadowRoot.querySelector<IconButton>(IconButton.metadata.tag).click();
    expect(await event).toBeDefined();
  });
});
