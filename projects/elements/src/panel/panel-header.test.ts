import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@nvidia-elements/testing';
import { PanelHeader } from '@elements/elements/panel';
import '@elements/elements/panel/define.js';

describe('mlv-panel-header', () => {
  let fixture: HTMLElement;
  let element: PanelHeader;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <mlv-panel>
        <mlv-panel-header>hello</mlv-panel-header>
      </mlv-panel>
    `);
    element = fixture.querySelector('mlv-panel-header');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get('mlv-panel-header')).toBeDefined();
  });

  it('should render with the header default slot', async () => {
    await elementIsStable(element);
    expect(element.slot).toBe('header');
  });
});
