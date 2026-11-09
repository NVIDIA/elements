// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createFixture, elementIsStable, removeFixture } from '@internals/testing';

import { getPanelMembershipKey } from './utils/model/membership.utils.js';
import { preparePreviewBoundaries } from './utils/presentation/preview.utils.js';

import type { WorkspaceLayout } from './utils/model/layout.utils.js';
import type { Workspace } from './workspace.js';

import './define.js';

vi.mock('./utils/presentation/preview.utils.js', { spy: true });

function pointer(type: string, x: number, y: number) {
  return new PointerEvent(type, {
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
}

function arrangement(singleGroup: boolean): WorkspaceLayout {
  return {
    version: 1,
    closed: [],
    root: singleGroup
      ? { type: 'group', panels: ['a', 'a2', 'b', 'b2', 'c'], active: 'a' }
      : {
          type: 'split',
          axis: 'horizontal',
          children: [
            { type: 'group', panels: ['a', 'a2'], active: 'a' },
            { type: 'group', panels: ['b', 'b2'], active: 'b' },
            { type: 'group', panels: ['c'], active: 'c' }
          ],
          weights: [1, 1, 1]
        }
  };
}

describe('workspace previews', () => {
  let fixture: HTMLElement | undefined;

  afterEach(() => {
    if (fixture) removeFixture(fixture);
    fixture = undefined;
    vi.restoreAllMocks();
  });

  async function setup(singleGroup = false) {
    fixture = await createFixture(html`
      <nve-workspace groupable rearrangeable .value=${JSON.stringify(arrangement(singleGroup))} style="width:900px;height:300px">
        <nve-workspace-panel id="a"><nve-workspace-panel-header>Alpha</nve-workspace-panel-header></nve-workspace-panel>
        <nve-workspace-panel id="a2"><nve-workspace-panel-header>Second alpha</nve-workspace-panel-header><input value="retained" /></nve-workspace-panel>
        <nve-workspace-panel id="b"><nve-workspace-panel-header>Beta</nve-workspace-panel-header></nve-workspace-panel>
        <nve-workspace-panel id="b2"><nve-workspace-panel-header>Second beta</nve-workspace-panel-header></nve-workspace-panel>
        <nve-workspace-panel id="c"><nve-workspace-panel-header>Gamma</nve-workspace-panel-header></nve-workspace-panel>
      </nve-workspace>
    `);
    const workspace = fixture.querySelector<Workspace>('nve-workspace')!;
    await elementIsStable(workspace);
    vi.spyOn(workspace, 'setPointerCapture').mockImplementation(() => {});
    vi.mocked(preparePreviewBoundaries).mockClear();
    return workspace;
  }

  function phase(workspace: Workspace) {
    return workspace.shadowRoot!.querySelector('[data-destination-ghost]')?.getAttribute('data-drag-phase');
  }

  function boundaries(workspace: Workspace) {
    return [...workspace.shadowRoot!.querySelectorAll('[data-scope-boundary]')].map(boundary => ({
      key: boundary.getAttribute('data-scope-boundary'),
      style: boundary.getAttribute('style')
    }));
  }

  function boundaryPreparations() {
    return vi.mocked(preparePreviewBoundaries).mock.calls.length;
  }

  async function rerender(workspace: Workspace) {
    workspace.requestUpdate();
    await elementIsStable(workspace);
  }

  async function detach(workspace: Workspace, selector = '[data-panel="a2"]') {
    const tab = workspace.shadowRoot!.querySelector<HTMLElement>(selector)!;
    const rect = tab.getBoundingClientRect();
    tab.dispatchEvent(pointer('pointerdown', rect.x + rect.width / 2, rect.y + rect.height / 2));
    const bounds = workspace.getBoundingClientRect();
    workspace.dispatchEvent(pointer('pointermove', bounds.x + 450, bounds.y + 150));
    await vi.waitFor(() => expect(phase(workspace)).toBe('detached'));
    await elementIsStable(workspace);
  }

  async function cancel(workspace: Workspace) {
    workspace.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    workspace.dispatchEvent(pointer('pointerup', 450, 150));
    await vi.waitFor(() => expect(phase(workspace)).toBeUndefined());
    await elementIsStable(workspace);
  }

  it('refreshes close labels and the carried title after authored text changes', async () => {
    const workspace = await setup();
    workspace.closable = true;
    await elementIsStable(workspace);
    const header = workspace.querySelector('#a2 > nve-workspace-panel-header')!;
    const getCloseLabel = () => workspace.shadowRoot!.querySelector('[data-close="a2"]')!.getAttribute('aria-label');

    expect(getCloseLabel()).toContain('Second alpha');
    header.textContent = 'Revised alpha';
    await vi.waitFor(() => expect(getCloseLabel()).toContain('Revised alpha'));
    await detach(workspace);
    expect(workspace.shadowRoot!.querySelector('[data-carried-ghost]')!.textContent).toBe('Revised alpha');

    header.textContent = 'Latest alpha';
    await vi.waitFor(() =>
      expect(workspace.shadowRoot!.querySelector('[data-carried-ghost]')!.textContent).toBe('Latest alpha')
    );
    expect(phase(workspace)).toBe('detached');
    await cancel(workspace);
  });

  it.each(['id', 'slot'])('keeps a detached drag active when the workspace %s changes', async attribute => {
    const workspace = await setup();
    const saved = workspace.value;
    await detach(workspace);

    workspace.setAttribute(attribute, 'changed');
    await Promise.resolve();
    await elementIsStable(workspace);
    expect(phase(workspace)).toBe('detached');

    await cancel(workspace);
    expect(workspace.value).toBe(saved);
  });

  it('uses the visible source ID when its title and saved active panel are unavailable', async () => {
    const workspace = await setup();
    const layout = JSON.parse(workspace.value);
    layout.root.children[0].panels.push('unavailable');
    layout.root.children[0].active = 'unavailable';
    workspace.value = JSON.stringify(layout);
    workspace.querySelector('#a > nve-workspace-panel-header')!.remove();
    await elementIsStable(workspace);
    const saved = workspace.value;

    await detach(workspace, '[data-drag-group="a"]');
    expect(workspace.shadowRoot!.querySelector('[data-carried-ghost]')!.textContent).toBe('a');
    await cancel(workspace);
    expect(workspace.value).toBe(saved);
  });

  it.each([
    { result: 'populated', empty: false },
    { result: 'empty', empty: true }
  ])('reuses $result boundaries across stable detached rerenders', async ({ empty }) => {
    const workspace = await setup(empty);
    await detach(workspace, empty ? '[data-drag-group="a"]' : '[data-panel="a2"]');
    const prepared = boundaryPreparations();
    const initial = boundaries(workspace);
    expect(prepared).toBeGreaterThan(0);
    if (empty) expect(initial).toEqual([]);
    else expect(initial.length).toBeGreaterThan(0);

    await rerender(workspace);
    expect(boundaryPreparations()).toBe(prepared);
    expect(boundaries(workspace)).toEqual(initial);
    await cancel(workspace);
  });

  it('marks only the selected recipient boundary active across rerenders and target changes', async () => {
    const workspace = await setup();
    await detach(workspace);
    const activeBoundaries = () =>
      [...workspace.shadowRoot!.querySelectorAll('[data-scope-boundary][data-active]')].map(boundary =>
        boundary.getAttribute('data-scope-boundary')
      );
    expect(activeBoundaries()).toEqual([getPanelMembershipKey(['b', 'b2'])]);
    await rerender(workspace);
    expect(activeBoundaries()).toEqual([getPanelMembershipKey(['b', 'b2'])]);

    const recipient = workspace.querySelector('#c')!.getBoundingClientRect();
    workspace.dispatchEvent(
      pointer('pointermove', recipient.x + recipient.width / 2, recipient.y + recipient.height / 2)
    );
    await vi.waitFor(() => expect(activeBoundaries()).toEqual([getPanelMembershipKey(['c'])]));
    await elementIsStable(workspace);
    await rerender(workspace);
    expect(activeBoundaries()).toEqual([getPanelMembershipKey(['c'])]);
    await cancel(workspace);
  });

  it('rebuilds boundaries when authored chrome changes and restores their original geometry', async () => {
    const workspace = await setup();
    await detach(workspace);
    const initial = boundaries(workspace);
    const prepared = boundaryPreparations();
    const header = workspace.querySelector('#b > nve-workspace-panel-header')!;
    const suffix = document.createElement('span');
    suffix.slot = 'suffix';
    suffix.style.cssText = 'display:inline-block;width:340px;height:1px';
    header.append(suffix);
    await vi.waitFor(() => expect(boundaryPreparations()).toBeGreaterThan(prepared));
    await elementIsStable(workspace);
    const changed = boundaryPreparations();
    expect(phase(workspace)).toBe('detached');
    expect(boundaries(workspace)).not.toEqual(initial);

    suffix.remove();
    await vi.waitFor(() => expect(boundaryPreparations()).toBeGreaterThan(changed));
    await elementIsStable(workspace);
    expect(boundaries(workspace)).toEqual(initial);
    const restored = boundaryPreparations();
    await rerender(workspace);
    expect(boundaryPreparations()).toBe(restored);
    await cancel(workspace);
  });

  it('rebuilds source-excluded boundaries for a different carried tab', async () => {
    const workspace = await setup();
    await detach(workspace);
    expect(boundaries(workspace).map(boundary => boundary.key)).toContain(getPanelMembershipKey(['a']));
    await cancel(workspace);
    const prepared = boundaryPreparations();
    await detach(workspace, '[data-panel="b2"]');
    expect(boundaryPreparations()).toBeGreaterThan(prepared);
    expect(boundaries(workspace).map(boundary => boundary.key)).toContain(getPanelMembershipKey(['b']));
    expect(boundaries(workspace).map(boundary => boundary.key)).not.toContain(getPanelMembershipKey(['a']));
    await cancel(workspace);
  });

  it('prepares boundaries again after cancellation and disconnection', async () => {
    const workspace = await setup();
    await detach(workspace);
    const initial = boundaries(workspace);
    await cancel(workspace);
    expect(boundaries(workspace)).toEqual([]);
    const prepared = boundaryPreparations();
    await detach(workspace);
    expect(boundaryPreparations()).toBeGreaterThan(prepared);
    expect(boundaries(workspace)).toEqual(initial);

    workspace.remove();
    fixture!.append(workspace);
    await elementIsStable(workspace);
    await vi.waitFor(() => expect(phase(workspace)).toBeUndefined());
    const disconnected = boundaryPreparations();
    await detach(workspace);
    expect(boundaryPreparations()).toBeGreaterThan(disconnected);
    expect(boundaries(workspace)).toEqual(initial);
    await cancel(workspace);
  });
});
