// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';
import '@nvidia-elements/core/workspace/define.js';
import type { Workspace } from './workspace.js';

describe('workspace accessibility', () => {
  let fixture: HTMLElement;

  afterEach(() => removeFixture(fixture));

  it('exposes its active panel and label', async () => {
    fixture = await createFixture(html`
      <nve-workspace style="height:250px">
        <nve-workspace-panel id="a"> <span slot="label">First</span>First content</nve-workspace-panel>
        <nve-workspace-panel id="b"> <span slot="label">Second</span>Second content</nve-workspace-panel>
      </nve-workspace>
    `);
    await elementIsStable(fixture.querySelector('nve-workspace'));
    const report = await runAxe(['nve-workspace']);
    expect(report.violations).toEqual([]);
  });

  it('exposes arrangement controls and omits hidden panels without built-in recovery', async () => {
    fixture = await createFixture(html`
      <nve-workspace rearrangeable closable resizable style="height:250px">
        <nve-workspace-panel id="a"> <span slot="label">First</span>First content</nve-workspace-panel>
        <nve-workspace-panel id="b"> <span slot="label">Second</span>Second content</nve-workspace-panel>
      </nve-workspace>
    `);
    const workspace = fixture.querySelector<Workspace>('nve-workspace')!;
    await elementIsStable(workspace);
    const saved = workspace.value;
    workspace.shadowRoot!.querySelector<HTMLButtonElement>('[data-move="a"]')!.click();
    await elementIsStable(workspace);
    await vi.waitFor(() => {
      const dropdown = workspace.shadowRoot!.querySelector('nve-dropdown')!;
      expect(getComputedStyle(dropdown).opacity).toBe('1');
    });
    expect((await runAxe(['nve-workspace'])).violations).toEqual([]);
    for (const operation of ['split', 'order', 'insert']) {
      const control = workspace.shadowRoot!.querySelector<HTMLSelectElement>('[data-operation]')!;
      control.value = operation;
      control.dispatchEvent(new Event('change', { bubbles: true }));
      await elementIsStable(workspace);
      expect((await runAxe(['nve-workspace'])).violations).toEqual([]);
    }
    const scope = workspace.shadowRoot!.querySelector<HTMLSelectElement>('[data-scope]')!;
    scope.value = 'workspace';
    scope.dispatchEvent(new Event('change', { bubbles: true }));
    await elementIsStable(workspace);
    expect((await runAxe(['nve-workspace'])).violations).toEqual([]);
    workspace.shadowRoot!.querySelector<HTMLElement>('[data-cancel]')!.click();
    workspace.shadowRoot!.querySelector<HTMLButtonElement>('[data-close="a"]')!.click();
    await elementIsStable(workspace);
    expect((await runAxe(['nve-workspace'])).violations).toEqual([]);
    expect(workspace.shadowRoot!.querySelector('.recovery, [data-reopen]')).toBeNull();
    workspace.value = saved;
    await elementIsStable(workspace);
    expect((await runAxe(['nve-workspace'])).violations).toEqual([]);
    workspace.value = JSON.stringify({
      version: 1,
      closed: [],
      root: {
        type: 'split',
        axis: 'horizontal',
        weights: [1, 1],
        children: ['a', 'b'].map(id => ({ type: 'pane', panels: [id], active: id }))
      }
    });
    await elementIsStable(workspace);
    expect(workspace.shadowRoot!.querySelector('nve-resize-handle')).not.toBeNull();
    expect((await runAxe(['nve-workspace'])).violations).toEqual([]);
  });
});
