import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@elements/elements/test';
import { IconButton } from '@elements/elements/icon-button';
import '@elements/elements/icon-button/define.js';

describe('nve-icon-button', () => {
  let fixture: HTMLElement;
  let element: IconButton;
  let elementWithAnchor: IconButton;
  let elementWithCustomIcon: IconButton;
  let anchor: HTMLAnchorElement;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-icon-button></nve-icon-button>
      <nve-icon-button>
        <a href="#" aria-label="link to page"></a>
      </nve-icon-button>
      <nve-icon-button>
        <span>🎉</span>
      </nve-icon-button>
    `);
    element = fixture.querySelectorAll('nve-icon-button')[0];
    elementWithAnchor = fixture.querySelectorAll('nve-icon-button')[1];
    elementWithCustomIcon = fixture.querySelectorAll('nve-icon-button')[2];
    anchor = fixture.querySelector('[href]');
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get('nve-icon-button')).toBeDefined();
  });

  it('should provide a aria role of button', async () => {
    await elementIsStable(element);
    expect(element._internals.role).toBe('button');
  });

  it('should use aria-hidden to semantically hide the SVG in favor of the host element role', async () => {
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector('[internal-host]').getAttribute('aria-hidden')).toBe('true');
    expect(element.shadowRoot.querySelector('nve-icon').getAttribute('aria-hidden')).toBe('true');
  });

  it('should have a default interaction unset', () => {
    expect(element.interaction).eq(undefined);
  });

  it('should update "name" on child nve-icon when "icon" is updated on parent', async () => {
    expect(element.iconName).eq(undefined);
    element.iconName = 'cancel';
    await elementIsStable(element);

    expect(element.iconName).toBe('cancel');
    element.iconName = 'cancel';
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector('nve-icon').name).toBe('cancel');
  });

  it('should allow anchor to be slotted', async () => {
    await elementIsStable(elementWithAnchor);
    expect(anchor.slot).toBe('anchor');
  });

  it('should allow custom icon to be slotted', async () => {
    await elementIsStable(elementWithAnchor);
    expect(elementWithCustomIcon.shadowRoot.querySelector<HTMLSlotElement>('slot').assignedElements()[0]).toBe(fixture.querySelector('span'));
  });
});
