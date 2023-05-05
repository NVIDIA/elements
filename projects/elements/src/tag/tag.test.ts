import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture, untilEvent } from '@elements/elements/test';
import { Tag } from '@elements/elements/tag';
import '@elements/elements/tag/define.js';

describe('nve-tag', () => {
  let fixture: HTMLElement;
  let element: Tag;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-tag></nve-tag>
    `);
    element = fixture.querySelector('nve-tag');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get('nve-tag')).toBeDefined();
  });

  it('should reflect a color', async () => {
    expect(element.color).toBe(undefined);
    expect(element.hasAttribute('color')).toBe(false);

    element.color = 'green-grass';
    await elementIsStable(element);
    expect(element.getAttribute('color')).toBe('green-grass');
  });

  it('should show close icon if closable', async () => {
    expect(element.closable).toBe(false);
    expect(element.shadowRoot.querySelector('nve-icon')).toBeFalsy();

    element.closable = true;
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector('nve-icon')).toBeTruthy();
  });

  it('should be an interctive button type', async () => {
    await elementIsStable(element);
    expect(element._internals.role).toBe('button');
  });

  it('should emit close event when close button clicked', async () => {
    element.closable = true;
    await elementIsStable(element);

    const event = untilEvent(element, 'close');
    element.shadowRoot.querySelector('nve-icon').click();
    expect((await event)).toBeDefined();
  });
});
