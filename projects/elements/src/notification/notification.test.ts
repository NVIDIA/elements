import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable, untilEvent } from '@elements/elements/test';
import { Notification } from '@elements/elements/notification';
import '@elements/elements/notification/define.js';

describe('nve-notification', () => {
  let fixture: HTMLElement;
  let element: Notification;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-notification>hello</nve-notification>
    `);
    element = fixture.querySelector('nve-notification');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get('nve-notification')).toBeDefined();
  });

  it('should render close button when closable', async () => {
    expect(element.shadowRoot.querySelector('nve-icon-button')).toBe(null);
    element.closable = true;
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector('nve-icon-button').tagName).toBe('MLV-ICON-BUTTON');
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
    element.shadowRoot.querySelector('nve-icon-button').click();
    expect((await event)).toBeDefined();
  });
});
