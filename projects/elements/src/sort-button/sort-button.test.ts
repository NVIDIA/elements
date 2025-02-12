import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture, emulateClick, untilEvent } from '@nvidia-elements/testing';
import { SortButton } from '@nvidia-elements/core/sort-button';
import { Icon } from '@nvidia-elements/core/icon';
import '@nvidia-elements/core/sort-button/define.js';

describe(SortButton.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: SortButton;
  let icon: Icon;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-sort-button></nve-sort-button>
    `);
    element = fixture.querySelector(SortButton.metadata.tag);
    icon = element.shadowRoot.querySelector(Icon.metadata.tag);
    await elementIsStable(element);
    await elementIsStable(icon);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get(SortButton.metadata.tag)).toBeDefined();
  });

  it('should initialize role spinbutton', async () => {
    await elementIsStable(element);
    expect(element._internals.role).toBe('spinbutton');
  });

  it('should have a type default of button', async () => {
    await elementIsStable(element);
    expect(element.type).toBe('button');
  });

  it('should use aria-hidden for decorative non-semantic icons', async () => {
    await elementIsStable(element);
    expect(icon.getAttribute('aria-hidden')).toBe('true');
  });

  it('should show ascending icon by default', async () => {
    await elementIsStable(element);
    expect(icon.name).toBe('sort-ascending');
  });

  it('should show ascending icon when sort is set to ascending', async () => {
    element.sort = 'ascending';
    await elementIsStable(element);
    expect(icon.name).toBe('sort-ascending');
  });

  it('should show descending icon when sort is set to descending', async () => {
    element.sort = 'descending';
    await elementIsStable(element);
    await elementIsStable(icon);
    expect(icon.name).toBe('sort-descending');
  });

  it('should dispatch a sort event containing current and next sort values when clicked', async () => {
    const event = untilEvent(element, 'sort');
    emulateClick(element);
    const detail = ((await event) as CustomEvent).detail;
    expect(detail.value).toBe('none');
    expect(detail.next).toBe('ascending');
    expect(element._internals.ariaLabel).toBe('sort ascending');

    element.sort = 'ascending';
    const eventTwo = untilEvent(element, 'sort');
    emulateClick(element);
    const detailTwo = ((await eventTwo) as CustomEvent).detail;
    expect(detailTwo.value).toBe('ascending');
    expect(detailTwo.next).toBe('descending');
    expect(element._internals.ariaLabel).toBe('sort descending');

    element.sort = 'descending';
    const eventThree = untilEvent(element, 'sort');
    emulateClick(element);
    const detailThree = ((await eventThree) as CustomEvent).detail;
    expect(detailThree.value).toBe('descending');
    expect(detailThree.next).toBe('none');
    expect(element._internals.ariaLabel).toBe('sort none');
  });
});
