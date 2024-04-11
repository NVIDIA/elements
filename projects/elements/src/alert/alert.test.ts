import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, emulateClick, removeFixture, untilEvent } from '@nvidia-elements/testing';
import { Alert } from '@nvidia-elements/core/alert';
import '@nvidia-elements/core/alert/define.js';

describe('nve-alert', () => {
  let fixture: HTMLElement;
  let alert: Alert;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-alert>default</nve-alert>
    `);
    alert = fixture.querySelector('nve-alert');
    await elementIsStable(alert);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define elements', () => {
    expect(customElements.get('nve-alert')).toBeDefined();
  });

  it('should show close button if closable', async () => {
    expect(alert.shadowRoot.querySelector('nve-icon-button')).toBe(null);
    alert.closable = true;
    await elementIsStable(alert);
    expect(alert.shadowRoot.querySelector('nve-icon-button')).toBeDefined();
  });

  it('should emit close event when close button clicked', async () => {
    alert.closable = true;
    await elementIsStable(alert);

    const event = untilEvent(alert, 'close');
    emulateClick(alert.shadowRoot.querySelector('nve-icon-button'));
    expect(await event).toBeDefined();
  });

  it('should show status icon if status is proivided', async () => {
    expect(alert.shadowRoot.querySelector('nve-icon').name).toBe('information-circle-stroke');
    alert.status = 'success';
    await elementIsStable(alert);
    expect(alert.shadowRoot.querySelector('nve-icon')).toBeDefined();
    expect(alert.shadowRoot.querySelector('nve-icon').name).toBe('checkmark-circle');
  });

  it('should set an aria-label for the icon status', async () => {
    expect(alert.shadowRoot.querySelector('nve-icon').ariaLabel).toBe('information');
    alert.status = 'success';
    await elementIsStable(alert);
    expect(alert.shadowRoot.querySelector('nve-icon').ariaLabel).toBe('success');
  });

  it('should provide a aria role of alert to describe content', async () => {
    await elementIsStable(alert);
    expect(alert._internals.role).toBe('alert');
  });

  it('should apply an aria-label to the close button', async () => {
    alert.closable = true;
    await elementIsStable(alert);
    expect(alert.shadowRoot.querySelector('nve-icon-button').ariaLabel).toBe('close');
  });

  it('should provide a actions slot for action buttons', async () => {
    await elementIsStable(alert);
    expect(alert.shadowRoot.querySelector('slot[name=actions]')).toBeFalsy();

    const button = document.createElement('button');
    button.slot = 'actions';
    alert.appendChild(button);
    alert.requestUpdate();

    await elementIsStable(alert);
    expect(alert.shadowRoot.querySelector('slot[name=actions]')).toBeTruthy();
  });

  it('should provide a prefix slot for banner api', async () => {
    await elementIsStable(alert);
    expect(alert.shadowRoot.querySelector('slot[name=prefix]')).toBeFalsy();

    const span = document.createElement('span');
    span.slot = 'prefix';
    alert.appendChild(span);
    alert.requestUpdate();

    await elementIsStable(alert);
    expect(alert.shadowRoot.querySelector('slot[name=prefix]')).toBeTruthy();
  });
});
