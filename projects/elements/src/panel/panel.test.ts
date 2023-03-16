import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@elements/elements/test';
import { Panel, PanelHeader, PanelFooter } from '@elements/elements/panel';
import '@elements/elements/panel/define.js';

describe('mlv-panel', () => {
  let fixture: HTMLElement;
  let panel: Panel;
  let panelHeader: PanelHeader;
  let panelFooter: PanelFooter;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <mlv-panel>
        <mlv-panel-footer></mlv-panel-footer>
        <p>content</p>
        <mlv-panel-header>
          <h3 slot="subtitle">subtitle</h3>
          <h2 slot="title">title</h2>
        </mlv-panel-header>
      </mlv-panel>
    `);
    panel = fixture.querySelector('mlv-panel');
    panelHeader = fixture.querySelector('mlv-panel-header');
    panelFooter = fixture.querySelector('mlv-panel-footer');
    await elementIsStable(panel);
    await elementIsStable(panelHeader);
    await elementIsStable(panelFooter);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define elements', () => {
    expect(customElements.get('mlv-panel')).toBeDefined();
    expect(customElements.get('mlv-panel-header')).toBeDefined();
    expect(customElements.get('mlv-panel-footer')).toBeDefined();
  });

  it('should have the mlv-panel-header self define the header slot', async () => {
    await elementIsStable(panelHeader);
    expect(panelHeader.slot).toBe('header');
  });

  it('should have the mlv-panel-footer self define the footer slot', async () => {
    await elementIsStable(panelFooter);
    expect(panelFooter.slot).toBe('footer');
  });
});
