import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@elements/elements/test';
import { ControlMessage } from '@elements/elements/forms';
import '@elements/elements/forms/define.js';

describe('nve-control-message', () => {
  let fixture: HTMLElement;
  let element: ControlMessage;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-control-message></nve-control-message>
    `);
    element = fixture.querySelector('nve-control-message');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get('nve-control-message')).toBeDefined();
  });

  it('should self assign to the messages slot for controls', () => {
    expect(element.slot).toBe('messages');
  });

  it('should assign correct alert state based on control validation state', async () => {
    const alert = element.shadowRoot.querySelector('nve-alert');
    expect(alert.status).toBe('muted');

    element.status = 'success';
    await elementIsStable(element);
    expect(alert.status).toBe('success');

    element.status = 'error';
    await elementIsStable(element);
    expect(alert.status).toBe('danger');

    element.status = 'disabled';
    await elementIsStable(element);
    expect(alert.status).toBe('muted');

    element.status = 'warning';
    await elementIsStable(element);
    expect(alert.status).toBe('warning');
  });

  it('should set the alert status to danger if message has a validation error applied', async () => {
    element.error = 'valueMissing';
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector('nve-alert').status).toBe('danger');
  });
});
