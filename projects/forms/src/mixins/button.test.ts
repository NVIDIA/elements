// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators/custom-element.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createFixture, elementIsStable, emulateClick, removeFixture, untilEvent } from '@internals/testing';

import { ButtonFormControlMixin } from './button.js';

@customElement('button-form-control-mixin-test-element')
class ButtonFormControlMixinTestElement extends ButtonFormControlMixin(LitElement) {
  render() {
    return html`<slot></slot>`;
  }
}

@customElement('button-form-control-mixin-anchor-slot-test-element')
class ButtonFormControlMixinAnchorSlotTestElement extends ButtonFormControlMixin(LitElement) {
  render() {
    return html`
      <slot></slot>
      <slot name="anchor"></slot>
    `;
  }
}

@customElement('button-form-control-mixin-anchor-state-test-element')
class ButtonFormControlMixinAnchorStateTestElement extends ButtonFormControlMixin(LitElement) {
  get readOnly() {
    return false;
  }

  render() {
    return html`<slot></slot>`;
  }
}

@customElement('button-form-control-mixin-no-super-updated-test-element')
class ButtonFormControlMixinNoSuperUpdatedTestElement extends ButtonFormControlMixin(LitElement) {
  updated() {
    this.dataset.updated = 'true';
  }

  render() {
    return html`<slot></slot>`;
  }
}

class ButtonFormControlMixinNativeTestElement extends ButtonFormControlMixin(HTMLElement) {}

if (!customElements.get('button-form-control-mixin-native-test-element')) {
  customElements.define('button-form-control-mixin-native-test-element', ButtonFormControlMixinNativeTestElement);
}

type CommandTestEvent = Event & { command: string; source: HTMLElement };
type InterestTestEvent = Event & { source: HTMLElement };

async function nativeElementIsStable() {
  await Promise.resolve();
}

