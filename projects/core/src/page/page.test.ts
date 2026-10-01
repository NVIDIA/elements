// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { Page } from '@nvidia-elements/core/page';
import '@nvidia-elements/core/page/define.js';
import '@nvidia-elements/core/resize-handle/define.js';

describe(Page.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: Page;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-page>
        <div slot="header">header</div>
        <div slot="subheader">subheader</div>
        <div slot="left-aside">left-aside</div>
        <div slot="left">left</div>
        <main>main</main>
        <div slot="bottom">bottom</div>
        <div slot="right">right</div>
        <div slot="right-aside">right-aside</div>
        <div slot="subfooter">subfooter</div>
        <div slot="footer">footer</div>
      </nve-page>
    `);
    element = fixture.querySelector(Page.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get(Page.metadata.tag)).toBeDefined();
  });

  it('should provide a default content slot', async () => {
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector('slot:not([name])')).toBeTruthy();
  });

  it('should provide a header slot', async () => {
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector('slot[name=header]')).toBeTruthy();
  });

  it('should provide a subheader slot', async () => {
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector('slot[name=subheader]')).toBeTruthy();
  });

  it('should provide a left-aside slot', async () => {
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector('slot[name=left-aside]')).toBeTruthy();
  });

  it('should provide a left slot', async () => {
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector('slot[name=left]')).toBeTruthy();
  });

  it('should provide a bottom slot', async () => {
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector('slot[name=bottom]')).toBeTruthy();
  });

  it('should provide a right slot', async () => {
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector('slot[name=right]')).toBeTruthy();
  });

  it('should provide a right-aside slot', async () => {
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector('slot[name=right-aside]')).toBeTruthy();
  });

  it('should provide a subfooter slot', async () => {
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector('slot[name=subfooter]')).toBeTruthy();
  });

  it('should provide a footer slot', async () => {
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector('slot[name=footer]')).toBeTruthy();
  });

  it('should reflect a document-scroll', async () => {
    expect(element.documentScroll).toBe(false);
    expect(element.hasAttribute('document-scroll')).toBe(false);

    element.documentScroll = true;
    await elementIsStable(element);
    expect(element.hasAttribute('document-scroll')).toBe(true);
  });

  it('should paint both panel borders above positioned main content', async () => {
    removeFixture(fixture);
    fixture = await createFixture(html`
      <nve-page document-scroll>
        <nve-page-panel slot="left" style="width: 200px;"></nve-page-panel>
        <nve-resize-handle slot="left" orientation="vertical" aria-label="Resize left panel"></nve-resize-handle>
        <main style="height: 300px;">
          <div id="surface" style="position: relative; height: 100%; background: var(--nve-sys-layer-container-background);"></div>
        </main>
        <nve-resize-handle slot="right" orientation="vertical" aria-label="Resize right panel"></nve-resize-handle>
        <nve-page-panel slot="right" style="width: 200px;"></nve-page-panel>
      </nve-page>
    `);
    element = fixture.querySelector('nve-page');
    await elementIsStable(element);

    const surface = fixture.querySelector('#surface');
    for (const panel of fixture.querySelectorAll('nve-page-panel')) {
      await elementIsStable(panel);
      await expect.poll(() => panel.getAnimations().length).toBe(0);
      const bounds = panel.getBoundingClientRect();
      const x = panel.slot === 'left' ? bounds.right - 0.5 : bounds.left + 0.5;
      for (const y of [bounds.top + 1, bounds.top + bounds.height / 2, bounds.bottom - 1]) {
        const painted = document.elementsFromPoint(x, y);
        expect(painted).toContain(panel);
        expect(painted).toContain(surface);
        expect(painted.indexOf(panel)).toBeLessThan(painted.indexOf(surface));
      }
    }
  });
});
