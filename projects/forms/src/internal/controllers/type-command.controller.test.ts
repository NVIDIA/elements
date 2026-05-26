// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createFixture, emulateClick, removeFixture, untilEvent } from '@internals/testing';

import { TypeCommandController } from './type-command.controller.js';
import type { ReactiveController } from './types.js';

type CommandTestEvent = Event & { command: string; source: HTMLElement };

class CommandBehaviorControllerTestElement extends HTMLElement {
  command?: string;
  commandfor: string | null = null;
  commandForElement: HTMLElement | null = null;
  disabled = false;
  readOnly = false;
  #controllers = new Set<ReactiveController>();

  constructor() {
    super();
    new TypeCommandController(this);
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

  sync() {
    this.#controllers.forEach(controller => controller.hostUpdated?.());
  }
}

if (!customElements.get('command-behavior-controller-test-element')) {
  customElements.define('command-behavior-controller-test-element', CommandBehaviorControllerTestElement);
}

describe('CommandBehaviorController', () => {
  let fixture: HTMLElement;

  afterEach(() => {
    removeFixture(fixture);
    vi.restoreAllMocks();
  });

  it('should dispatch command events to direct commandForElement targets', async () => {
    fixture = await createFixture(
      html`<command-behavior-controller-test-element></command-behavior-controller-test-element><div id="target"></div>`
    );
    const element = fixture.querySelector<CommandBehaviorControllerTestElement>(
      'command-behavior-controller-test-element'
    )!;
    const target = fixture.querySelector<HTMLElement>('#target')!;

    element.command = '--test';
    element.commandForElement = target;
    element.sync();

    const command = untilEvent<CommandTestEvent>(target, 'command');
    await emulateClick(element);
    const event = await command;

    expect(event.command).toBe('--test');
    expect(event.source).toBe(element);
  });

  it('should resolve command targets by commandfor id', async () => {
    fixture = await createFixture(
      html`<command-behavior-controller-test-element></command-behavior-controller-test-element><div id="target"></div>`
    );
    const element = fixture.querySelector<CommandBehaviorControllerTestElement>(
      'command-behavior-controller-test-element'
    )!;
    const target = fixture.querySelector<HTMLElement>('#target')!;

    element.command = '--test';
    element.setAttribute('commandfor', 'target');
    element.sync();

    const command = untilEvent<CommandTestEvent>(target, 'command');
    await emulateClick(element);

    expect((await command).source).toBe(element);
  });

  it('should not dispatch when clicks are prevented, disabled, readonly, or commandless', async () => {
    fixture = await createFixture(
      html`<command-behavior-controller-test-element></command-behavior-controller-test-element><div id="target"></div>`
    );
    const element = fixture.querySelector<CommandBehaviorControllerTestElement>(
      'command-behavior-controller-test-element'
    )!;
    const target = fixture.querySelector<HTMLElement>('#target')!;
    const command = vi.fn();

    target.addEventListener('command', command);
    element.command = '--test';
    element.commandForElement = target;
    element.addEventListener('click', event => event.preventDefault(), { capture: true, once: true });
    element.sync();
    element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

    element.disabled = true;
    element.sync();
    await emulateClick(element);

    element.disabled = false;
    element.readOnly = true;
    element.sync();
    await emulateClick(element);

    element.readOnly = false;
    element.command = undefined;
    element.sync();
    await emulateClick(element);

    expect(command).not.toHaveBeenCalled();
  });

  it('should warn when command target references do not resolve', async () => {
    fixture = await createFixture(
      html`<command-behavior-controller-test-element></command-behavior-controller-test-element>`
    );
    const element = fixture.querySelector<CommandBehaviorControllerTestElement>(
      'command-behavior-controller-test-element'
    )!;
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    element.command = '--test';
    element.setAttribute('commandfor', 'missing');
    element.sync();
    await emulateClick(element);

    expect(warn).toHaveBeenCalledWith('commandForElement', 'missing', 'not found');
  });

  it('should remove click behavior on disconnect', async () => {
    fixture = await createFixture(
      html`<command-behavior-controller-test-element></command-behavior-controller-test-element><div id="target"></div>`
    );
    const element = fixture.querySelector<CommandBehaviorControllerTestElement>(
      'command-behavior-controller-test-element'
    )!;
    const target = fixture.querySelector<HTMLElement>('#target')!;
    const command = vi.fn();

    target.addEventListener('command', command);
    element.command = '--test';
    element.commandForElement = target;
    element.sync();
    element.remove();
    element.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(command).not.toHaveBeenCalled();
  });
});
