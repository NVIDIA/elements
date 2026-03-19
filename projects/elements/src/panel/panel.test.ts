// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { Panel, PanelHeader, PanelFooter } from '@nvidia-elements/core/panel';
import { IconButton } from '@nvidia-elements/core/icon-button';
import { getFlattenedDOMTree } from '@nvidia-elements/core/internal';
import '@nvidia-elements/core/panel/define.js';
import '@nvidia-elements/core/icon-button/define.js';

describe(Panel.metadata.tag, () => {
  let fixture: HTMLElement;
  let panel: Panel;
  let panelHeader: PanelHeader;
  let panelFooter: PanelFooter;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-panel>
        <nve-panel-footer></nve-panel-footer>
        <p nve-text="body">content</p>
        <nve-panel-header>
          <nve-icon-button container="flat" slot="action-icon" icon-name="more-actions"></nve-icon-button>
          <h3 nve-text="heading" slot="subtitle">subtitle</h3>
          <h2 nve-text="heading" slot="title">title</h2>
        </nve-panel-header>
      </nve-panel>
    `);
    panel = fixture.querySelector(Panel.metadata.tag);
    panelHeader = fixture.querySelector(PanelHeader.metadata.tag);
    panelFooter = fixture.querySelector(PanelFooter.metadata.tag);

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
    expect(customElements.get(Panel.metadata.tag)).toBeDefined();
    expect(customElements.get(PanelHeader.metadata.tag)).toBeDefined();
    expect(customElements.get(PanelFooter.metadata.tag)).toBeDefined();
    expect(customElements.get(IconButton.metadata.tag)).toBeDefined();
  });

  it('should have card preserve the heading/content/footer DOM order via slots', async () => {
    await elementIsStable(panel);
    await elementIsStable(panelHeader);
    await elementIsStable(panelFooter);

    const [header, footer] = getFlattenedDOMTree(panel).filter(e =>
      e.tagName.toLocaleLowerCase().includes(Panel.metadata.tag)
    );
    expect(header).toBe(panelHeader);
    expect(footer).toBe(panelFooter);
  });

  it('should have panel header preserve the title/subtitle/action DOM order via slots', async () => {
    await elementIsStable(panelHeader);

    const [titleElement, subtitleElement, actionElement] = getFlattenedDOMTree(panelHeader).filter(e =>
      e.hasAttribute('slot')
    );
    expect(titleElement).toBe(panelHeader.querySelector('[slot="title"'));
    expect(subtitleElement).toBe(panelHeader.querySelector('[slot="subtitle"'));
    expect(actionElement).toBe(panelHeader.querySelector('[slot="action-icon"'));
  });

  it('should replace collapse icon with cancel icon when closable', async () => {
    await elementIsStable(panel);
    expect(panel.shadowRoot.querySelector(IconButton.metadata.tag).tagName.toLocaleLowerCase()).toBe(
      IconButton.metadata.tag
    );
    expect(panel.shadowRoot.querySelector(IconButton.metadata.tag).getAttribute('direction')).toBe('left');
    expect(panel.shadowRoot.querySelector(IconButton.metadata.tag).ariaLabel).toBe('close');

    panel.closable = true;
    await elementIsStable(panel);
    expect(panel.shadowRoot.querySelector(IconButton.metadata.tag).getAttribute('icon-name')).toBe('cancel');
    expect(panel.shadowRoot.querySelector(IconButton.metadata.tag).ariaLabel).toBe('hide');
  });

  it('should replace collapse icon with expand icon when collapsed, and update aria attributes', async () => {
    await elementIsStable(panel);
    expect(panel.shadowRoot.querySelector(IconButton.metadata.tag).tagName.toLocaleLowerCase()).toBe(
      IconButton.metadata.tag
    );
    expect(panel.shadowRoot.querySelector(IconButton.metadata.tag).getAttribute('direction')).toBe('left');
    expect(panel.shadowRoot.querySelector(IconButton.metadata.tag).ariaLabel).toBe('close');
    expect(panel._internals.ariaExpanded).toBe('true');
    expect(panel.matches(':state(expanded)')).toBe(true);

    panel.expanded = false;

    await elementIsStable(panel);
    expect(panel.shadowRoot.querySelector(IconButton.metadata.tag).getAttribute('direction')).toBe('right');
    expect(panel.shadowRoot.querySelector(IconButton.metadata.tag).ariaLabel).toBe('expand');
    expect(panel._internals.ariaExpanded).toBe('false');
    expect(panel.matches(':state(expanded)')).toBe(false);
  });

  it('should flip collapse icon direction when panel side set to "right" mode', async () => {
    await elementIsStable(panel);
    expect(panel.shadowRoot.querySelector(IconButton.metadata.tag).tagName.toLocaleLowerCase()).toBe(
      IconButton.metadata.tag
    );
    expect(panel.shadowRoot.querySelector(IconButton.metadata.tag).getAttribute('icon-name')).toBe('double-chevron');
    expect(panel.shadowRoot.querySelector(IconButton.metadata.tag).getAttribute('direction')).toBe('left');

    panel.setAttribute('side', 'right');
    await elementIsStable(panel);
    expect(panel.shadowRoot.querySelector(IconButton.metadata.tag).getAttribute('icon-name')).toBe('double-chevron');
    expect(panel.shadowRoot.querySelector(IconButton.metadata.tag).getAttribute('direction')).toBe('right');
  });

  it('should collapse left side panel when icon button clicked', async () => {
    await elementIsStable(panel);
    expect(panel.shadowRoot.querySelector(IconButton.metadata.tag).tagName.toLocaleLowerCase()).toBe(
      IconButton.metadata.tag
    );
    expect(panel.shadowRoot.querySelector(IconButton.metadata.tag).getAttribute('icon-name')).toBe('double-chevron');
    expect(panel.shadowRoot.querySelector(IconButton.metadata.tag).getAttribute('direction')).toBe('left');
    expect(panel.shadowRoot.querySelector(IconButton.metadata.tag).ariaLabel).toBe('close');
    expect(panel._internals.ariaExpanded).toBe('true');
    expect(panel.matches(':state(expanded)')).toBe(true);

    panel.shadowRoot.querySelector<IconButton>(IconButton.metadata.tag).click();

    await elementIsStable(panel);
    expect(panel.shadowRoot.querySelector(IconButton.metadata.tag).getAttribute('icon-name')).toBe('double-chevron');
    expect(panel.shadowRoot.querySelector(IconButton.metadata.tag).getAttribute('direction')).toBe('right');
    expect(panel.shadowRoot.querySelector(IconButton.metadata.tag).ariaLabel).toBe('expand');
    expect(panel._internals.ariaExpanded).toBe('false');
    expect(panel.matches(':state(expanded)')).toBe(false);
  });

  it('should collapse right side panel when icon button clicked', async () => {
    panel.side = 'right';
    await elementIsStable(panel);
    expect(panel.shadowRoot.querySelector(IconButton.metadata.tag).tagName.toLocaleLowerCase()).toBe(
      IconButton.metadata.tag
    );
    expect(panel.shadowRoot.querySelector(IconButton.metadata.tag).getAttribute('icon-name')).toBe('double-chevron');
    expect(panel.shadowRoot.querySelector(IconButton.metadata.tag).getAttribute('direction')).toBe('right');
    expect(panel.shadowRoot.querySelector(IconButton.metadata.tag).ariaLabel).toBe('close');
    expect(panel._internals.ariaExpanded).toBe('true');
    expect(panel.matches(':state(expanded)')).toBe(true);

    panel.shadowRoot.querySelector<IconButton>(IconButton.metadata.tag).click();

    await elementIsStable(panel);
    expect(panel.shadowRoot.querySelector(IconButton.metadata.tag).getAttribute('icon-name')).toBe('double-chevron');
    expect(panel.shadowRoot.querySelector(IconButton.metadata.tag).getAttribute('direction')).toBe('left');
    expect(panel.shadowRoot.querySelector(IconButton.metadata.tag).ariaLabel).toBe('expand');
    expect(panel._internals.ariaExpanded).toBe('false');
    expect(panel.matches(':state(expanded)')).toBe(false);
  });
});
