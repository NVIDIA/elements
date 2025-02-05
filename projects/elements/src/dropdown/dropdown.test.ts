import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable, untilEvent, emulateClick } from '@nvidia-elements/testing';
import { IconButton } from '@nvidia-elements/core/icon-button';
import { Dropdown } from '@nvidia-elements/core/dropdown';
import '@nvidia-elements/core/dropdown/define.js';

describe(Dropdown.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: Dropdown;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-dropdown>hello</nve-dropdown>
    `);
    element = fixture.querySelector(Dropdown.metadata.tag);
    element.hidePopover();
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get(Dropdown.metadata.tag)).toBeDefined();
  });

  it('should reflect modal state', async () => {
    await elementIsStable(element);
    expect(element.modal).toBe(true);
    expect(element.hasAttribute('modal')).toBe(true);
  });

  it('should render close button when closable', async () => {
    expect(element.shadowRoot.querySelector(IconButton.metadata.tag)).toBe(null);
    element.closable = true;
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector(IconButton.metadata.tag).tagName.toLocaleLowerCase()).toBe(
      IconButton.metadata.tag
    );
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
    element.hidePopover();
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
    emulateClick(element.shadowRoot.querySelector<IconButton>(IconButton.metadata.tag));
    expect(await event).toBeDefined();
  });
});
