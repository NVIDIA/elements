// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createFixture, elementIsStable, removeFixture } from '@internals/testing';

import { WorkspaceFullscreenController } from './controllers/workspace-fullscreen.controller.js';
import { WorkspaceRearrangeController } from './controllers/workspace-rearrange.controller.js';
import { WorkspaceResizeController } from './controllers/workspace-resize.controller.js';
import { parseWorkspaceValue } from './utils/model/value.utils.js';

import { Workspace } from './workspace.js';

import type { WorkspaceLayout } from './utils/model/layout.utils.js';

import type { WorkspacePanel } from './panel/panel.js';

import './define.js';
import '@nvidia-elements/core/ghost/define.js';

describe(Workspace.metadata.tag, () => {
  const arrangement = JSON.stringify({
    version: 1,
    closed: [],
    root: {
      type: 'split',
      axis: 'horizontal',
      weights: [1, 1, 1],
      children: ['a', 'b', 'c'].map(id => ({ type: 'group', panels: [id], active: id }))
    }
  });

  let fixture: HTMLElement | undefined;

  afterEach(() => {
    if (fixture) removeFixture(fixture);
    fixture = undefined;
    vi.restoreAllMocks();
  });

  async function setup() {
    fixture = await createFixture(html`
      <nve-workspace style="width:912px;height:250px" .value=${arrangement}>
        <nve-workspace-panel id="a" min-width="120"
          ><nve-workspace-panel-header>A</nve-workspace-panel-header><input value="retained"
        /></nve-workspace-panel>
        <nve-workspace-panel id="b" min-width="250"><nve-workspace-panel-header>B</nve-workspace-panel-header>Content B</nve-workspace-panel>
        <nve-workspace-panel id="c" min-width="120"><nve-workspace-panel-header>C</nve-workspace-panel-header>Content C</nve-workspace-panel>
      </nve-workspace>
    `);
    const workspace = fixture.querySelector<Workspace>('nve-workspace')!;
    await elementIsStable(workspace);
    await vi.waitFor(() => expect(workspace.querySelector('#a')!.getBoundingClientRect().width).toBeCloseTo(300));
    return workspace;
  }

  it('keeps grouping opt-in and reflects explicit changes', async () => {
    const workspace = await setup();
    expect(workspace.groupable).toBe(false);
    expect(workspace.hasAttribute('groupable')).toBe(false);
    workspace.groupable = true;
    await elementIsStable(workspace);
    expect(workspace.hasAttribute('groupable')).toBe(true);
    workspace.removeAttribute('groupable');
    await elementIsStable(workspace);
    expect(workspace.groupable).toBe(false);
  });

  it('announces committed values without intercepting changes from application content', async () => {
    const workspace = await setup();
    workspace.closable = true;
    await elementIsStable(workspace);
    const before = workspace.value;
    const observed = vi.fn();
    const committed = vi.fn();
    workspace.addEventListener('change', observed);
    workspace.addEventListener('change', event => {
      if (event.target !== workspace) return;
      committed(workspace.value);
    });
    const input = workspace.querySelector('input')!;
    input.dispatchEvent(new Event('change', { bubbles: true }));
    expect(observed).toHaveBeenCalledOnce();
    expect(observed.mock.calls[0]![0].target).toBe(input);
    expect(committed).not.toHaveBeenCalled();
    workspace.shadowRoot!.querySelector<HTMLElement>('[data-close="a"]')!.click();
    await elementIsStable(workspace);
    expect(committed).toHaveBeenCalledExactlyOnceWith(workspace.value);
    expect(workspace.value).not.toBe(before);
    const event = observed.mock.calls[1]![0];
    expect(event.target).toBe(workspace);
    expect(event.bubbles).toBe(true);
    expect(event.composed).toBe(true);
    expect(event.cancelable).toBe(false);
    expect(event).not.toBeInstanceOf(CustomEvent);
  });

  describe('layout restoration and container sizing', () => {
    it('should reject invalid restoration without replacing a valid arrangement', async () => {
      const workspace = await setup();
      const value = workspace.value;
      expect(() => {
        workspace.value = '{"version":2}';
      }).toThrow();
      expect(workspace.value).toBe(value);
    });

    it('publishes restored and cleared values synchronously without announcing a change', async () => {
      const workspace = await setup();
      const change = vi.fn();
      workspace.addEventListener('change', change);
      const target = JSON.stringify({
        version: 1,
        root: { type: 'group', panels: ['a', 'b', 'c'], active: 'b' },
        closed: []
      });
      workspace.value = target;
      expect(workspace.value).toBe(target);
      await elementIsStable(workspace);
      expect(workspace.value).toBe(target);
      expect(change).not.toHaveBeenCalled();
      workspace.value = '';
      expect(workspace.value).toBe('');
      expect(change).not.toHaveBeenCalled();
    });

    it('reuses the serialized value for repeated reads', async () => {
      const workspace = await setup();
      const value = workspace.value;
      const stringify = vi.spyOn(JSON, 'stringify');
      expect(workspace.value).toBe(value);
      expect(workspace.value).toBe(value);
      expect(stringify).not.toHaveBeenCalled();
    });

    it('should preserve the saved preference and focused supplied input through constrained container sizing', async () => {
      const workspace = await setup();
      const value = workspace.value;
      const change = vi.fn();
      workspace.addEventListener('change', change);
      const input = workspace.querySelector('input')!;
      input.value = 'edited';
      input.focus();
      workspace.style.width = '350px';
      await vi.waitFor(() => expect(workspace.querySelector('#a')!.getBoundingClientRect().width).toBeCloseTo(120));
      expect(document.activeElement).toBe(input);
      expect(input.parentElement).toBe(workspace.querySelector('#a'));
      expect(input.value).toBe('edited');
      expect(workspace.value).toBe(value);
      workspace.style.width = '912px';
      await vi.waitFor(() => expect(workspace.querySelector('#a')!.getBoundingClientRect().width).toBeCloseTo(300));
      expect(change).not.toHaveBeenCalled();
    });
  });

  describe('selection and supplied content', () => {
    it('should keep authored label and content nodes through regrouping and keyboard selection', async () => {
      const workspace = await setup();
      const panel = workspace.querySelector('#a')!;
      const label = panel.querySelector('nve-workspace-panel-header')!;
      const input = panel.querySelector('input')!;
      input.value = 'edited';
      workspace.value = JSON.stringify({
        version: 1,
        closed: [],
        root: { type: 'group', panels: ['a', 'b', 'c'], active: 'a' }
      });
      await elementIsStable(workspace);
      const tab = workspace.shadowRoot!.querySelector<HTMLElement>('[data-panel="a"]')!;
      tab.focus();
      tab.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowRight', code: 'ArrowRight', bubbles: true, composed: true })
      );
      await elementIsStable(workspace);
      expect(workspace.shadowRoot!.activeElement).toBe(workspace.shadowRoot!.querySelector('[data-panel="b"]'));
      expect(workspace.shadowRoot!.querySelector('[data-panel="b"]')!.hasAttribute('selected')).toBe(true);
      expect(panel.querySelector('nve-workspace-panel-header')).toBe(label);
      expect(panel.querySelector('input')).toBe(input);
      expect(input.parentElement).toBe(panel);
      expect(input.value).toBe('edited');
      expect(panel.shadowRoot!.querySelector('.content')!.hasAttribute('hidden')).toBe(true);
    });

    it('should announce changed selection once and keep selected clicks and Home silent', async () => {
      const workspace = await setup();
      workspace.value = JSON.stringify({
        version: 1,
        closed: [],
        root: { type: 'group', panels: ['a', 'b', 'c'], active: 'a' }
      });
      await elementIsStable(workspace);
      const change = vi.fn();
      workspace.addEventListener('change', change);
      const first = workspace.shadowRoot!.querySelector<HTMLElement>('[data-panel="a"]')!;
      first.click();
      first.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', code: 'Home', bubbles: true, composed: true }));
      await elementIsStable(workspace);
      expect(change).not.toHaveBeenCalled();
      const next = workspace.shadowRoot!.querySelector<HTMLElement>('[data-panel="b"]')!;
      next.click();
      await elementIsStable(workspace);
      expect(next.hasAttribute('selected')).toBe(true);
      expect(change).toHaveBeenCalledOnce();
      next.click();
      await elementIsStable(workspace);
      expect(change).toHaveBeenCalledOnce();
    });
  });

  it('pairs controller document listeners across adoption while the host is disconnected', () => {
    const registered = vi.spyOn(Workspace.prototype, 'addController');
    const workspace = document.createElement('nve-workspace');
    const controllers = registered.mock.calls
      .map(([controller]) => controller)
      .filter(
        (
          controller
        ): controller is WorkspaceRearrangeController | WorkspaceResizeController | WorkspaceFullscreenController =>
          controller instanceof WorkspaceRearrangeController ||
          controller instanceof WorkspaceResizeController ||
          controller instanceof WorkspaceFullscreenController
      );
    try {
      expect(controllers).toHaveLength(3);
      const added = vi.spyOn(document, 'addEventListener');
      for (const controller of controllers) controller.hostConnected();
      const registrations = [...added.mock.calls];
      expect(registrations.map(([type]) => type).sort()).toEqual([
        'fullscreenchange',
        'keydown',
        'keydown',
        'pointerdown'
      ]);
      const removed = vi.spyOn(document, 'removeEventListener');
      const destination = document.implementation.createHTMLDocument();
      destination.adoptNode(workspace);
      for (const controller of controllers) controller.hostDisconnected();
      for (const registration of registrations) expect(removed).toHaveBeenCalledWith(...registration);
      const next = vi.spyOn(destination, 'addEventListener');
      for (const controller of controllers) controller.hostConnected();
      for (const registration of registrations) expect(next).toHaveBeenCalledWith(...registration);
    } finally {
      for (const controller of controllers) controller.hostDisconnected();
    }
  });
});

