import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable, untilEvent } from '@elements/elements/test';
import type { ControlMessage } from '../control-message/control-message.js';
import type { Control } from '../control/control.js';
import { updateControlStatusState, setupControlStates, setupControlValidationStates, showNonValidationMessages, hideAllValidationMessages, showActiveValidationMessages, hideAllControlMessages, hideInactiveValidationMessages } from './states.js';
import '@elements/elements/forms/define.js';

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
    control = fixture.querySelector('nve-control');
    message = fixture.querySelector('nve-control-message');
    await elementIsStable(control);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  describe('updateControlStatusState', () => {
    it('should add appropriate error/success states to the control based on available messages', async () => {
      expect(control.matches(':--error')).toBe(false);
      expect(control.matches(':--success')).toBe(false);

      message.status = 'error';
      updateControlStatusState(control, message);
      expect((control._internals.states as any).has('--error')).toBe(true);
      expect((control._internals.states as any).has('--success')).toBe(false);

      message.status = 'success';
      updateControlStatusState(control, message);
      expect((control._internals.states as any).has('--error')).toBe(false);
      expect((control._internals.states as any).has('--success')).toBe(true);
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
    control = fixture.querySelector('nve-control');
    message = fixture.querySelector('nve-control-message');
    setupControlValidationStates(control, [message]);
    await elementIsStable(control);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should update validation state if HTML5 validation is disabled and manually controlled', async () => {
    await elementIsStable(control);
    expect((control._internals.states as any).has('--valid')).toBe(true);
    expect((control._internals.states as any).has('--invalid')).toBe(false);
    expect((control._internals.states as any).has('--touched')).toBe(false);

    message.status = 'error';
    control.appendChild(message);
    control.shadowRoot.dispatchEvent(new Event('slotchange'));
    await elementIsStable(control);

    expect(message.hidden).toBe(false);
    expect((control._internals.states as any).has('--valid')).toBe(false);
    expect((control._internals.states as any).has('--invalid')).toBe(true);

    message.remove();
    control.shadowRoot.dispatchEvent(new Event('slotchange'));
    await elementIsStable(control);await elementIsStable(control);await elementIsStable(control);await elementIsStable(control);
    expect((control._internals.states as any).has('--invalid')).toBe(false);
    expect((control._internals.states as any).has('--valid')).toBe(true);
  });
});

