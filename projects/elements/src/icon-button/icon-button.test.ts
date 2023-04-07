import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@elements/elements/test';
import { IconButton } from '@elements/elements/icon-button';
import '@elements/elements/icon-button/define.js';

describe('mlv-icon-button', () => {
  let fixture: HTMLElement;
  let element: IconButton;
  let elementWithAnchor: IconButton;
  let elementWithCustomIcon: IconButton;
  let anchor: HTMLAnchorElement;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <mlv-icon-button></mlv-icon-button>
      <mlv-icon-button>
        <a href="#" aria-label="link to page"></a>
      </mlv-icon-button>
      <mlv-icon-button>
        <span slot="icon">🎉</span>
      </mlv-icon-button>
    `);
    element = fixture.querySelectorAll('mlv-icon-button')[0];
    elementWithAnchor = fixture.querySelectorAll('mlv-icon-button')[1];
    elementWithCustomIcon = fixture.querySelectorAll('mlv-icon-button')[2];
    anchor = fixture.querySelector('a');
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get('mlv-icon-button')).toBeDefined();
  });

  it('should have a default interaction unset', () => {
    expect(element.interaction).eq(undefined);
  });

  it('should update "name" on child mlv-icon when "icon" is updated on parent', async () => {
    expect(element.iconName).eq(undefined);
    element.iconName = 'cancel';
    await elementIsStable(element);

    expect(element.iconName).toBe('cancel');
    element.iconName = 'cancel';
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector('mlv-icon').name).toBe('cancel');
  });

  it('should allow anchor to be slotted', async () => {
    await elementIsStable(elementWithAnchor);
    expect(elementWithAnchor.shadowRoot.querySelector('slot').assignedElements()[0]).toBe(anchor);
  });

  it('should allow custom icon to be slotted', async () => {
    await elementIsStable(elementWithAnchor);
    expect(elementWithCustomIcon.shadowRoot.querySelector<HTMLSlotElement>('slot[name=icon]').assignedElements()[0]).toBe(fixture.querySelector('[slot=icon]'));
  });
});