describe('workspace supplied panel reconciliation', () => {
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

  afterEach(() => {
    if (fixture) removeFixture(fixture);
  });

  async function setup(value = arrangement) {
    fixture = await createFixture(html`
      <nve-workspace style="width:806px;height:320px" groupable rearrangeable closable resizable .value=${value}>
        <nve-workspace-panel id="a"><nve-workspace-panel-header>Alpha</nve-workspace-panel-header><input value="retained" /></nve-workspace-panel>
        <nve-workspace-panel id="b"><nve-workspace-panel-header>Beta</nve-workspace-panel-header>Content B</nve-workspace-panel>
        <nve-workspace-panel id="c"><nve-workspace-panel-header>Gamma</nve-workspace-panel-header>Content C</nve-workspace-panel>
        <nve-workspace-panel id="d"><nve-workspace-panel-header>Delta</nve-workspace-panel-header>Content D</nve-workspace-panel>
      </nve-workspace>
    `);
    const workspace = fixture.querySelector<Workspace>('nve-workspace')!;
    await elementIsStable(workspace);
    return workspace;
  }

  function control<T extends HTMLElement = HTMLElement>(workspace: Workspace, selector: string): T {
    const element = workspace.shadowRoot!.querySelector<T>(selector);
    expect(element, selector).not.toBeNull();
    return element!;
  }

  function snapshot(workspace: Workspace): WorkspaceLayout {
    return JSON.parse(workspace.value);
  }

  it('should retain missing identities and selected preference while a panel is removed and restored', async () => {
    const workspace = await setup();
    const before = workspace.value;
    const panel = workspace.querySelector('#a')!;
    const change = vi.fn();
    workspace.addEventListener('change', change);
    panel.remove();
    await vi.waitFor(() => expect(workspace.shadowRoot!.querySelector('[data-panel="a"]')).toBeNull());
    expect(workspace.querySelector('#b')!.getAttribute('aria-hidden')).toBe('false');
    expect(workspace.querySelector('#b')!.getAttribute('role')).toBe('group');
    expect(workspace.value).toBe(before);
    workspace.append(panel);
    await vi.waitFor(() => expect(control(workspace, '[data-panel="a"]').hasAttribute('selected')).toBe(true));
    expect(workspace.value).toBe(before);
    expect(change).not.toHaveBeenCalled();
  });

  it('should announce a newly appended panel once while closed identities remain closed', async () => {
    const workspace = await setup();
    control(workspace, '[data-close="a"]').click();
    await elementIsStable(workspace);
    const change = vi.fn();
    workspace.addEventListener('change', change);
    const panel = document.createElement('nve-workspace-panel');
    panel.id = 'new-panel';
    panel.textContent = 'New content';
    workspace.append(panel);
    await vi.waitFor(() => expect(change).toHaveBeenCalledOnce());
    await elementIsStable(workspace);
    expect(snapshot(workspace).closed).toEqual(['a']);
    expect(workspace.shadowRoot!.querySelector('[data-panel="a"]')).toBeNull();
    expect(control(workspace, '[data-panel="new-panel"]')).toBeDefined();
    panel.remove();
    await elementIsStable(workspace);
    workspace.append(panel);
    await elementIsStable(workspace);
    expect(change).toHaveBeenCalledOnce();
  });

  it('should keep delayed closed panels closed when restoring an all-closed layout', async () => {
    const workspace = await setup();
    const change = vi.fn();
    workspace.addEventListener('change', change);
    workspace.value = JSON.stringify({
      version: 1,
      root: { type: 'group', panels: ['a', 'b', 'c', 'd', 'later'], active: 'later' },
      closed: ['a', 'b', 'c', 'd', 'later']
    });
    await elementIsStable(workspace);
    const panel = document.createElement('nve-workspace-panel');
    panel.id = 'later';
    workspace.append(panel);
    await elementIsStable(workspace);
    expect(snapshot(workspace).closed).toContain('later');
    expect(panel.hidden).toBe(false);
    expect(panel.matches(':state(workspace-presented)')).toBe(false);
    expect(getComputedStyle(panel).display).toBe('none');
    expect(workspace.shadowRoot!.querySelector('nve-tabs-item[data-panel]')).toBeNull();
    expect(change).not.toHaveBeenCalled();
  });
});

