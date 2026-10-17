// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import type { Workspace } from './workspace.js';
import type { WorkspacePanel } from './workspace-panel.js';
import { parseLayout } from './workspace-layout.utils.js';
import './define.js';

describe('workspace private presentation', () => {
  let fixture: HTMLElement;

  afterEach(() => {
    removeFixture(fixture);
    vi.restoreAllMocks();
  });

  async function setup() {
    fixture = await createFixture(html`
      <nve-workspace closable rearrangeable style="height:220px;width:600px">
        <nve-workspace-panel id="a">
          <strong slot="label">Rich Alpha</strong>
          <input value="retained" />
        </nve-workspace-panel>
        <nve-workspace-panel id="b" hidden>
          <span slot="label">Beta</span>Application-hidden content</nve-workspace-panel
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
    workspace.shadowRoot!.querySelector<HTMLButtonElement>('[data-close="a"]')!.click();
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
    const snapshot = parseLayout(workspace.value);
    workspace.value = JSON.stringify({ ...snapshot, closed: [] });
    await elementIsStable(workspace);
    expect(setter).toHaveBeenCalledOnce();
    expect(panel.matches(':state(workspace-presented)')).toBe(true);
    expect(getComputedStyle(panel).display).toBe('block');
    expect(panel.querySelector('input')).toBe(input);
  });

  it('retains application-native hidden without importing it into the canonical closed state', async () => {
    const workspace = await setup();
    const panel = workspace.querySelector<WorkspacePanel>('#b')!;
    const setter = vi.spyOn(panel, 'hidden', 'set');
    expect(panel.hidden).toBe(true);
    expect(panel.matches(':state(workspace-presented)')).toBe(true);
    expect(getComputedStyle(panel).display).toBe('none');
    const saved = workspace.value;
    workspace.shadowRoot!.querySelector<HTMLButtonElement>('[data-close="b"]')!.click();
    await elementIsStable(workspace);
    workspace.value = saved;
    await elementIsStable(workspace);
    expect(setter).not.toHaveBeenCalled();
    expect(panel.hidden).toBe(true);
    expect(parseLayout(workspace.value).closed).toEqual([]);
    expect(getComputedStyle(panel).display).toBe('none');
  });

  it('isolates overshooting preview geometry from viewport scroll extents and allocation', async () => {
    const workspace = await setup();
    const viewport = workspace.shadowRoot!.querySelector<HTMLElement>('.viewport')!;
    const canvas = workspace.shadowRoot!.querySelector<HTMLElement>('.canvas')!;
    const extents = () => [viewport.clientWidth, viewport.clientHeight, viewport.scrollWidth, viewport.scrollHeight];
    const before = extents();
    const allocation = [canvas.style.width, canvas.style.height];
    const saved = workspace.value;
    const ghost = document.createElement('nve-ghost');
    ghost.className = 'destination';
    ghost.style.cssText = 'transform:translate(550px,200px);width:600px;height:220px;transition:none';
    workspace.shadowRoot!.querySelector('.preview-layer')!.append(ghost);
    expect(ghost.getBoundingClientRect().right).toBeGreaterThan(viewport.getBoundingClientRect().right);
    expect(ghost.getBoundingClientRect().bottom).toBeGreaterThan(viewport.getBoundingClientRect().bottom);
    expect(extents()).toEqual(before);
    workspace.requestUpdate();
    await elementIsStable(workspace);
    expect(extents()).toEqual(before);
    expect([canvas.style.width, canvas.style.height]).toEqual(allocation);
    expect(workspace.value).toBe(saved);
  });

  it('updates localized native controls and live authored label names without changing the saved arrangement', async () => {
    const workspace = await setup();
    const saved = workspace.value;
    workspace.i18n = {
      workspaceArrange: 'Organiser',
      workspaceDestination: 'Destination locale',
      workspaceMove: 'Déplacer'
    };
    workspace.querySelector('[slot="label"]')!.textContent = 'Live Alpha';
    await vi.waitFor(() =>
      expect(workspace.shadowRoot!.querySelector('[data-move="a"]')!.getAttribute('aria-label')).toBe(
        'Organiser Live Alpha'
      )
    );
    expect(workspace.shadowRoot!.querySelector('[data-panel="a"]')!.getAttribute('aria-label')).toBe('Live Alpha');
    workspace.shadowRoot!.querySelector<HTMLButtonElement>('[data-move="a"]')!.click();
    await elementIsStable(workspace);
    expect(workspace.shadowRoot!.querySelector('[data-target]')!.getAttribute('aria-label')).toBe('Destination locale');
    expect(workspace.value).toBe(saved);
  });
});
