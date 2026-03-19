// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, emulateClick, removeFixture, untilEvent } from '@internals/testing';
import { Alert } from '@nvidia-elements/core/alert';
import { IconButton } from '@nvidia-elements/core/icon-button';
import { Icon } from '@nvidia-elements/core/icon';
import '@nvidia-elements/core/alert/define.js';

describe(Alert.metadata.tag, () => {
  let fixture: HTMLElement;
  let alert: Alert;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-alert>default</nve-alert>
    `);
    alert = fixture.querySelector(Alert.metadata.tag);
    await elementIsStable(alert);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define elements', () => {
    expect(customElements.get(Alert.metadata.tag)).toBeDefined();
  });

  it('should show close button if closable', async () => {
    expect(alert.shadowRoot.querySelector(IconButton.metadata.tag)).toBe(null);
    alert.closable = true;
    await elementIsStable(alert);
    expect(alert.shadowRoot.querySelector(IconButton.metadata.tag)).toBeDefined();
  });

  it('should emit close event when close button clicked', async () => {
    alert.closable = true;
    await elementIsStable(alert);

    const event = untilEvent(alert, 'close');
    emulateClick(alert.shadowRoot.querySelector(IconButton.metadata.tag));
    expect(await event).toBeDefined();
  });

  it('should show status icon if status is proivided', async () => {
    expect(alert.shadowRoot.querySelector<Icon>(Icon.metadata.tag).name).toBe('information-circle-stroke');
    alert.status = 'success';
    await elementIsStable(alert);
    expect(alert.shadowRoot.querySelector<Icon>(Icon.metadata.tag)).toBeDefined();
    expect(alert.shadowRoot.querySelector<Icon>(Icon.metadata.tag).name).toBe('checkmark-circle');
  });

  it('should set an aria-label for the icon status', async () => {
    expect(alert.shadowRoot.querySelector<Icon>(Icon.metadata.tag).ariaLabel).toBe('information');
    alert.status = 'success';
    await elementIsStable(alert);
    expect(alert.shadowRoot.querySelector<Icon>(Icon.metadata.tag).ariaLabel).toBe('success');
  });

  it('should provide a aria role of alert to describe content', async () => {
    await elementIsStable(alert);
    expect(alert._internals.role).toBe('alert');
  });

  it('should apply an aria-label to the close button', async () => {
    alert.closable = true;
    await elementIsStable(alert);
    expect(alert.shadowRoot.querySelector<IconButton>(IconButton.metadata.tag).ariaLabel).toBe('close');
  });

  it('should provide a actions slot for action buttons', async () => {
    await elementIsStable(alert);
    expect(alert.shadowRoot.querySelector<HTMLElement>('slot[name=actions]').hidden).toBe(true);

    const button = document.createElement('button');
    button.slot = 'actions';
    alert.appendChild(button);
    alert.requestUpdate();

    await elementIsStable(alert);
    expect(alert.shadowRoot.querySelector<HTMLElement>('slot[name=actions]').hidden).toBe(false);
  });

  it('should provide a prefix slot for banner api', async () => {
    await elementIsStable(alert);
    expect(alert.shadowRoot.querySelector<HTMLElement>('slot[name=prefix]').hidden).toBe(true);

    const span = document.createElement('span');
    span.slot = 'prefix';
    alert.appendChild(span);
    alert.requestUpdate();

    await elementIsStable(alert);
    expect(alert.shadowRoot.querySelector<HTMLElement>('slot[name=prefix]').hidden).toBe(false);
  });
});
