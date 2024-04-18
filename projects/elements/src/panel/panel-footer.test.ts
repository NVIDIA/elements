import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@nvidia-elements/testing';
import { PanelFooter } from '@nvidia-elements/core/panel';
import '@nvidia-elements/core/panel/define.js';

describe(PanelFooter.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: PanelFooter;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <mlv-panel>
        <mlv-panel-footer>hello</mlv-panel-footer>
      </mlv-panel>
    `);
    element = fixture.querySelector(PanelFooter.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get(PanelFooter.metadata.tag)).toBeDefined();
  });

  it('should render with the footer default slot', async () => {
    await elementIsStable(element);
    expect(element.slot).toBe('footer');
  });
});
