import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@nvidia-elements/testing';
import { DropdownFooter } from '@nvidia-elements/core/dropdown';
import '@nvidia-elements/core/dropdown/define.js';

describe(DropdownFooter.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: DropdownFooter;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <mlv-dropdown>
        <mlv-dropdown-footer>hello</mlv-dropdown-footer>
      </mlv-dropdown>
    `);
    element = fixture.querySelector(DropdownFooter.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get(DropdownFooter.metadata.tag)).toBeDefined();
  });

  it('should render with the footer default slot', async () => {
    await elementIsStable(element);
    expect(element.slot).toBe('footer');
  });
});
