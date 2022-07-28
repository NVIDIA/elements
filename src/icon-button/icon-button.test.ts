import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@elements/elements/test';
import { IconButton } from '@elements/elements/icon-button';
import '@elements/elements/icon-button/define.js';

describe('mlv-icon-button', () => {
  let fixture: HTMLElement;
  let element: IconButton;

  beforeEach(async () => {
    fixture = await createFixture(html`<mlv-icon-button></mlv-icon-button>`);
    element = fixture.querySelector('mlv-icon-button');
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get('mlv-icon-button')).toBeDefined();
  });

  it('should have a default variant of "primary"', () => {
    expect(element.variant).eq('primary');
  });

  it('should update "name" on chile mlv-icon when "name" is updated on parent', async () => {
    expect(element.name).eq(undefined);
    element.name = 'test';
    await elementIsStable(element);

    expect(element.name).toBe('test');
    element.name = 'test';
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector('mlv-icon').name).toBe('test');
  });
});
