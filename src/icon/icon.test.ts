import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable } from '@elements/elements/test';
import { Icon } from '@elements/elements/icon';
import '@elements/elements/icon/define.js';

describe('nve-icon', () => {
  let fixture: HTMLElement;
  let element: Icon;

  beforeEach(async () => {
    fixture = await createFixture(html`<nve-icon></nve-icon>`);
    element = fixture.querySelector('nve-icon');
    await elementIsStable(element);
  });

  afterEach(() => {
    fixture.remove();
  });

  it('should create element', () => {
    expect(element.tagName).eq('MLV-ICON');
  });

  it('should have a default variant of "default"', () => {
    expect(element.variant).eq('default');
  });

  it('should update svg reference when "name" is updated', async () => {
    expect(element.name).eq(undefined);
    element.name = 'test';
    await elementIsStable(element);
    expect(element.shadowRoot.innerHTML).includes('/assets/icons.svg#test');
  });

  it('should update svg color when "color" is updated', async () => {
    expect(element.color).eq(undefined);
    element.color = 'red';
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector('svg').getAttribute('color')).eq('red');
  });
});
