// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable, untilEvent } from '@internals/testing';
import { ControlMessage } from '../control-message/control-message.js';
import { Control } from '../control/control.js';
import { ControlGroup } from '../control-group/control-group.js';
import {
  updateControlStatusState,
  setupControlStates,
  setupControlValidationStates,
  showNonValidationMessages,
  hideAllValidationMessages,
  showActiveValidationMessages,
  hideInactiveValidationMessages
} from './states.js';
import '@nvidia-elements/core/forms/define.js';

describe('updateControlStatusState', () => {
  let fixture: HTMLElement;
  let control: Control;
  let message: ControlMessage;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-control>
        <label>label</label>
        <input type="text" required />
        <nve-control-message>message</nve-control-message>
      </nve-control>
    `);
    control = fixture.querySelector(Control.metadata.tag);
    message = fixture.querySelector(ControlMessage.metadata.tag);
    await elementIsStable(control);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  describe('updateControlStatusState', () => {
    it('should add appropriate error/success states to the control based on available messages', async () => {
      expect(control.matches(':state(error)')).toBe(false);
      expect(control.matches(':state(success)')).toBe(false);

      message.status = 'error';
      updateControlStatusState(control, message);
      expect(control.matches(':state(error)')).toBe(true);
      expect(control.matches(':state(success)')).toBe(false);

      message.status = 'success';
      updateControlStatusState(control, message);
      expect(control.matches(':state(error)')).toBe(false);
      expect(control.matches(':state(success)')).toBe(true);
    });

    it('should add/remove success states if added or removed', async () => {
      expect(control.matches(':state(error)')).toBe(false);
      expect(control.matches(':state(success)')).toBe(false);

      message.status = 'success';
      updateControlStatusState(control, message);
      expect(control.matches(':state(error)')).toBe(false);
      expect(control.matches(':state(success)')).toBe(true);

      message.remove();
      control.shadowRoot.dispatchEvent(new Event('slotchange'));
      await elementIsStable(control);

      expect(control.matches(':state(error)')).toBe(false);
      expect(control.matches(':state(success)')).toBe(false);

      control.appendChild(message);
      control.shadowRoot.dispatchEvent(new Event('slotchange'));
      await elementIsStable(control);

      expect(control.matches(':state(error)')).toBe(false);
      expect(control.matches(':state(success)')).toBe(true);
    });

    it('should add/remove error states if added or removed', async () => {
      expect(control.matches(':state(error)')).toBe(false);
      expect(control.matches(':state(success)')).toBe(false);

      message.status = 'error';
      updateControlStatusState(control, message);
      expect(control.matches(':state(error)')).toBe(true);
      expect(control.matches(':state(success)')).toBe(false);

      message.remove();
      control.shadowRoot.dispatchEvent(new Event('slotchange'));
      await elementIsStable(control);

      expect(control.matches(':state(error)')).toBe(false);
      expect(control.matches(':state(success)')).toBe(false);

      control.appendChild(message);
      control.shadowRoot.dispatchEvent(new Event('slotchange'));
      await elementIsStable(control);

      expect(control.matches(':state(error)')).toBe(true);
      expect(control.matches(':state(success)')).toBe(false);
    });
  });
});

describe('setupControlValidationStates HTML5 disabled', () => {
  let fixture: HTMLElement;
  let control: Control;
  let message: ControlMessage;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-control>
        <label>label</label>
        <input type="text" formnovalidate required />
        <nve-control-message>message</nve-control-message>
      </nve-control>
    `);
    control = fixture.querySelector(Control.metadata.tag);
    message = fixture.querySelector(ControlMessage.metadata.tag);
    setupControlValidationStates(control, [message]);
    await elementIsStable(control);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should update validation state if HTML5 validation is disabled and manually controlled', async () => {
    await elementIsStable(control);
    expect(control._internals.states.has('valid')).toBe(true);
    expect(control._internals.states.has('invalid')).toBe(false);
    expect(control._internals.states.has('touched')).toBe(false);

    message.status = 'error';
    control.appendChild(message);
    control.shadowRoot.dispatchEvent(new Event('slotchange'));
    await elementIsStable(control);

    expect(message.hidden).toBe(false);
    expect(control._internals.states.has('valid')).toBe(false);
    expect(control._internals.states.has('invalid')).toBe(true);

    message.remove();
    control.shadowRoot.dispatchEvent(new Event('slotchange'));
    await elementIsStable(control);
    await elementIsStable(control);
    await elementIsStable(control);
    await elementIsStable(control);
    expect(control._internals.states.has('invalid')).toBe(false);
    expect(control._internals.states.has('valid')).toBe(true);
  });
});

