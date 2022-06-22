import { describe, expect, it, beforeEach } from 'vitest';
import { Icon } from '@elements/elements/icon';
import '@elements/elements/icon/define.js';

describe('nve-icon', () => {
  let element: Icon;
  beforeEach(async () => {
    element = document.createElement('nve-icon');
    document.body.appendChild(element);
    await element.updateComplete;
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
    await element.updateComplete;
    expect(element.shadowRoot.innerHTML).includes('/assets/icons.svg#test');
  });

  it('should update svg color when "color" is updated', async () => {
    expect(element.color).eq(undefined);
    element.color = 'red';
    await element.updateComplete;
    expect(element.shadowRoot.querySelector('svg').getAttribute('color')).eq('red');
  });
});
