import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@elements/elements/test';
import { ControlMessage } from '../control-message/control-message.js';
import { Control } from '../control/control.js';
import { updateControlStatusState, setupControlStates, setupControlValidationStates } from './states.js';
import '@elements/elements/forms/define.js';

describe('updateControlStatusState', () => {
  let fixture: HTMLElement;
  let control: Control;
  let message: ControlMessage;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <mlv-control>
        <label>label</label>
        <input type="text" required />
        <mlv-control-message>message</mlv-control-message>
      </mlv-control>
    `);
    control = fixture.querySelector('mlv-control');
    message = fixture.querySelector('mlv-control-message');
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
      <mlv-control>
        <label>label</label>
        <input type="text" formnovalidate required />
        <mlv-control-message>message</mlv-control-message>
      </mlv-control>
    `);
    control = fixture.querySelector('mlv-control');
    message = fixture.querySelector('mlv-control-message');
    setupControlValidationStates(control, [message]);
    await elementIsStable(control);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should update validation state if HTML5 validation is disabled and manually controlled', async () => {
    await elementIsStable(control);
    // expect((control._internals.states as any).has('--valid')).toBe(true); // incorrect in happy-dom
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
  let control: Control;
  let message: ControlMessage;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <mlv-control>
        <label>label</label>
        <input type="text" required />
        <mlv-control-message>message</mlv-control-message>
      </mlv-control>
    `);
    control = fixture.querySelector('mlv-control');
    message = fixture.querySelector('mlv-control-message');
    setupControlValidationStates(control, [message]);
    await elementIsStable(control);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should reset validation state on blur', async () => {
    control.input.dispatchEvent(new Event('blur'));
    await elementIsStable(control);

    // expect((control._internals.states as any).has('--invalid')).toBe(true); // incorrect in happy-dom
    expect((control._internals.states as any).has('--valid')).toBe(false);
    // expect(control.status).toBe('error'); // incorrect in happy-dom
  });

  it('should reset validation state on input', async () => {
    control.input.dispatchEvent(new Event('blur'));
    await elementIsStable(control);

    // expect((control._internals.states as any).has('--invalid')).toBe(true); // incorrect in happy-dom
    expect((control._internals.states as any).has('--valid')).toBe(false);
    // expect(control.status).toBe('error'); // incorrect in happy-dom
  });

  it('should reset validity when passing', async () => {
    control.input.value = 'test';
    control.input.dispatchEvent(new Event('blur'));
    await elementIsStable(control);

    expect((control._internals.states as any).has('--invalid')).toBe(false);
    // expect(control.status).toBe(null); // incorrect in happy-dom
  });
});

describe('setupControlStates', () => {
  let fixture: HTMLElement;
  let control: Control;
  let input: HTMLInputElement & { readonly: boolean; };

  beforeEach(async () => {
    fixture = await createFixture(html`
      <mlv-control>
        <label>label</label>
        <input type="text" required name="input" />
        <mlv-control-message>message</mlv-control-message>
      </mlv-control>
    `);
    control = fixture.querySelector('mlv-control');
    setupControlStates(control);
    input = fixture.querySelector<HTMLInputElement & { readonly: boolean; }>('input');
    await elementIsStable(control);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should update checked states', async () => {
    await elementIsStable(control);
    expect((control.matches('[state--checked]'))).toBe(false);
    expect((control._internals.states as any).has('--checked')).toBe(false);

    input.checked = true;
    input.dispatchEvent(new Event('change'));
    await elementIsStable(control);
    expect((control.matches('[state--checked]'))).toBe(true);
    expect((control._internals.states as any).has('--checked')).toBe(true);
  });

  it('should update readonly states', async () => {
    await elementIsStable(control);
    expect((control.matches('[state--readonly]'))).toBe(false);
    expect((control._internals.states as any).has('--readonly')).toBe(false);

    input.setAttribute('readonly', '');
    await elementIsStable(control);
    expect((control.matches('[state--readonly]'))).toBe(true);
    expect((control._internals.states as any).has('--readonly')).toBe(true);
  });

  it('should update disabled states', async () => {
    await elementIsStable(control);
    expect((control.matches('[state--disabled]'))).toBe(false);
    expect((control._internals.states as any).has('--disabled')).toBe(false);

    input.setAttribute('disabled', '');
    await elementIsStable(control);
    expect((control.matches('[state--disabled]'))).toBe(true);
    expect((control._internals.states as any).has('--disabled')).toBe(true);
  });

  it('should update focus states', async () => {
    await elementIsStable(control);
    expect((control.matches('[state--focus]'))).toBe(false);
    expect((control._internals.states as any).has('--focus')).toBe(false);

    input.dispatchEvent(new Event('focus'));
    await elementIsStable(control);
    expect((control.matches('[state--focus]'))).toBe(true);
    expect((control._internals.states as any).has('--focus')).toBe(true);

    input.dispatchEvent(new Event('blur'));
    await elementIsStable(control);
    expect((control.matches('[state--focus]'))).toBe(false);
    expect((control._internals.states as any).has('--focus')).toBe(false);
  });

  it('should update touched state', async () => {
    await elementIsStable(control);
    expect((control.matches('[state--touched]'))).toBe(false);
    expect((control._internals.states as any).has('--touched')).toBe(false);

    input.dispatchEvent(new Event('blur'));
    await elementIsStable(control);
    expect((control.matches('[state--touched]'))).toBe(true);
    expect((control._internals.states as any).has('--touched')).toBe(true);
  });

  it('should update dirty state', async () => {
    await elementIsStable(control);
    expect((control.matches('[state--dirty]'))).toBe(false);
    expect((control._internals.states as any).has('--dirty')).toBe(false);

    input.dispatchEvent(new Event('input'));
    await elementIsStable(control);
    expect((control.matches('[state--dirty]'))).toBe(true);
    expect((control._internals.states as any).has('--dirty')).toBe(true);
  });
});
