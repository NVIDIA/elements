import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable, untilEvent } from '@nvidia-elements/testing';
import { Toast } from '@elements/elements/toast';
import '@elements/elements/toast/define.js';

describe('mlv-toast', () => {
  let fixture: HTMLElement;
  let element: Toast;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <mlv-toast>hello</mlv-toast>
    `);
    element = fixture.querySelector('mlv-toast');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get('mlv-toast')).toBeDefined();
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

  it('should default to positioning on the top of an anchor', async () => {
    await elementIsStable(element);
    expect(element.position).toBe('top');
  });

  it('should initialize role of type alert', async () => {
    await elementIsStable(element);
    expect(element._internals.role).toBe('alert');
  });

  it('should set an aria-label for the icon status', async () => {
    await elementIsStable(element);
    element.status = 'success';
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector('mlv-icon').ariaLabel).toBe('success');
  });

  it('should apply an aria-label to the close button', async () => {
    element.closable = true;
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector('mlv-icon-button').ariaLabel).toBe('close');
  });

  it('should hide status icon if muted', async () => {
    element.status = 'muted';
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector('mlv-icon')).toBe(null);
  });

  it('should emit close event when close button clicked', async () => {
    element.closable = true;
    await elementIsStable(element);

    const event = untilEvent(element, 'close');
    element.shadowRoot.querySelector('mlv-icon-button').click();
    expect(await event).toBeDefined();
  });
});
