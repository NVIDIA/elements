import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable, untilEvent } from '@nvidia-elements/testing';
import { Notification } from '@nvidia-elements/core/notification';
import '@nvidia-elements/core/notification/define.js';

describe('mlv-notification', () => {
  let fixture: HTMLElement;
  let element: Notification;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <mlv-notification>hello</mlv-notification>
    `);
    element = fixture.querySelector('mlv-notification');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get('mlv-notification')).toBeDefined();
  });

  it('should render close button when closable', async () => {
    expect(element.shadowRoot.querySelector('mlv-icon-button')).toBe(null);
    element.closable = true;
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector('mlv-icon-button').tagName).toBe('MLV-ICON-BUTTON');
  });

  // https://open-ui.org/components/popup.research.explainer#api-shape
  it('should default to manual behavior', async () => {
    await elementIsStable(element);
    expect(element.popoverType).toBe('manual');
  });

  it('should initialize role type of alert', async () => {
    await elementIsStable(element);
    expect(element._internals.role).toBe('alert');
  });

  it('should set an aria-label for the icon status', async () => {
    expect(element.shadowRoot.querySelector('mlv-icon').ariaLabel).toBe('information');
    element.status = 'success';
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector('mlv-icon').ariaLabel).toBe('success');
  });

  it('should default to positioning to inline content', async () => {
    await elementIsStable(element);
    expect(element.position).toBe(undefined);
  });

  it('should default to alignment to inline content', async () => {
    await elementIsStable(element);
    expect(element.position).toBe(undefined);
  });

  it('should initialize to inline content', async () => {
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector('dialog')).toBe(null);
  });

  it('should update to a popover type if positioned', async () => {
    expect(element.shadowRoot.querySelector('dialog')).toBe(null);
    element.position = 'bottom';
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector('dialog').tagName).toBe('DIALOG');
  });

  it('should override remove to set hidden', async () => {
    expect(element.hidden).toBe(false);
    await element.remove();
    expect(element.hidden).toBe(true);
  });

  it('should emit close event when close button clicked', async () => {
    element.closable = true;
    await elementIsStable(element);

    const event = untilEvent(element, 'close');
    element.shadowRoot.querySelector('mlv-icon-button').click();
    expect(await event).toBeDefined();
  });

  it('should nve-animation-complete event to signal when to remove element', async () => {
    element.closable = true;
    await elementIsStable(element);

    const event = untilEvent(element.shadowRoot as any, 'nve-animation-complete');
    await element.remove();
    expect(await event).toBeDefined();
  });

  it('should reflect a status', async () => {
    expect(element.status).toBe(undefined);
    expect(element.hasAttribute('status')).toBe(false);

    element.status = 'accent';
    await elementIsStable(element);
    expect(element.getAttribute('status')).toBe('accent');
  });

  it('should reflect a container', async () => {
    expect(element.container).toBe(undefined);
    expect(element.hasAttribute('container')).toBe(false);

    element.container = 'flat';
    await elementIsStable(element);
    expect(element.getAttribute('container')).toBe('flat');
  });
});
