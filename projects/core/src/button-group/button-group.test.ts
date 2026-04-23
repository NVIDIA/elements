// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, emulateClick, removeFixture } from '@internals/testing';
import { ButtonGroup } from '@nvidia-elements/core/button-group';
import { IconButton } from '@nvidia-elements/core/icon-button';
import { Divider } from '@nvidia-elements/core/divider';
import '@nvidia-elements/core/button-group/define.js';
import '@nvidia-elements/core/icon-button/define.js';
import '@nvidia-elements/core/divider/define.js';

describe(ButtonGroup.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: ButtonGroup;
  let buttons: IconButton[];

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-button-group>
        <nve-icon-button icon-name="copy"></nve-icon-button>
        <nve-icon-button icon-name="add-comment"></nve-icon-button>
        <nve-icon-button icon-name="download"></nve-icon-button>
      </nve-button-group>
    `);
    element = fixture.querySelector(ButtonGroup.metadata.tag);
    buttons = Array.from(fixture.querySelectorAll(IconButton.metadata.tag));
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get(ButtonGroup.metadata.tag)).toBeDefined();
  });

  it('should initialize role group', async () => {
    await elementIsStable(element);
    expect(element._internals.role).toBe('group');
  });

  it('should sync split state if divider is provided', async () => {
    await elementIsStable(element);
    expect(element.matches(':state(split)')).toBe(false);

    const divider = document.createElement(Divider.metadata.tag);
    element.appendChild(divider);

    await elementIsStable(element);
    expect(element.matches(':state(split)')).toBe(true);
  });

  it('should sync flat container styles', async () => {
    element.container = 'flat';
    await elementIsStable(element);
    expect(buttons[0].container).toBe('flat');
    expect(buttons[1].container).toBe('flat');
    expect(buttons[2].container).toBe('flat');
  });

  it('should sync interaction container styles', async () => {
    element.interaction = 'emphasis';
    await elementIsStable(element);
    expect(buttons[0].interaction).toBe('emphasis');
    expect(buttons[1].interaction).toBe('emphasis');
    expect(buttons[2].interaction).toBe('emphasis');
  });

  it('should sync interaction styles to all buttons when interaction changes', async () => {
    element.interaction = 'destructive';
    await elementIsStable(element);
    expect(buttons[0].interaction).toBe('destructive');
    expect(buttons[1].interaction).toBe('destructive');
    expect(buttons[2].interaction).toBe('destructive');
  });

  it('should reflect orientation attribute to DOM', async () => {
    expect(element.getAttribute('orientation')).toBe('horizontal');
    element.orientation = 'vertical';
    await elementIsStable(element);
    expect(element.getAttribute('orientation')).toBe('vertical');
  });

  it('should be stateless by default', async () => {
    await elementIsStable(element);
    emulateClick(buttons[0]);
    expect(buttons[0].pressed).toBe(undefined);
    expect(buttons[1].pressed).toBe(undefined);
    expect(buttons[2].pressed).toBe(undefined);
  });

  it('should have an exclusive press when using behavior-select="single"', async () => {
    element.behaviorSelect = 'single';
    await elementIsStable(element);

    emulateClick(buttons[0]);
    await elementIsStable(element);

    expect(buttons[0].pressed).toBe(true);
    expect(buttons[1].pressed).toBe(false);
    expect(buttons[2].pressed).toBe(false);

    emulateClick(buttons[1]);
    await elementIsStable(element);

    expect(buttons[0].pressed).toBe(false);
    expect(buttons[1].pressed).toBe(true);
    expect(buttons[2].pressed).toBe(false);
  });

  it('should allow multiple buttons in pressed state when using behavior-select="multi"', async () => {
    element.behaviorSelect = 'multi';
    await elementIsStable(element);

    emulateClick(buttons[0]);
    await elementIsStable(element);

    expect(buttons[0].pressed).toBe(true);
    expect(buttons[1].pressed).toBe(undefined);
    expect(buttons[2].pressed).toBe(undefined);

    emulateClick(buttons[1]);
    await elementIsStable(element);

    expect(buttons[0].pressed).toBe(true);
    expect(buttons[1].pressed).toBe(true);
    expect(buttons[2].pressed).toBe(undefined);
  });
});
