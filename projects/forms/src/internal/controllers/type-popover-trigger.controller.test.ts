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
  interestForElement: HTMLElement | null = null;
  popoverTargetAction?: PopoverTargetAction;
  popoverTargetElement: HTMLElement | null = null;
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

    element.setAttribute('popovertarget', 'popover');
    await emulateClick(element);

    expect(element.popoverTargetElement).toBe(popover);
    expect(togglePopover).toHaveBeenCalledWith({ source: element });
  });

  it('should not invoke a popover from a canceled click', async () => {
    fixture = await createFixture(html`
      <popover-trigger-controller-test-element></popover-trigger-controller-test-element>
      <div id="popover" popover>popover</div>
    `);
    const element = fixture.querySelector<PopoverTriggerControllerTestElement>(
      'popover-trigger-controller-test-element'
    )!;
    const popover = fixture.querySelector<HTMLElement>('[popover]')!;
    const togglePopover = vi.spyOn(popover, 'togglePopover').mockImplementation(() => false);
    fixture.addEventListener('click', event => event.preventDefault(), { capture: true });
    element.popoverTargetElement = popover;

    element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

    expect(togglePopover).not.toHaveBeenCalled();
  });

  it('should follow a changed popover target id', async () => {
    fixture = await createFixture(html`
      <popover-trigger-controller-test-element></popover-trigger-controller-test-element>
      <div id="tooltip"></div>
      <div id="first" popover>first</div>
      <div id="second" popover>second</div>
    `);
    const element = fixture.querySelector<PopoverTriggerControllerTestElement>(
      'popover-trigger-controller-test-element'
    )!;
    const tooltip = fixture.querySelector<HTMLElement>('#tooltip')!;
    const first = fixture.querySelector<HTMLElement>('#first')!;
    const second = fixture.querySelector<HTMLElement>('#second')!;
    const loseInterest = vi.fn();
    tooltip.addEventListener('loseinterest', loseInterest);

    element.interestForElement = tooltip;
    element.popoverTargetAction = 'show';
    element.setAttribute('popovertarget', 'first');
    await emulateClick(element);
    first.hidePopover();

    loseInterest.mockClear();
    element.setAttribute('popovertarget', 'second');
    await emulateClick(element);

    expect(element.popoverTargetElement).toBe(second);
    expect(first.matches(':popover-open')).toBe(false);
    expect(second.matches(':popover-open')).toBe(true);
    expect(loseInterest).toHaveBeenCalledOnce();
  });

  it('should preserve tooltip interest when opening is canceled', async () => {
    fixture = await createFixture(html`
      <popover-trigger-controller-test-element></popover-trigger-controller-test-element>
      <div id="tooltip"></div>
      <div id="popover" popover>popover</div>
    `);
    const element = fixture.querySelector<PopoverTriggerControllerTestElement>(
      'popover-trigger-controller-test-element'
    )!;
    const tooltip = fixture.querySelector<HTMLElement>('#tooltip')!;
    const popover = fixture.querySelector<HTMLElement>('[popover]')!;
    const loseInterest = vi.fn();
    tooltip.addEventListener('loseinterest', loseInterest);
    popover.addEventListener('beforetoggle', event => event.preventDefault());
    element.interestForElement = tooltip;
    element.popoverTargetElement = popover;

    await emulateClick(element);

    expect(popover.matches(':popover-open')).toBe(false);
    expect(loseInterest).not.toHaveBeenCalled();
  });

  it('should preserve tooltip interest when toggling a popover closed', async () => {
    fixture = await createFixture(html`
      <popover-trigger-controller-test-element></popover-trigger-controller-test-element>
      <div id="tooltip"></div>
      <div id="popover" popover>popover</div>
    `);
    const element = fixture.querySelector<PopoverTriggerControllerTestElement>(
      'popover-trigger-controller-test-element'
    )!;
    const tooltip = fixture.querySelector<HTMLElement>('#tooltip')!;
    const popover = fixture.querySelector<HTMLElement>('[popover]')!;
    const loseInterest = vi.fn();
    tooltip.addEventListener('loseinterest', loseInterest);
    element.interestForElement = tooltip;
    element.popoverTargetElement = popover;
    popover.showPopover();

    await emulateClick(element);

    expect(popover.matches(':popover-open')).toBe(false);
    expect(loseInterest).not.toHaveBeenCalled();
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

  it('should pass the anchor as the popover source when the target has an anchor', async () => {
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

  it('should hand over tooltip interest after an anchored target popover opens from the trigger', async () => {
    fixture = await createFixture(html`
      <popover-trigger-controller-test-element interestfor="tooltip" popovertarget="popover"></popover-trigger-controller-test-element>
      <div id="tooltip"></div>
      <div id="anchor"></div>
      <div id="popover" popover>popover</div>
    `);
    const element = fixture.querySelector<PopoverTriggerControllerTestElement>(
      'popover-trigger-controller-test-element'
    )!;
    const tooltip = fixture.querySelector<HTMLElement>('#tooltip')!;
    const anchor = fixture.querySelector<HTMLElement>('#anchor')!;
    const popover = fixture.querySelector<HTMLElement>('[popover]')!;
    let interestSource: HTMLElement | undefined;
    let popoverSource: HTMLElement | null | undefined;
    tooltip.addEventListener('loseinterest', event => {
      interestSource = (event as Event & { source: HTMLElement }).source;
    });
    popover.addEventListener('beforetoggle', event => {
      popoverSource = (event as ToggleEvent).source;
    });

    Object.defineProperty(popover, 'anchor', { configurable: true, value: 'anchor' });
    element.interestForElement = tooltip;
    element.setAttribute('popovertarget', 'popover');
    await emulateClick(element);

    expect(element.popoverTargetElement).toBe(popover);
    expect(popover.matches(':popover-open')).toBe(true);
    expect(popoverSource).toBe(anchor);
    expect(interestSource).toBe(element);
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
