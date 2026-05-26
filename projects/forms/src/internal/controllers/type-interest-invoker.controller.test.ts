// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, describe, expect, it } from 'vitest';
import { createFixture, removeFixture, untilEvent } from '@internals/testing';

import { TypeInterestInvokerController } from './type-interest-invoker.controller.js';
import type { ReactiveController } from './types.js';

type InterestTestEvent = Event & { source: HTMLElement };

class InterestInvokerControllerTestElement extends HTMLElement {
  interestForElement: HTMLElement | null = null;
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

  it('should dispatch interest and loseinterest events from focus and blur', async () => {
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

    element.dispatchEvent(new FocusEvent('focus'));
    element.dispatchEvent(new FocusEvent('blur'));

    expect((await interest).source).toBe(element);
    expect((await loseinterest).source).toBe(element);
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
