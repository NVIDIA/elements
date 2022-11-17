import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@elements/elements/test';
import { Dropdown } from '@elements/elements/dropdown';
import '@elements/elements/dropdown/define.js';

describe('nve-dropdown', () => {
  let fixture: HTMLElement;
  let element: Dropdown;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-dropdown>hello</nve-dropdown>
    `);
    element = fixture.querySelector('nve-dropdown');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get('nve-dropdown')).toBeDefined();
  });

  it('should render close button when closable', async () => {
    expect(element.shadowRoot.querySelector('nve-icon-button')).toBe(null);
    element.closable = true;
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector('nve-icon-button').tagName).toBe('MLV-ICON-BUTTON');
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
});
