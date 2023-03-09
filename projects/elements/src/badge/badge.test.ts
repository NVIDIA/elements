import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@elements/elements/test';
import { Badge } from '@elements/elements/badge';
import '@elements/elements/badge/define.js';

describe('mlv-badge', () => {
  let fixture: HTMLElement;
  let element: Badge;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <mlv-badge></mlv-badge>
    `);
    element = fixture.querySelector('mlv-badge');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get('mlv-badge')).toBeDefined();
  });

  it('should reflect a status', async () => {
    expect(element.status).toBe(undefined);
    expect(element.hasAttribute('status')).toBe(false);

    element.status = 'restarting';
    await elementIsStable(element);
    expect(element.getAttribute('status')).toBe('restarting');
  });

  it('should provide suffix icon slot', async () => {
    expect(element.shadowRoot.querySelector('slot[name="suffix-icon"]')).toBeTruthy();
  });

  it('should provide trend icon when using a trend status', async () => {
    expect(element.shadowRoot.querySelector('mlv-icon')).toBeFalsy();

    element.status = 'trend-up';
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector('mlv-icon').name).toBe('trend-up');

    element.status = 'trend-down';
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector('mlv-icon').name).toBe('trend-down');

    element.status = 'trend-neutral';
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector('mlv-icon').name).toBe('minus');
  });
});
