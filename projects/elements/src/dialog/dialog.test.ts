import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable, untilEvent } from '@nvidia-elements/testing';
import { IconButton } from '@nvidia-elements/core/icon-button';
import { Dialog } from '@nvidia-elements/core/dialog';
import '@nvidia-elements/core/dialog/define.js';

describe(Dialog.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: Dialog;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-dialog id="dialog">hello</nve-dialog>
      <button popovertarget="dialog">button</button>
    `);
    element = fixture.querySelector(Dialog.metadata.tag);
    element.hidePopover();
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get(Dialog.metadata.tag)).toBeDefined();
  });

  it('should initialize role of type dialog', async () => {
    await elementIsStable(element);
    expect(element._internals.role).toBe('dialog');
  });

  it('should render close button when closable', async () => {
    expect(element.shadowRoot.querySelector(IconButton.metadata.tag)).toBe(null);

    element.closable = true;
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector(IconButton.metadata.tag).tagName.toLocaleLowerCase()).toBe(
      IconButton.metadata.tag
    );
  });

  it('should return popoverDismissible based on closable state', async () => {
    await elementIsStable(element);
    expect(element.popoverDismissible).toBe(false);

    element.closable = true;
    await elementIsStable(element);
    expect(element.popoverDismissible).toBe(true);
  });

  it('should reflect a modal attribute', async () => {
    expect(element.modal).toBe(undefined);
    expect(element.getAttribute('modal')).toBe(null);

    element.modal = true;
    await elementIsStable(element);
    expect(element.getAttribute('modal')).toBe('');
  });

  it('should use manual behavior when non-modal', async () => {
    expect(element.modal).toBe(undefined);
    expect(element.popoverType).toBe('manual');
    expect(element.popover).toBe('manual');
    await elementIsStable(element);

    element.modal = true;
    await elementIsStable(element);
    expect(element.popoverType).toBe('auto');
    expect(element.popover).toBe('auto');
  });

  // https://open-ui.org/components/popup.research.explainer#api-shape
  it('should use auto behavior when modal', async () => {
    element.modal = true;
    await elementIsStable(element);
    expect(element.popoverType).toBe('auto');
  });

  it('should use default to center position', async () => {
    await elementIsStable(element);
    expect(element.position).toBe('center');
  });

  it('should use default to center alignment', async () => {
    await elementIsStable(element);
    expect(element.alignment).toBe('center');
  });

  it('should use default to anchor as document.body', async () => {
    await elementIsStable(element);
    expect(element.anchor).toBe(document.body);
  });

  it('should apply an aria-label to the close button', async () => {
    element.closable = true;
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector(IconButton.metadata.tag).ariaLabel).toBe('close');
  });

  it('should emit open event when showPopover is called', async () => {
    element.closable = true;
    await elementIsStable(element);

    const event = untilEvent(element, 'open');
    element.showPopover();
    expect(await event).toBeDefined();
  });

  it('should emit close event when hidePopover is called', async () => {
    element.closable = true;
    await elementIsStable(element);

    const open = untilEvent(element, 'open');
    element.showPopover();
    expect(await open).toBeDefined();

    const close = untilEvent(element, 'close');
    element.hidePopover();
    expect(await close).toBeDefined();
  });

  it('should emit close event when close button clicked', async () => {
    element.closable = true;
    await elementIsStable(element);

    const open = untilEvent(element, 'open');
    element.showPopover();
    expect(await open).toBeDefined();

    const event = untilEvent(element, 'close');
    element.shadowRoot.querySelector<IconButton>(IconButton.metadata.tag).click();
    expect(await event).toBeDefined();
  });
});
