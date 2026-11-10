// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';

import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import type { Point } from '@nvidia-elements/core/internal';

import { parseWorkspaceValue } from './utils/model/value.utils.js';

import type { WorkspaceLayout } from './utils/model/layout.utils.js';

import type { WorkspacePanelHeader } from './panel-header/panel-header.js';
import type { Workspace } from './workspace.js';

import './define.js';
import '@nvidia-elements/core/ghost/define.js';

describe('workspace header semantics', () => {
  const arrangement = {
    version: 1,
    closed: [],
    root: {
      type: 'split',
      axis: 'horizontal',
      weights: [1, 1],
      children: [
        { type: 'group', panels: ['a', 'b'], active: 'a' },
        { type: 'group', panels: ['c'], active: 'c' }
      ]
    }
  };

  let fixture: HTMLElement;
  let workspace: Workspace;

  beforeEach(async () => {
    fixture =
      await createFixture(html`<nve-workspace closable style="width:600px;height:250px" .value=${JSON.stringify(arrangement)}>
      <nve-workspace-panel id="a"><nve-workspace-panel-header>Alpha<button slot="suffix">Alpha action</button></nve-workspace-panel-header><input value="retained"></nve-workspace-panel>
      <nve-workspace-panel id="b"><nve-workspace-panel-header>Beta</nve-workspace-panel-header>Beta content</nve-workspace-panel>
      <nve-workspace-panel id="c"><nve-workspace-panel-header>Gamma</nve-workspace-panel-header>Gamma content</nve-workspace-panel>
    </nve-workspace>`);
    workspace = fixture.querySelector<Workspace>('nve-workspace')!;
    await elementIsStable(workspace);
  });

  afterEach(() => removeFixture(fixture));

  it('presents a singleton as a named group with a passive title and independent close control', async () => {
    const title = workspace.shadowRoot!.querySelector<HTMLElement>('[data-panel="c"]')!;
    const panel = workspace.querySelector('#c')!;
    expect(title.localName).toBe('div');
    expect(title.hasAttribute('tabindex')).toBe(false);
    expect(title.hasAttribute('role')).toBe(false);
    expect(title.hasAttribute('aria-selected')).toBe(false);
    expect(title.closest('nve-tabs')).toBeNull();
    expect(panel.getAttribute('role')).toBe('group');
    expect(panel.getAttribute('aria-label')).toBe('Gamma');
    expect(panel.ariaLabelledByElements ?? []).toEqual([]);
    const close = workspace.shadowRoot!.querySelector<HTMLElement>('[data-close="c"]')!;
    expect(close.tabIndex).toBe(0);
    expect(close.getAttribute('slot')).toBeNull();
    workspace.groupable = true;
    workspace.rearrangeable = true;
    await elementIsStable(workspace);
    expect(workspace.shadowRoot!.querySelector('[data-panel="c"]')).toBe(title);
    expect(title.closest('nve-tabs')).toBeNull();
  });

  it('keeps pointer clicks on singleton titles passive', async () => {
    workspace.rearrangeable = true;
    await elementIsStable(workspace);
    const value = workspace.value;
    const change = vi.fn();
    workspace.addEventListener('change', change);
    await userEvent.click(workspace.shadowRoot!.querySelector<HTMLElement>('[data-panel="c"]')!);
    await elementIsStable(workspace);
    expect(workspace.querySelector('#c')!.shadowRoot!.activeElement).toBeNull();
    expect(workspace.value).toBe(value);
    expect(change).not.toHaveBeenCalled();
  });

  it('retains real tab relationships for existing groups without grouping or rearrangement permission', async () => {
    const tab = workspace.shadowRoot!.querySelector<HTMLElement>('nve-tabs-item[data-panel="a"]')!;
    const panel = workspace.querySelector('#a')!;
    expect(workspace.groupable).toBe(false);
    expect(workspace.rearrangeable).toBe(false);
    expect(tab.closest('nve-tabs')).not.toBeNull();
    expect(tab.ariaControlsElements).toEqual([panel]);
    expect(panel.getAttribute('role')).toBe('tabpanel');
    expect(panel.getAttribute('aria-label')).toBe('Alpha');
  });

  it('lets Tabs initialize restored selection and its close-control tab order', async () => {
    workspace.value = JSON.stringify({
      ...arrangement,
      root: { type: 'group', panels: ['b', 'a', 'c'], active: 'b' }
    });
    await elementIsStable(workspace);
    const selected = workspace.shadowRoot!.querySelector<HTMLElement>('[data-panel="b"]')!;
    await vi.waitFor(() => {
      expect(selected.tabIndex).toBe(0);
      expect(workspace.shadowRoot!.querySelectorAll('.tab-track nve-tabs-item[tabindex="0"]')).toHaveLength(1);
    });
    selected.focus();

    await userEvent.keyboard('{Tab}');

    expect(workspace.shadowRoot!.activeElement).toBe(workspace.shadowRoot!.querySelector('[data-close="b"]'));
  });

  it('keeps roving focus and its close control independent of programmatic selection', async () => {
    const first = workspace.shadowRoot!.querySelector<HTMLElement>('[data-panel="a"]')!;
    const second = workspace.shadowRoot!.querySelector<HTMLElement>('[data-panel="b"]')!;
    first.focus();
    await userEvent.keyboard('{ArrowRight}');
    await elementIsStable(workspace);
    expect(workspace.shadowRoot!.activeElement).toBe(second);
    workspace.querySelector('#a')!.dispatchEvent(new CommandEvent('command', { command: '--select' }));
    await elementIsStable(workspace);
    expect(first.hasAttribute('selected')).toBe(true);
    expect(first.tabIndex).toBe(-1);
    expect(second.tabIndex).toBe(0);
    expect(workspace.shadowRoot!.activeElement).toBe(second);

    await userEvent.keyboard('{Tab}');

    expect(workspace.shadowRoot!.activeElement).toBe(workspace.shadowRoot!.querySelector('[data-close="b"]'));
    await userEvent.keyboard('{Shift>}{Tab}{/Shift}');
    expect(workspace.shadowRoot!.activeElement).toBe(second);
    await userEvent.keyboard('{ArrowLeft}');
    await elementIsStable(workspace);
    await userEvent.keyboard('{Tab}');
    expect(workspace.shadowRoot!.activeElement).toBe(workspace.shadowRoot!.querySelector('[data-close="a"]'));
  });

  it('moves focus from a surviving tab to its body when an inactive companion closes', async () => {
    const tab = workspace.shadowRoot!.querySelector<HTMLElement>('[data-panel="a"]')!;
    tab.focus();
    workspace.querySelector('#b')!.dispatchEvent(new CommandEvent('command', { command: '--close' }));
    await elementIsStable(workspace);
    const panel = workspace.querySelector('#a')!;
    await vi.waitFor(() => expect(panel.shadowRoot!.activeElement).toBe(panel.shadowRoot!.querySelector('.body')));
    expect(panel.getAttribute('role')).toBe('group');
    expect(panel.ariaLabelledByElements ?? []).toEqual([]);
    expect(workspace.querySelector('#b')!.ariaLabelledByElements ?? []).toEqual([]);
  });

  it('recovers focused tab semantics after silent value restoration leaves one open member', async () => {
    const tab = workspace.shadowRoot!.querySelector<HTMLElement>('[data-panel="a"]')!;
    tab.focus();
    const changed = vi.fn();
    workspace.addEventListener('change', changed);
    workspace.value = JSON.stringify({ ...arrangement, closed: ['b'] });
    await elementIsStable(workspace);
    const panel = workspace.querySelector('#a')!;
    await vi.waitFor(() => expect(panel.shadowRoot!.activeElement).toBe(panel.shadowRoot!.querySelector('.body')));
    expect(panel.getAttribute('role')).toBe('group');
    expect(panel.ariaLabelledByElements ?? []).toEqual([]);
    expect(changed).not.toHaveBeenCalled();
  });

  it('recovers the same panel when a focused group is split into differently ordered singletons', async () => {
    workspace.shadowRoot!.querySelector<HTMLElement>('[data-panel="a"]')!.focus();
    workspace.value = JSON.stringify({
      version: 1,
      closed: [],
      root: {
        type: 'split',
        axis: 'horizontal',
        weights: [1, 1, 1],
        children: ['b', 'a', 'c'].map(id => ({ type: 'group', panels: [id], active: id }))
      }
    });
    await elementIsStable(workspace);
    const panel = workspace.querySelector('#a')!;
    await vi.waitFor(() => expect(panel.shadowRoot!.activeElement).toBe(panel.shadowRoot!.querySelector('.body')));
    expect(workspace.querySelector('#b')!.shadowRoot!.activeElement).toBeNull();
  });

  it('retains close-control focus when its panel changes from tabbed to singleton', async () => {
    workspace.shadowRoot!.querySelector<HTMLElement>('[data-close="a"]')!.focus();
    workspace.value = JSON.stringify({ ...arrangement, closed: ['b'] });
    await elementIsStable(workspace);
    expect(workspace.shadowRoot!.activeElement).toBe(workspace.shadowRoot!.querySelector('[data-close="a"]'));
  });

  it('recovers to surviving content when restoration removes the focused close control', async () => {
    workspace.shadowRoot!.querySelector<HTMLElement>('[data-close="b"]')!.focus();
    workspace.value = JSON.stringify({ ...arrangement, closed: ['b'] });
    await elementIsStable(workspace);
    const panel = workspace.querySelector('#a')!;
    await vi.waitFor(() => expect(panel.shadowRoot!.activeElement).toBe(panel.shadowRoot!.querySelector('.body')));
    expect(workspace.shadowRoot!.activeElement).not.toBe(workspace.shadowRoot!.querySelector('[data-close="a"]'));
  });

  it('preserves focused application content when closing a companion and restoring its group', async () => {
    const input = workspace.querySelector<HTMLInputElement>('#a input')!;
    input.focus();
    workspace.querySelector('#b')!.dispatchEvent(new CommandEvent('command', { command: '--close' }));
    await elementIsStable(workspace);
    expect(document.activeElement).toBe(input);
    workspace.value = JSON.stringify(arrangement);
    await elementIsStable(workspace);
    expect(document.activeElement).toBe(input);
    expect(workspace.querySelector('#a')!.getAttribute('role')).toBe('tabpanel');
  });

  it('preserves focused suffix controls while silently changing group presentation', async () => {
    const action = workspace.querySelector<HTMLButtonElement>('#a button')!;
    action.focus();
    workspace.value = JSON.stringify({ ...arrangement, closed: ['b'] });
    await elementIsStable(workspace);
    expect(document.activeElement).toBe(action);
    workspace.value = JSON.stringify(arrangement);
    await elementIsStable(workspace);
    expect(document.activeElement).toBe(action);
  });

  it('preserves an external invoker focus when closing an inactive companion', async () => {
    const invoker = document.createElement('button');
    invoker.textContent = 'Close Beta';
    fixture.append(invoker);
    invoker.focus();
    workspace.querySelector('#b')!.dispatchEvent(new CommandEvent('command', { command: '--close' }));
    await elementIsStable(workspace);
    expect(document.activeElement).toBe(invoker);
    expect(workspace.querySelector('#a')!.getAttribute('role')).toBe('group');
  });
});

