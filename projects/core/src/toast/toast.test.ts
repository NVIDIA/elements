// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable, untilEvent } from '@internals/testing';
import { IconButton } from '@nvidia-elements/core/icon-button';
import { Toast } from '@nvidia-elements/core/toast';
import { Icon } from '@nvidia-elements/core/icon';
import '@nvidia-elements/core/toast/define.js';

describe(Toast.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: Toast;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-toast>hello</nve-toast>
    `);
    element = fixture.querySelector(Toast.metadata.tag);
    element.hidePopover();
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get(Toast.metadata.tag)).toBeDefined();
  });

  it('should render close button when closable', async () => {
    expect(element.shadowRoot.querySelector(IconButton.metadata.tag)).toBe(null);
    element.closable = true;
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector(IconButton.metadata.tag).tagName.toLocaleLowerCase()).toBe(
      IconButton.metadata.tag
    );
  });

  // https://open-ui.org/components/popup.research.explainer#api-shape
  it('should default to manual behavior', async () => {
    await elementIsStable(element);
    expect(element.popoverType).toBe('manual');
  });

  it('should default to positioning on the top of an anchor', async () => {
    await elementIsStable(element);
    expect(element.position).toBe('top');
  });

  it('should initialize role of type alert', async () => {
    await elementIsStable(element);
    expect(element._internals.role).toBe('alert');
  });

  it('should set an aria-label for the icon status', async () => {
    await elementIsStable(element);
    element.status = 'success';
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector(Icon.metadata.tag).ariaLabel).toBe('success');
  });

  it('should apply an aria-label to the close button', async () => {
    element.closable = true;
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector(IconButton.metadata.tag).ariaLabel).toBe('close');
  });

  it('should hide status icon if muted', async () => {
    element.status = 'muted';
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector(Icon.metadata.tag)).toBe(null);
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
    element.closable = true;
    await elementIsStable(element);

    const open = untilEvent(element, 'open');
    element.showPopover();
    expect(await open).toBeDefined();

    const event = untilEvent(element, 'close');
    element.shadowRoot.querySelector<IconButton>(IconButton.metadata.tag).click();
    expect(await event).toBeDefined();
  });

  it('should reflect status attribute to DOM', async () => {
    expect(element.getAttribute('status')).toBe(null);
    element.status = 'warning';
    await elementIsStable(element);
    expect(element.getAttribute('status')).toBe('warning');
  });

  it('should render default information icon when no status is set', async () => {
    await elementIsStable(element);
    const icon = element.shadowRoot.querySelector<Icon>(Icon.metadata.tag);
    expect(icon).toBeTruthy();
    expect(icon.name).toBe('information-circle-stroke');
  });

  it('should include detail in open event', async () => {
    await elementIsStable(element);
    const event = untilEvent(element, 'open');
    element.showPopover();
    const e = await event;
    expect(e).toBeDefined();
    expect((e as CustomEvent).detail).toBeDefined();
  });

  it('should not be inert when open and should be inert after close', async () => {
    await elementIsStable(element);

    const open = untilEvent(element, 'open');
    element.showPopover();
    await open;
    expect(element.inert).toBe(false);

    const close = untilEvent(element, 'close');
    element.hidePopover();
    await close;
    expect(element.inert).toBe(true);
  });

  it('should auto-close after closeTimeout elapses', async () => {
    element.closeTimeout = 50;
    await elementIsStable(element);

    const open = untilEvent(element, 'open');
    element.showPopover();
    await open;

    const close = untilEvent(element, 'close');
    const e = await close;
    expect(e).toBeDefined();
  });
});
