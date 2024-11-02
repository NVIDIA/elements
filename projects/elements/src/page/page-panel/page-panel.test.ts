import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable, untilEvent } from '@nvidia-elements/testing';
import { PagePanel } from '@nvidia-elements/core/page';
import '@nvidia-elements/core/page/define.js';
import { IconButton } from '@nvidia-elements/core/icon-button';

describe(PagePanel.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: PagePanel;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-page>
        <nve-page-panel>hello</nve-page-panel>
      </nve-page>
    `);
    element = fixture.querySelector(PagePanel.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get(PagePanel.metadata.tag)).toBeDefined();
  });

  it('should have an aria role "region"', async () => {
    expect(element._internals.role).toBe('region');
  });

  it('should provide a default content slot', async () => {
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector('slot:not([name])')).toBeTruthy();
  });

  it('should provide a header slot', async () => {
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector('slot[name=header]')).toBeTruthy();
  });

  it('should provide a footer slot', async () => {
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector('slot[name=footer]')).toBeTruthy();
  });

  it('should reflect size attribute', async () => {
    expect(element.size).toBe(undefined);
    expect(element.hasAttribute('size')).toBe(false);

    element.size = 'sm';
    await elementIsStable(element);
    expect(element.getAttribute('size')).toBe('sm');
  });

  it('should show close button if closable', async () => {
    expect(element.shadowRoot.querySelector(IconButton.metadata.tag)).toBe(null);
    element.closable = true;
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector<IconButton>(IconButton.metadata.tag)).toBeDefined();
    expect(element.shadowRoot.querySelector<IconButton>(IconButton.metadata.tag).iconName).toBe('cancel');
  });

  it('should show expand button if expandable', async () => {
    expect(element.shadowRoot.querySelector(IconButton.metadata.tag)).toBe(null);
    element.expandable = true;
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector<IconButton>(IconButton.metadata.tag)).toBeDefined();
    expect(element.shadowRoot.querySelector<IconButton>(IconButton.metadata.tag).iconName).toBe('double-chevron');
  });

  it('should change the expand icon direction left when panel assigned to the left slot', async () => {
    element.expandable = true;
    element.slot = 'left';
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector<IconButton>(IconButton.metadata.tag)).toBeDefined();
    expect(element.shadowRoot.querySelector<IconButton>(IconButton.metadata.tag).iconName).toBe('double-chevron');
    expect(element.shadowRoot.querySelector<IconButton>(IconButton.metadata.tag).direction).toBe('left');
  });

  it('should change the expand icon direction right when panel assigned to the right slot', async () => {
    element.expandable = true;
    element.slot = 'right';
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector<IconButton>(IconButton.metadata.tag)).toBeDefined();
    expect(element.shadowRoot.querySelector<IconButton>(IconButton.metadata.tag).iconName).toBe('double-chevron');
    expect(element.shadowRoot.querySelector<IconButton>(IconButton.metadata.tag).direction).toBe('right');
  });

  it('should change the expand icon direction down when panel assigned to the bottom slot', async () => {
    element.expandable = true;
    element.slot = 'bottom';
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector<IconButton>(IconButton.metadata.tag)).toBeDefined();
    expect(element.shadowRoot.querySelector<IconButton>(IconButton.metadata.tag).iconName).toBe('double-chevron');
    expect(element.shadowRoot.querySelector<IconButton>(IconButton.metadata.tag).direction).toBe('down');
  });

  it('should emit close event when close button clicked', async () => {
    element.closable = true;
    await elementIsStable(element);
    const event = untilEvent(element, 'close');
    element.shadowRoot.querySelector<IconButton>(IconButton.metadata.tag).click();
    expect(await event).toBeDefined();
  });

  it('should emit close event when expandable button clicked', async () => {
    element.expandable = true;
    await elementIsStable(element);
    const event = untilEvent(element, 'close');
    element.shadowRoot.querySelector<IconButton>(IconButton.metadata.tag).click();
    expect(await event).toBeDefined();
  });
});
