// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createFixture, elementIsStable, removeFixture } from '@internals/testing';

import { WorkspaceCompositionController } from './controllers/workspace-composition.controller.js';

import type { WorkspacePanelHeader } from './panel-header/panel-header.js';
import type { WorkspacePanel } from './panel/panel.js';
import type { Workspace } from './workspace.js';

import './define.js';
import '@nvidia-elements/core/ghost/define.js';

describe('workspace panel composition', () => {
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

  it('observes content after controller connection and stops before controller disconnection', async () => {
    const order: string[] = [];
    const start = WorkspaceCompositionController.prototype.startObserving;
    const stop = WorkspaceCompositionController.prototype.stopObserving;
    vi.spyOn(WorkspaceCompositionController.prototype, 'startObserving').mockImplementation(function () {
      order.push('observe');
      start.call(this);
    });
    vi.spyOn(WorkspaceCompositionController.prototype, 'stopObserving').mockImplementation(function () {
      order.push('stop');
      stop.call(this);
    });
    const workspace = await setup();
    workspace.addController({
      hostConnected: () => order.push('connect'),
      hostDisconnected: () => order.push('disconnect')
    });
    // Lit connects controllers added to an already connected host immediately.
    order.length = 0;
    workspace.remove();
    fixture.append(workspace);
    await elementIsStable(workspace);
    expect(order).toEqual(['stop', 'disconnect', 'connect', 'observe']);
  });

  describe('group framing', () => {
    it('frames the complete selected group and clips chrome against the same configurable radius', async () => {
      const workspace = await setup();
      const panel = workspace.querySelector<HTMLElement>('#a')!;
      const inactive = workspace.querySelector('#companion')!;
      const frame = panel.shadowRoot!.querySelector<HTMLElement>('.frame')!;
      const content = panel.shadowRoot!.querySelector<HTMLElement>('.content')!;
      const chrome = workspace.shadowRoot!.querySelector<HTMLElement>('.group-chrome')!;
      expect(frame.hidden).toBe(false);
      const surface = panel.shadowRoot!.querySelector<HTMLElement>('.surface')!;
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

    it('paints configurable shadows only on the selected panel of each group', async () => {
      const workspace = await setup();
      const panel = workspace.querySelector<HTMLElement>('#a')!;
      const companion = workspace.querySelector<HTMLElement>('#companion')!;
      expect(getComputedStyle(panel).boxShadow).not.toBe('none');
      expect(getComputedStyle(companion).boxShadow).toBe('none');

      panel.style.setProperty('--box-shadow', 'none');
      companion.style.setProperty('--box-shadow', '0 2px 4px rgb(12, 34, 56)');
      expect(getComputedStyle(panel).boxShadow).toBe('none');
      expect(getComputedStyle(companion).boxShadow).toBe('none');

      workspace.shadowRoot!.querySelector<HTMLElement>('[data-panel="companion"]')!.click();
      await elementIsStable(workspace);
      expect(getComputedStyle(companion).boxShadow).toContain('rgb(12, 34, 56)');
      expect(getComputedStyle(panel).boxShadow).toBe('none');
    });

    it('defaults flat and full panels to no shadow while allowing explicit overrides', async () => {
      const workspace = await setup();
      const panel = workspace.querySelector<HTMLElement>('#a')!;
      const shadow = getComputedStyle(panel).boxShadow;
      for (const container of ['flat', 'full'] as const) {
        panel.style.removeProperty('--box-shadow');
        workspace.container = container;
        await elementIsStable(workspace);
        expect(getComputedStyle(panel).boxShadow).toBe('none');
        panel.style.setProperty('--box-shadow', 'var(--nve-ref-shadow-100)');
        expect(getComputedStyle(panel).boxShadow).toBe(shadow);
      }
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
  });

  describe('header content and controls', () => {
    it('uses the panel ID as a fallback title and propagates container framing', async () => {
      const workspace = await setup();
      const bare = workspace.querySelector('#b')!;
      expect(workspace.shadowRoot!.querySelector('[data-panel="b"]')!.textContent).toBe('b');
      workspace.container = 'flat';
      await elementIsStable(workspace);
      expect(bare.getAttribute('container')).toBe('flat');
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

    it('configures one divider before populated header suffixes', async () => {
      const workspace = await setup();
      const alpha = workspace.querySelector<WorkspacePanelHeader>('#a nve-workspace-panel-header')!;
      const suffix = alpha.shadowRoot!.querySelector<HTMLElement>('.suffix')!;
      const divider = () => getComputedStyle(suffix, '::before');
      const lastTab = workspace.shadowRoot!.querySelector('[data-panel="companion"]')!.parentElement!;
      expect(divider().borderInlineStartWidth).toBe('1px');
      expect(divider().borderInlineEndWidth).toBe('0px');
      expect(getComputedStyle(lastTab).borderInlineEndWidth).toBe('0px');
      expect(suffix.getBoundingClientRect().height).toBe(lastTab.getBoundingClientRect().height);

      alpha.style.setProperty('--suffix-border', '3px dashed rgb(12, 34, 56)');
      expect(divider().borderInlineStart).toBe('3px dashed rgb(12, 34, 56)');
      alpha.style.setProperty('--suffix-border', 'none');
      expect(divider().borderInlineStartWidth).toBe('0px');
      alpha.style.removeProperty('--suffix-border');
      alpha.querySelector('button')!.remove();
      await elementIsStable(workspace);
      await vi.waitFor(() => expect(divider().borderInlineStartWidth).toBe('0px'));
      expect(suffix.getBoundingClientRect().width).toBe(0);
    });

    it('configures dividers between tabs and after the grip without adding outside borders', async () => {
      const workspace = await setup();
      const entries = [...workspace.shadowRoot!.querySelector('.tablist')!.querySelectorAll('.tab-entry')];
      expect(entries).toHaveLength(2);
      expect(getComputedStyle(entries[0]).borderInlineStartWidth).toBe('0px');
      expect(getComputedStyle(entries[1]).borderInlineStartWidth).toBe('1px');
      workspace.rearrangeable = true;
      await elementIsStable(workspace);
      await vi.waitFor(() => expect(getComputedStyle(entries[0]).borderInlineStartWidth).toBe('1px'));

      workspace.style.setProperty('--tab-border', '2px dashed rgb(12, 34, 56)');
      for (const container of ['inset', 'flat', 'full'] as const) {
        workspace.container = container;
        await elementIsStable(workspace);
        for (const entry of entries) {
          expect(getComputedStyle(entry).borderInlineStart).toBe('2px dashed rgb(12, 34, 56)');
          expect(getComputedStyle(entry).borderInlineEndWidth).toBe('0px');
        }
      }
      workspace.style.setProperty('--tab-border', 'none');
      for (const entry of entries) expect(getComputedStyle(entry).borderInlineStartWidth).toBe('0px');
    });

    it('configures a trailing border only for populated title prefixes', async () => {
      const workspace = await setup();
      const header = workspace.querySelector<WorkspacePanelHeader>('#a nve-workspace-panel-header')!;
      const prefix = header.shadowRoot!.querySelector('slot[name="prefix"]')!;
      expect(getComputedStyle(prefix).borderInlineEndWidth).toBe('0px');
      header.style.setProperty('--prefix-border', '2px dotted rgb(12, 34, 56)');
      expect(getComputedStyle(prefix).borderInlineEnd).toBe('2px dotted rgb(12, 34, 56)');
      expect(getComputedStyle(prefix).borderInlineStartWidth).toBe('0px');

      header.querySelector('[slot="prefix"]')!.remove();
      await elementIsStable(header);
      expect(getComputedStyle(prefix).borderInlineEndWidth).toBe('0px');
      expect(getComputedStyle(prefix).display).toBe('none');
    });

    it('configures prefix and suffix padding independently of the title', async () => {
      const workspace = await setup();
      const header = workspace.querySelector<WorkspacePanelHeader>('#a nve-workspace-panel-header')!;
      const suffix = header.shadowRoot!.querySelector('.suffix-content')!;
      const prefix = header.shadowRoot!.querySelector('slot[name="prefix"]')!;
      const label = header.shadowRoot!.querySelector('.label-content')!;
      expect(getComputedStyle(prefix).paddingInlineStart).toBe('0px');
      expect(getComputedStyle(suffix).paddingInlineStart).toBe('4px');
      expect(getComputedStyle(suffix).paddingInlineEnd).toBe('4px');
      expect(getComputedStyle(label).paddingInlineStart).toBe('16px');

      header.style.setProperty('--prefix-padding', '4px');
      header.style.setProperty('--suffix-padding', '12px 4px');
      expect(getComputedStyle(prefix).paddingInlineStart).toBe('4px');
      expect(getComputedStyle(suffix).paddingInlineStart).toBe('4px');
      expect(getComputedStyle(suffix).paddingInlineEnd).toBe('4px');
      expect(getComputedStyle(suffix).paddingBlockStart).toBe('12px');
      expect(getComputedStyle(suffix).paddingBlockEnd).toBe('12px');
      expect(getComputedStyle(label).paddingInlineStart).toBe('16px');
    });

    it('composes flat close controls as suffix accessories beside their tabs', async () => {
      const workspace = await setup();
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

    it('configures close-control size and trailing insets in grouped and singleton headers', async () => {
      const workspace = await setup();
      workspace.id = 'compact-actions';
      workspace.closable = true;
      workspace.style.setProperty('--close-button-inset', '4px');
      const style = document.createElement('style');
      style.textContent = '#compact-actions::part(close-button) { --width: 24px; --height: 24px; }';
      fixture.append(style);
      await elementIsStable(workspace);
      const buttons = [...workspace.shadowRoot!.querySelectorAll<HTMLElement>('[data-close]')];
      expect(buttons).toHaveLength(3);
      for (const button of buttons) {
        const rect = button.getBoundingClientRect();
        expect(rect.width).toBe(24);
        expect(rect.height).toBe(24);
        expect(button.closest('.tab-entry')!.getBoundingClientRect().right - rect.right).toBe(4);
      }
      const header = workspace.querySelector('#a nve-workspace-panel-header')!;
      const label = header.shadowRoot!.querySelector('.label')!;
      const width = label.getBoundingClientRect().width;
      workspace.style.setProperty('--close-button-inset', '12px');
      await vi.waitFor(() => expect(label.getBoundingClientRect().width).toBeCloseTo(width - 8, 1));
      for (const button of buttons)
        expect(button.closest('.tab-entry')!.getBoundingClientRect().right - button.getBoundingClientRect().right).toBe(
          12
        );
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
  });

  describe('header sizing', () => {
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

    it('propagates compact header sizing through tabs, controls, content, and growing requirements', async () => {
      const workspace = await setup();
      const bareHeader = document.createElement('nve-workspace-panel-header');
      bareHeader.textContent = 'Beta';
      workspace.querySelector('#b')!.append(bareHeader);
      workspace.rearrangeable = true;
      workspace.closable = true;
      const headers = [...workspace.querySelectorAll<WorkspacePanelHeader>('nve-workspace-panel-header')];
      for (const header of headers) {
        header.style.setProperty('--min-height', '32px');
        header.style.setProperty('--padding', '4px 8px');
        header.style.setProperty('--suffix-padding', '0 4px');
      }
      await vi.waitFor(() =>
        expect(workspace.shadowRoot!.querySelector('.tabs')!.getBoundingClientRect().height).toBe(32)
      );
      const saved = workspace.value;
      const active = headers[0]!;
      const suffix = active.shadowRoot!.querySelector('.suffix')!;
      const natural = active.shadowRoot!.querySelector('.suffix-content')!;
      expect(suffix.getBoundingClientRect().height).toBe(32);
      expect(natural.getBoundingClientRect().height).toBe(32);
      expect(workspace.shadowRoot!.querySelector('nve-drag-handle')!.getBoundingClientRect().height).toBe(32);
      for (const panel of workspace.querySelectorAll('nve-workspace-panel'))
        expect(getComputedStyle(panel.shadowRoot!.querySelector('.content')!).top).toBe('32px');
      headers.at(-1)!.style.setProperty('--min-height', '64px');
      await vi.waitFor(() => expect(suffix.getBoundingClientRect().height).toBe(64));
      expect(natural.getBoundingClientRect().height).toBe(32);
      headers.at(-1)!.style.setProperty('--min-height', '32px');
      await vi.waitFor(() => expect(suffix.getBoundingClientRect().height).toBe(32));
      expect(workspace.value).toBe(saved);
    });

    it('measures suffix controls and their padding intrinsically in both directions', async () => {
      const workspace = await setup();
      const header = workspace.querySelector<WorkspacePanelHeader>('#a nve-workspace-panel-header')!;
      const control = header.querySelector('button')!;
      const row = workspace.shadowRoot!.querySelector('.tabs')!;
      expect(row.getBoundingClientRect().height).toBe(48);
      control.style.height = '80px';
      await vi.waitFor(() => expect(row.getBoundingClientRect().height).toBe(88));
      control.style.removeProperty('height');
      await vi.waitFor(() => expect(row.getBoundingClientRect().height).toBe(48));
      header.style.setProperty('--suffix-padding', '24px 4px');
      await vi.waitFor(() => expect(row.getBoundingClientRect().height).toBeGreaterThan(48));
      header.style.removeProperty('--suffix-padding');
      await vi.waitFor(() => expect(row.getBoundingClientRect().height).toBe(48));
    });

    it('retains the default height for a presented panel without an authored header', async () => {
      const workspace = await setup();
      const headers = [...workspace.querySelectorAll<WorkspacePanelHeader>('nve-workspace-panel-header')];
      for (const header of headers) {
        header.style.setProperty('--min-height', '32px');
        header.style.setProperty('--padding', '4px');
        header.style.setProperty('--suffix-padding', '0');
      }
      await vi.waitFor(() =>
        expect(workspace.shadowRoot!.querySelector('.tabs')!.getBoundingClientRect().height).toBe(48)
      );
      expect(workspace.shadowRoot!.querySelector('[data-panel="b"]')!.textContent?.trim()).toBe('b');
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
  });

  describe('measurement updates', () => {
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

    it('retains intrinsic measurements through allocation-only updates', async () => {
      const workspace = await setup();
      workspace.closable = true;
      await elementIsStable(workspace);
      const viewport = workspace.shadowRoot!.querySelector<HTMLElement>('.viewport')!;
      const viewportWidth = vi.spyOn(viewport, 'clientWidth', 'get');
      const viewportHeight = vi.spyOn(viewport, 'clientHeight', 'get');
      const header = workspace.querySelector<WorkspacePanelHeader>('#a nve-workspace-panel-header')!;
      const label = vi.spyOn(header.shadowRoot!.querySelector('.label-content')!, 'getBoundingClientRect');
      const suffix = vi.spyOn(header.shadowRoot!.querySelector('.suffix-content')!, 'getBoundingClientRect');
      const action = vi.spyOn(
        workspace.shadowRoot!.querySelector('[data-chrome] nve-icon-button')!,
        'getBoundingClientRect'
      );
      workspace.requestUpdate();
      await elementIsStable(workspace);
      expect(label).not.toHaveBeenCalled();
      expect(suffix).not.toHaveBeenCalled();
      expect(action).not.toHaveBeenCalled();
      expect(viewportWidth).not.toHaveBeenCalled();
      expect(viewportHeight).not.toHaveBeenCalled();
      workspace.style.width = '600px';
      await vi.waitFor(() => expect(workspace.shadowRoot!.querySelector('.viewport')!.clientWidth).toBe(600));
      await elementIsStable(workspace);
      expect(suffix).not.toHaveBeenCalled();
      expect(action).not.toHaveBeenCalled();
    });

    it('publishes suffix height changes only when they affect the shared header height', async () => {
      const workspace = await setup();
      const header = workspace.querySelector<WorkspacePanelHeader>('#a nve-workspace-panel-header')!;
      const control = header.querySelector('button')!;
      const row = workspace.shadowRoot!.querySelector('.tabs')!;
      header.style.setProperty('--min-height', '0px');
      control.style.width = '80px';
      control.style.height = '80px';
      await vi.waitFor(() =>
        expect(row.getBoundingClientRect().height).toBeGreaterThanOrEqual(control.getBoundingClientRect().height)
      );
      const expandedHeight = row.getBoundingClientRect().height;
      control.style.height = '20px';
      await vi.waitFor(() => expect(row.getBoundingClientRect().height).toBeLessThan(expandedHeight));
      await elementIsStable(workspace);
      const height = row.getBoundingClientRect().height;
      const changed = vi.fn();
      workspace.addEventListener('commandavailabilitychange', changed);
      const suffix = vi.spyOn(header.shadowRoot!.querySelector('.suffix-content')!, 'getBoundingClientRect');

      control.style.height = '24px';
      await vi.waitFor(() => expect(suffix).toHaveBeenCalled());
      await elementIsStable(workspace);
      expect(row.getBoundingClientRect().height).toBe(height);
      expect(changed).not.toHaveBeenCalled();

      control.style.height = '80px';
      await vi.waitFor(() => expect(row.getBoundingClientRect().height).toBeGreaterThan(height));
      expect(changed).toHaveBeenCalled();
    });

    it('ignores footer width-only observations when intrinsic heights remain unchanged', async () => {
      const workspace = await setup();
      const footer = workspace.querySelector<HTMLElement>('#a nve-workspace-panel-footer')!;
      const row = workspace.shadowRoot!.querySelector('.tabs')!;
      const canvas = workspace.shadowRoot!.querySelector<HTMLElement>('.canvas')!;
      footer.style.height = '80px';
      await vi.waitFor(() =>
        expect(parseFloat(canvas.style.minHeight)).toBeCloseTo(
          row.getBoundingClientRect().height + footer.getBoundingClientRect().height,
          1
        )
      );
      await elementIsStable(workspace);
      const header = workspace.querySelector<WorkspacePanelHeader>('#a nve-workspace-panel-header')!;
      const label = vi.spyOn(header.shadowRoot!.querySelector('.label-content')!, 'getBoundingClientRect');
      const suffix = vi.spyOn(header.shadowRoot!.querySelector('.suffix-content')!, 'getBoundingClientRect');
      const footerRect = vi.spyOn(footer, 'getBoundingClientRect');
      footer.style.width = '300px';
      await vi.waitFor(() => expect(footerRect).toHaveBeenCalled());
      await elementIsStable(workspace);
      expect(label).not.toHaveBeenCalled();
      expect(suffix).not.toHaveBeenCalled();
    });

    it('configures a replacement header when its panel presentation is unchanged', async () => {
      const workspace = await setup();
      const panel = workspace.querySelector<WorkspacePanel>('#a')!;
      const replacement = document.createElement('nve-workspace-panel-header');
      replacement.textContent = 'Alpha';
      panel.querySelector('nve-workspace-panel-header')!.replaceWith(replacement);
      await elementIsStable(workspace);
      await vi.waitFor(() =>
        expect(replacement.shadowRoot!.querySelector('.suffix')!.hasAttribute('inert')).toBe(false)
      );
      expect(
        replacement.shadowRoot!.querySelector<HTMLElement>('.label')!.getBoundingClientRect().width
      ).toBeGreaterThan(0);
      expect(panel.shadowRoot!.querySelector<HTMLElement>('.content')!.hidden).toBe(false);
    });
  });
});

describe('workspace live header labels', () => {
  let fixture: HTMLElement;

  afterEach(() => {
    removeFixture(fixture);
    vi.restoreAllMocks();
  });

  async function setup() {
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
    const workspace = fixture.querySelector<Workspace>('nve-workspace')!;
    await elementIsStable(workspace);
    return workspace;
  }

  it('updates localized close controls and live authored labels without changing the saved arrangement', async () => {
    const workspace = await setup();
    const saved = workspace.value;
    expect(workspace.i18n).toMatchObject({ close: 'close', move: 'move' });
    expect(workspace.shadowRoot!.querySelector('[data-drag-group]')!.getAttribute('aria-label')).toBe('move');
    workspace.i18n = { close: 'Fermer' };
    workspace.querySelector('nve-workspace-panel-header')!.textContent = 'Live Alpha';
    await vi.waitFor(() =>
      expect(workspace.shadowRoot!.querySelector('[data-panel="a"]')!.getAttribute('aria-label')).toBe('Live Alpha')
    );
    expect(workspace.shadowRoot!.querySelector('[data-close="a"]')!.getAttribute('aria-label')).toBe(
      'Fermer Live Alpha'
    );
    expect(workspace.value).toBe(saved);
  });
});

describe('workspace measured sizing', () => {
  const rows = JSON.stringify({
    version: 1,
    closed: [],
    root: {
      type: 'split',
      axis: 'vertical',
      weights: [1, 1],
      children: ['a', 'b'].map(id => ({ type: 'group', panels: [id], active: id }))
    }
  });

  let fixture: HTMLElement;

  afterEach(() => {
    removeFixture(fixture);
    vi.restoreAllMocks();
  });

  async function setup(value = '') {
    fixture = await createFixture(html`
      <nve-workspace groupable rearrangeable closable .value=${value} style="width:260px;height:180px">
        <nve-workspace-panel id="a">
          <nve-workspace-panel-header>Alpha</nve-workspace-panel-header>
          <input value="persistent" />
        </nve-workspace-panel>
        <nve-workspace-panel id="b"> <nve-workspace-panel-header>Beta</nve-workspace-panel-header>Beta content</nve-workspace-panel>
      </nve-workspace>
    `);
    const workspace = fixture.querySelector<Workspace>('nve-workspace')!;
    await elementIsStable(workspace);
    return workspace;
  }

  it('fills a start-aligned column while honoring an explicit width', async () => {
    const workspace = await setup();
    fixture.style.cssText = 'display:flex;flex-direction:column;align-items:start;width:600px';
    workspace.style.removeProperty('width');
    await vi.waitFor(() => expect(workspace.offsetWidth).toBe(600));
    fixture.style.width = '480px';
    await vi.waitFor(() => expect(workspace.offsetWidth).toBe(480));
    workspace.style.width = '260px';
    await vi.waitFor(() => expect(workspace.offsetWidth).toBe(260));
    expect(workspace.offsetHeight).toBe(180);
  });

  it('responds to direct requirement changes without changing saved state or application nodes', async () => {
    const workspace = await setup(rows);
    const a = workspace.querySelector<WorkspacePanel>('#a')!;
    const b = workspace.querySelector<WorkspacePanel>('#b')!;
    expect(a.minWidth).toBe(0);
    expect(a.minHeight).toBe(0);
    const saved = workspace.value;
    const input = a.querySelector('input')!;
    const change = vi.fn();
    workspace.addEventListener('change', change);
    a.minHeight = 110;
    b.minHeight = 110;
    await vi.waitFor(() => expect(workspace.shadowRoot!.querySelector<HTMLElement>('.canvas')!.offsetHeight).toBe(226));
    expect(a.getAttribute('min-height')).toBe('110');
    workspace.style.height = '300px';
    await vi.waitFor(() => expect(workspace.shadowRoot!.querySelector<HTMLElement>('.canvas')!.offsetHeight).toBe(300));
    expect(workspace.value).toBe(saved);
    expect(change).not.toHaveBeenCalled();
    expect(a.querySelector('input')).toBe(input);
  });

  it('settles fractional container sizing without scrollbar-driven updates', async () => {
    const workspace = await setup();
    const viewport = workspace.shadowRoot!.querySelector<HTMLElement>('.viewport')!;
    const canvas = workspace.shadowRoot!.querySelector<HTMLElement>('.canvas')!;
    const scrollbars = document.createElement('style');
    scrollbars.textContent = '.viewport::-webkit-scrollbar { display: block; width: 15px; height: 15px; }';
    workspace.shadowRoot!.append(scrollbars);
    const requestUpdate = workspace.requestUpdate.bind(workspace);
    let updates = 0;
    vi.spyOn(workspace, 'requestUpdate').mockImplementation((...args) => {
      // Disconnect a runaway fixture so the regression fails without freezing the runner.
      if (++updates === 25) workspace.remove();
      return requestUpdate(...args);
    });
    workspace.style.width = '260.625px';
    workspace.value = JSON.stringify({
      version: 1,
      closed: ['b'],
      root: { type: 'group', panels: ['a', 'b'], active: 'b' }
    });
    const saved = workspace.value;
    const changed = vi.fn();
    workspace.addEventListener('change', changed);
    await elementIsStable(workspace);
    expect(workspace.isConnected).toBe(true);
    expect(updates).toBeLessThan(25);
    expect(canvas.offsetWidth).toBe(viewport.clientWidth);
    expect(canvas.offsetHeight).toBe(viewport.clientHeight);
    expect(viewport.scrollWidth).toBe(viewport.clientWidth);
    expect(viewport.scrollHeight).toBe(viewport.clientHeight);
    expect(workspace.value).toBe(saved);
    expect(changed).not.toHaveBeenCalled();
  });

  it('admits a repairing join and rejects another vertical split while constrained', async () => {
    const workspace = await setup(rows);
    for (const panel of workspace.querySelectorAll<WorkspacePanel>('nve-workspace-panel')) panel.minHeight = 110;
    await vi.waitFor(() => expect(workspace.shadowRoot!.querySelector<HTMLElement>('.canvas')!.offsetHeight).toBe(226));
    const changed = vi.fn();
    workspace.addEventListener('change', changed);
    const source = document.createElement('button');
    Object.assign(source, { placement: { operation: 'join', target: 'b' } });
    workspace.querySelector('#a')!.dispatchEvent(new CommandEvent('command', { command: '--place', source }));
    await elementIsStable(workspace);
    expect(workspace.shadowRoot!.querySelectorAll('nve-tabs.tab-track')).toHaveLength(1);
    expect(changed).toHaveBeenCalledOnce();
    const joined = workspace.value;
    Object.assign(source, { placement: { operation: 'split', target: 'b', position: 'top' } });
    workspace.querySelector('#a')!.dispatchEvent(new CommandEvent('command', { command: '--place', source }));
    await elementIsStable(workspace);
    expect(workspace.value).toBe(joined);
    expect(changed).toHaveBeenCalledOnce();
  });
});
