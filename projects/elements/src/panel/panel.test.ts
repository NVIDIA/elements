import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@elements/elements/test';
import { Panel, PanelHeader, PanelFooter } from '@elements/elements/panel';
import { getFlatDOMTree } from '@elements/elements/internal';
import '@elements/elements/panel/define.js';

describe('nve-panel', () => {
  let fixture: HTMLElement;
  let panel: Panel;
  let panelHeader: PanelHeader;
  let panelFooter: PanelFooter;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-panel>
        <nve-panel-footer></nve-panel-footer>
        <p>content</p>
        <nve-panel-header>
          <h3 slot="subtitle">subtitle</h3>
          <h2 slot="title">title</h2>
        </nve-panel-header>
      </nve-panel>
    `);
    panel = fixture.querySelector('nve-panel');
    panelHeader = fixture.querySelector('nve-panel-header');
    panelFooter = fixture.querySelector('nve-panel-footer');
    await elementIsStable(panel);
    await elementIsStable(panelHeader);
    await elementIsStable(panelFooter);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define elements', () => {
    expect(customElements.get('nve-panel')).toBeDefined();
    expect(customElements.get('nve-panel-header')).toBeDefined();
    expect(customElements.get('nve-panel-footer')).toBeDefined();
  });

  it('should have the nve-panel-header self define the header slot', async () => {
    await elementIsStable(panelHeader);
    expect(panelHeader.slot).toBe('header');
  });

  it('should have the nve-panel-footer self define the footer slot', async () => {
    await elementIsStable(panelFooter);
    expect(panelFooter.slot).toBe('footer');
  });
});
