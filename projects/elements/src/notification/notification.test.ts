// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable, untilEvent } from '@internals/testing';
import { Notification, NotificationGroup } from '@nvidia-elements/core/notification';
import { IconButton } from '@nvidia-elements/core/icon-button';
import { Icon } from '@nvidia-elements/core/icon';
import '@nvidia-elements/core/notification/define.js';

describe(Notification.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: Notification;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-notification>hello</nve-notification>
    `);
    element = fixture.querySelector(Notification.metadata.tag);
    element.hidePopover();
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get(Notification.metadata.tag)).toBeDefined();
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

  it('should initialize role type of alert', async () => {
    await elementIsStable(element);
    expect(element._internals.role).toBe('alert');
  });

  it('should set an aria-label for the icon status', async () => {
    expect(element.shadowRoot.querySelector(Icon.metadata.tag).ariaLabel).toBe('information');
    element.status = 'success';
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector(Icon.metadata.tag).ariaLabel).toBe('success');
  });

  it('should default to positioning to inline content', async () => {
    await elementIsStable(element);
    expect(element.position).toBe(undefined);
  });

  it('should default to alignment to inline content', async () => {
    await elementIsStable(element);
    expect(element.position).toBe(undefined);
  });

  it('should initialize to inline content', async () => {
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector('dialog')).toBe(null);
  });

  it('should reflect a status', async () => {
    expect(element.status).toBe(undefined);
    expect(element.hasAttribute('status')).toBe(false);

    element.status = 'accent';
    await elementIsStable(element);
    expect(element.getAttribute('status')).toBe('accent');
  });

  it('should reflect a container', async () => {
    expect(element.container).toBe(undefined);
    expect(element.hasAttribute('container')).toBe(false);

    element.container = 'flat';
    await elementIsStable(element);
    expect(element.getAttribute('container')).toBe('flat');
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

  it('should provide a icon slot', async () => {
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector('slot[name="icon"]')).toBeDefined();
  });
});

describe(`${Notification.metadata.tag} - inline`, () => {
  let fixture: HTMLElement;
  let element: Notification;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-notification>hello</nve-notification>
    `);
    element = fixture.querySelector(Notification.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get(Notification.metadata.tag)).toBeDefined();
  });

  it('should emit close event when closed and inline mode', async () => {
    element.closable = true;
    element.container = 'flat';
    await elementIsStable(element);

    const event = untilEvent(element, 'close');
    element.shadowRoot.querySelector<IconButton>(IconButton.metadata.tag).click();
    expect(await event).toBeDefined();
  });
});

describe(`${Notification.metadata.tag} - inline group`, () => {
  let fixture: HTMLElement;
  let element: NotificationGroup;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-notification-group></nve-notification-group>
    `);
    element = fixture.querySelector(NotificationGroup.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should setup close timeout when in inline mode', async () => {
    const notification = document.createElement('nve-notification');
    notification.closeTimeout = 10;

    const close = untilEvent(notification, 'close');
    element.appendChild(notification);
    await elementIsStable(notification);
    expect(await close).toBeDefined();
  });
});