describe('ButtonFormControlMixin', () => {
  describe('button semantics', () => {
    let button: ButtonFormControlMixinTestElement;
    let fixture: HTMLElement;

    beforeEach(async () => {
      fixture = await createFixture(
        html`<button-form-control-mixin-test-element></button-form-control-mixin-test-element>`
      );
      button = fixture.querySelector<ButtonFormControlMixinTestElement>('button-form-control-mixin-test-element')!;
      await elementIsStable(button);
    });

    afterEach(() => {
      removeFixture(fixture);
    });

    it('should initialize role and focus behavior', () => {
      expect(button._internals.role).toBe('button');
      expect(button.tabIndex).toBe(0);
    });

    it('should add active state on pointer and keyboard activation', () => {
      expect(button.matches(':state(active)')).toBe(false);

      button.dispatchEvent(new MouseEvent('mousedown'));
      expect(button.matches(':state(active)')).toBe(true);

      button.dispatchEvent(new MouseEvent('mouseup'));
      expect(button.matches(':state(active)')).toBe(false);

      button.dispatchEvent(new KeyboardEvent('keypress', { code: 'Space' }));
      expect(button.matches(':state(active)')).toBe(true);
    });

    it('should clear active state on blur and ignore non-activation keys', () => {
      button.dispatchEvent(new KeyboardEvent('keypress', { code: 'KeyA' }));
      expect(button.matches(':state(active)')).toBe(false);

      button.dispatchEvent(new KeyboardEvent('keypress', { code: 'Enter' }));
      expect(button.matches(':state(active)')).toBe(true);

      button.dispatchEvent(new FocusEvent('blur'));
      expect(button.matches(':state(active)')).toBe(false);
    });

    it('should prevent default on space keypress activation', () => {
      const space = new KeyboardEvent('keypress', { code: 'Space', cancelable: true });
      const enter = new KeyboardEvent('keypress', { code: 'Enter', cancelable: true });

      button.dispatchEvent(space);
      button.dispatchEvent(enter);

      expect(space.defaultPrevented).toBe(true);
      expect(enter.defaultPrevented).toBe(false);
    });

    it('should activate click behavior with enter and space keyup events', () => {
      const click = vi.fn();
      button.addEventListener('click', click);

      button.dispatchEvent(new KeyboardEvent('keyup', { code: 'Enter' }));
      button.dispatchEvent(new KeyboardEvent('keyup', { code: 'Space' }));
      button.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyA' }));

      expect(click).toHaveBeenCalledTimes(2);
    });

    it('should sync disabled state', async () => {
      button.disabled = true;
      await elementIsStable(button);

      expect(button._internals.ariaDisabled).toBe('true');
      expect(button.matches(':state(disabled)')).toBe(true);
      expect(button.tabIndex).toBe(-1);
    });

    it('should sync readonly state and deprecated alias', async () => {
      button.readonly = true;
      await elementIsStable(button);

      expect(button.readOnly).toBe(true);
      expect(button.readonly).toBe(true);
      expect(button.hasAttribute('readonly')).toBe(true);
      expect(button._internals.role).toBe('none');
      expect(button.tabIndex).toBe(-1);
      expect(button._internals.ariaDisabled).toBe(null);

      button.readOnly = false;
      await elementIsStable(button);

      expect(button._internals.role).toBe('button');
      expect(button.tabIndex).toBe(0);
    });

    it('should restore explicit internals role when readonly is false', async () => {
      button._internals.role = 'tab';
      button.readOnly = true;
      await elementIsStable(button);

      expect(button._internals.role).toBe('none');

      button.readOnly = false;
      await elementIsStable(button);

      expect(button._internals.role).toBe('tab');
    });

    it('should preserve author tabindex when enabled and remove tabindex when readonly', async () => {
      removeFixture(fixture);
      fixture = await createFixture();
      button = new ButtonFormControlMixinTestElement();
      button.tabIndex = 3;
      fixture.appendChild(button);
      await elementIsStable(button);

      expect(button.tabIndex).toBe(3);

      button.disabled = true;
      await elementIsStable(button);
      expect(button.tabIndex).toBe(-1);

      button.disabled = false;
      await elementIsStable(button);
      expect(button.tabIndex).toBe(3);

      button.readOnly = true;
      await elementIsStable(button);
      expect(button.hasAttribute('tabindex')).toBe(false);

      button.readOnly = false;
      await elementIsStable(button);
      expect(button.tabIndex).toBe(3);
    });
  });

  describe('native custom element host', () => {
    let fixture: HTMLElement;

    afterEach(() => {
      removeFixture(fixture);
    });

    it('should initialize and sync properties without lit update APIs', async () => {
      fixture = await createFixture(
        html`<button-form-control-mixin-native-test-element></button-form-control-mixin-native-test-element>`
      );
      const button = fixture.querySelector<ButtonFormControlMixinNativeTestElement>(
        'button-form-control-mixin-native-test-element'
      )!;
      await nativeElementIsStable();

      expect('requestUpdate' in button).toBe(false);
      expect('updateComplete' in button).toBe(false);
      expect(button._internals.role).toBe('button');
      expect(button.tabIndex).toBe(0);

      button.disabled = true;
      await nativeElementIsStable();

      expect(button.hasAttribute('disabled')).toBe(true);
      expect(button._internals.ariaDisabled).toBe('true');
      expect(button.matches(':state(disabled)')).toBe(true);
      expect(button.tabIndex).toBe(-1);
    });

    it('should flush reflected properties set before connection', async () => {
      fixture = await createFixture();
      const button = new ButtonFormControlMixinNativeTestElement();
      button.pressed = true;
      button.name = 'native-name';

      expect(button.hasAttribute('pressed')).toBe(false);
      expect(button.hasAttribute('name')).toBe(false);

      fixture.appendChild(button);
      await nativeElementIsStable();

      expect(button.hasAttribute('pressed')).toBe(true);
      expect(button.getAttribute('name')).toBe('native-name');
      expect(button._internals.ariaPressed).toBe('true');
    });

    it('should react to attributes and dispatch commands', async () => {
      fixture = await createFixture(html`
        <button-form-control-mixin-native-test-element command="--native" commandfor="target" selected>
        </button-form-control-mixin-native-test-element>
        <div id="target"></div>
      `);
      const button = fixture.querySelector<ButtonFormControlMixinNativeTestElement>(
        'button-form-control-mixin-native-test-element'
      )!;
      const target = fixture.querySelector<HTMLElement>('#target')!;
      await nativeElementIsStable();
      const command = untilEvent<CommandTestEvent>(target, 'command');

      expect(button.selected).toBe(true);
      expect(button._internals.ariaSelected).toBe('true');
      expect(button.matches(':state(selected)')).toBe(true);

      emulateClick(button);

      expect((await command).command).toBe('--native');
    });
  });

  describe('aria states', () => {
    let button: ButtonFormControlMixinTestElement;
    let fixture: HTMLElement;

    beforeEach(async () => {
      fixture = await createFixture(
        html`<button-form-control-mixin-test-element></button-form-control-mixin-test-element>`
      );
      button = fixture.querySelector<ButtonFormControlMixinTestElement>('button-form-control-mixin-test-element')!;
      await elementIsStable(button);
    });

    afterEach(() => {
      removeFixture(fixture);
    });

    it('should leave optional aria states unset by default', () => {
      expect(button._internals.ariaPressed).toBe(null);
      expect(button._internals.ariaExpanded).toBe(null);
      expect(button._internals.ariaSelected).toBe(null);
      expect(button._internals.ariaCurrent).toBe(null);
    });

    it('should sync pressed, expanded, selected, and current states', async () => {
      button.pressed = true;
      button.expanded = true;
      button.selected = true;
      button.current = 'page';
      await elementIsStable(button);

      expect(button._internals.ariaPressed).toBe('true');
      expect(button._internals.ariaExpanded).toBe('true');
      expect(button._internals.ariaSelected).toBe('true');
      expect(button._internals.ariaCurrent).toBe('page');
      expect(button.matches(':state(pressed)')).toBe(true);
      expect(button.matches(':state(expanded)')).toBe(true);
      expect(button.matches(':state(selected)')).toBe(true);
      expect(button.matches(':state(current)')).toBe(true);
    });

    it('should sync false optional states explicitly', async () => {
      button.pressed = false;
      button.expanded = false;
      button.selected = false;
      await elementIsStable(button);

      expect(button._internals.ariaPressed).toBe('false');
      expect(button._internals.ariaExpanded).toBe('false');
      expect(button._internals.ariaSelected).toBe('false');
      expect(button.matches(':state(pressed)')).toBe(false);
      expect(button.matches(':state(expanded)')).toBe(false);
      expect(button.matches(':state(selected)')).toBe(false);
    });

    it('should sync observed state attributes', async () => {
      button.setAttribute('pressed', '');
      button.setAttribute('expanded', '');
      button.setAttribute('selected', '');
      button.setAttribute('current', 'step');
      await elementIsStable(button);

      expect(button.pressed).toBe(true);
      expect(button.expanded).toBe(true);
      expect(button.selected).toBe(true);
      expect(button.current).toBe('step');
      expect(button._internals.ariaCurrent).toBe('step');

      button.removeAttribute('pressed');
      button.removeAttribute('expanded');
      button.removeAttribute('selected');
      await elementIsStable(button);

      expect(button.pressed).toBe(false);
      expect(button.expanded).toBe(false);
      expect(button.selected).toBe(false);
    });

    it('should reflect properties set before connection after connect', async () => {
      const element = new ButtonFormControlMixinTestElement();
      element.pressed = true;
      element.name = 'queued-name';

      expect(element.hasAttribute('pressed')).toBe(false);
      expect(element.hasAttribute('name')).toBe(false);

      removeFixture(fixture);
      fixture = await createFixture();
      fixture.appendChild(element);
      await elementIsStable(element);

      expect(element.hasAttribute('pressed')).toBe(true);
      expect(element.getAttribute('name')).toBe('queued-name');
    });

    it('should no-op duplicate reflected state updates', async () => {
      button.disabled = true;
      button.name = 'stable';
      await elementIsStable(button);

      button.disabled = true;
      button.name = 'stable';
      await elementIsStable(button);

      expect(button.hasAttribute('disabled')).toBe(true);
      expect(button.getAttribute('name')).toBe('stable');
    });

    it('should suppress optional aria states when readonly', async () => {
      button.pressed = true;
      button.expanded = true;
      button.selected = true;
      button.current = 'page';
      await elementIsStable(button);

      button.readOnly = true;
      await elementIsStable(button);

      expect(button._internals.ariaPressed).toBe(null);
      expect(button._internals.ariaExpanded).toBe(null);
      expect(button._internals.ariaSelected).toBe(null);
      expect(button._internals.ariaCurrent).toBe(null);
    });
  });

  describe('form behavior', () => {
    let fixture: HTMLElement;
    let form: HTMLFormElement;
    let otherForm: HTMLFormElement;
    let submitButton: ButtonFormControlMixinTestElement;

    beforeEach(async () => {
      fixture = await createFixture(html`
        <form id="other"></form>
        <form id="main">
          <button-form-control-mixin-test-element type="button"></button-form-control-mixin-test-element>
          <button-form-control-mixin-test-element name="button-name" value="button-value"></button-form-control-mixin-test-element>
        </form>
      `);
      form = fixture.querySelector<HTMLFormElement>('#main')!;
      form.addEventListener('submit', event => event.preventDefault());
      otherForm = fixture.querySelector<HTMLFormElement>('#other')!;
      otherForm.addEventListener('submit', event => event.preventDefault());
      submitButton = fixture.querySelectorAll<ButtonFormControlMixinTestElement>(
        'button-form-control-mixin-test-element'
      )[1]!;
      await elementIsStable(submitButton);
    });

    afterEach(() => {
      removeFixture(fixture);
    });

    it('should default to submit when associated with a form and type is unset', () => {
      expect(submitButton.type).toBe('submit');
      expect(submitButton.form).toBe(form);
    });

    it('should not submit when type is button', async () => {
      const buttonTypeButton = fixture.querySelector<ButtonFormControlMixinTestElement>(
        'button-form-control-mixin-test-element'
      );
      const submit = vi.fn();
      form.addEventListener('submit', submit);

      emulateClick(buttonTypeButton);
      await elementIsStable(buttonTypeButton);

      expect(submit).not.toHaveBeenCalled();
    });

    it('should submit with hidden native submitter name and value', async () => {
      const submit = untilEvent<SubmitEvent>(form, 'submit');
      emulateClick(submitButton);
      const event = await submit;

      expect(event.submitter?.name).toBe('button-name');
      expect(event.submitter?.value).toBe('button-value');
      expect(event.submitter?.form).toBe(form);
    });

    it('should submit with empty native submitter data by default', async () => {
      const defaultButton = document.createElement(
        'button-form-control-mixin-test-element'
      ) as ButtonFormControlMixinTestElement;
      form.appendChild(defaultButton);
      await elementIsStable(defaultButton);
      const submit = untilEvent<SubmitEvent>(form, 'submit');

      emulateClick(defaultButton);
      const event = await submit;

      expect(event.submitter?.name).toBe('');
      expect(event.submitter?.value).toBe('');
    });

    it('should clean up the hidden native submitter after submit', async () => {
      const submit = untilEvent<SubmitEvent>(form, 'submit');
      emulateClick(submitButton);
      await submit;
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(form.querySelector('button[type="submit"]')).toBe(null);
    });

    it('should clean up the hidden native submitter when disconnected after blocked validation', async () => {
      const input = document.createElement('input');
      input.required = true;
      form.appendChild(input);

      emulateClick(submitButton);
      emulateClick(submitButton);

      expect(form.querySelectorAll('button[type="submit"]')).toHaveLength(1);

      submitButton.remove();

      expect(form.querySelector('button[type="submit"]')).toBe(null);
    });

    it('should reset associated form when type is reset', async () => {
      const input = document.createElement('input');
      input.defaultValue = 'initial';
      input.value = 'changed';
      form.appendChild(input);
      submitButton.type = 'reset';
      await elementIsStable(submitButton);

      emulateClick(submitButton);

      expect(input.value).toBe('initial');
    });

    it('should not submit or reset when disabled or readonly', async () => {
      const submit = vi.fn((event: SubmitEvent) => event.preventDefault());
      const input = document.createElement('input');
      input.defaultValue = 'initial';
      input.value = 'changed';
      form.appendChild(input);
      form.addEventListener('submit', submit);

      submitButton.disabled = true;
      await elementIsStable(submitButton);
      emulateClick(submitButton);
      expect(submit).not.toHaveBeenCalled();

      submitButton.disabled = false;
      submitButton.readOnly = true;
      submitButton.type = 'reset';
      await elementIsStable(submitButton);
      emulateClick(submitButton);
      expect(input.value).toBe('changed');
    });

    it('should respect external form references', async () => {
      submitButton.form = 'other';
      await elementIsStable(submitButton);

      expect(submitButton.form).toBe(otherForm);
      const submit = untilEvent<SubmitEvent>(otherForm, 'submit');
      emulateClick(submitButton);

      expect((await submit).target).toBe(otherForm);
    });

    it('should support direct form element references and invalid id fallbacks', async () => {
      submitButton.form = otherForm;
      await elementIsStable(submitButton);
      expect(submitButton.form).toBe(otherForm);

      submitButton.form = 'missing';
      await elementIsStable(submitButton);
      expect(submitButton.form).toBe(null);
    });

    it('should preserve direct form references when the form attribute is removed', async () => {
      submitButton.setAttribute('form', 'other');
      submitButton.form = otherForm;
      await elementIsStable(submitButton);
      submitButton.removeAttribute('form');
      await elementIsStable(submitButton);

      expect(submitButton.form).toBe(otherForm);
    });

    it('should sync removable string attributes', async () => {
      submitButton.value = 'saved';
      submitButton.popovertarget = 'popover';
      submitButton.commandfor = 'command-target';
      submitButton.command = '--test';
      submitButton.interestfor = 'interest-target';
      await elementIsStable(submitButton);

      submitButton.removeAttribute('value');
      submitButton.removeAttribute('popovertarget');
      submitButton.removeAttribute('commandfor');
      submitButton.removeAttribute('command');
      submitButton.removeAttribute('interestfor');
      await elementIsStable(submitButton);

      expect(submitButton.value).toBeUndefined();
      expect(submitButton.popovertarget).toBeUndefined();
      expect(submitButton.commandfor).toBe(null);
      expect(submitButton.command).toBeUndefined();
      expect(submitButton.interestfor).toBe(null);
    });
  });

  describe('anchor behavior', () => {
    let button: ButtonFormControlMixinTestElement;
    let fixture: HTMLElement;
    let anchor: HTMLAnchorElement;

    beforeEach(async () => {
      fixture = await createFixture(html`
        <button-form-control-mixin-test-element>
          <a href="#">anchor</a>
        </button-form-control-mixin-test-element>
      `);
      button = fixture.querySelector<ButtonFormControlMixinTestElement>('button-form-control-mixin-test-element');
      anchor = fixture.querySelector<HTMLAnchorElement>('a');
      await elementIsStable(button);
    });

    afterEach(() => {
      removeFixture(fixture);
    });

    it('should switch to anchor readonly behavior', () => {
      expect(button.readOnly).toBe(true);
      expect(button.matches(':state(anchor)')).toBe(true);
    });

    it('should remove anchor aria-current when selected is false', async () => {
      removeFixture(fixture);
      fixture = await createFixture(html`
        <button-form-control-mixin-anchor-state-test-element>
          <a href="#">anchor</a>
        </button-form-control-mixin-anchor-state-test-element>
      `);
      const anchorStateButton = fixture.querySelector<ButtonFormControlMixinAnchorStateTestElement>(
        'button-form-control-mixin-anchor-state-test-element'
      )!;
      anchor = fixture.querySelector<HTMLAnchorElement>('a')!;
      await elementIsStable(anchorStateButton);

      anchorStateButton.selected = true;
      await elementIsStable(anchorStateButton);

      expect(anchor.getAttribute('aria-current')).toBe('page');
      expect(anchorStateButton._internals.ariaSelected).toBe(null);
      expect(anchorStateButton.matches(':state(selected)')).toBe(true);

      anchorStateButton.selected = false;
      await elementIsStable(anchorStateButton);

      expect(anchor.hasAttribute('aria-current')).toBe(false);
      expect(anchorStateButton._internals.ariaSelected).toBe(null);
      expect(anchorStateButton.matches(':state(selected)')).toBe(false);
    });

    it('should remove anchor aria-current when current is cleared', async () => {
      removeFixture(fixture);
      fixture = await createFixture(html`
        <button-form-control-mixin-anchor-state-test-element>
          <a href="#">anchor</a>
        </button-form-control-mixin-anchor-state-test-element>
      `);
      const anchorStateButton = fixture.querySelector<ButtonFormControlMixinAnchorStateTestElement>(
        'button-form-control-mixin-anchor-state-test-element'
      )!;
      anchor = fixture.querySelector<HTMLAnchorElement>('a')!;
      await elementIsStable(anchorStateButton);

      anchorStateButton.current = 'page';
      await elementIsStable(anchorStateButton);

      expect(anchor.getAttribute('aria-current')).toBe('page');
      expect(anchorStateButton._internals.ariaCurrent).toBe(null);
      expect(anchorStateButton.matches(':state(current)')).toBe(true);

      anchorStateButton.current = null;
      await elementIsStable(anchorStateButton);

      expect(anchor.hasAttribute('aria-current')).toBe(false);
      expect(anchorStateButton._internals.ariaCurrent).toBe(null);
      expect(anchorStateButton.matches(':state(current)')).toBe(false);
    });

    it('should prevent anchor clicks when disabled', () => {
      const listener = vi.fn();
      anchor.addEventListener('click', listener);

      emulateClick(anchor);
      expect(listener).toHaveBeenCalledTimes(1);

      button.disabled = true;
      emulateClick(anchor);
      expect(listener).toHaveBeenCalledTimes(1);
    });

    it('should support parent anchors', async () => {
      removeFixture(fixture);
      fixture = await createFixture(html`
        <a href="#">
          <button-form-control-mixin-test-element>anchor</button-form-control-mixin-test-element>
        </a>
      `);
      button = fixture.querySelector<ButtonFormControlMixinTestElement>('button-form-control-mixin-test-element');
      const parentAnchor = fixture.querySelector<HTMLAnchorElement>('a');
      await elementIsStable(button);

      expect(button.readOnly).toBe(true);
      expect(button.matches(':state(anchor)')).toBe(true);
      expect(button.style.cursor).toBe('pointer');
      expect(parentAnchor.style.textDecoration).toBe('none');
    });

    it('should move slotted anchors into the anchor slot and remove empty text nodes', async () => {
      removeFixture(fixture);
      fixture = await createFixture(html`
        <button-form-control-mixin-anchor-slot-test-element>
          <a href="#">anchor</a>
        </button-form-control-mixin-anchor-slot-test-element>
      `);
      const anchorButton = fixture.querySelector<ButtonFormControlMixinAnchorSlotTestElement>(
        'button-form-control-mixin-anchor-slot-test-element'
      )!;
      anchor = fixture.querySelector<HTMLAnchorElement>('a')!;
      await elementIsStable(anchorButton);

      const emptyTextNodes = Array.from(anchorButton.childNodes).filter(
        node => node.nodeType === Node.TEXT_NODE && node.textContent?.trim() === ''
      );

      expect(anchor.slot).toBe('anchor');
      expect(emptyTextNodes).toHaveLength(0);
    });
  });

  describe('invoker behavior', () => {
    let button: ButtonFormControlMixinTestElement;
    let fixture: HTMLElement;

    afterEach(() => {
      removeFixture(fixture);
    });

    it('should dispatch command events from commandfor', async () => {
      fixture = await createFixture(html`
        <button-form-control-mixin-test-element command="--test" commandfor="target"></button-form-control-mixin-test-element>
        <div id="target"></div>
      `);
      button = fixture.querySelector<ButtonFormControlMixinTestElement>('button-form-control-mixin-test-element')!;
      const target = fixture.querySelector<HTMLElement>('#target')!;
      const command = untilEvent<CommandTestEvent>(target, 'command');
      await elementIsStable(button);

      emulateClick(button);

      expect((await command).command).toBe('--test');
    });

    it('should prefer commandForElement over commandfor', async () => {
      fixture = await createFixture(html`
        <button-form-control-mixin-test-element command="--test" commandfor="attribute-target"></button-form-control-mixin-test-element>
        <div id="attribute-target"></div>
        <div id="property-target"></div>
      `);
      button = fixture.querySelector<ButtonFormControlMixinTestElement>('button-form-control-mixin-test-element')!;
      const attributeTarget = fixture.querySelector<HTMLElement>('#attribute-target')!;
      const propertyTarget = fixture.querySelector<HTMLElement>('#property-target')!;
      const attributeCommand = vi.fn();
      const propertyCommand = vi.fn();
      attributeTarget.addEventListener('command', attributeCommand);
      propertyTarget.addEventListener('command', propertyCommand);

      button.commandForElement = propertyTarget;
      await elementIsStable(button);
      emulateClick(button);

      expect(attributeCommand).not.toHaveBeenCalled();
      expect(propertyCommand).toHaveBeenCalledOnce();
      expect((propertyCommand.mock.calls[0]?.[0] as CommandTestEvent).source).toBe(button);
    });

    it('should no-op command dispatch when clicks are default-prevented, disabled, readonly, or commandless', async () => {
      fixture = await createFixture(html`
        <button-form-control-mixin-test-element command="--test" commandfor="target"></button-form-control-mixin-test-element>
        <button-form-control-mixin-test-element commandfor="target"></button-form-control-mixin-test-element>
        <div id="target"></div>
      `);
      button = fixture.querySelector<ButtonFormControlMixinTestElement>('button-form-control-mixin-test-element')!;
      const commandless = fixture.querySelectorAll<ButtonFormControlMixinTestElement>(
        'button-form-control-mixin-test-element'
      )[1]!;
      const target = fixture.querySelector<HTMLElement>('#target')!;
      const command = vi.fn();
      target.addEventListener('command', command);

      button.addEventListener('click', event => event.preventDefault(), { capture: true });
      button.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      button.disabled = true;
      await elementIsStable(button);
      emulateClick(button);
      button.disabled = false;
      button.readOnly = true;
      await elementIsStable(button);
      emulateClick(button);
      emulateClick(commandless);

      expect(command).not.toHaveBeenCalled();
    });

    it('should dispatch commands for subclasses that do not call super.updated', async () => {
      fixture = await createFixture(html`
        <button-form-control-mixin-no-super-updated-test-element command="--test" commandfor="target"></button-form-control-mixin-no-super-updated-test-element>
        <div id="target"></div>
      `);
      const noSuperButton = fixture.querySelector<ButtonFormControlMixinNoSuperUpdatedTestElement>(
        'button-form-control-mixin-no-super-updated-test-element'
      )!;
      const target = fixture.querySelector<HTMLElement>('#target')!;
      const command = untilEvent<CommandTestEvent>(target, 'command');

      emulateClick(noSuperButton);

      expect((await command).source).toBe(noSuperButton);
    });

    it('should warn and no-op for missing command targets', async () => {
      fixture = await createFixture(
        html`<button-form-control-mixin-test-element command="--test" commandfor="missing"></button-form-control-mixin-test-element>`
      );
      button = fixture.querySelector<ButtonFormControlMixinTestElement>('button-form-control-mixin-test-element')!;
      await elementIsStable(button);
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

      emulateClick(button);

      expect(warn).toHaveBeenCalledWith('commandForElement', 'missing', 'not found');
      warn.mockRestore();
    });

    it('should dispatch commands to targets in the same shadow tree', async () => {
      const host = document.createElement('div');
      const shadow = host.attachShadow({ mode: 'open' });
      fixture = await createFixture();
      fixture.appendChild(host);
      shadow.innerHTML = `
        <button-form-control-mixin-test-element command="--test" commandfor="target"></button-form-control-mixin-test-element>
        <div id="target"></div>
      `;
      button = shadow.querySelector<ButtonFormControlMixinTestElement>('button-form-control-mixin-test-element')!;
      const target = shadow.querySelector<HTMLElement>('#target')!;
      await elementIsStable(button);
      const command = untilEvent<CommandTestEvent>(target, 'command');

      emulateClick(button);

      expect((await command).command).toBe('--test');
    });

    it('should toggle popover targets', async () => {
      fixture = await createFixture(html`
        <button-form-control-mixin-test-element popovertarget="popover"></button-form-control-mixin-test-element>
        <div popover id="popover">popover</div>
      `);
      button = fixture.querySelector<ButtonFormControlMixinTestElement>('button-form-control-mixin-test-element')!;
      const popover = fixture.querySelector<HTMLElement>('[popover]')!;
      await elementIsStable(button);

      emulateClick(button);
      await elementIsStable(button);

      expect(popover.matches(':popover-open')).toBe(true);
    });

    it('should follow a changed popover target', async () => {
      fixture = await createFixture(html`
        <button-form-control-mixin-test-element
          popovertarget="first"
          popovertargetaction="show"
        ></button-form-control-mixin-test-element>
        <div popover id="first">first</div>
        <div popover id="second">second</div>
      `);
      button = fixture.querySelector<ButtonFormControlMixinTestElement>('button-form-control-mixin-test-element')!;
      const first = fixture.querySelector<HTMLElement>('#first')!;
      const second = fixture.querySelector<HTMLElement>('#second')!;
      await elementIsStable(button);

      emulateClick(button);
      first.hidePopover();

      button.popovertarget = 'second';
      await elementIsStable(button);
      emulateClick(button);

      expect(button.popoverTargetElement).toBe(second);
      expect(first.matches(':popover-open')).toBe(false);
      expect(second.matches(':popover-open')).toBe(true);
    });

    it('should support popover target properties and show or hide actions', async () => {
      fixture = await createFixture(html`
        <button-form-control-mixin-test-element></button-form-control-mixin-test-element>
        <div popover id="popover">popover</div>
      `);
      button = fixture.querySelector<ButtonFormControlMixinTestElement>('button-form-control-mixin-test-element')!;
      const popover = fixture.querySelector<HTMLElement>('[popover]')!;
      button.popoverTargetElement = popover;
      button.popoverTargetAction = 'show';
      await elementIsStable(button);

      emulateClick(button);
      expect(popover.matches(':popover-open')).toBe(true);

      button.popoverTargetAction = 'hide';
      await elementIsStable(button);
      emulateClick(button);
      expect(popover.matches(':popover-open')).toBe(false);
    });

    it('should no-op popover behavior when disabled', async () => {
      fixture = await createFixture(html`
        <button-form-control-mixin-test-element disabled popovertarget="popover"></button-form-control-mixin-test-element>
        <div popover id="popover">popover</div>
      `);
      button = fixture.querySelector<ButtonFormControlMixinTestElement>('button-form-control-mixin-test-element')!;
      const popover = fixture.querySelector<HTMLElement>('[popover]')!;
      await elementIsStable(button);

      emulateClick(button);

      expect(popover.matches(':popover-open')).toBe(false);
    });

    it('should pass anchored popover source when the target has an anchor reference', async () => {
      fixture = await createFixture(html`
        <button-form-control-mixin-test-element popovertarget="popover" popovertargetaction="show"></button-form-control-mixin-test-element>
        <div id="anchor"></div>
        <div popover id="popover">popover</div>
      `);
      button = fixture.querySelector<ButtonFormControlMixinTestElement>('button-form-control-mixin-test-element')!;
      const anchorTarget = fixture.querySelector<HTMLElement>('#anchor')!;
      const popover = fixture.querySelector<HTMLElement>('[popover]');
      Object.defineProperty(popover, 'anchor', { configurable: true, value: 'anchor' });
      const showPopover = vi.spyOn(popover, 'showPopover').mockImplementation(() => {});
      await elementIsStable(button);

      emulateClick(button);

      expect(showPopover).toHaveBeenCalledWith({ source: anchorTarget });
      showPopover.mockRestore();
    });

    it('should dispatch interest and loseinterest events', async () => {
      fixture = await createFixture(html`
        <button-form-control-mixin-test-element interestfor="target"></button-form-control-mixin-test-element>
        <div id="target"></div>
      `);
      button = fixture.querySelector<ButtonFormControlMixinTestElement>('button-form-control-mixin-test-element')!;
      const target = fixture.querySelector<HTMLElement>('#target')!;
      await elementIsStable(button);
      const interest = untilEvent<InterestTestEvent>(target, 'interest');
      const loseinterest = untilEvent<InterestTestEvent>(target, 'loseinterest');

      button.dispatchEvent(new MouseEvent('mouseenter'));
      button.dispatchEvent(new MouseEvent('mouseleave'));

      expect((await interest).source).toBe(button);
      expect((await loseinterest).source).toBe(button);
    });

    it('should no-op interest dispatch for missing targets', async () => {
      fixture = await createFixture(
        html`<button-form-control-mixin-test-element interestfor="missing"></button-form-control-mixin-test-element>`
      );
      button = fixture.querySelector<ButtonFormControlMixinTestElement>('button-form-control-mixin-test-element');
      await elementIsStable(button);

      button.dispatchEvent(new MouseEvent('mouseenter'));

      expect(button.interestForElement).toBe(null);
    });

    it('should dispatch interest and loseinterest events from focus-visible focus and blur', async () => {
      fixture = await createFixture(html`
        <button-form-control-mixin-test-element interestfor="target"></button-form-control-mixin-test-element>
        <div id="target"></div>
      `);
      button = fixture.querySelector<ButtonFormControlMixinTestElement>('button-form-control-mixin-test-element')!;
      const target = fixture.querySelector<HTMLElement>('#target')!;
      await elementIsStable(button);
      const interest = untilEvent<InterestTestEvent>(target, 'interest');
      const loseinterest = untilEvent<InterestTestEvent>(target, 'loseinterest');
      const focusVisibleMatch = vi.spyOn(button, 'matches').mockReturnValue(true);

      button.dispatchEvent(new FocusEvent('focus'));
      button.dispatchEvent(new FocusEvent('blur'));

      expect((await interest).source).toBe(button);
      expect((await loseinterest).source).toBe(button);
      expect(focusVisibleMatch).toHaveBeenCalledWith(':focus-visible');
    });

    it('should support direct interestForElement references', async () => {
      fixture = await createFixture(html`
        <button-form-control-mixin-test-element></button-form-control-mixin-test-element>
        <div id="target"></div>
      `);
      button = fixture.querySelector<ButtonFormControlMixinTestElement>('button-form-control-mixin-test-element')!;
      const target = fixture.querySelector<HTMLElement>('#target')!;
      button.interestForElement = target;
      await elementIsStable(button);
      const interest = untilEvent<InterestTestEvent>(target, 'interest');

      button.dispatchEvent(new MouseEvent('mouseenter'));

      expect((await interest).source).toBe(button);
    });

    it('should infer interest target from hint popover target', async () => {
      fixture = await createFixture(html`
        <button-form-control-mixin-test-element popovertarget="hint"></button-form-control-mixin-test-element>
        <div id="hint" popover="hint"></div>
      `);
      button = fixture.querySelector<ButtonFormControlMixinTestElement>('button-form-control-mixin-test-element')!;
      const target = fixture.querySelector<HTMLElement>('#hint')!;
      await elementIsStable(button);
      const interest = untilEvent<InterestTestEvent>(target, 'interest');

      button.dispatchEvent(new MouseEvent('mouseenter'));

      expect((await interest).source).toBe(button);
    });
  });
});
