// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@internals/testing';
import { Icon } from '@nvidia-elements/core/icon';
import { ControlMessage } from '@nvidia-elements/core/forms';
import '@nvidia-elements/core/forms/define.js';

describe(ControlMessage.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: ControlMessage;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-control-message></nve-control-message>
    `);
    element = fixture.querySelector(ControlMessage.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get(ControlMessage.metadata.tag)).toBeDefined();
  });

  it('should self assign to the messages slot for controls', () => {
    expect(element.slot).toBe('messages');
  });

  it('should assign correct icon based on control validation state', async () => {
    const icon = element.shadowRoot.querySelector<Icon>(Icon.metadata.tag);
    expect(icon.name).toBe('information-circle-stroke');

    element.status = 'success';
    await elementIsStable(element);
    expect(icon.name).toBe('checkmark-circle');

    element.status = 'error';
    await elementIsStable(element);
    expect(icon.name).toBe('exclamation-circle');

    element.status = 'disabled';
    await elementIsStable(element);
    expect(icon.name).toBe('information-circle-stroke');

    element.status = 'warning';
    await elementIsStable(element);
    expect(icon.name).toBe('exclamation-triangle');
  });

  it('should set the icon name if message has a validation error applied', async () => {
    element.error = 'valueMissing';
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector<Icon>(Icon.metadata.tag).name).toBe('exclamation-circle');
  });

  it('should set danger color status if message has a validation error applied', async () => {
    element.error = 'valueMissing';
    await elementIsStable(element);
    expect(getComputedStyle(element).getPropertyValue('--color')).toBe(
      getComputedStyle(globalThis.document.documentElement).getPropertyValue('--nve-sys-support-danger-emphasis-color')
    );
  });

  it('should support a slot for the icon', async () => {
    const icon = document.createElement(Icon.metadata.tag) as Icon;
    icon.name = 'information-circle-stroke';
    icon.slot = 'icon';
    element.appendChild(icon);
    await elementIsStable(element);
    expect(
      (element.shadowRoot.querySelector('slot[name="icon"]') as HTMLSlotElement).assignedNodes()[0]
    ).toBeInstanceOf(Icon);
  });
});
