import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@nvidia-elements/testing';
import { Badge } from '@elements/elements/badge';
import '@elements/elements/badge/define.js';

describe('mlv-badge', () => {
  let fixture: HTMLElement;
  let element: Badge;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <mlv-badge>label</mlv-badge>
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

  it('should set a default aria role of status', async () => {
    await elementIsStable(element);
    expect(element._internals.role).toBe('status');
  });

  it('should set a default aria-label', async () => {
    await elementIsStable(element);
    expect(element._internals.ariaLabel).toBe('label');
  });

  it('should set trend specific label when status is a trend', async () => {
    element.textContent = '+10%';
    element.status = 'trend-up';
    await elementIsStable(element);
    expect(element._internals.ariaLabel).toBe('+10% trend up');
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

  it('should assign unamed icon slots to the first icon slot', async () => {
    const icon = document.createElement('mlv-icon');
    element.appendChild(icon);
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector<HTMLSlotElement>('slot[name="prefix-icon"]').assignedElements()).toContain(
      icon
    );
  });

  it('should provide trend icon when using a trend status', async () => {
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
