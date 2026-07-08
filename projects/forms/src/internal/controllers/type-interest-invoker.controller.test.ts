// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createFixture, removeFixture, untilEvent } from '@internals/testing';

import { TypeInterestInvokerController } from './type-interest-invoker.controller.js';
import type { ReactiveController } from './types.js';

type InterestTestEvent = Event & { source: HTMLElement };

class InterestInvokerControllerTestElement extends HTMLElement {
  interestForElement: HTMLElement | null = null;
  popoverTargetElement: HTMLElement | null = null;
  #controllers = new Set<ReactiveController>();

  constructor() {
    super();
    new TypeInterestInvokerController(this);
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

if (!customElements.get('interest-invoker-controller-test-element')) {
  customElements.define('interest-invoker-controller-test-element', InterestInvokerControllerTestElement);
}

describe('InterestInvokerController', () => {
  let fixture: HTMLElement;

  afterEach(() => {
    removeFixture(fixture);
    vi.restoreAllMocks();
  });

  it('should dispatch interest and loseinterest events from pointer hover', async () => {
    fixture = await createFixture(html`
      <interest-invoker-controller-test-element interestfor="target"></interest-invoker-controller-test-element>
      <div id="target"></div>
    `);
    const element = fixture.querySelector<InterestInvokerControllerTestElement>(
      'interest-invoker-controller-test-element'
    )!;
    const target = fixture.querySelector<HTMLElement>('#target')!;
    const interest = untilEvent<InterestTestEvent>(target, 'interest');
    const loseinterest = untilEvent<InterestTestEvent>(target, 'loseinterest');

    element.dispatchEvent(new MouseEvent('mouseenter'));
    element.dispatchEvent(new MouseEvent('mouseleave'));

    expect((await interest).source).toBe(element);
    expect((await loseinterest).source).toBe(element);
  });

  it('should dispatch interest and loseinterest events from focus-visible focus and blur', async () => {
    fixture = await createFixture(html`
      <interest-invoker-controller-test-element interestfor="target"></interest-invoker-controller-test-element>
      <div id="target"></div>
    `);
    const element = fixture.querySelector<InterestInvokerControllerTestElement>(
      'interest-invoker-controller-test-element'
    )!;
    const target = fixture.querySelector<HTMLElement>('#target')!;
    const interest = untilEvent<InterestTestEvent>(target, 'interest');
    const loseinterest = untilEvent<InterestTestEvent>(target, 'loseinterest');
    const focusVisibleMatch = vi.spyOn(element, 'matches').mockReturnValue(true);

    element.dispatchEvent(new FocusEvent('focus'));
    element.dispatchEvent(new FocusEvent('blur'));

    expect((await interest).source).toBe(element);
    expect((await loseinterest).source).toBe(element);
    expect(focusVisibleMatch).toHaveBeenCalledWith(':focus-visible');
  });

  it('should not dispatch interest from focus that is not focus-visible', async () => {
    fixture = await createFixture(html`
      <interest-invoker-controller-test-element interestfor="target"></interest-invoker-controller-test-element>
      <div id="target"></div>
    `);
    const element = fixture.querySelector<InterestInvokerControllerTestElement>(
      'interest-invoker-controller-test-element'
    )!;
    const target = fixture.querySelector<HTMLElement>('#target')!;
    const interest = vi.fn();
    target.addEventListener('interest', interest);
    const focusVisibleMatch = vi.spyOn(element, 'matches').mockReturnValue(false);

    element.dispatchEvent(new FocusEvent('focus'));

    expect(interest).not.toHaveBeenCalled();
    expect(focusVisibleMatch).toHaveBeenCalledWith(':focus-visible');
  });

  it('should not dispatch interest while its popover target is open', async () => {
    fixture = await createFixture(html`
      <interest-invoker-controller-test-element interestfor="tooltip"></interest-invoker-controller-test-element>
      <div id="tooltip"></div>
      <div id="popover" popover>popover</div>
    `);
    const element = fixture.querySelector<InterestInvokerControllerTestElement>(
      'interest-invoker-controller-test-element'
    )!;
    const tooltip = fixture.querySelector<HTMLElement>('#tooltip')!;
    const popover = fixture.querySelector<HTMLElement>('[popover]')!;
    const interest = vi.fn();
    tooltip.addEventListener('interest', interest);
    element.popoverTargetElement = popover;
    popover.showPopover();

    element.dispatchEvent(new MouseEvent('mouseenter'));

    expect(interest).not.toHaveBeenCalled();
  });

  it('should support direct interestForElement references', async () => {
    fixture = await createFixture(html`
      <interest-invoker-controller-test-element></interest-invoker-controller-test-element>
      <div id="target"></div>
    `);
    const element = fixture.querySelector<InterestInvokerControllerTestElement>(
      'interest-invoker-controller-test-element'
    )!;
    const target = fixture.querySelector<HTMLElement>('#target')!;
    const interest = untilEvent<InterestTestEvent>(target, 'interest');

    element.interestForElement = target;
    element.dispatchEvent(new MouseEvent('mouseenter'));

    expect((await interest).source).toBe(element);
  });

  it('should infer interest target from hint popover target', async () => {
    fixture = await createFixture(html`
      <interest-invoker-controller-test-element popovertarget="hint"></interest-invoker-controller-test-element>
      <div id="hint" popover="hint"></div>
    `);
    const element = fixture.querySelector<InterestInvokerControllerTestElement>(
      'interest-invoker-controller-test-element'
    )!;
    const target = fixture.querySelector<HTMLElement>('#hint')!;
    const interest = untilEvent<InterestTestEvent>(target, 'interest');

    element.dispatchEvent(new MouseEvent('mouseenter'));

    expect((await interest).source).toBe(element);
    expect(element.interestForElement).toBe(target);
  });

  it('should no-op for missing targets and after disconnect', async () => {
    fixture = await createFixture(
      html`<interest-invoker-controller-test-element interestfor="missing"></interest-invoker-controller-test-element>`
    );
    const element = fixture.querySelector<InterestInvokerControllerTestElement>(
      'interest-invoker-controller-test-element'
    )!;

    element.dispatchEvent(new MouseEvent('mouseenter'));
    expect(element.interestForElement).toBe(null);

    const target = document.createElement('div');
    let fired = false;
    target.addEventListener('interest', () => (fired = true));
    element.interestForElement = target;
    element.remove();
    element.dispatchEvent(new MouseEvent('mouseenter'));

    expect(fired).toBe(false);
  });
});
