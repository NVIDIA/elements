// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators/custom-element.js';
import { property } from 'lit/decorators/property.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createFixture, removeFixture, untilEvent, emulateClick, elementIsStable } from '@internals/testing';
import { TypeCommandController } from '@nvidia-elements/core/internal';

class TypeCommandControllerTestElementBase extends LitElement {
  @property({ type: String }) command: string;
  @property({ type: String, attribute: 'commandfor' }) commandfor: string;
  @property({ type: Object }) commandForElement: HTMLElement;
  @property({ type: Boolean, attribute: 'readonly' }) readOnly = false;
  @property({ type: Boolean }) disabled: boolean;
}

@customElement('type-command-controller-test-element')
class TypeCommandControllerTestElement extends TypeCommandControllerTestElementBase {
  _typeCommandController = new TypeCommandController<TypeCommandControllerTestElement>(this);
}

@customElement('manual-type-command-controller-test-element')
class ManualTypeCommandControllerTestElement extends TypeCommandControllerTestElementBase {
  _typeCommandController = new TypeCommandController<ManualTypeCommandControllerTestElement>(this, {
    trigger: 'manual'
  });
}

describe('type-command.controller', () => {
  let element: TypeCommandControllerTestElement;
  let target: HTMLElement;
  let fixture: HTMLElement;

  afterEach(() => {
    removeFixture(fixture);
  });

  describe('commandfor attribute', () => {
    beforeEach(async () => {
      fixture = await createFixture(
        html`
          <type-command-controller-test-element command="--test" commandfor="target"></type-command-controller-test-element>
          <div id="target"></div>
        `
      );
      element = fixture.querySelector<TypeCommandControllerTestElement>('type-command-controller-test-element');
      target = fixture.querySelector<HTMLElement>('#target');
    });

    it('should trigger command event when clicked', async () => {
      const event = untilEvent<Event & { source: HTMLElement; command: string }>(target, 'command');
      await emulateClick(element);
      const { source, command } = await event;
      expect(source).toBe(element);
      expect(command).toBe('--test');
    });

    it('should expose the resolved target', () => {
      expect(element._typeCommandController.target).toBe(target);
    });
  });

  describe('commandForElement property', () => {
    beforeEach(async () => {
      fixture = await createFixture(
        html`
          <type-command-controller-test-element command="--test"></type-command-controller-test-element>
          <div id="target"></div>
        `
      );
      element = fixture.querySelector<TypeCommandControllerTestElement>('type-command-controller-test-element');
      target = fixture.querySelector<HTMLElement>('#target');
      element.commandForElement = target;
      await elementIsStable(element);
    });

    it('should trigger command event via element reference', async () => {
      const event = untilEvent<Event & { source: HTMLElement; command: string }>(target, 'command');
      await emulateClick(element);
      const { source, command } = await event;
      expect(source).toBe(element);
      expect(command).toBe('--test');
    });

    it('should expose the commandForElement target', () => {
      expect(element._typeCommandController.target).toBe(target);
    });

    it('should prefer commandForElement over commandfor', async () => {
      removeFixture(fixture);
      fixture = await createFixture(
        html`
          <type-command-controller-test-element command="--test" commandfor="target-id"></type-command-controller-test-element>
          <div id="target-id"></div>
          <div id="target-property"></div>
        `
      );
      element = fixture.querySelector<TypeCommandControllerTestElement>('type-command-controller-test-element');
      target = fixture.querySelector<HTMLElement>('#target-property');
      const targetById = fixture.querySelector<HTMLElement>('#target-id');
      element.commandForElement = target;
      await elementIsStable(element);

      let commandForIdFired = false;
      targetById.addEventListener('command', () => (commandForIdFired = true));
      const event = untilEvent<Event & { source: HTMLElement; command: string }>(target, 'command');
      await emulateClick(element);

      expect((await event).command).toBe('--test');
      expect(commandForIdFired).toBe(false);
    });
  });

  describe('manual trigger', () => {
    let manualElement: ManualTypeCommandControllerTestElement;

    beforeEach(async () => {
      fixture = await createFixture(
        html`
          <manual-type-command-controller-test-element
            command="--test"
            commandfor="target"
          ></manual-type-command-controller-test-element>
          <div id="target"></div>
        `
      );
      manualElement = fixture.querySelector<ManualTypeCommandControllerTestElement>(
        'manual-type-command-controller-test-element'
      );
      target = fixture.querySelector<HTMLElement>('#target');
      await elementIsStable(manualElement);
    });

    it('should not trigger command event when clicked', async () => {
      let fired = false;
      target.addEventListener('command', () => (fired = true));
      await emulateClick(manualElement);

      expect(fired).toBe(false);
    });

    it('should dispatch command event explicitly', async () => {
      const event = untilEvent<Event & { source: HTMLElement; command: string }>(target, 'command');
      const dispatched = manualElement._typeCommandController.dispatchCommand();

      expect(dispatched).toBe(true);
      const { source, command } = await event;
      expect(source).toBe(manualElement);
      expect(command).toBe('--test');
    });
  });

  describe('readonly', () => {
    beforeEach(async () => {
      fixture = await createFixture(
        html`
          <type-command-controller-test-element command="--test" commandfor="target" readonly></type-command-controller-test-element>
          <div id="target"></div>
        `
      );
      element = fixture.querySelector<TypeCommandControllerTestElement>('type-command-controller-test-element');
      target = fixture.querySelector<HTMLElement>('#target');
      await elementIsStable(element);
    });

    it('should not trigger command event when readonly', async () => {
      let fired = false;
      target.addEventListener('command', () => (fired = true));
      await emulateClick(element);
      expect(fired).toBe(false);
    });

    it('should not dispatch command event when deprecated readonly property is true', async () => {
      removeFixture(fixture);
      fixture = await createFixture(
        html`
          <type-command-controller-test-element command="--test" commandfor="target"></type-command-controller-test-element>
          <div id="target"></div>
        `
      );
      element = fixture.querySelector<TypeCommandControllerTestElement>('type-command-controller-test-element');
      target = fixture.querySelector<HTMLElement>('#target');
      (element as TypeCommandControllerTestElement & { readonly: boolean }).readonly = true;
      await elementIsStable(element);

      let fired = false;
      target.addEventListener('command', () => (fired = true));

      await emulateClick(element);

      expect(element._typeCommandController.dispatchCommand()).toBe(false);
      expect(fired).toBe(false);
    });
  });

  describe('disabled', () => {
    beforeEach(async () => {
      fixture = await createFixture(
        html`
          <type-command-controller-test-element command="--test" commandfor="target" disabled></type-command-controller-test-element>
          <div id="target"></div>
        `
      );
      element = fixture.querySelector<TypeCommandControllerTestElement>('type-command-controller-test-element');
      target = fixture.querySelector<HTMLElement>('#target');
      await elementIsStable(element);
    });

    it('should not trigger command event when disabled', async () => {
      let fired = false;
      target.addEventListener('command', () => (fired = true));
      await emulateClick(element);
      expect(fired).toBe(false);
    });
  });

  describe('no target', () => {
    beforeEach(async () => {
      fixture = await createFixture(
        html`<type-command-controller-test-element command="--test"></type-command-controller-test-element>`
      );
      element = fixture.querySelector<TypeCommandControllerTestElement>('type-command-controller-test-element');
      await elementIsStable(element);
    });

    it('should not throw when neither commandfor nor commandForElement is set', () => {
      expect(() => emulateClick(element)).not.toThrow();
    });
  });

  describe('missing target warning', () => {
    beforeEach(async () => {
      fixture = await createFixture(
        html`
          <type-command-controller-test-element command="--test" commandfor="nonexistent"></type-command-controller-test-element>
        `
      );
      element = fixture.querySelector<TypeCommandControllerTestElement>('type-command-controller-test-element');
      await elementIsStable(element);
    });

    it('should warn when commandfor references a nonexistent element', async () => {
      const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      await emulateClick(element);
      expect(spy).toHaveBeenCalledWith('commandForElement', 'nonexistent', 'not found');
      spy.mockRestore();
    });
  });

  describe('disconnect', () => {
    beforeEach(async () => {
      fixture = await createFixture(
        html`
          <type-command-controller-test-element command="--test" commandfor="target"></type-command-controller-test-element>
          <div id="target"></div>
        `
      );
      element = fixture.querySelector<TypeCommandControllerTestElement>('type-command-controller-test-element');
      target = fixture.querySelector<HTMLElement>('#target');
      await elementIsStable(element);
    });

    it('should not trigger command event after disconnect', async () => {
      element.remove();
      let fired = false;
      target.addEventListener('command', () => (fired = true));
      element.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      expect(fired).toBe(false);
    });
  });
});
