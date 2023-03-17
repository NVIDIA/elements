import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@elements/elements/test';
import { PanelHeader } from '@elements/elements/panel';
import '@elements/elements/panel/define.js';

describe('nve-panel-header', () => {
  let fixture: HTMLElement;
  let element: PanelHeader;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-panel>
        <nve-panel-header>hello</nve-panel-header>
      </nve-panel>
    `);
    element = fixture.querySelector('nve-panel-header');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get('nve-panel-header')).toBeDefined();
  });

  it('should render with the header default slot', async () => {
    await elementIsStable(element);
    expect(element.slot).toBe('header');
  });
});