describe('setupControlValidationStates', () => {
  let fixture: HTMLElement;
  let form: HTMLFormElement;
  let control: Control;
  let message: ControlMessage;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <form>
        <nve-control>
          <label>label</label>
          <input type="text" required value="" />
          <nve-control-message>message</nve-control-message>
        </nve-control>
      </form>
    `);
    control = fixture.querySelector('nve-control');
    message = fixture.querySelector('nve-control-message');
    form = fixture.querySelector('form');
    setupControlValidationStates(control, [message]);
    await elementIsStable(control);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should reset validation state on blur', async () => {
    control.input.dispatchEvent(new Event('blur'));
    await elementIsStable(control);

    expect((control._internals.states as any).has('--invalid')).toBe(true);
    expect((control._internals.states as any).has('--valid')).toBe(false);
    expect(control.status).toBe('error');
    expect(message.hidden).toBe(false);
    expect(message.hasAttribute('hidden')).toBe(false);

    control.input.value = 'test';
    control.input.dispatchEvent(new Event('blur'));
    await elementIsStable(control);

    expect((control._internals.states as any).has('--invalid')).toBe(false);
    expect((control._internals.states as any).has('--valid')).toBe(true);
    expect(control.status).toBe(null);
  });

  it('should reset validation state on input', async () => {
    control.input.dispatchEvent(new Event('blur'));
    await elementIsStable(control);

    expect((control._internals.states as any).has('--invalid')).toBe(true);
    expect((control._internals.states as any).has('--valid')).toBe(false);
    expect(control.status).toBe('error');
  });

  it('should reset validity when passing', async () => {
    control.input.value = 'test';
    control.input.dispatchEvent(new Event('blur'));
    await elementIsStable(control);

    expect((control._internals.states as any).has('--invalid')).toBe(false);
    expect(control.status).toBe(null);
  });

  it('should reset validity when parent form reset is called', async () => {
    control.input.value = 'test';
    control.input.dispatchEvent(new Event('blur'));
    await elementIsStable(control);

    const event = untilEvent(form, 'reset');
    form.reset();
    expect((await event)).toBeDefined();
    await elementIsStable(control);
    expect(control.input.value).toBe('');
  });
});

describe('setupControlStates', () => {
  let fixture: HTMLElement;
  let control: Control;
  let input: HTMLInputElement & { readonly: boolean; };

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-control>
        <label>label</label>
        <input type="text" required name="input" />
        <nve-control-message>message</nve-control-message>
      </nve-control>
    `);
    control = fixture.querySelector('nve-control');
    setupControlStates(control);
    input = fixture.querySelector<HTMLInputElement & { readonly: boolean; }>('input');
    await elementIsStable(control);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should update checked states', async () => {
    await elementIsStable(control);
    expect((control.matches(':--checked'))).toBe(false);
    expect((control._internals.states as any).has('--checked')).toBe(false);

    input.checked = true;
    input.dispatchEvent(new Event('change'));
    await elementIsStable(control);
    expect((control.matches(':--checked'))).toBe(true);
    expect((control._internals.states as any).has('--checked')).toBe(true);
  });

  it('should update readonly states', async () => {
    await elementIsStable(control);
    expect((control.matches(':--readonly'))).toBe(false);
    expect((control._internals.states as any).has('--readonly')).toBe(false);

    input.setAttribute('readonly', '');
    await elementIsStable(control);
    expect((control.matches(':--readonly'))).toBe(true);
    expect((control._internals.states as any).has('--readonly')).toBe(true);
  });

  it('should update disabled states', async () => {
    await elementIsStable(control);
    expect((control.matches(':--disabled'))).toBe(false);
    expect((control._internals.states as any).has('--disabled')).toBe(false);

    input.setAttribute('disabled', '');
    await elementIsStable(control);
    expect((control.matches(':--disabled'))).toBe(true);
    expect((control._internals.states as any).has('--disabled')).toBe(true);
  });

  it('should update focus states', async () => {
    await elementIsStable(control);
    expect((control.matches(':--focus'))).toBe(false);
    expect((control._internals.states as any).has('--focus')).toBe(false);

    input.dispatchEvent(new Event('focus'));
    await elementIsStable(control);
    expect((control.matches(':--focus'))).toBe(true);
    expect((control._internals.states as any).has('--focus')).toBe(true);

    input.dispatchEvent(new Event('blur'));
    await elementIsStable(control);
    expect((control.matches(':--focus'))).toBe(false);
    expect((control._internals.states as any).has('--focus')).toBe(false);
  });

  it('should update touched state', async () => {
    await elementIsStable(control);
    expect((control.matches(':--touched'))).toBe(false);
    expect((control._internals.states as any).has('--touched')).toBe(false);

    input.dispatchEvent(new Event('blur'));
    await elementIsStable(control);
    expect((control.matches(':--touched'))).toBe(true);
    expect((control._internals.states as any).has('--touched')).toBe(true);
    expect((control.matches(':--focus'))).toBe(false);
    expect((control._internals.states as any).has('--focus')).toBe(false);
  });

  it('should update dirty state', async () => {
    await elementIsStable(control);
    expect((control.matches(':--dirty'))).toBe(false);
    expect((control._internals.states as any).has('--dirty')).toBe(false);

    input.dispatchEvent(new Event('input'));
    await elementIsStable(control);
    expect((control.matches(':--dirty'))).toBe(true);
    expect((control._internals.states as any).has('--dirty')).toBe(true);
  });
});

describe('showNonValidationMessages', () => {
  it('should show all messages that do not have a validation requirement', async () => {
    const messages = [
      document.createElement('nve-control-message'),
      document.createElement('nve-control-message')
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
      document.createElement('nve-control-message'),
      document.createElement('nve-control-message')
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
      document.createElement('nve-control-message'),
      document.createElement('nve-control-message')
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

describe('hideAllControlMessages', () => {
  it('should hide all control messages', async () => {
    const messages = [
      document.createElement('nve-control-message'),
      document.createElement('nve-control-message')
    ];

    document.body.append(...messages)

    expect(messages[0].hidden).toBe(false);
    expect(messages[1].hidden).toBe(false);
    expect(messages[0].hasAttribute('hidden')).toBe(false);
    expect(messages[1].hasAttribute('hidden')).toBe(false);

    hideAllControlMessages(messages);

    expect(messages[0].hidden).toBe(true);
    expect(messages[1].hidden).toBe(true);
    expect(messages[0].hasAttribute('hidden')).toBe(true);
    expect(messages[1].hasAttribute('hidden')).toBe(true);

    messages[0].remove();
    messages[1].remove();
  });
});

describe('hideInactiveValidationMessages', () => {
  it('should hide all validation messages if control is valid', async () => {
    const controlMock = { input: { validity: { valid: true } } } as Control;
    const messages = [
      document.createElement('nve-control-message'),
      document.createElement('nve-control-message')
    ];

    messages[0].error = 'valueMissing';

    hideInactiveValidationMessages(controlMock, messages);

    expect(messages[0].hidden).toBe(true);
    expect(messages[1].hidden).toBe(false);
    expect(messages[0].hasAttribute('hidden')).toBe(true);
    expect(messages[1].hasAttribute('hidden')).toBe(false);
  });
});
