import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable } from '@elements/elements/test';
import { Icon, IconVariants } from '@elements/elements/icon';
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

  it('should reflect variant atrribute for style hook', async () => {
    expect(element.variant).eq(undefined);
    element.variant = IconVariants.Lighter;
    await elementIsStable(element);
    expect(element.getAttribute('variant')).eq('lighter');
  });

  it('should update svg reference when "name" is updated', async () => {
    expect(element.name).eq(undefined);
    element.name = 'test';
    await elementIsStable(element);
    expect(element.shadowRoot.innerHTML).includes('/assets/icons.svg#test');
  });
});
