import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, emulateClick, removeFixture, untilEvent } from '@elements/elements/test';
import { Alert } from '@elements/elements/alert';
import '@elements/elements/alert/define.js';

describe('mlv-alert', () => {
  let fixture: HTMLElement;
  let alert: Alert;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <mlv-alert>default</mlv-alert>
    `);
    alert = fixture.querySelector('mlv-alert');
    await elementIsStable(alert);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define elements', () => {
    expect(customElements.get('mlv-alert')).toBeDefined();
  });

  it('should show close button if closable', async () => {
    expect(alert.shadowRoot.querySelector('mlv-icon-button')).toBe(null);
    alert.closable = true;
    await elementIsStable(alert);
    expect(alert.shadowRoot.querySelector('mlv-icon-button')).toBeDefined();
  });

  it('should emit close event when close button clicked', async () => {
    alert.closable = true;
    await elementIsStable(alert);

    const event = untilEvent(alert, 'close');
    emulateClick(alert.shadowRoot.querySelector('mlv-icon-button'));
    expect((await event)).toBeDefined();
  });

  it('should show status icon if status is proivided', async () => {
    expect(alert.shadowRoot.querySelector('mlv-icon').name).toBe('information');
    alert.status = 'success';
    await elementIsStable(alert);
    expect(alert.shadowRoot.querySelector('mlv-icon')).toBeDefined();
    expect(alert.shadowRoot.querySelector('mlv-icon').name).toBe('passed-or-success');
  });

  it('should provide a aria role of alert to describe content', async () => {
    await elementIsStable(alert);
    expect(alert._internals.role).toBe('alert');
  });
});
