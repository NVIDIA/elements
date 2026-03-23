import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators/custom-element.js';
import { property } from 'lit/decorators/property.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createFixture, removeFixture, untilEvent, emulateClick, elementIsStable } from '@internals/testing';
import { TypeCommandController } from '@nvidia-elements/core/internal';

@customElement('type-command-controller-test-element')
class TypeCommandControllerTestElement extends LitElement {
  @property({ type: String }) command: string;
  @property({ type: String, attribute: 'commandfor' }) commandfor: string;
  @property({ type: Object }) commandForElement: HTMLElement;
  @property({ type: Boolean }) readonly: boolean;
  @property({ type: Boolean }) disabled: boolean;
  _typeCommandController = new TypeCommandController<TypeCommandControllerTestElement>(this);
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