describe('workspace tab overflow and scrolling', () => {
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

  let fixture: HTMLElement;

  afterEach(() => {
    removeFixture(fixture);
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  async function createWorkspace() {
    fixture = await createFixture(html`<nve-workspace style="width:700px;height:300px" .value=${arrangement}>
      <nve-workspace-panel id="a"><nve-workspace-panel-header><span slot="prefix">★</span>Alpha<button slot="suffix">Alpha action</button></nve-workspace-panel-header><nve-workspace-panel-content><input value="retained"></nve-workspace-panel-content><nve-workspace-panel-footer>Alpha status</nve-workspace-panel-footer></nve-workspace-panel>
      <nve-workspace-panel id="companion"><nve-workspace-panel-header>Companion<button slot="suffix">Companion action</button></nve-workspace-panel-header><nve-workspace-panel-footer>Companion status</nve-workspace-panel-footer></nve-workspace-panel>
      <nve-workspace-panel id="b">Bare content</nve-workspace-panel>
    </nve-workspace>`);
    const workspace = fixture.querySelector<Workspace>('nve-workspace')!;
    await elementIsStable(workspace);
    return workspace;
  }

  it('uses scoped Tabs with one selected keyboard stop for each tabbed group', async () => {
    const workspace = await createWorkspace();
    const groups = [...workspace.shadowRoot!.querySelectorAll('nve-tabs.tab-track')];
    expect(groups).toHaveLength(1);
    for (const tabs of groups) {
      expect(tabs.querySelectorAll('nve-tabs-item[tabindex="0"]')).toHaveLength(1);
    }
  });

  it('keeps readable tab minimums independent of the group minimum width', async () => {
    const workspace = await createWorkspace();
    workspace.querySelectorAll('[slot="suffix"]').forEach(element => element.remove());
    workspace.style.width = '140px';
    workspace.closable = true;
    workspace.value = JSON.stringify({
      version: 1,
      closed: [],
      root: { type: 'group', panels: ['a', 'companion', 'b'], active: 'a' }
    });
    await elementIsStable(workspace);
    const entry = workspace.shadowRoot!.querySelector<HTMLElement>('.tablist .tab-entry')!;
    const strip = entry.closest<HTMLElement>('.tablist')!;
    await vi.waitFor(() => expect(entry.getBoundingClientRect().width).toBe(120));
    const saved = workspace.value;
    expect(workspace.querySelector('#a')!.getBoundingClientRect().width).toBe(140);
    expect(strip.scrollWidth).toBeGreaterThan(strip.clientWidth);

    workspace.style.setProperty('--tab-min-width', 'calc(2 * 100px)');
    await vi.waitFor(() => expect(entry.getBoundingClientRect().width).toBe(200));
    expect(workspace.querySelector('#a')!.getBoundingClientRect().width).toBe(140);
    expect(workspace.value).toBe(saved);
  });

  it('ellipsizes long titles while preserving prefix decoration and header height', async () => {
    const workspace = await createWorkspace();
    const header = workspace.querySelector<WorkspacePanelHeader>('#a nve-workspace-panel-header')!;
    const text = document.createElement('span');
    text.textContent = 'A long application title that cannot fit within one tab';
    header.append(text);
    await elementIsStable(header);
    const title = header.shadowRoot!.querySelector<HTMLElement>('.title-content')!;
    const prefix = header.querySelector<HTMLElement>('[slot="prefix"]')!;
    expect(getComputedStyle(title).textOverflow).toBe('ellipsis');
    expect(title.scrollWidth).toBeGreaterThan(title.clientWidth);
    expect(title.clientWidth).toBeGreaterThan(0);
    expect(prefix.getBoundingClientRect().width).toBeGreaterThan(0);
    expect(header.shadowRoot!.querySelector('.label-content')!.getBoundingClientRect().height).toBe(48);
  });

  it('ellipsizes identifier titles when no authored header is supplied', async () => {
    const workspace = await createWorkspace();
    const id = 'a-long-identifier-for-a-panel-without-an-authored-header';
    workspace.querySelector('#b')!.id = id;
    workspace.value = JSON.stringify({
      version: 1,
      closed: [],
      root: { type: 'group', panels: ['a', 'companion', id], active: id }
    });
    await elementIsStable(workspace);
    const title = workspace.shadowRoot!.querySelector<HTMLElement>(`[data-panel="${id}"] .fallback-title`)!;
    expect(getComputedStyle(title).textOverflow).toBe('ellipsis');
    expect(title.scrollWidth).toBeGreaterThan(title.clientWidth);
    expect(title.clientWidth).toBeGreaterThan(0);
  });

  it('scrolls titles and close controls with their tabs without waiting for scroll handlers', async () => {
    const workspace = await createWorkspace();
    workspace.closable = true;
    workspace.style.width = '240px';
    await vi.waitFor(() =>
      expect(workspace.shadowRoot!.querySelector('.group-chrome')!.getBoundingClientRect().width).toBeLessThan(240)
    );
    await elementIsStable(workspace);
    const close = workspace.shadowRoot!.querySelector<HTMLElement>('[data-close="a"]')!;
    const tab = workspace.shadowRoot!.querySelector<HTMLElement>('[data-panel="a"]')!;
    const strip = tab.closest<HTMLElement>('.tablist')!;
    expect(close.closest('.tablist')).toBe(strip);
    expect(close.closest('nve-tabs')).toBe(tab.closest('nve-tabs'));
    expect(close.parentElement).toBe(tab.parentElement);
    expect(tab.parentElement!.getBoundingClientRect().right - close.getBoundingClientRect().right).toBe(8);
    const header = workspace.querySelector<WorkspacePanelHeader>('#a nve-workspace-panel-header')!;
    const label = header.shadowRoot!.querySelector<HTMLElement>('.label')!;
    const original = {
      close: close.getBoundingClientRect().x,
      tab: tab.getBoundingClientRect().x,
      label: label.getBoundingClientRect().x
    };
    const updates = vi.spyOn(workspace, 'requestUpdate');
    const headerUpdates = vi.spyOn(header, 'requestUpdate');
    const track = header.shadowRoot!.querySelector<HTMLElement>('.label-track')!;
    await vi.waitFor(() => expect(track.getAnimations()).toHaveLength(1));
    vi.spyOn(header, '_scroll').mockImplementation(() => {});
    strip.scrollLeft = 40;
    expect(strip.scrollLeft).toBeGreaterThan(0);
    expect(original.close - close.getBoundingClientRect().x).toBe(strip.scrollLeft);
    expect(original.tab - tab.getBoundingClientRect().x).toBe(strip.scrollLeft);
    await vi.waitFor(() => expect(original.label - label.getBoundingClientRect().x).toBeCloseTo(strip.scrollLeft, 1));
    expect(updates).not.toHaveBeenCalled();
    expect(headerUpdates).not.toHaveBeenCalled();
  });

  it('reads one scroll offset before updating all fallback titles', async () => {
    vi.stubGlobal('ScrollTimeline', undefined);
    const workspace = await createWorkspace();
    workspace.style.width = '240px';
    await vi.waitFor(() =>
      expect(workspace.shadowRoot!.querySelector('.group-chrome')!.getBoundingClientRect().width).toBeLessThan(240)
    );
    await elementIsStable(workspace);
    const headers = ['a', 'companion'].map(
      id => workspace.querySelector<WorkspacePanelHeader>(`#${id} nve-workspace-panel-header`)!
    );
    const labels = headers.map(header => header.shadowRoot!.querySelector<HTMLElement>('.label')!);
    const original = labels.map(label => label.getBoundingClientRect().x);
    const strip = workspace.shadowRoot!.querySelector<HTMLElement>('.tablist')!;
    strip.scrollLeft = 40;
    const offset = strip.scrollLeft;
    const read = vi.spyOn(strip, 'scrollLeft', 'get');
    strip.dispatchEvent(new Event('scroll'));
    expect(read).toHaveBeenCalledTimes(1);
    labels.forEach((label, index) => expect(original[index]! - label.getBoundingClientRect().x).toBe(offset));
    for (const header of headers)
      expect(header.shadowRoot!.querySelector('.label-track')!.getAnimations()).toHaveLength(0);
  });

  it('updates the scroll binding when the strip changes size and releases it when the group closes', async () => {
    const workspace = await createWorkspace();
    workspace.style.width = '240px';
    await elementIsStable(workspace);
    const header = workspace.querySelector<WorkspacePanelHeader>('#a nve-workspace-panel-header')!;
    const label = header.shadowRoot!.querySelector<HTMLElement>('.label')!;
    const track = header.shadowRoot!.querySelector<HTMLElement>('.label-track')!;
    const strip = workspace.shadowRoot!.querySelector<HTMLElement>('.tablist')!;
    strip.scrollLeft = strip.scrollWidth;
    await vi.waitFor(() =>
      expect(label.getBoundingClientRect().x).toBeCloseTo(strip.getBoundingClientRect().x - strip.scrollLeft, 1)
    );
    workspace.style.width = '320px';
    await elementIsStable(workspace);
    strip.scrollLeft = strip.scrollWidth;
    await vi.waitFor(() =>
      expect(label.getBoundingClientRect().x).toBeCloseTo(strip.getBoundingClientRect().x - strip.scrollLeft, 1)
    );
    workspace.value = JSON.stringify({ ...JSON.parse(arrangement), closed: ['a', 'companion'] });
    await elementIsStable(workspace);
    expect(track.getAnimations()).toHaveLength(0);
  });

  it('keeps header scrolling current when native overflow changes during detached dragging', async () => {
    const workspace = await createWorkspace();
    workspace.groupable = true;
    workspace.rearrangeable = true;
    await elementIsStable(workspace);
    vi.spyOn(workspace, 'setPointerCapture').mockImplementation(() => {});
    const tab = workspace.shadowRoot!.querySelector<HTMLElement>('[data-panel="b"]')!;
    const rect = tab.getBoundingClientRect();
    const pointer = (type: string, x: number, y: number) =>
      new PointerEvent(type, {
        bubbles: true,
        composed: true,
        cancelable: true,
        pointerId: 1,
        pointerType: 'mouse',
        isPrimary: true,
        button: 0,
        buttons: type === 'pointerup' ? 0 : 1,
        clientX: x,
        clientY: y
      });
    tab.dispatchEvent(pointer('pointerdown', rect.x + rect.width / 2, rect.y + rect.height / 2));
    const bounds = workspace.getBoundingClientRect();
    workspace.dispatchEvent(pointer('pointermove', bounds.x + 100, bounds.y + 150));
    const phase = () =>
      workspace.shadowRoot!.querySelector('[data-destination-ghost]')?.getAttribute('data-drag-phase');
    await vi.waitFor(() => expect(phase()).toBe('detached'));
    const header = workspace.querySelector<WorkspacePanelHeader>('#a nve-workspace-panel-header')!;
    const label = header.shadowRoot!.querySelector<HTMLElement>('.label')!;
    const style = document.createElement('style');
    style.textContent = 'nve-workspace::part(tabs) { min-width: 1400px; }';
    fixture.append(style);
    workspace.dispatchEvent(pointer('pointermove', bounds.x + 101, bounds.y + 150));
    await elementIsStable(workspace);
    const strip = workspace.shadowRoot!.querySelector<HTMLElement>('.tablist')!;
    await vi.waitFor(() => expect(strip.scrollWidth).toBeGreaterThan(strip.clientWidth));
    const beforeScroll = { labelX: label.getBoundingClientRect().x, offset: strip.scrollLeft };
    strip.scrollLeft = strip.scrollWidth;
    await vi.waitFor(() => {
      expect(strip.scrollLeft).toBeGreaterThan(0);
      expect(beforeScroll.labelX - label.getBoundingClientRect().x).toBeCloseTo(
        strip.scrollLeft - beforeScroll.offset,
        1
      );
    });
    expect(phase()).toBe('detached');
    workspace.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    workspace.dispatchEvent(pointer('pointerup', bounds.x + 101, bounds.y + 150));
    await vi.waitFor(() => expect(phase()).toBeUndefined());
  });

  it('reveals keyboard selection in the native strip after allocating the selected header', async () => {
    const workspace = await createWorkspace();
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

describe('workspace singleton tab presentation', () => {
  let fixture: HTMLElement;
  let workspace: Workspace;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-workspace closable groupable rearrangeable style="height:220px;width:600px">
        <nve-workspace-panel id="a">
          <nve-workspace-panel-header><strong>Rich Alpha</strong></nve-workspace-panel-header>
          <input value="retained" />
        </nve-workspace-panel>
        <nve-workspace-panel id="b" hidden>
          <nve-workspace-panel-header>Beta</nve-workspace-panel-header>Application-hidden content</nve-workspace-panel
        >
      </nve-workspace>
    `);
    workspace = fixture.querySelector<Workspace>('nve-workspace')!;
    await elementIsStable(workspace);
  });

  afterEach(() => {
    removeFixture(fixture);
    vi.restoreAllMocks();
  });

  it('renders tab selection only while a group has multiple open panels', async () => {
    const tabs = workspace.shadowRoot!.querySelector('nve-tabs')!;
    expect(getComputedStyle(tabs, '::after').display).not.toBe('none');
    workspace.shadowRoot!.querySelector<HTMLElement>('[data-close="b"]')!.click();
    await elementIsStable(workspace);
    expect(workspace.shadowRoot!.querySelector('nve-tabs.tab-track')).toBeNull();
    const snapshot = parseWorkspaceValue(workspace.value);
    if (!snapshot) throw new Error('Expected a workspace layout');
    workspace.value = JSON.stringify({ ...snapshot, closed: [] });
    await elementIsStable(workspace);
    const restored = workspace.shadowRoot!.querySelector('nve-tabs.tab-track')!;
    expect(getComputedStyle(restored, '::after').display).not.toBe('none');
  });

  it('clips singleton header overflow without reading or binding a scrolling strip', async () => {
    workspace.style.width = '180px';
    const strip = workspace.shadowRoot!.querySelector<HTMLElement>('.tablist')!;
    await vi.waitFor(() => expect(strip.scrollWidth).toBeGreaterThan(strip.clientWidth));
    expect(getComputedStyle(strip).overflowX).toBe('auto');
    const saved = workspace.value;
    workspace.shadowRoot!.querySelector<HTMLElement>('[data-close="b"]')!.click();
    await elementIsStable(workspace);
    const singleton = workspace.shadowRoot!.querySelector<HTMLElement>('.tablist')!;
    const entry = singleton.querySelector<HTMLElement>('.tab-entry')!;
    entry.style.width = '300px';
    expect(getComputedStyle(singleton).overflowX).toBe('clip');
    const width = vi.spyOn(singleton, 'scrollWidth', 'get');
    const offset = vi.spyOn(singleton, 'scrollLeft', 'get');
    workspace.requestUpdate();
    await elementIsStable(workspace);
    expect(width).not.toHaveBeenCalled();
    expect(offset).not.toHaveBeenCalled();
    const label = workspace.querySelector('nve-workspace-panel-header')!.shadowRoot!.querySelector('.label-track')!;
    expect(label.getAnimations()).toHaveLength(0);
    workspace.value = saved;
    await elementIsStable(workspace);
    const restored = workspace.shadowRoot!.querySelector<HTMLElement>('.tablist')!;
    expect(getComputedStyle(restored).overflowX).toBe('auto');
    expect(restored.scrollWidth).toBeGreaterThan(restored.clientWidth);
  });
});

describe('workspace tab close and focus', () => {
  const arrangement = JSON.stringify({
    version: 1,
    closed: [],
    root: {
      type: 'split',
      axis: 'horizontal',
      weights: [1, 1],
      children: [
        { type: 'group', panels: ['a', 'b'], active: 'a' },
        { type: 'group', panels: ['c', 'd'], active: 'c' }
      ]
    }
  });

  let fixture: HTMLElement | undefined;
  let workspace: Workspace;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-workspace style="width:806px;height:320px" groupable rearrangeable closable resizable .value=${arrangement}>
        <nve-workspace-panel id="a"><nve-workspace-panel-header>Alpha</nve-workspace-panel-header><input value="retained" /></nve-workspace-panel>
        <nve-workspace-panel id="b"><nve-workspace-panel-header>Beta</nve-workspace-panel-header>Content B</nve-workspace-panel>
        <nve-workspace-panel id="c"><nve-workspace-panel-header>Gamma</nve-workspace-panel-header>Content C</nve-workspace-panel>
        <nve-workspace-panel id="d"><nve-workspace-panel-header>Delta</nve-workspace-panel-header>Content D</nve-workspace-panel>
      </nve-workspace>
    `);
    workspace = fixture.querySelector<Workspace>('nve-workspace')!;
    await elementIsStable(workspace);
  });

  afterEach(() => {
    if (fixture) removeFixture(fixture);
  });

  function control<T extends HTMLElement = HTMLElement>(selector: string): T {
    const element = workspace.shadowRoot!.querySelector<T>(selector);
    expect(element, selector).not.toBeNull();
    return element!;
  }

  function snapshot(): WorkspaceLayout {
    return JSON.parse(workspace.value);
  }

  it.each(['Enter', 'Space'])('should close an inactive tab with %s without activating it', async key => {
    const tab = control('[data-panel="b"]');
    const close = control('[data-close="b"]');
    const click = vi.fn();
    const change = vi.fn();
    tab.addEventListener('click', click);
    workspace.addEventListener('change', change);
    close.focus();

    await userEvent.keyboard(`{${key}>}`);
    expect(tab.matches(':state(active)')).toBe(false);
    await userEvent.keyboard(`{/${key}}`);
    await elementIsStable(workspace);

    expect(click).not.toHaveBeenCalled();
    expect(change).toHaveBeenCalledOnce();
    expect(snapshot().closed).toEqual(['b']);
    expect(workspace.querySelector('#a')!.getAttribute('aria-hidden')).toBe('false');
    expect(workspace.querySelector('#a')!.shadowRoot!.activeElement).toBe(
      workspace.querySelector('#a')!.shadowRoot!.querySelector('.body')
    );
  });

  it('should recover focus on close and retain input through application snapshot restoration', async () => {
    const panel = workspace.querySelector<HTMLElement>('#a')!;
    const input = panel.querySelector('input')!;
    const saved = workspace.value;
    const change = vi.fn();
    workspace.addEventListener('change', change);
    input.value = 'edited';
    input.focus();
    control('[data-close="a"]').click();
    await elementIsStable(workspace);
    expect(panel.isConnected).toBe(true);
    expect(panel.hidden).toBe(false);
    expect(panel.matches(':state(workspace-presented)')).toBe(false);
    expect(getComputedStyle(panel).display).toBe('none');
    expect(workspace.querySelector('#b')!.shadowRoot!.activeElement).toBe(
      workspace.querySelector('#b')!.shadowRoot!.querySelector('.body')
    );
    expect(snapshot().closed).toEqual(['a']);
    expect(change).toHaveBeenCalledOnce();
    expect(snapshot().root).toEqual(JSON.parse(saved).root);
    workspace.value = JSON.stringify({ ...snapshot(), closed: [] });
    await elementIsStable(workspace);
    expect(panel.hidden).toBe(false);
    expect(panel.matches(':state(workspace-presented)')).toBe(true);
    expect(panel.querySelector('input')).toBe(input);
    expect(input.value).toBe('edited');
    expect(change).toHaveBeenCalledOnce();
  });
});

describe('workspace reserved tab presentation', () => {
  function pointer(type: string, clientX: number, clientY: number) {
    return new PointerEvent(type, {
      clientX,
      clientY,
      pointerId: 5,
      isPrimary: true,
      button: 0,
      buttons: type === 'pointerup' ? 0 : 1,
      bubbles: true,
      composed: true,
      cancelable: true
    });
  }

  function nextFrame() {
    return new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
  }

  let fixture: HTMLElement;
  let workspace: Workspace;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-workspace groupable rearrangeable closable style="width:720px;height:240px">
        ${['a', 'companion', 'b', 'b2'].map(
          id => html`
            <nve-workspace-panel id=${id}>
              <nve-workspace-panel-header>${id}${id === 'b2' ? html`<span slot="suffix" style="display:block;width:120px">Recipient actions</span>` : null}</nve-workspace-panel-header>
              <input .value=${id} />
            </nve-workspace-panel>
          `
        )}
      </nve-workspace>
    `);
    workspace = fixture.querySelector<Workspace>('nve-workspace')!;
    workspace.value = JSON.stringify({
      version: 1,
      closed: [],
      root: {
        type: 'split',
        axis: 'horizontal',
        weights: [1, 1],
        children: [
          { type: 'group', panels: ['a', 'companion'], active: 'a' },
          { type: 'group', panels: ['b', 'b2'], active: 'b2' }
        ]
      }
    });
    await elementIsStable(workspace);
    vi.spyOn(workspace, 'setPointerCapture').mockImplementation(() => {});
  });

  afterEach(() => {
    removeFixture(fixture);
    vi.restoreAllMocks();
  });

  function button(id: string) {
    return workspace.shadowRoot!.querySelector<HTMLElement>(`[data-panel="${id}"]`)!;
  }

  function entry(id: string) {
    return button(id).closest<HTMLElement>('nve-tabs-item-group')!;
  }

  function move(type: string, point: Point) {
    workspace.dispatchEvent(pointer(type, point.x, point.y));
  }

  function begin(id: string) {
    const control = button(id),
      rect = control.getBoundingClientRect();
    control.dispatchEvent(pointer('pointerdown', rect.x + rect.width / 2, rect.y + rect.height / 2));
  }

  it('reserves an empty inert tab, slides existing headers, and retains the original nonfirst recipient body', async () => {
    const saved = workspace.value,
      input = workspace.querySelector('#a input');
    const change = vi.fn();
    workspace.addEventListener('change', change);
    const original = button('b'),
      strip = original.closest('.tablist');
    const target = original.getBoundingClientRect();
    begin('companion');
    move('pointermove', { x: target.x + 8, y: target.y + target.height / 2 });
    await vi.waitFor(() =>
      expect(
        workspace.shadowRoot!.querySelector('[data-preview-allocation]')?.getAttribute('data-preview-allocation')
      ).toBe('reserved')
    );
    await elementIsStable(workspace);
    const carried = entry('companion');
    expect(carried.inert).toBe(true);
    expect(getComputedStyle(carried).visibility).toBe('hidden');
    expect(carried.getAttribute('aria-hidden')).toBe('true');
    expect(original.closest('.tablist')).toBe(strip);
    expect(button('b')).toBe(original);
    expect(button('b2').hasAttribute('selected')).toBe(true);
    expect(workspace.querySelector('#b2')!.shadowRoot!.querySelector<HTMLElement>('.content')!.hidden).toBe(false);
    expect(workspace.querySelector('#companion')!.matches(':state(workspace-presented)')).toBe(false);
    expect(getComputedStyle(entry('b')).transitionProperty).toContain('left');
    expect(workspace.value).toBe(saved);
    expect(change).not.toHaveBeenCalled();
    expect(workspace.querySelector('#a input')).toBe(input);
    workspace.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await vi.waitFor(() => expect(workspace.shadowRoot!.querySelector('[data-destination-ghost]')).toBeNull());
    expect(workspace.value).toBe(saved);
  });

  it('holds the accepted insertion position across refresh and small real pointer movements, then silently returns an inactive tab', async () => {
    const saved = workspace.value,
      change = vi.fn();
    workspace.addEventListener('change', change);
    const target = button('b').getBoundingClientRect();
    begin('companion');
    move('pointermove', { x: target.x + 8, y: target.y + target.height / 2 });
    await vi.waitFor(() =>
      expect(
        workspace.shadowRoot!.querySelector('[data-destination-ghost]')?.getAttribute('data-destination-kind')
      ).toBe('tab')
    );
    await elementIsStable(workspace);
    await vi.waitFor(() => expect(entry('a').getAnimations()).toHaveLength(0));
    const original = entry('a').getBoundingClientRect();
    move('pointermove', { x: original.x + original.width * 0.75, y: original.y + original.height / 2 });
    await nextFrame();
    await elementIsStable(workspace);
    await vi.waitFor(() => {
      expect(entry('a').getAnimations()).toHaveLength(0);
      expect(entry('companion').getAnimations()).toHaveLength(0);
    });
    const reservationRect = entry('companion').getBoundingClientRect();
    expect(reservationRect.left).toBeCloseTo(entry('a').getBoundingClientRect().right, 1);
    const destination = entry('companion').getAttribute('style');
    const strip = button('a').closest('.tablist')!;
    strip.dispatchEvent(new Event('scroll'));
    await nextFrame();
    await elementIsStable(workspace);
    expect(entry('companion').getAttribute('style')).toBe(destination);
    for (const dx of [-1, 1]) {
      move('pointermove', {
        x: reservationRect.x + reservationRect.width / 2 + dx,
        y: reservationRect.y + reservationRect.height / 2
      });
      await nextFrame();
      await elementIsStable(workspace);
      expect(entry('companion').getAttribute('style')).toBe(destination);
    }
    move('pointerup', {
      x: reservationRect.x + reservationRect.width / 2,
      y: reservationRect.y + reservationRect.height / 2
    });
    await elementIsStable(workspace);
    expect(workspace.value).toBe(saved);
    expect(change).not.toHaveBeenCalled();
    expect(button('a').hasAttribute('selected')).toBe(true);
  });

  it('updates a held reservation clipping independently of placement feasibility during native scroll', async () => {
    const extra = Array.from({ length: 12 }, (_, index) => `extra-${index}`);
    for (const id of extra) {
      const panel = document.createElement('nve-workspace-panel');
      panel.id = id;
      workspace.append(panel);
    }
    workspace.value = JSON.stringify({
      version: 1,
      closed: [],
      root: {
        type: 'split',
        axis: 'horizontal',
        weights: [1, 1],
        children: [
          { type: 'group', panels: ['a', 'companion'], active: 'a' },
          { type: 'group', panels: ['b', 'b2', ...extra], active: 'b2' }
        ]
      }
    });
    await elementIsStable(workspace);
    const target = button('b').getBoundingClientRect();
    begin('companion');
    move('pointermove', { x: target.x + 8, y: target.y + target.height / 2 });
    await vi.waitFor(() =>
      expect(
        workspace.shadowRoot!.querySelector('[data-preview-allocation]')?.getAttribute('data-preview-allocation')
      ).toBe('reserved')
    );
    const strip = button('b').closest<HTMLElement>('.tablist')!;
    const saved = workspace.value;
    strip.scrollLeft = strip.scrollWidth;
    strip.dispatchEvent(new Event('scroll'));
    await nextFrame();
    await elementIsStable(workspace);
    expect(strip.scrollLeft).toBeGreaterThan(0);
    const ghost = workspace.shadowRoot!.querySelector<HTMLElement>('[data-destination-ghost]')!;
    expect(ghost.hasAttribute('data-cue-clipped')).toBe(true);
    expect(getComputedStyle(ghost).visibility).toBe('hidden');
    expect(workspace.value).toBe(saved);
    strip.scrollLeft = 0;
    strip.dispatchEvent(new Event('scroll'));
    await nextFrame();
    await elementIsStable(workspace);
    expect(ghost.hasAttribute('data-cue-clipped')).toBe(false);
    expect(getComputedStyle(ghost).visibility).toBe('visible');
    workspace.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await vi.waitFor(() => expect(workspace.shadowRoot!.querySelector('[data-destination-ghost]')).toBeNull());
    expect(strip.scrollLeft).toBe(0);
  });
});
