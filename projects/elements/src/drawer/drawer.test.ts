import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable, untilEvent } from '@nvidia-elements/testing';
import { Drawer } from '@nvidia-elements/core/drawer';
import '@nvidia-elements/core/drawer/define.js';

describe('mlv-drawer', () => {
  let fixture: HTMLElement;
  let element: Drawer;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <mlv-drawer>hello</mlv-drawer>
    `);
    element = fixture.querySelector('mlv-drawer');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get('mlv-drawer')).toBeDefined();
  });

  it('should render close button when closable', async () => {
    expect(element.shadowRoot.querySelector('mlv-icon-button')).toBe(null);

    element.closable = true;
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector('mlv-icon-button').tagName).toBe('MLV-ICON-BUTTON');
  });

  it('should use manual behavior when non-modal', async () => {
    expect(element.modal).toBe(undefined);
    expect(element.popoverType).toBe('manual');
    await elementIsStable(element);

    element.modal = true;
    await elementIsStable(element);
    expect(element.popoverType).toBe('auto');
  });

  // https://open-ui.org/components/popup.research.explainer#api-shape
  it('should use auto behavior when modal', async () => {
    element.modal = true;
    await elementIsStable(element);
    expect(element.popoverType).toBe('auto');
  });

  it('should use default to left position', async () => {
    await elementIsStable(element);
    expect(element.position).toBe('left');
  });

  it('should use default to anchor as document.body', async () => {
    await elementIsStable(element);
    expect(element.anchor).toBe(document.body);
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
