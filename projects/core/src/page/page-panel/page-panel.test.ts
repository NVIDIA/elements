// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable, untilEvent } from '@internals/testing';
import { PagePanel } from '@nvidia-elements/core/page';
import '@nvidia-elements/core/page/define.js';

describe(PagePanel.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: PagePanel;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-page>
        <nve-page-panel>hello</nve-page-panel>
      </nve-page>
    `);
    element = fixture.querySelector(PagePanel.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get(PagePanel.metadata.tag)).toBeDefined();
  });

  it('should have an aria role "region"', async () => {
    expect(element._internals.role).toBe('region');
  });

  it('should provide a default content slot', async () => {
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector('slot:not([name])')).toBeTruthy();
  });

  it('should provide a header slot', async () => {
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector('slot[name=header]')).toBeTruthy();
  });

  it('should provide a footer slot', async () => {
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector('slot[name=footer]')).toBeTruthy();
  });

  it('should reflect size attribute', async () => {
    expect(element.size).toBe(undefined);
    expect(element.hasAttribute('size')).toBe(false);

    element.size = 'sm';
    await elementIsStable(element);
    expect(element.getAttribute('size')).toBe('sm');
  });

  it('should provide an actions slot', async () => {
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector('slot[name=actions]')).toBeTruthy();
  });

  it('should not render an internal action button', async () => {
    element.setAttribute('closable', '');
    element.setAttribute('expandable', '');
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector('nve-icon-button')).toBe(null);
  });

  it('should emit close event when close command is received', async () => {
    const event = untilEvent(element, 'close');
    element.dispatchEvent(new CommandEvent('command', { command: '--close' }));
    expect(await event).toBeDefined();
  });

  it('should toggle hidden state when command is received', async () => {
    element.hidden = true;
    element.dispatchEvent(new CommandEvent('command', { command: '--open' }));
    await elementIsStable(element);
    expect(element.hidden).toBe(false);

    element.dispatchEvent(new CommandEvent('command', { command: '--toggle' }));
    await elementIsStable(element);
    expect(element.hidden).toBe(true);
  });

  it.each(['left', 'right', 'bottom'])('should remove closed panels from the %s slot after sliding', async slot => {
    removeFixture(fixture);
    fixture = await createFixture(html`
      <nve-page>
        <nve-page-panel slot="left" style="--animation-duration: 40ms;">first</nve-page-panel>
        <nve-page-panel slot="left" style="--animation-duration: 40ms;" hidden>second</nve-page-panel>
        <main>main</main>
      </nve-page>
    `);
    const panels = [...fixture.querySelectorAll('nve-page-panel')];
    for (const panel of panels) {
      panel.slot = slot;
      await elementIsStable(panel);
    }
    const [first, second] = panels;
    expect(first.getAnimations()).toHaveLength(0);
    expect(second.getClientRects()).toHaveLength(0);
    await expect.poll(() => first.getAnimations().length).toBe(0);

    for (const [opening, closing] of [
      [second, first],
      [first, second]
    ]) {
      opening.dispatchEvent(new CommandEvent('command', { command: '--open' }));
      closing.dispatchEvent(new CommandEvent('command', { command: '--close' }));
      expect(closing.hidden).toBe(true);
      expect(opening.getAnimations().length).toBeGreaterThan(0);
      const animations = closing.getAnimations();
      expect(animations.length).toBeGreaterThan(0);
      expect(closing.getClientRects()).toHaveLength(1);
      await expect.poll(() => opening.getAnimations().length + closing.getAnimations().length).toBe(0);
      expect(closing.getClientRects()).toHaveLength(0);
      expect(opening.getClientRects()).toHaveLength(1);
    }

    first.dispatchEvent(new CommandEvent('command', { command: '--close' }));
    first.getBoundingClientRect();
    first.dispatchEvent(new CommandEvent('command', { command: '--open' }));
    await expect.poll(() => first.getAnimations().length).toBe(0);
    expect(first.hidden).toBe(false);
    expect(first.getClientRects()).toHaveLength(1);
    expect(second.getClientRects()).toHaveLength(0);

    first.style.setProperty('--animation-duration', '0ms');
    first.dispatchEvent(new CommandEvent('command', { command: '--close' }));
    expect(first.getClientRects()).toHaveLength(0);
    first.dispatchEvent(new CommandEvent('command', { command: '--open' }));
    expect(first.getClientRects()).toHaveLength(1);
  });
});
