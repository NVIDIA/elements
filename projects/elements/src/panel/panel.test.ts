import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@nvidia-elements/testing';
import { Panel, PanelHeader, PanelFooter } from '@elements/elements/panel';
import '@elements/elements/panel/define.js';
import '@elements/elements/icon-button/define.js';
import { getFlatDOMTree } from '@elements/elements/internal';

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
          <mlv-icon-button container="flat" slot="action-icon" icon-name="more-actions"></mlv-icon-button>
          <h3 slot="subtitle">subtitle</h3>
          <h2 slot="title">title</h2>
        </mlv-panel-header>
      </mlv-panel>
    `);
    panel = fixture.querySelector('mlv-panel');
    panelHeader = fixture.querySelector('mlv-panel-header');
    panelFooter = fixture.querySelector('mlv-panel-footer');

    panel.expanded = true;
    panel.behaviorExpand = true;

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
    expect(customElements.get('mlv-icon-button')).toBeDefined();
  });

  it('should have card preserve the heading/content/footer DOM order via slots', async () => {
    await elementIsStable(panel);
    await elementIsStable(panelHeader);
    await elementIsStable(panelFooter);

    const [header, footer] = getFlatDOMTree(panel).filter(e => e.tagName.includes('MLV-PANEL'));
    expect(header).toBe(panelHeader);
    expect(footer).toBe(panelFooter);
  });

  it('should have panel header preserve the title/subtitle/action DOM order via slots', async () => {
    await elementIsStable(panelHeader);

    const [titleElement, subtitleElement, actionElement] = getFlatDOMTree(panelHeader).filter(e =>
      e.hasAttribute('slot')
    );
    expect(titleElement).toBe(panelHeader.querySelector('[slot="title"'));
    expect(subtitleElement).toBe(panelHeader.querySelector('[slot="subtitle"'));
    expect(actionElement).toBe(panelHeader.querySelector('[slot="action-icon"'));
  });

  it('should replace collapse icon with cancel icon when closable', async () => {
    await elementIsStable(panel);
    expect(panel.shadowRoot.querySelector('mlv-icon-button').tagName).toBe('MLV-ICON-BUTTON');
    expect(panel.shadowRoot.querySelector('mlv-icon-button').getAttribute('direction')).toBe('left');
    expect(panel.shadowRoot.querySelector('mlv-icon-button').ariaLabel).toBe('close');

    panel.closable = true;
    await elementIsStable(panel);
    expect(panel.shadowRoot.querySelector('mlv-icon-button').getAttribute('icon-name')).toBe('cancel');
    expect(panel.shadowRoot.querySelector('mlv-icon-button').ariaLabel).toBe('hide');
  });

  it('should replace collapse icon with expand icon when collapsed, and update aria attributes', async () => {
    await elementIsStable(panel);
    expect(panel.shadowRoot.querySelector('mlv-icon-button').tagName).toBe('MLV-ICON-BUTTON');
    expect(panel.shadowRoot.querySelector('mlv-icon-button').getAttribute('direction')).toBe('left');
    expect(panel.shadowRoot.querySelector('mlv-icon-button').ariaLabel).toBe('close');
    expect(panel._internals.ariaExpanded).toBe('true');
    expect(panel.matches(':--expanded')).toBe(true);

    panel.expanded = false;

    await elementIsStable(panel);
    expect(panel.shadowRoot.querySelector('mlv-icon-button').getAttribute('direction')).toBe('right');
    expect(panel.shadowRoot.querySelector('mlv-icon-button').ariaLabel).toBe('expand');
    expect(panel._internals.ariaExpanded).toBe('false');
    expect(panel.matches(':--expanded')).toBe(false);
  });

  it('should flip collapse icon direction when panel side set to "right" mode', async () => {
    await elementIsStable(panel);
    expect(panel.shadowRoot.querySelector('mlv-icon-button').tagName).toBe('MLV-ICON-BUTTON');
    expect(panel.shadowRoot.querySelector('mlv-icon-button').getAttribute('icon-name')).toBe('double-chevron');
    expect(panel.shadowRoot.querySelector('mlv-icon-button').getAttribute('direction')).toBe('left');

    panel.setAttribute('side', 'right');
    await elementIsStable(panel);
    expect(panel.shadowRoot.querySelector('mlv-icon-button').getAttribute('icon-name')).toBe('double-chevron');
    expect(panel.shadowRoot.querySelector('mlv-icon-button').getAttribute('direction')).toBe('right');
  });

  it('should collapse left side panel when icon button clicked', async () => {
    await elementIsStable(panel);
    expect(panel.shadowRoot.querySelector('mlv-icon-button').tagName).toBe('MLV-ICON-BUTTON');
    expect(panel.shadowRoot.querySelector('mlv-icon-button').getAttribute('icon-name')).toBe('double-chevron');
    expect(panel.shadowRoot.querySelector('mlv-icon-button').getAttribute('direction')).toBe('left');
    expect(panel.shadowRoot.querySelector('mlv-icon-button').ariaLabel).toBe('close');
    expect(panel._internals.ariaExpanded).toBe('true');
    expect(panel.matches(':--expanded')).toBe(true);

    panel.shadowRoot.querySelector('mlv-icon-button').click();

    await elementIsStable(panel);
    expect(panel.shadowRoot.querySelector('mlv-icon-button').getAttribute('icon-name')).toBe('double-chevron');
    expect(panel.shadowRoot.querySelector('mlv-icon-button').getAttribute('direction')).toBe('right');
    expect(panel.shadowRoot.querySelector('mlv-icon-button').ariaLabel).toBe('expand');
    expect(panel._internals.ariaExpanded).toBe('false');
    expect(panel.matches(':--expanded')).toBe(false);
  });

  it('should collapse right side panel when icon button clicked', async () => {
    panel.side = 'right';
    await elementIsStable(panel);
    expect(panel.shadowRoot.querySelector('mlv-icon-button').tagName).toBe('MLV-ICON-BUTTON');
    expect(panel.shadowRoot.querySelector('mlv-icon-button').getAttribute('icon-name')).toBe('double-chevron');
    expect(panel.shadowRoot.querySelector('mlv-icon-button').getAttribute('direction')).toBe('right');
    expect(panel.shadowRoot.querySelector('mlv-icon-button').ariaLabel).toBe('close');
    expect(panel._internals.ariaExpanded).toBe('true');
    expect(panel.matches(':--expanded')).toBe(true);

    panel.shadowRoot.querySelector('mlv-icon-button').click();

    await elementIsStable(panel);
    expect(panel.shadowRoot.querySelector('mlv-icon-button').getAttribute('icon-name')).toBe('double-chevron');
    expect(panel.shadowRoot.querySelector('mlv-icon-button').getAttribute('direction')).toBe('left');
    expect(panel.shadowRoot.querySelector('mlv-icon-button').ariaLabel).toBe('expand');
    expect(panel._internals.ariaExpanded).toBe('false');
    expect(panel.matches(':--expanded')).toBe(false);
  });
});
