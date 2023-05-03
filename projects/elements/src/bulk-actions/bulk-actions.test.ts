import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture, untilEvent } from '@elements/elements/test';
import { BulkActions } from '@elements/elements/bulk-actions';
import '@elements/elements/bulk-actions/define.js';

describe('nve-bulk-actions', () => {
  let fixture: HTMLElement;
  let element: BulkActions;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-bulk-actions></nve-bulk-actions>
    `);
    element = fixture.querySelector('nve-bulk-actions');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get('nve-bulk-actions')).toBeDefined();
  });

  it('should reflect a status', async () => {
    expect(element.status).toBe(undefined);
    expect(element.hasAttribute('status')).toBe(false);

    element.status = 'accent';
    await elementIsStable(element);
    expect(element.getAttribute('status')).toBe('accent');
  });

  it('should render close button when closable', async () => {
    expect(element.shadowRoot.querySelector('nve-icon-button')).toBe(null);
    element.closable = true;
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector('nve-icon-button').tagName).toBe('MLV-ICON-BUTTON');
  });

  it('should emit close event when close button clicked', async () => {
    element.closable = true;
    await elementIsStable(element);

    const event = untilEvent(element, 'close');
    element.shadowRoot.querySelector('nve-icon-button').click();
    expect((await event)).toBeDefined();
  });
});
