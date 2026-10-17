// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import type { Workspace } from './workspace.js';
import type { WorkspacePanel } from './workspace-panel.js';
import type { WorkspacePanelHeader } from './workspace-panel-header.js';
import './define.js';

const arrangement = JSON.stringify({
  version: 1,
  closed: [],
  root: {
    type: 'split',
    axis: 'horizontal',
    weights: [1, 1],
    children: [
      { type: 'group', panels: ['a', 'companion'], active: 'a' },
      { type: 'group', panels: ['b'], active: 'b' }
    ]
  }
});

describe('workspace panel composition', () => {
  let fixture: HTMLElement;

  afterEach(() => {
    removeFixture(fixture);
    vi.restoreAllMocks();
  });

  async function setup() {
    fixture = await createFixture(html`<nve-workspace style="width:700px;height:300px" .value=${arrangement}>
      <nve-workspace-panel id="a"><nve-workspace-panel-header><span slot="prefix">★</span>Alpha<button slot="suffix">Alpha action</button></nve-workspace-panel-header><nve-workspace-panel-content><input value="retained"></nve-workspace-panel-content><nve-workspace-panel-footer>Alpha status</nve-workspace-panel-footer></nve-workspace-panel>
      <nve-workspace-panel id="companion"><nve-workspace-panel-header>Companion<button slot="suffix">Companion action</button></nve-workspace-panel-header><nve-workspace-panel-footer>Companion status</nve-workspace-panel-footer></nve-workspace-panel>
      <nve-workspace-panel id="b">Bare content</nve-workspace-panel>
    </nve-workspace>`);
    const workspace = fixture.querySelector<Workspace>('nve-workspace')!;
    await elementIsStable(workspace);
    return workspace;
  }

  it('uses the panel ID as a fallback title and propagates container framing', async () => {
    const workspace = await setup();
    const bare = workspace.querySelector('#b')!;
    expect(workspace.shadowRoot!.querySelector('[data-panel="b"]')!.textContent).toBe('b');
    workspace.container = 'flat';
    await elementIsStable(workspace);
    expect(bare.getAttribute('container')).toBe('flat');
  });

  it('frames the complete selected group and clips chrome against the same configurable radius', async () => {
    const workspace = await setup();
    const panel = workspace.querySelector<HTMLElement>('#a')!;
    const inactive = workspace.querySelector('#companion')!;
    const frame = panel.shadowRoot!.querySelector<HTMLElement>('.frame')!;
    const content = panel.shadowRoot!.querySelector<HTMLElement>('.content')!;
    const chrome = workspace.shadowRoot!.querySelector<HTMLElement>('.group-chrome')!;
    expect(frame.hidden).toBe(false);
    expect(getComputedStyle(frame.parentElement!).overflow).toBe('visible');
    const surface = panel.shadowRoot!.querySelector<HTMLElement>('.surface')!;
    expect(getComputedStyle(surface).overflow).toBe('hidden');
    expect(frame.parentElement).toBe(surface.parentElement);
    expect(inactive.shadowRoot!.querySelector<HTMLElement>('.frame')!.hidden).toBe(true);
    expect(frame.getBoundingClientRect().toJSON()).toEqual(panel.getBoundingClientRect().toJSON());
    expect(chrome.getBoundingClientRect().height).toBe(panel.getBoundingClientRect().height);
    expect(getComputedStyle(content).borderLeftColor).toBe('rgba(0, 0, 0, 0)');
    const saved = workspace.value;
    const input = panel.querySelector('input');
    workspace.style.setProperty('--border-radius', '50%');
    panel.style.setProperty('--border', '3px solid rgb(12, 34, 56)');
    await elementIsStable(workspace);
    expect(getComputedStyle(frame).borderRadius).toBe('50%');
    expect(getComputedStyle(surface).borderRadius).toBe('50%');
    expect(getComputedStyle(chrome).borderRadius).toBe('50%');
    expect(getComputedStyle(frame).borderLeftColor).toBe('rgb(12, 34, 56)');
    expect(getComputedStyle(frame).borderLeftWidth).toBe('3px');
    expect(getComputedStyle(content).borderLeftWidth).toBe('3px');
    expect(panel.querySelector('input')).toBe(input);
    expect(workspace.value).toBe(saved);
  });

  it('keeps flat and full group frames bordered and square despite a configured contained radius', async () => {
    const workspace = await setup();
    workspace.style.setProperty('--border-radius', '40px');
    const panel = workspace.querySelector('#a')!;
    const frame = panel.shadowRoot!.querySelector<HTMLElement>('.frame')!;
    for (const container of ['flat', 'full'] as const) {
      workspace.container = container;
      await elementIsStable(workspace);
      expect(getComputedStyle(frame).borderRadius).toBe('0px');
      expect(getComputedStyle(workspace.shadowRoot!.querySelector('.group-chrome')!).borderRadius).toBe('0px');
      expect(getComputedStyle(frame).borderLeftWidth).toBe('1px');
    }
  });

  it('draws shared frame edges once at zero gap and restores separated borders', async () => {
    const workspace = await setup();
    const extra = document.createElement('nve-workspace-panel');
    extra.id = 'c';
    workspace.append(extra);
    workspace.value = JSON.stringify({
      version: 1,
      closed: [],
      root: {
        type: 'split',
        axis: 'horizontal',
        weights: [1, 1],
        children: [
          { type: 'group', panels: ['a', 'companion'], active: 'a' },
          {
            type: 'split',
            axis: 'vertical',
            weights: [1, 1],
            children: [
              { type: 'group', panels: ['b'], active: 'b' },
              { type: 'group', panels: ['c'], active: 'c' }
            ]
          }
        ]
      }
    });
    await elementIsStable(workspace);
    const left = workspace.querySelector('#a')!.shadowRoot!.querySelector('.frame')!;
    const upper = workspace.querySelector('#b')!.shadowRoot!.querySelector('.frame')!;
    const lower = extra.shadowRoot!.querySelector('.frame')!;
    const saved = workspace.value;

    workspace.style.setProperty('--gap', '0px');
    await vi.waitFor(() => expect(getComputedStyle(left).borderRightWidth).toBe('0px'));
    expect(getComputedStyle(upper).borderBottomWidth).toBe('0px');
    for (const frame of [left, upper, lower]) {
      expect(getComputedStyle(frame).borderLeftWidth).toBe('1px');
      expect(getComputedStyle(frame).borderTopWidth).toBe('1px');
    }
    expect(getComputedStyle(left).borderBottomWidth).toBe('1px');
    expect(getComputedStyle(upper).borderRightWidth).toBe('1px');
    expect(getComputedStyle(lower).borderRightWidth).toBe('1px');
    expect(getComputedStyle(lower).borderBottomWidth).toBe('1px');

    workspace.style.setProperty('--gap', '6px');
    await vi.waitFor(() => expect(getComputedStyle(left).borderRightWidth).toBe('1px'));
    for (const frame of [left, upper, lower]) expect(getComputedStyle(frame).borderWidth).toBe('1px');
    expect(workspace.value).toBe(saved);
  });

  it('projects selected actions separately from title decoration without relocating content', async () => {
    const workspace = await setup();
    const alpha = workspace.querySelector<WorkspacePanelHeader>('#a nve-workspace-panel-header')!;
    const companion = workspace.querySelector<WorkspacePanelHeader>('#companion nve-workspace-panel-header')!;
    const action = alpha.querySelector('button')!;
    expect(alpha.slot).toBe('header');
    expect(workspace.querySelector('#a nve-workspace-panel-footer')!.getAttribute('slot')).toBe('footer');
    expect(alpha.shadowRoot!.querySelector('.suffix')!.getAttribute('aria-hidden')).toBe('false');
    expect(alpha.shadowRoot!.querySelector('.suffix')!.hasAttribute('inert')).toBe(false);
    expect(companion.shadowRoot!.querySelector('.suffix')!.hasAttribute('inert')).toBe(true);
    expect(
      companion.shadowRoot!.querySelector<HTMLElement>('.suffix-content')!.getBoundingClientRect().width
    ).toBeGreaterThan(0);
    expect(alpha.shadowRoot!.querySelector<HTMLElement>('.separator')!.getBoundingClientRect().width).toBe(
      alpha.getBoundingClientRect().width
    );
    expect(companion.shadowRoot!.querySelector('.separator')).toBeNull();
    expect(workspace.shadowRoot!.querySelector('[data-panel="a"]')!.getAttribute('aria-label')).toBe('Alpha');
    workspace.shadowRoot!.querySelector<HTMLElement>('[data-panel="companion"]')!.click();
    await elementIsStable(workspace);
    expect(alpha.shadowRoot!.querySelector('.suffix')!.hasAttribute('inert')).toBe(true);
    expect(companion.shadowRoot!.querySelector('.suffix')!.hasAttribute('inert')).toBe(false);
    expect(action.parentElement).toBe(alpha);
    expect(workspace.querySelector<HTMLInputElement>('#a input')!.value).toBe('retained');
  });

  it('draws one divider before populated header suffixes', async () => {
    const workspace = await setup();
    const alpha = workspace.querySelector<WorkspacePanelHeader>('#a nve-workspace-panel-header')!;
    const suffix = alpha.shadowRoot!.querySelector<HTMLElement>('.suffix-content')!;
    const lastTab = workspace.shadowRoot!.querySelector('[data-panel="companion"]')!.parentElement!;
    expect(getComputedStyle(suffix).borderInlineStartWidth).toBe('1px');
    expect(getComputedStyle(suffix).borderInlineEndWidth).toBe('0px');
    expect(getComputedStyle(lastTab).borderInlineEndWidth).toBe('0px');
    expect(suffix.getBoundingClientRect().height).toBe(lastTab.getBoundingClientRect().height);

    alpha.querySelector('button')!.remove();
    await elementIsStable(workspace);
    await vi.waitFor(() => expect(getComputedStyle(suffix).borderInlineStartWidth).toBe('0px'));
    expect(suffix.getBoundingClientRect().width).toBe(0);
  });

  it('configures prefix and suffix padding independently of the title', async () => {
    const workspace = await setup();
    const header = workspace.querySelector<WorkspacePanelHeader>('#a nve-workspace-panel-header')!;
    const suffix = header.shadowRoot!.querySelector('.suffix-content')!;
    const prefix = header.shadowRoot!.querySelector('slot[name="prefix"]')!;
    const label = header.shadowRoot!.querySelector('.label-content')!;
    expect(getComputedStyle(prefix).paddingInlineStart).toBe('0px');
    expect(getComputedStyle(suffix).paddingInlineStart).toBe('8px');
    expect(getComputedStyle(suffix).paddingInlineEnd).toBe('8px');
    expect(getComputedStyle(label).paddingInlineStart).toBe('16px');

    header.style.setProperty('--prefix-padding', '4px');
    header.style.setProperty('--suffix-padding', '12px 4px');
    expect(getComputedStyle(prefix).paddingInlineStart).toBe('4px');
    expect(getComputedStyle(suffix).paddingInlineStart).toBe('4px');
    expect(getComputedStyle(suffix).paddingInlineEnd).toBe('4px');
    expect(getComputedStyle(label).paddingInlineStart).toBe('16px');
  });

  it('places title prefixes after the group drag handle without moving supplied content', async () => {
    const workspace = await setup();
    workspace.rearrangeable = true;
    await elementIsStable(workspace);
    await vi.waitFor(() => expect(workspace.shadowRoot!.querySelector('[data-drag-group="a"]')).not.toBeNull());
    const header = workspace.querySelector<WorkspacePanelHeader>('#a nve-workspace-panel-header')!;
    const prefix = header.querySelector<HTMLElement>('[slot="prefix"]')!;
    const handle = workspace.shadowRoot!.querySelector<HTMLElement>('[data-drag-group="a"]')!;
    const strip = handle.closest<HTMLElement>('.tabs')!;
    expect(handle.getBoundingClientRect().left).toBe(strip.getBoundingClientRect().left);
    expect(prefix.getBoundingClientRect().left).toBeGreaterThanOrEqual(handle.getBoundingClientRect().right);
    expect(prefix.parentElement).toBe(header);

    prefix.remove();
    await elementIsStable(header);
    const slot = header.shadowRoot!.querySelector('slot[name="prefix"]')!;
    expect(getComputedStyle(slot).display).toBe('none');
  });

  it('uses independently scoped Tabs with one selected keyboard stop per group', async () => {
    const workspace = await setup();
    const groups = [...workspace.shadowRoot!.querySelectorAll('nve-tabs.tab-track')];
    expect(groups).toHaveLength(2);
    for (const tabs of groups) {
      expect(getComputedStyle(tabs).anchorScope).toBe('--selected, --selected-group');
      expect(tabs.querySelectorAll('nve-tabs-item[tabindex="0"]')).toHaveLength(1);
      const item = tabs.querySelector('nve-tabs-item')!;
      expect(item.shadowRoot!.querySelector<HTMLElement>('[internal-host]')!.getBoundingClientRect().height).toBe(
        item.closest('nve-tabs-item-group')!.getBoundingClientRect().height
      );
    }
    const close = workspace.shadowRoot!.querySelector('[data-close]');
    expect(close).toBeNull();
    workspace.closable = true;
    await elementIsStable(workspace);
    const button = workspace.shadowRoot!.querySelector('nve-icon-button[data-close]')!;
    expect(button.getAttribute('container')).toBe('flat');
    const entry = button.closest('nve-tabs-item-group')!;
    expect(button.getAttribute('slot')).toBe('suffix');
    expect(button.closest('nve-tabs')).not.toBeNull();
    expect(button.closest('nve-tabs-item')).toBeNull();
    expect(entry.querySelector('[data-panel="a"]')!.parentElement).toBe(button.parentElement);
  });

  it('updates only the chrome affected by an allocation change', async () => {
    const workspace = await setup();
    const panel = workspace.querySelector<WorkspacePanel>('#a')!;
    const header = panel.querySelector<WorkspacePanelHeader>('nve-workspace-panel-header')!;
    const panelRender = vi.spyOn(panel, 'render');
    const headerRender = vi.spyOn(header, 'render');
    workspace.requestUpdate();
    await elementIsStable(workspace);
    expect(panelRender).not.toHaveBeenCalled();
    expect(headerRender).not.toHaveBeenCalled();
    workspace.style.width = '600px';
    await vi.waitFor(() => expect(headerRender).toHaveBeenCalled());
    await elementIsStable(workspace);
    expect(panelRender).not.toHaveBeenCalled();
  });

  it('configures a replacement header when its panel presentation is unchanged', async () => {
    const workspace = await setup();
    const panel = workspace.querySelector<WorkspacePanel>('#a')!;
    const replacement = document.createElement('nve-workspace-panel-header');
    replacement.textContent = 'Alpha';
    panel.querySelector('nve-workspace-panel-header')!.replaceWith(replacement);
    await elementIsStable(workspace);
    await vi.waitFor(() => expect(replacement.shadowRoot!.querySelector('.suffix')!.hasAttribute('inert')).toBe(false));
    expect(replacement.shadowRoot!.querySelector<HTMLElement>('.label')!.getBoundingClientRect().width).toBeGreaterThan(
      0
    );
    expect(panel.shadowRoot!.querySelector<HTMLElement>('.content')!.hidden).toBe(false);
  });

  it('shares title typography with the actual tab and resolves header minimum height independently', async () => {
    const workspace = await setup();
    const header = workspace.querySelector<WorkspacePanelHeader>('#a nve-workspace-panel-header')!;
    const item = workspace.shadowRoot!.querySelector('[data-panel="a"]')!;
    const label = header.shadowRoot!.querySelector<HTMLElement>('.label-content')!;
    expect(getComputedStyle(label).fontWeight).toBe(
      getComputedStyle(item.shadowRoot!.querySelector('[internal-host]')!).fontWeight
    );
    expect(getComputedStyle(label).color).toBe(
      getComputedStyle(item.shadowRoot!.querySelector('[internal-host]')!).color
    );
    const saved = workspace.value;
    header.style.setProperty('--min-height', '72px');
    await vi.waitFor(() =>
      expect(workspace.shadowRoot!.querySelector<HTMLElement>('.tabs')!.getBoundingClientRect().height).toBe(72)
    );
    expect(header.shadowRoot!.querySelector<HTMLElement>('.suffix')!.getBoundingClientRect().height).toBe(72);
    expect(header.shadowRoot!.querySelector<HTMLElement>('.suffix-content')!.getBoundingClientRect().height).toBe(72);
    expect(workspace.value).toBe(saved);
  });

  it('measures newly supplied footer requirements without changing the arrangement', async () => {
    const workspace = await setup();
    workspace.style.height = '100px';
    await elementIsStable(workspace);
    const panel = workspace.querySelector('#b')!;
    const saved = workspace.value;
    const footer = document.createElement('nve-workspace-panel-footer');
    footer.textContent = 'Added status';
    footer.style.setProperty('--padding', '100px');
    panel.append(footer);
    await vi.waitFor(() => expect(footer.getBoundingClientRect().height).toBeGreaterThan(200));
    await vi.waitFor(() =>
      expect(workspace.shadowRoot!.querySelector<HTMLElement>('.canvas')!.offsetHeight).toBeGreaterThan(200)
    );
    expect(workspace.value).toBe(saved);
  });

  it('scrolls close controls with their tabs through one native scrollport', async () => {
    const workspace = await setup();
    workspace.closable = true;
    workspace.style.width = '240px';
    await elementIsStable(workspace);
    const close = workspace.shadowRoot!.querySelector<HTMLElement>('[data-close="a"]')!;
    const tab = workspace.shadowRoot!.querySelector<HTMLElement>('[data-panel="a"]')!;
    const strip = tab.closest<HTMLElement>('.tablist')!;
    expect(close.closest('.tablist')).toBe(strip);
    expect(close.closest('nve-tabs')).toBe(tab.closest('nve-tabs'));
    expect(close.parentElement).toBe(tab.parentElement);
    expect(close.getBoundingClientRect().right).toBeCloseTo(tab.parentElement!.getBoundingClientRect().right, 0);
    const original = { close: close.getBoundingClientRect().x, tab: tab.getBoundingClientRect().x };
    strip.scrollLeft = 40;
    expect(strip.scrollLeft).toBeGreaterThan(0);
    expect(original.close - close.getBoundingClientRect().x).toBe(strip.scrollLeft);
    expect(original.tab - tab.getBoundingClientRect().x).toBe(strip.scrollLeft);
  });

  it('reveals keyboard selection in the native strip after allocating the selected header', async () => {
    const workspace = await setup();
    workspace.closable = true;
    workspace.style.width = '180px';
    workspace.value = JSON.stringify({
      version: 1,
      closed: [],
      root: { type: 'group', panels: ['a', 'b', 'companion'], active: 'a' }
    });
    await elementIsStable(workspace);
    const strip = workspace.shadowRoot!.querySelector<HTMLElement>('.tablist')!;
    await vi.waitFor(() => expect(strip.scrollWidth).toBeGreaterThan(strip.clientWidth));
    strip.scrollLeft = 0;
    const first = workspace.shadowRoot!.querySelector<HTMLElement>('[data-panel="a"]')!;
    first.focus();
    first.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', code: 'End', bubbles: true, composed: true }));
    await vi.waitFor(() => expect(strip.scrollLeft).toBeGreaterThan(0));
    const selected = workspace.shadowRoot!.querySelector<HTMLElement>('[data-panel="companion"]')!;
    expect(selected.hasAttribute('selected')).toBe(true);
    await Promise.all(
      [...workspace.shadowRoot!.querySelectorAll<HTMLElement>('nve-tabs-item')].map(element => elementIsStable(element))
    );
    expect(workspace.shadowRoot!.activeElement).toBe(selected);
    expect(selected.tabIndex).toBe(0);
    expect(first.tabIndex).toBe(-1);
    expect(workspace.shadowRoot!.querySelectorAll('.tab-track nve-tabs-item[tabindex="0"]')).toHaveLength(1);
  });
});
