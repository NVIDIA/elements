import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@nvidia-elements/testing';
import { Dot } from '@nvidia-elements/core/dot';
import '@nvidia-elements/core/dot/define.js';

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

  it('should reflect a size', async () => {
    expect(element.size).toBe(undefined);
    expect(element.hasAttribute('size')).toBe(false);

    element.size = 'sm';
    await elementIsStable(element);
    expect(element.getAttribute('size')).toBe('sm');
  });

  it('should apply slotted text specific styles', async () => {
    await elementIsStable(element);
    expect(element.matches(':state(has-text)')).toBe(false);

    element.innerHTML = '<span>test</span>';
    await elementIsStable(element);
    expect(element.matches(':state(has-text)')).toBe(true);

    element.innerHTML = '';
    await elementIsStable(element);
    expect(element.matches(':state(has-text)')).toBe(false);
  });
});
