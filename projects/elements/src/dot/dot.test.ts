import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@elements/elements/test';
import { Dot } from '@elements/elements/dot';
import '@elements/elements/dot/define.js';

describe('mlv-dot', () => {
  let fixture: HTMLElement;
  let element: Dot;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <mlv-dot></mlv-dot>
    `);
    element = fixture.querySelector('mlv-dot');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get('mlv-dot')).toBeDefined();
  });

  it('should reflect a status', async () => {
    expect(element.status).toBe(undefined);
    expect(element.hasAttribute('status')).toBe(false);

    element.status = 'restarting';
    await elementIsStable(element);
    expect(element.getAttribute('status')).toBe('restarting');
  });

  it('should apply slotted text specific styles', async () => {
    await elementIsStable(element);
    expect(element.matches(':--has-text')).toBe(false);

    element.innerHTML = '<span>test</span>';
    await elementIsStable(element);
    expect(element.matches(':--has-text')).toBe(true);

    element.innerHTML = '';
    await elementIsStable(element);
    expect(element.matches(':--has-text')).toBe(false);
  });
});
