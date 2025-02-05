import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable, untilEvent } from '@nvidia-elements/testing';
import { IconButton } from '@nvidia-elements/core/icon-button';
import { Drawer } from '@nvidia-elements/core/drawer';
import '@nvidia-elements/core/drawer/define.js';

describe(Drawer.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: Drawer;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-drawer>hello</nve-drawer>
    `);
    element = fixture.querySelector(Drawer.metadata.tag);
    element.hidePopover();
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get(Drawer.metadata.tag)).toBeDefined();
  });

  it('should render close button when closable', async () => {
    expect(element.shadowRoot.querySelector(IconButton.metadata.tag)).toBe(null);

    element.closable = true;
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector(IconButton.metadata.tag).tagName.toLocaleLowerCase()).toBe(
      IconButton.metadata.tag
    );
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

  it('should create a ghost element placeholder when open and in inline mode', async () => {
    element.inline = true;
    await elementIsStable(element);

    const toggle = untilEvent(element, 'toggle');
    element.showPopover();
    expect(await toggle).toBeDefined();
    expect(document.body.querySelector('[nve-ghost]') as HTMLElement).toBeTruthy();
  });

  it('should remove a ghost element placeholder when closed', async () => {
    element.inline = true;
    await elementIsStable(element);

    const toggle = untilEvent(element, 'toggle');
    element.showPopover();
    expect(await toggle).toBeDefined();
    expect(document.body.querySelector('[nve-ghost]') as HTMLElement).toBeTruthy();

    const hide = untilEvent(element, 'toggle');
    element.hidePopover();
    expect(await hide).toBeDefined();
    expect(document.body.querySelector('[nve-ghost]') as HTMLElement).toBe(null);
  });
});
