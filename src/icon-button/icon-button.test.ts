import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable } from '@elements/elements/test';
import { IconButton } from '@elements/elements/icon-button';
import '@elements/elements/icon-button/define.js';

describe('nve-icon-button', () => {
  let fixture: HTMLElement;
  let element: IconButton;

  beforeEach(async () => {
    fixture = await createFixture(html`<nve-icon-button></nve-icon-button>`);
    element = fixture.querySelector('nve-icon-button');
  });

  afterEach(() => {
    fixture.remove();
  });

  it('should create element', () => {
    expect(element.tagName).eq('MLV-ICON-BUTTON');
  });

  it('should have a default variant of "primary"', () => {
    expect(element.variant).eq('primary');
  });

  it('should update "name" on chile nve-icon when "name" is updated on parent', async () => {
    expect(element.name).eq(undefined);
    element.name = 'test';
    await elementIsStable(element);

    expect(element.name).toBe('test');
    element.name = 'test';
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector('nve-icon').name).toBe('test');
  });
});