describe('setupControlValidationStates', () => {
  let fixture: HTMLElement;
  let form: HTMLFormElement;
  let input: HTMLInputElement;
  let control: Control;
  let message: ControlMessage;
  let validationMessage: ControlMessage;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <form>
        <nve-control>
          <label>label</label>
          <input type="text" required value="" />
          <nve-control-message>message</nve-control-message>
          <nve-control-message error="valueMissing">required</nve-control-message>
        </nve-control>
      </form>
    `);
    control = fixture.querySelector(Control.metadata.tag);
    message = fixture.querySelector(ControlMessage.metadata.tag);
    form = fixture.querySelector('form');
    input = fixture.querySelector('input');
    validationMessage = fixture.querySelector(`${ControlMessage.metadata.tag}[error="valueMissing"]`);
    await elementIsStable(control);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should reset validation state on blur', async () => {
    control.input.dispatchEvent(new Event('blur'));
    await elementIsStable(control);

    expect(control._internals.states.has('invalid')).toBe(true);
    expect(control._internals.states.has('valid')).toBe(false);
    expect(control.status).toBe('error');
    expect(getComputedStyle(message).display).toBe('none');
    expect(validationMessage.hidden).toBe(false);

    control.input.value = 'test';
    control.input.dispatchEvent(new Event('blur'));
    await elementIsStable(control);

    expect(control._internals.states.has('invalid')).toBe(false);
    expect(control._internals.states.has('valid')).toBe(true);
    expect(control.status).toBe(null);
    expect(getComputedStyle(message).display).toBe('block');
    expect(validationMessage.hidden).toBe(true);
  });

  it('should reset validation state on input', async () => {
    control.input.dispatchEvent(new Event('blur'));
    await elementIsStable(control);

    expect(control._internals.states.has('invalid')).toBe(true);
    expect(control._internals.states.has('valid')).toBe(false);
    expect(control.status).toBe('error');
  });

  it('should reset validity when passing', async () => {
    control.input.value = 'test';
    control.input.dispatchEvent(new Event('blur'));
    await elementIsStable(control);

    expect(control._internals.states.has('invalid')).toBe(false);
    expect(control.status).toBe(null);
  });

  it('should reset validity when parent form reset is called', async () => {
    control.input.value = 'test';
    control.input.dispatchEvent(new Event('blur'));
    await elementIsStable(control);

    const event = untilEvent(form, 'reset');
    form.reset();
    expect(await event).toBeDefined();
    await elementIsStable(control);
    expect(control.input.value).toBe('');
  });

  it('should reset validation state on invalid event', async () => {
    message.error = 'customError';
    input.setCustomValidity('customError');
    control.input.dispatchEvent(new Event('invalid'));
    await elementIsStable(control);
    expect(message.hidden).toBe(false);
    expect(validationMessage.hidden).toBe(true);
  });
});

describe('setupControlStates', () => {
  let fixture: HTMLElement;
  let control: Control;
  let input: HTMLInputElement & { readonly: boolean };

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-control>
        <label>label</label>
        <input type="text" required name="input" />
        <nve-control-message>message</nve-control-message>
      </nve-control>
    `);
    control = fixture.querySelector(Control.metadata.tag);
    setupControlStates(control);
    input = fixture.querySelector<HTMLInputElement & { readonly: boolean }>('input');
    await elementIsStable(control);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should update checked states', async () => {
    await elementIsStable(control);
    expect(control.matches(':state(checked)')).toBe(false);
    expect(control._internals.states.has('checked')).toBe(false);

    input.checked = true;
    input.dispatchEvent(new Event('change'));
    await elementIsStable(control);
    expect(control.matches(':state(checked)')).toBe(true);
    expect(control._internals.states.has('checked')).toBe(true);
  });

  it('should update readonly states', async () => {
    await elementIsStable(control);
    expect(control.matches(':state(readonly)')).toBe(false);
    expect(control._internals.states.has('readonly')).toBe(false);

    input.setAttribute('readonly', '');
    await elementIsStable(control);
    expect(control.matches(':state(readonly)')).toBe(true);
    expect(control._internals.states.has('readonly')).toBe(true);
  });

  it('should update disabled states', async () => {
    await elementIsStable(control);
    expect(control.matches(':state(disabled)')).toBe(false);
    expect(control._internals.states.has('disabled')).toBe(false);

    input.setAttribute('disabled', '');
    await elementIsStable(control);
    expect(control.matches(':state(disabled)')).toBe(true);
    expect(control._internals.states.has('disabled')).toBe(true);
  });

  it('should update focus states', async () => {
    await elementIsStable(control);
    expect(control.matches(':state(focus)')).toBe(false);
    expect(control._internals.states.has('focus')).toBe(false);

    input.dispatchEvent(new Event('focus'));
    await elementIsStable(control);
    expect(control.matches(':state(focus)')).toBe(true);
    expect(control._internals.states.has('focus')).toBe(true);

    input.dispatchEvent(new Event('blur'));
    await elementIsStable(control);
    expect(control.matches(':state(focus)')).toBe(false);
    expect(control._internals.states.has('focus')).toBe(false);
  });

  it('should update touched state', async () => {
    await elementIsStable(control);
    expect(control.matches(':state(touched)')).toBe(false);
    expect(control._internals.states.has('touched')).toBe(false);

    input.dispatchEvent(new Event('blur'));
    await elementIsStable(control);
    expect(control.matches(':state(touched)')).toBe(true);
    expect(control._internals.states.has('touched')).toBe(true);
    expect(control.matches(':state(focus)')).toBe(false);
    expect(control._internals.states.has('focus')).toBe(false);
  });

  it('should update dirty state', async () => {
    await elementIsStable(control);
    expect(control.matches(':state(dirty)')).toBe(false);
    expect(control._internals.states.has('dirty')).toBe(false);

    input.dispatchEvent(new Event('input'));
    await elementIsStable(control);
    expect(control.matches(':state(dirty)')).toBe(true);
    expect(control._internals.states.has('dirty')).toBe(true);
  });
});

