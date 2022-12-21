import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@elements/elements/test';
import { ControlMessage } from '../control-message/control-message.js';
import { Control } from '../control/control.js';
import { updateControlStatusState } from './states.js';
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

  describe('setupControlValidationStates', () => {
    it('should add appropriate valid/invalid states based on available validation status', async () => {
      expect((control._internals.states as any).has('--valid')).toBe(false);
      expect((control._internals.states as any).has('--invalid')).toBe(false);

      control.input.dispatchEvent(new Event('invalid'));
      await elementIsStable(control);
      expect(control.status).toBe('error');
      expect((control._internals.states as any).has('--valid')).toBe(false);
      expect((control._internals.states as any).has('--invalid')).toBe(true);
    });
  });
});

describe('setupControlValidationStates', () => {
  let fixture: HTMLElement;
  let control: Control;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-control>
        <label>label</label>
        <input type="text" formnovalidate required />
        <nve-control-message>message</nve-control-message>
      </nve-control>
    `);
    control = fixture.querySelector('nve-control');
    await elementIsStable(control);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should update validation state if HTML5 validation is disabled and manually controlled', async () => {
    await elementIsStable(control);
    expect((control._internals.states as any).has('--valid')).toBe(false);
    expect((control._internals.states as any).has('--invalid')).toBe(false);

    const message = document.createElement('nve-control-message');
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
