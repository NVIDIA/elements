import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@nvidia-elements/testing';
import { PanelFooter } from '@elements/elements/panel';
import '@elements/elements/panel/define.js';

describe('mlv-panel-footer', () => {
  let fixture: HTMLElement;
  let element: PanelFooter;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <mlv-panel>
        <mlv-panel-footer>hello</mlv-panel-footer>
      </mlv-panel>
    `);
    element = fixture.querySelector('mlv-panel-footer');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get('mlv-panel-footer')).toBeDefined();
  });

  it('should render with the footer default slot', async () => {
    await elementIsStable(element);
    expect(element.slot).toBe('footer');
  });
});