describe('workspace supplied content visibility', () => {
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

  it('suppresses closed flat-tree content without changing native hidden or light-DOM ownership', async () => {
    const workspace = await setup();
    const panel = workspace.querySelector<WorkspacePanel>('#a')!;
    const input = panel.querySelector('input')!;
    const setter = vi.spyOn(panel, 'hidden', 'set');
    const slot = panel.assignedSlot;
    workspace.shadowRoot!.querySelector<HTMLElement>('[data-close="a"]')!.click();
    await elementIsStable(workspace);
    panel.hidden = false;
    panel.style.display = 'block';
    expect(setter).toHaveBeenCalledOnce();
    expect(panel.matches(':state(workspace-presented)')).toBe(false);
    expect(getComputedStyle(panel).display).toBe('none');
    expect(panel.parentElement).toBe(workspace);
    expect(panel.assignedSlot).toBe(slot);
    expect(panel.querySelector('input')).toBe(input);
    expect(panel.hasAttribute('hidden')).toBe(false);
    const snapshot = parseWorkspaceValue(workspace.value);
    if (!snapshot) throw new Error('Expected a workspace layout');
    workspace.value = JSON.stringify({ ...snapshot, closed: [] });
    await elementIsStable(workspace);
    expect(setter).toHaveBeenCalledOnce();
    expect(panel.matches(':state(workspace-presented)')).toBe(true);
    expect(getComputedStyle(panel).display).toBe('block');
    expect(panel.querySelector('input')).toBe(input);
  });

  it('retains application-native hidden without importing it into the saved closed state', async () => {
    const workspace = await setup();
    const panel = workspace.querySelector<WorkspacePanel>('#b')!;
    const setter = vi.spyOn(panel, 'hidden', 'set');
    expect(panel.hidden).toBe(true);
    expect(panel.matches(':state(workspace-presented)')).toBe(true);
    expect(getComputedStyle(panel).display).toBe('none');
    const saved = workspace.value;
    workspace.shadowRoot!.querySelector<HTMLElement>('[data-close="b"]')!.click();
    await elementIsStable(workspace);
    workspace.value = saved;
    await elementIsStable(workspace);
    expect(setter).not.toHaveBeenCalled();
    expect(panel.hidden).toBe(true);
    expect(parseWorkspaceValue(workspace.value)?.closed).toEqual([]);
    expect(getComputedStyle(panel).display).toBe('none');
  });
});