describe('showNonValidationMessages', () => {
  it('should show all messages that do not have a validation requirement', async () => {
    const messages = [
      document.createElement(ControlMessage.metadata.tag) as ControlMessage,
      document.createElement(ControlMessage.metadata.tag) as ControlMessage
    ];

    messages[0].setAttribute('error', 'valueMissing');
    messages[0].hidden = true;
    messages[1].hidden = true;

    showNonValidationMessages(messages);

    expect(messages[0].hidden).toBe(true);
    expect(messages[1].hidden).toBe(false);
  });
});

describe('hideAllValidationMessages', () => {
  it('should hide all messages with a validation requirement', async () => {
    const messages = [
      document.createElement(ControlMessage.metadata.tag) as ControlMessage,
      document.createElement(ControlMessage.metadata.tag) as ControlMessage
    ];

    messages[0].setAttribute('error', 'valueMissing');

    hideAllValidationMessages(messages);

    expect(messages[0].hidden).toBe(true);
    expect(messages[1].hidden).toBe(false);
    expect(messages[0].hasAttribute('hidden')).toBe(true);
    expect(messages[1].hasAttribute('hidden')).toBe(false);
  });
});

describe('showActiveValidationMessages', () => {
  it('should only messages wich have active validation rules', async () => {
    const controlMock = { input: { validity: { valueMissing: true } } } as Control;
    const messages = [
      document.createElement(ControlMessage.metadata.tag) as ControlMessage,
      document.createElement(ControlMessage.metadata.tag) as ControlMessage
    ];

    messages[0].error = 'valueMissing';
    messages[0].hidden = true;
    messages[1].hidden = true;

    showActiveValidationMessages(controlMock, messages);

    expect(messages[0].hidden).toBe(false);
    expect(messages[1].hidden).toBe(true);
    expect(messages[0].hasAttribute('hidden')).toBe(false);
    expect(messages[1].hasAttribute('hidden')).toBe(true);
  });
});

describe('hideInactiveValidationMessages', () => {
  it('should hide all validation messages if control is valid', async () => {
    const controlMock = { input: { validity: { valid: true } } } as Control;
    const messages = [
      document.createElement(ControlMessage.metadata.tag) as ControlMessage,
      document.createElement(ControlMessage.metadata.tag) as ControlMessage
    ];

    messages[0].error = 'valueMissing';

    hideInactiveValidationMessages(controlMock, messages);

    expect(messages[0].hidden).toBe(true);
    expect(messages[1].hidden).toBe(false);
    expect(messages[0].hasAttribute('hidden')).toBe(true);
    expect(messages[1].hasAttribute('hidden')).toBe(false);
  });
});

describe('setupControlGroupStates initial', () => {
  let fixture: HTMLElement;
  let controlGroup: ControlGroup;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-control-group>
        <label>control group</label>
      </nve-control-group>
    `);
    controlGroup = fixture.querySelector(ControlGroup.metadata.tag);
    await elementIsStable(controlGroup);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should not apply :state(disabled) state when no controls are rendered', async () => {
    await elementIsStable(controlGroup);
    expect(controlGroup.matches(':state(disabled)')).toBe(false);
    expect(controlGroup._internals.states.has('disabled')).toBe(false);
  });
});

describe('setupControlGroupStates', () => {
  let fixture: HTMLElement;
  let controlGroup: ControlGroup;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-control-group>
        <label>control group</label>
        <nve-control>
          <label>label</label>
          <input type="text" />
        </nve-control>
      </nve-control-group>
    `);
    controlGroup = fixture.querySelector(ControlGroup.metadata.tag);
    await elementIsStable(controlGroup);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should update disabled states', async () => {
    await elementIsStable(controlGroup);
    expect(controlGroup.matches(':state(disabled)')).toBe(false);
    expect(controlGroup._internals.states.has('disabled')).toBe(false);

    controlGroup.querySelector('input').setAttribute('disabled', '');
    await elementIsStable(controlGroup);

    expect(controlGroup.matches(':state(disabled)')).toBe(true);
    expect(controlGroup._internals.states.has('disabled')).toBe(true);
  });
});
