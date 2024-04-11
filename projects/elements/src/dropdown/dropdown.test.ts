import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable, untilEvent } from '@nvidia-elements/testing';
import { Dropdown } from '@nvidia-elements/core/dropdown';
import '@nvidia-elements/core/dropdown/define.js';

describe('mlv-dropdown', () => {
  let fixture: HTMLElement;
  let element: Dropdown;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <mlv-dropdown>hello</mlv-dropdown>
    `);
    element = fixture.querySelector('mlv-dropdown');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get('mlv-dropdown')).toBeDefined();
  });

  it('should render close button when closable', async () => {
    expect(element.shadowRoot.querySelector('mlv-icon-button')).toBe(null);
    element.closable = true;
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector('mlv-icon-button').tagName).toBe('MLV-ICON-BUTTON');
  });

  it('should render arrow when set', async () => {
    expect(element.shadowRoot.querySelector('.arrow')).toBe(null);
    element.arrow = true;
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector('.arrow').tagName).toBe('DIV');
  });

  // https://open-ui.org/components/popup.research.explainer#api-shape
  it('should default to auto behavior', async () => {
    await elementIsStable(element);
    expect(element.popoverType).toBe('auto');
  });

  it('should default to positioning on the bottom of an anchor', async () => {
    await elementIsStable(element);
    expect(element.position).toBe('bottom');
  });

  it('should apply an aria-label to the close button', async () => {
    element.closable = true;
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector('mlv-icon-button').ariaLabel).toBe('close');
  });

  it('should emit close event when close button clicked', async () => {
    element.closable = true;
    await elementIsStable(element);

    const event = untilEvent(element, 'close');
    element.shadowRoot.querySelector('mlv-icon-button').click();
    expect(await event).toBeDefined();
  });
});
