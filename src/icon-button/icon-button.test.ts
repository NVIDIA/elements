import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@elements/elements/test';
import { IconButton } from '@elements/elements/icon-button';
import '@elements/elements/icon-button/define.js';

describe('nve-icon-button', () => {
  let fixture: HTMLElement;
  let element: IconButton;
  let elementWithAnchor: IconButton;
  let anchor: HTMLAnchorElement;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-icon-button></nve-icon-button>
      <nve-icon-button>
        <a href="#" aria-label="link to page"></a>
      </nve-icon-button>
    `);
    element = fixture.querySelectorAll('nve-icon-button')[0];
    elementWithAnchor = fixture.querySelectorAll('nve-icon-button')[1];
    anchor = fixture.querySelector('a');
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get('nve-icon-button')).toBeDefined();
  });

  it('should have a default interaction unset', () => {
    expect(element.interaction).eq(undefined);
  });

  it('should update "name" on child nve-icon when "icon" is updated on parent', async () => {
    expect(element.iconName).eq(undefined);
    element.iconName = 'test';
    await elementIsStable(element);

    expect(element.iconName).toBe('test');
    element.iconName = 'test';
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector('nve-icon').name).toBe('test');
  });

  it('should allow anchor to be slotted', async () => {
    await elementIsStable(elementWithAnchor);
    expect(elementWithAnchor.shadowRoot.querySelector('slot').assignedElements()[0]).toBe(anchor);
  });
});
