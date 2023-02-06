import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@elements/elements/test';
import { Icon } from '@elements/elements/icon';
import '@elements/elements/icon/define.js';

describe('mlv-icon', () => {
  let fixture: HTMLElement;
  let element: Icon;

  beforeEach(async () => {
    fixture = await createFixture(html`<mlv-icon></mlv-icon>`);
    element = fixture.querySelector('mlv-icon');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get('mlv-icon')).toBeDefined();
  });

  it('should reflect variant atrribute for style hook', async () => {
    expect(element.variant).eq(undefined);
    element.variant = 'inherit';
    await elementIsStable(element);
    expect(element.getAttribute('variant')).eq('inherit');
  });

  it('should update svg reference when "name" is updated', async () => {
    expect(element.name).eq(undefined);
    element.name = 'book';
    await elementIsStable(element);
    expect(element.shadowRoot.innerHTML).includes('<div internal-host="">');
  });
});
