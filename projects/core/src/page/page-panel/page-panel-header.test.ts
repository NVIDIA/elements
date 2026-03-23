import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@internals/testing';
import { PagePanelHeader } from '@nvidia-elements/core/page';
import '@nvidia-elements/core/page/define.js';

describe(PagePanelHeader.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: PagePanelHeader;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-page>
        <nve-page-panel>
          <nve-page-panel-header>hello</nve-page-panel-header>
        </nve-page-panel>
      </nve-page>
    `);
    element = fixture.querySelector(PagePanelHeader.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get(PagePanelHeader.metadata.tag)).toBeDefined();
  });

  it('should render with the header default slot', async () => {
    await elementIsStable(element);
    expect(element.slot).toBe('header');
  });
});
