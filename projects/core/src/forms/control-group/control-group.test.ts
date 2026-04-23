// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@internals/testing';
import { ControlGroup, ControlMessage } from '@nvidia-elements/core/forms';
import '@nvidia-elements/core/forms/define.js';

describe(ControlGroup.metadata.tag, () => {
  let fixture: HTMLElement;
  let label: HTMLLabelElement;
  let element: ControlGroup;
  let message: ControlMessage;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-control-group>
        <label>group</label>
        <nve-control-message>message</nve-control-message>
      </nve-control-group>
    `);
    element = fixture.querySelector(ControlGroup.metadata.tag);
    message = fixture.querySelector(ControlMessage.metadata.tag);
    label = fixture.querySelector('label');
    await elementIsStable(element);
    await elementIsStable(message);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get(ControlGroup.metadata.tag)).toBeDefined();
  });

  it('should provide a aria role of group to describe content', async () => {
    await elementIsStable(element);
    expect(element._internals.role).toBe('group');
  });

  it('should associate label to group', async () => {
    await elementIsStable(element);
    expect(element.getAttribute('aria-labelledby')).toBe(label.id);
  });

  it('should assign label to label slot', async () => {
    await elementIsStable(element);
    expect(label.slot).toBe('label');
  });

  it('should associate message to group', async () => {
    await elementIsStable(element);
    expect(element.getAttribute('aria-describedby')).toBe(message.id);
  });

  it('should assign no-label style hook if no visble control label was provided', async () => {
    label.remove();
    element.requestUpdate();
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector('.no-label')).toBeTruthy();
  });
});
