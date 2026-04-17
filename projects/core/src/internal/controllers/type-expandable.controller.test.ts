// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators/custom-element.js';
import { property } from 'lit/decorators/property.js';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createFixture, removeFixture, elementIsStable, untilEvent } from '@internals/testing';
import { TypeExpandableController } from '@nvidia-elements/core/internal';

@customElement('type-expandable-controller-test-element')
class TypeExpandableControllerTestElement extends LitElement {
  @property({ type: Boolean }) expanded: boolean;

  @property({ type: Boolean }) expandable: boolean;

  @property({ type: Boolean }) behaviorExpand: boolean;

  #typeExpandableController = new TypeExpandableController(this);

  close() {
    this.#typeExpandableController.close();
  }

  open() {
    this.#typeExpandableController.open();
  }

  toggle() {
    this.#typeExpandableController.toggle();
  }
}

describe('type-expandable.controller', () => {
  let element: TypeExpandableControllerTestElement;
  let fixture: HTMLElement;

  beforeEach(async () => {
    fixture = await createFixture(
      html`<type-expandable-controller-test-element></type-expandable-controller-test-element>`
    );
    element = fixture.querySelector<TypeExpandableControllerTestElement>('type-expandable-controller-test-element');
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should emit close event when close button clicked', async () => {
    element.expanded = true;
    await elementIsStable(element);

    const event = untilEvent(element, 'close');
    element.close();
    expect(await event).toBeDefined();
    expect((await event).bubbles).toBe(true);
    expect(element.expanded).toBe(true); // default to stateless
  });

  it('should emit open event when open button clicked', async () => {
    element.expanded = false;
    await elementIsStable(element);

    const event = untilEvent(element, 'open');
    element.open();
    expect(await event).toBeDefined();
    expect((await event).bubbles).toBe(true);
    expect(element.expanded).toBe(false); // default to stateless
  });

  it('should enable auto stateful expanding if behavior-expand is set', async () => {
    element.expanded = false;
    element.behaviorExpand = true;
    await elementIsStable(element);

    element.toggle();
    expect(element.expanded).toBe(true);

    element.toggle();
    expect(element.expanded).toBe(false);
  });

  it('should update expandable style state', async () => {
    expect(element.matches(':state(expandable)')).toBeFalsy();

    element.expandable = true;
    await elementIsStable(element);
    expect(element.matches(':state(expandable)')).toBeTruthy();

    element.expandable = false;
    await elementIsStable(element);
    expect(element.matches(':state(expandable)')).toBeFalsy();
  });

  it('should have expanded state true before open event is dispatched when behaviorExpand is active', async () => {
    element.behaviorExpand = true;
    element.expanded = false;
    await elementIsStable(element);

    let stateAtEventTime: boolean | undefined;
    element.addEventListener('open', () => {
      stateAtEventTime = element.expanded;
    });

    element.open();
    await elementIsStable(element);

    expect(stateAtEventTime).toBe(true);
  });

  it('should have expanded state false before close event is dispatched when behaviorExpand is active', async () => {
    element.behaviorExpand = true;
    element.expanded = true;
    await elementIsStable(element);

    let stateAtEventTime: boolean | undefined;
    element.addEventListener('close', () => {
      stateAtEventTime = element.expanded;
    });

    element.close();
    await elementIsStable(element);

    expect(stateAtEventTime).toBe(false);
  });

  it('should have correct state before events when using toggle with behaviorExpand', async () => {
    element.behaviorExpand = true;
    element.expanded = false;
    await elementIsStable(element);

    let openStateAtEventTime: boolean | undefined;
    let closeStateAtEventTime: boolean | undefined;

    element.addEventListener('open', () => {
      openStateAtEventTime = element.expanded;
    });
    element.addEventListener('close', () => {
      closeStateAtEventTime = element.expanded;
    });

    element.toggle();
    await elementIsStable(element);
    expect(openStateAtEventTime).toBe(true);

    element.toggle();
    await elementIsStable(element);
    expect(closeStateAtEventTime).toBe(false);
  });

  describe('invoker command support', () => {
    it('should toggle state when receiving --toggle command', async () => {
      element.expanded = false;
      await elementIsStable(element);

      element.dispatchEvent(new CommandEvent('command', { command: '--toggle' }));
      await elementIsStable(element);
      expect(element.expanded).toBe(true);

      element.dispatchEvent(new CommandEvent('command', { command: '--toggle' }));
      await elementIsStable(element);
      expect(element.expanded).toBe(false);
    });

    it('should open when receiving --open command', async () => {
      element.expanded = false;
      await elementIsStable(element);

      const event = untilEvent(element, 'open');
      element.dispatchEvent(new CommandEvent('command', { command: '--open' }));
      expect(await event).toBeDefined();
      expect(element.expanded).toBe(true);
    });

    it('should close when receiving --close command', async () => {
      element.expanded = true;
      await elementIsStable(element);

      const event = untilEvent(element, 'close');
      element.dispatchEvent(new CommandEvent('command', { command: '--close' }));
      expect(await event).toBeDefined();
      expect(element.expanded).toBe(false);
    });

    it('should emit open event when receiving --toggle command from closed state', async () => {
      element.expanded = false;
      await elementIsStable(element);

      const event = untilEvent(element, 'open');
      element.dispatchEvent(new CommandEvent('command', { command: '--toggle' }));
      expect(await event).toBeDefined();
    });

    it('should emit close event when receiving --toggle command from open state', async () => {
      element.expanded = true;
      await elementIsStable(element);

      const event = untilEvent(element, 'close');
      element.dispatchEvent(new CommandEvent('command', { command: '--toggle' }));
      expect(await event).toBeDefined();
    });

    it('should have updated state before open event when receiving command', async () => {
      element.expanded = false;
      await elementIsStable(element);

      let stateAtEventTime: boolean | undefined;
      element.addEventListener('open', () => {
        stateAtEventTime = element.expanded;
      });

      element.dispatchEvent(new CommandEvent('command', { command: '--open' }));
      await elementIsStable(element);

      expect(stateAtEventTime).toBe(true);
    });

    it('should have updated state before close event when receiving command', async () => {
      element.expanded = true;
      await elementIsStable(element);

      let stateAtEventTime: boolean | undefined;
      element.addEventListener('close', () => {
        stateAtEventTime = element.expanded;
      });

      element.dispatchEvent(new CommandEvent('command', { command: '--close' }));
      await elementIsStable(element);

      expect(stateAtEventTime).toBe(false);
    });
  });
});
