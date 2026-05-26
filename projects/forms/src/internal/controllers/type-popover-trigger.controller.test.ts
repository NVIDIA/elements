// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createFixture, emulateClick, removeFixture } from '@internals/testing';

import type { PopoverTargetAction } from '../../mixins/button.types.js';
import { TypePopoverTriggerController } from './type-popover-trigger.controller.js';
import type { ReactiveController } from './types.js';

class PopoverTriggerControllerTestElement extends HTMLElement {
  disabled = false;
  popoverTargetAction?: PopoverTargetAction;
  popoverTargetElement: HTMLElement | null = null;
  popovertarget?: string;
  #controllers = new Set<ReactiveController>();

  constructor() {
    super();
    new TypePopoverTriggerController(this);
  }

  addController(controller: ReactiveController) {
    this.#controllers.add(controller);
  }

  connectedCallback() {
    this.#controllers.forEach(controller => controller.hostConnected?.());
  }

  disconnectedCallback() {
    this.#controllers.forEach(controller => controller.hostDisconnected?.());
  }
}

if (!customElements.get('popover-trigger-controller-test-element')) {
  customElements.define('popover-trigger-controller-test-element', PopoverTriggerControllerTestElement);
}

describe('PopoverTriggerController', () => {
  let fixture: HTMLElement;

  afterEach(() => {
    removeFixture(fixture);
    vi.restoreAllMocks();
  });

  it('should resolve popover targets by id and toggle them', async () => {
    fixture = await createFixture(html`
      <popover-trigger-controller-test-element></popover-trigger-controller-test-element>
      <div id="popover" popover>popover</div>
    `);
    const element = fixture.querySelector<PopoverTriggerControllerTestElement>(
      'popover-trigger-controller-test-element'
    )!;
    const popover = fixture.querySelector<HTMLElement>('[popover]')!;
    const togglePopover = vi.spyOn(popover, 'togglePopover').mockImplementation(() => false);

    element.popovertarget = 'popover';
    await emulateClick(element);

    expect(element.popoverTargetElement).toBe(popover);
    expect(togglePopover).toHaveBeenCalledWith({ source: element });
  });

  it('should support direct popover target properties and show or hide actions', async () => {
    fixture = await createFixture(html`
      <popover-trigger-controller-test-element></popover-trigger-controller-test-element>
      <div id="popover" popover>popover</div>
    `);
    const element = fixture.querySelector<PopoverTriggerControllerTestElement>(
      'popover-trigger-controller-test-element'
    )!;
    const popover = fixture.querySelector<HTMLElement>('[popover]')!;
    const showPopover = vi.spyOn(popover, 'showPopover').mockImplementation(() => undefined);
    const hidePopover = vi.spyOn(popover, 'hidePopover').mockImplementation(() => undefined);

    element.popoverTargetElement = popover;
    element.popoverTargetAction = 'show';
    await emulateClick(element);

    element.popoverTargetAction = 'hide';
    await emulateClick(element);

    expect(showPopover).toHaveBeenCalledWith({ source: element });
    expect(hidePopover).toHaveBeenCalledTimes(1);
  });

  it('should no-op when disabled or missing a target', async () => {
    fixture = await createFixture(html`
      <popover-trigger-controller-test-element></popover-trigger-controller-test-element>
      <div id="popover" popover>popover</div>
    `);
    const element = fixture.querySelector<PopoverTriggerControllerTestElement>(
      'popover-trigger-controller-test-element'
    )!;
    const popover = fixture.querySelector<HTMLElement>('[popover]')!;
    const togglePopover = vi.spyOn(popover, 'togglePopover').mockImplementation(() => false);

    await emulateClick(element);

    element.popoverTargetElement = popover;
    element.disabled = true;
    await emulateClick(element);

    expect(togglePopover).not.toHaveBeenCalled();
  });

  it('should pass anchored popover sources', async () => {
    fixture = await createFixture(html`
      <popover-trigger-controller-test-element></popover-trigger-controller-test-element>
      <div id="anchor"></div>
      <div id="popover" popover>popover</div>
    `);
    const element = fixture.querySelector<PopoverTriggerControllerTestElement>(
      'popover-trigger-controller-test-element'
    )!;
    const anchor = fixture.querySelector<HTMLElement>('#anchor')!;
    const popover = fixture.querySelector<HTMLElement>('[popover]')!;
    const showPopover = vi.spyOn(popover, 'showPopover').mockImplementation(() => undefined);

    Object.defineProperty(popover, 'anchor', { configurable: true, value: 'anchor' });
    element.popoverTargetElement = popover;
    element.popoverTargetAction = 'show';
    await emulateClick(element);

    expect(showPopover).toHaveBeenCalledWith({ source: anchor });
  });

  it('should remove click behavior on disconnect', async () => {
    fixture = await createFixture(html`
      <popover-trigger-controller-test-element></popover-trigger-controller-test-element>
      <div id="popover" popover>popover</div>
    `);
    const element = fixture.querySelector<PopoverTriggerControllerTestElement>(
      'popover-trigger-controller-test-element'
    )!;
    const popover = fixture.querySelector<HTMLElement>('[popover]')!;
    const togglePopover = vi.spyOn(popover, 'togglePopover').mockImplementation(() => false);

    element.popoverTargetElement = popover;
    element.remove();
    element.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(togglePopover).not.toHaveBeenCalled();
  });
});
