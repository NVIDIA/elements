import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@nvidia-elements/testing';
import { Alert } from '@nvidia-elements/core/alert';
import { ControlMessage } from '@nvidia-elements/core/forms';
import '@nvidia-elements/core/forms/define.js';

describe(ControlMessage.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: ControlMessage;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <mlv-control-message></mlv-control-message>
    `);
    element = fixture.querySelector(ControlMessage.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get(ControlMessage.metadata.tag)).toBeDefined();
  });

  it('should self assign to the messages slot for controls', () => {
    expect(element.slot).toBe('messages');
  });

  it('should assign correct alert state based on control validation state', async () => {
    const alert = element.shadowRoot.querySelector<Alert>(Alert.metadata.tag);
    expect(alert.status).toBe(undefined);

    element.status = 'success';
    await elementIsStable(element);
    expect(alert.status).toBe('success');

    element.status = 'error';
    await elementIsStable(element);
    expect(alert.status).toBe('danger');

    element.status = 'disabled';
    await elementIsStable(element);
    expect(alert.status).toBe(undefined);

    element.status = 'warning';
    await elementIsStable(element);
    expect(alert.status).toBe('warning');
  });

  it('should set the alert status to danger if message has a validation error applied', async () => {
    element.error = 'valueMissing';
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector<Alert>(Alert.metadata.tag).status).toBe('danger');
  });
});
