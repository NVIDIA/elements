// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createFixture, elementIsStable, emulateClick, removeFixture } from '@internals/testing';
import type { Button } from '../button/button.js';
import type { Workspace } from './workspace.js';
import type { WorkspaceLayout, WorkspaceNode } from './workspace-layout.utils.js';
import {
  isWorkspacePlacement,
  resolveWorkspacePlacement,
  type WorkspaceCommandSource,
  type WorkspacePlacement
} from './workspace-command.utils.js';
import './define.js';
import '../button/define.js';

const pane = (...panels: string[]): WorkspaceNode => ({ type: 'pane', panels, active: panels.at(-1)! });
const split = (axis: 'horizontal' | 'vertical', weights: number[], ...children: WorkspaceNode[]): WorkspaceNode => ({
  type: 'split',
  axis,
  weights,
  children
});
const saved = (root: WorkspaceNode, closed: string[] = []): WorkspaceLayout => ({ version: 1, root, closed });
const nested = () =>
  saved(split('horizontal', [2, 3], pane('a', 'companion'), split('vertical', [1, 1], pane('b'), pane('c'))));
const peers = () => saved(split('horizontal', [2, 5, 3], pane('a'), pane('b'), pane('c')));

describe('workspace invoker commands', () => {
  let fixture: HTMLElement;

  afterEach(() => {
    removeFixture(fixture);
    vi.restoreAllMocks();
  });

  async function setup(layout = nested()) {
    fixture = await createFixture(html`
      <div>
        <nve-button id="invoker">Invoke</nve-button>
        <nve-workspace id="workspace" .value=${JSON.stringify(layout)} style="width:900px;height:500px">
          ${['a', 'companion', 'b', 'c'].map(
            id => html`
              <nve-workspace-panel id=${id}>
                <span slot="label">${id}</span>
                <input .value=${id} />
              </nve-workspace-panel>
            `
          )}
        </nve-workspace>
      </div>
    `);
    const workspace = fixture.querySelector<Workspace>('nve-workspace')!;
    const button = fixture.querySelector<Button & WorkspaceCommandSource>('nve-button')!;
    await elementIsStable(workspace);
    await vi.waitFor(() =>
      expect(workspace.shadowRoot!.querySelector<HTMLElement>('.tabs')!.offsetWidth).toBeGreaterThan(0)
    );
    const changed = vi.fn();
    workspace.addEventListener('workspacechange', changed);
    return { workspace, button, changed };
  }

  async function invoke(
    workspace: Workspace,
    button: Button & WorkspaceCommandSource,
    { command, anchor = 'a', placement }: { command: string; anchor?: string; placement?: WorkspacePlacement }
  ) {
    button.command = command;
    button.commandForElement = workspace.querySelector<HTMLElement>(`#${anchor}`);
    button.placement = placement;
    await emulateClick(button);
    await elementIsStable(workspace);
  }

  const value = (workspace: Workspace): WorkspaceLayout => JSON.parse(workspace.value);

  function control<T extends HTMLElement = HTMLButtonElement>(workspace: Workspace, selector: string) {
    return workspace.shadowRoot!.querySelector<T>(selector)!;
  }

  async function choose(workspace: Workspace, selector: string, next: string) {
    const select = control<HTMLSelectElement>(workspace, selector);
    select.value = next;
    select.dispatchEvent(new Event('change', { bubbles: true }));
    await elementIsStable(workspace);
  }

  describe('command targeting', () => {
    it('captures native nonbubbling direct-panel commands and leaves focus on the invoker', async () => {
      const { workspace, button, changed } = await setup();
      button.focus();
      await invoke(workspace, button, { command: '--select' });

      const root = value(workspace).root;
      if (root?.type !== 'split' || root.children[0]?.type !== 'pane') throw new Error('Expected pane');
      expect(root.children[0].active).toBe('a');
      expect(changed).toHaveBeenCalledOnce();
      expect(document.activeElement).toBe(button);
      await invoke(workspace, button, { command: '--select' });
      expect(changed).toHaveBeenCalledOnce();
    });

    it('supports workspace-target unary commands using only the invoker panel value', async () => {
      const { workspace, button, changed } = await setup();
      button.command = '--select';
      button.commandForElement = workspace;
      button.value = 'a';
      await emulateClick(button);
      await elementIsStable(workspace);
      expect(changed).toHaveBeenCalledOnce();
      button.value = 'missing';
      await emulateClick(button);
      expect(changed).toHaveBeenCalledOnce();
    });

    it('ignores commands targeted at nested application controls', async () => {
      const { workspace, button, changed } = await setup();
      const child = workspace.querySelector<HTMLInputElement>('#a input')!;
      button.commandForElement = child;
      button.command = '--close';
      workspace.closable = true;
      await emulateClick(button);
      await elementIsStable(workspace);
      expect(changed).not.toHaveBeenCalled();
      expect(value(workspace).closed).toEqual([]);
    });
  });

  describe('placement operations', () => {
    it('honors a self-target TAB index and keeps repeated placement silent without changing active preference', async () => {
      const { workspace, button, changed } = await setup(saved(pane('a', 'companion', 'b', 'c')));
      workspace.rearrangeable = true;
      await elementIsStable(workspace);
      const request = { command: '--place', placement: { operation: 'tab' as const, target: 'a', index: 4 } };
      await invoke(workspace, button, request);
      expect(value(workspace).root).toEqual({ type: 'pane', panels: ['companion', 'b', 'c', 'a'], active: 'c' });
      expect(changed).toHaveBeenCalledOnce();
      await invoke(workspace, button, request);
      expect(changed).toHaveBeenCalledOnce();
    });

    it('distinguishes same-axis SPLIT from ORDER with the same durable source and target', async () => {
      const { workspace, button, changed } = await setup(peers());
      workspace.rearrangeable = true;
      await elementIsStable(workspace);
      await invoke(workspace, button, {
        command: '--place',
        anchor: 'b',
        placement: { operation: 'split', target: 'a', position: 'left' }
      });
      const divided = value(workspace).root;
      if (divided?.type !== 'split') throw new Error('Expected split');
      expect(divided.children.slice(0, 2).map(node => node.type === 'pane' && node.panels[0])).toEqual(['b', 'a']);
      expect(divided.weights).not.toEqual([0.5, 0.2, 0.3]);
      expect(changed).toHaveBeenCalledOnce();
      workspace.value = JSON.stringify(peers());
      await elementIsStable(workspace);
      await invoke(workspace, button, {
        command: '--place',
        anchor: 'b',
        placement: { operation: 'order', target: 'a', position: 'before' }
      });
      const ordered = value(workspace).root;
      if (ordered?.type !== 'split') throw new Error('Expected peers');
      expect(ordered.weights).toEqual([0.5, 0.2, 0.3]);
      expect(changed).toHaveBeenCalledTimes(2);
    });

    it('inserts a tab beside its target arrangement with recipient-share weights', async () => {
      const { workspace, button, changed } = await setup(nested());
      workspace.rearrangeable = true;
      await invoke(workspace, button, {
        command: '--place',
        anchor: 'companion',
        placement: { operation: 'insert', scope: 'arrangement', target: 'c', position: 'right' }
      });
      const result = value(workspace);
      expect(result).toEqual(
        saved(
          split(
            'horizontal',
            expect.any(Array),
            pane('a'),
            split('vertical', [1 / 2, 1 / 2], pane('b'), pane('c')),
            pane('companion')
          )
        )
      );
      if (result.root?.type !== 'split') throw new Error('Expected owner');
      const weights = result.root.weights;
      expect(weights).toHaveLength(3);
      [4 / 15, 2 / 5, 1 / 3].forEach((weight, index) => expect(weights[index]).toBeCloseTo(weight, 10));
      expect(changed).toHaveBeenCalledOnce();
    });

    it('preserves the whole tabbed pane and traveling weights when ordering beside a peer arrangement', async () => {
      const { workspace, button } = await setup();
      workspace.rearrangeable = true;
      await invoke(workspace, button, {
        command: '--place',
        anchor: 'a',
        placement: {
          operation: 'order',
          source: 'pane',
          target: 'c',
          position: 'after'
        }
      });
      const root = value(workspace).root;
      if (root?.type !== 'split') throw new Error('Expected peers');
      expect(root.weights).toEqual([0.6, 0.4]);
      expect(root.children[1]).toEqual(pane('a', 'companion'));
    });

    it('inserts at workspace scope and joins at an explicit tab index', async () => {
      const { workspace, button, changed } = await setup();
      workspace.rearrangeable = true;
      await invoke(workspace, button, {
        command: '--place',
        anchor: 'companion',
        placement: {
          operation: 'insert',
          scope: 'workspace',
          position: 'top'
        }
      });
      const root = value(workspace).root;
      expect(root?.type === 'split' && root.axis).toBe('vertical');
      expect(root?.type === 'split' && root.children[0]).toEqual(pane('companion'));
      workspace.value = JSON.stringify(nested());
      await elementIsStable(workspace);
      await invoke(workspace, button, {
        command: '--place',
        anchor: 'companion',
        placement: { operation: 'tab', target: 'b', index: 0 }
      });
      const result = value(workspace).root;
      if (result?.type !== 'split' || result.children[1]?.type !== 'split') throw new Error('Expected column');
      expect(result.children[1].children[0]).toEqual({ type: 'pane', panels: ['companion', 'b'], active: 'companion' });
      expect(changed).toHaveBeenCalledTimes(2);
    });

    it('keeps a valid original ORDER no-op and invalid cross-owner ORDER silent', async () => {
      const { workspace, button, changed } = await setup();
      workspace.rearrangeable = true;
      const initial = workspace.value;
      await invoke(workspace, button, {
        command: '--place',
        anchor: 'b',
        placement: { operation: 'order', target: 'c', position: 'before' }
      });
      await invoke(workspace, button, {
        command: '--place',
        anchor: 'b',
        placement: { operation: 'order', target: 'a', position: 'before' }
      });
      expect(workspace.value).toBe(initial);
      expect(changed).not.toHaveBeenCalled();
    });
  });

  describe('capability gates', () => {
    it('honors independent capability gates while open activates and select never reopens', async () => {
      const { workspace, button, changed } = await setup();
      const original = workspace.value;
      await invoke(workspace, button, { command: '--close' });
      await invoke(workspace, button, {
        command: '--place',
        anchor: 'a',
        placement: { operation: 'split', target: 'b', position: 'left' }
      });
      await invoke(workspace, button, { command: '--arrange' });
      expect(workspace.value).toBe(original);
      expect(changed).not.toHaveBeenCalled();
      workspace.closable = true;
      await elementIsStable(workspace);
      await invoke(workspace, button, { command: '--close' });
      expect(value(workspace).closed).toEqual(['a']);
      expect(changed).toHaveBeenCalledTimes(1);
      await invoke(workspace, button, { command: '--select' });
      expect(value(workspace).closed).toEqual(['a']);
      expect(changed).toHaveBeenCalledTimes(1);
      await invoke(workspace, button, { command: '--open' });
      expect(value(workspace).closed).toEqual([]);
      expect(changed).toHaveBeenCalledTimes(2);
      const root = value(workspace).root;
      if (root?.type !== 'split' || root.children[0]?.type !== 'pane') throw new Error('Expected pane');
      expect(root.children[0].active).toBe('a');
      expect(workspace.querySelector('#a')!.hasAttribute('hidden')).toBe(false);
      await invoke(workspace, button, { command: '--open' });
      expect(changed).toHaveBeenCalledTimes(2);
    });

    it('accepts a native HTML invoker and closes arrangement actions when the capability is removed', async () => {
      const { workspace, button, changed } = await setup();
      const native: HTMLButtonElement & WorkspaceCommandSource = document.createElement('button');
      native.command = '--select';
      native.commandForElement = workspace.querySelector('#a');
      native.textContent = 'Select';
      fixture.append(native);
      await emulateClick(native);
      await elementIsStable(workspace);
      expect(changed).toHaveBeenCalledOnce();
      workspace.rearrangeable = true;
      await elementIsStable(workspace);
      await invoke(workspace, button, { command: '--arrange-pane' });
      await vi.waitFor(() => expect(control(workspace, '#workspace-actions').matches(':popover-open')).toBe(true));
      workspace.rearrangeable = false;
      await elementIsStable(workspace);
      expect(workspace.shadowRoot!.querySelector('#workspace-actions')).toBeNull();
      const initial = workspace.value;
      await invoke(workspace, button, {
        command: '--place',
        anchor: 'a',
        placement: { operation: 'insert', scope: 'workspace', position: 'bottom' }
      });
      expect(workspace.value).toBe(initial);
      expect(changed).toHaveBeenCalledOnce();
    });
  });

  describe('arrangement menus', () => {
    it('opens explicit pane actions and keeps their placement identical to the invoker result', async () => {
      const { workspace, button } = await setup();
      workspace.rearrangeable = true;
      await invoke(workspace, button, { command: '--arrange-pane' });
      await vi.waitFor(() => expect(control(workspace, '#workspace-actions').matches(':popover-open')).toBe(true));
      expect(control(workspace, '[data-move-panel]')).not.toBeNull();
      await choose(workspace, '[data-operation]', 'order');
      await choose(workspace, '[data-target]', 'c');
      await choose(workspace, '[data-position]', 'after');
      expect(control(workspace, '[data-apply]').hasAttribute('disabled')).toBe(false);
      control(workspace, '[data-apply]').click();
      await elementIsStable(workspace);
      const menu = workspace.value;
      workspace.value = JSON.stringify(nested());
      await elementIsStable(workspace);
      await invoke(workspace, button, {
        command: '--place',
        anchor: 'a',
        placement: {
          operation: 'order',
          source: 'pane',
          target: 'c',
          position: 'after'
        }
      });
      expect(workspace.value).toBe(menu);
    });

    it('lets the native action button toggle its dropdown without a second programmatic open', async () => {
      const { workspace, changed } = await setup();
      workspace.rearrangeable = true;
      await elementIsStable(workspace);
      const dropdown = control(workspace, '#workspace-actions');
      const show = vi.spyOn(dropdown, 'showPopover');
      const trigger = control(workspace, '[data-move="a"]');
      const initial = workspace.value;
      await emulateClick(trigger);
      await elementIsStable(workspace);
      expect(dropdown.matches(':popover-open')).toBe(true);
      expect(show).not.toHaveBeenCalled();
      expect(control(workspace, '[data-target]')).not.toBeNull();
      await emulateClick(trigger);
      await elementIsStable(workspace);
      expect(dropdown.matches(':popover-open')).toBe(false);
      expect(show).not.toHaveBeenCalled();
      expect(workspace.value).toBe(initial);
      expect(changed).not.toHaveBeenCalled();
    });

    it('contains nested control close events without dismissing arrangement actions', async () => {
      const { workspace, button, changed } = await setup();
      workspace.rearrangeable = true;
      await invoke(workspace, button, { command: '--arrange' });
      const dropdown = control(workspace, '#workspace-actions');
      await vi.waitFor(() => expect(dropdown.matches(':popover-open')).toBe(true));
      const closed = vi.fn();
      workspace.addEventListener('close', closed);
      const initial = workspace.value;
      control(workspace, '[data-operation]')
        .closest('nve-select')!
        .dispatchEvent(new CustomEvent('close', { bubbles: true, composed: true }));
      await elementIsStable(workspace);
      expect(dropdown.matches(':popover-open')).toBe(true);
      expect(closed).not.toHaveBeenCalled();
      expect(control(workspace, '[data-apply]').hasAttribute('disabled')).toBe(false);
      await emulateClick(control(workspace, '[data-cancel]'));
      await vi.waitFor(() => expect(dropdown.matches(':popover-open')).toBe(false));
      await vi.waitFor(() => expect(closed).toHaveBeenCalledOnce());
      expect(workspace.value).toBe(initial);
      expect(changed).not.toHaveBeenCalled();
    });
  });

  describe('invalid placement requests', () => {
    it.each([
      { name: 'a nonfinite tab index', placement: { operation: 'tab', target: 'b', index: Number.NaN } },
      { name: 'a negative tab index', placement: { operation: 'tab', target: 'b', index: -1 } },
      { name: 'an invalid split direction', placement: { operation: 'split', target: 'b', position: 'diagonal' } },
      { name: 'an invalid insertion scope', placement: { operation: 'insert', scope: 'root', position: 'top' } },
      {
        name: 'a workspace insertion with a target',
        placement: { operation: 'insert', scope: 'workspace', target: 'b', position: 'top' }
      },
      {
        name: 'an invalid source mode',
        placement: { operation: 'split', source: 'group', target: 'b', position: 'left' }
      }
    ])('rejects $name without mutation', async ({ placement }) => {
      const { workspace, button, changed } = await setup();
      workspace.rearrangeable = true;
      button.command = '--place';
      button.commandForElement = workspace.querySelector('#a');
      Object.assign(button, { placement });
      const initial = workspace.value;
      await emulateClick(button);
      await elementIsStable(workspace);
      expect(workspace.value).toBe(initial);
      expect(changed).not.toHaveBeenCalled();
    });

    it('rejects an unavailable target without mutation', async () => {
      const { workspace, button, changed } = await setup();
      workspace.rearrangeable = true;
      const initial = workspace.value;
      await invoke(workspace, button, {
        command: '--place',
        anchor: 'a',
        placement: { operation: 'split', target: 'missing', position: 'left' }
      });
      expect(workspace.value).toBe(initial);
      expect(changed).not.toHaveBeenCalled();
    });

    it('rejects a closed target without mutation', async () => {
      const { workspace, button, changed } = await setup({ ...nested(), closed: ['b'] });
      workspace.rearrangeable = true;
      const initial = workspace.value;
      await invoke(workspace, button, {
        command: '--place',
        anchor: 'a',
        placement: { operation: 'tab', target: 'b' }
      });
      expect(workspace.value).toBe(initial);
      expect(changed).not.toHaveBeenCalled();
    });
  });

  describe('gesture interruption', () => {
    it('cancels an active carry before a real command mutation and retains application content', async () => {
      const { workspace, button, changed } = await setup();
      workspace.rearrangeable = true;
      workspace.closable = true;
      await elementIsStable(workspace);
      vi.spyOn(workspace, 'setPointerCapture').mockImplementation(() => {});
      const input = workspace.querySelector('#a input');
      const tab = control(workspace, '[data-panel="a"]');
      const box = tab.getBoundingClientRect();
      tab.dispatchEvent(
        new PointerEvent('pointerdown', {
          clientX: box.x + 20,
          clientY: box.y + 20,
          pointerId: 7,
          isPrimary: true,
          button: 0,
          bubbles: true,
          composed: true
        })
      );
      workspace.dispatchEvent(
        new PointerEvent('pointermove', {
          clientX: box.x + 20,
          clientY: box.y + 80,
          pointerId: 7,
          isPrimary: true,
          buttons: 1,
          bubbles: true,
          composed: true
        })
      );
      await vi.waitFor(() => expect(workspace.shadowRoot!.querySelector('[data-destination-ghost]')).not.toBeNull());
      await invoke(workspace, button, { command: '--close', anchor: 'b' });
      expect(workspace.shadowRoot!.querySelector('[data-destination-ghost]')).toBeNull();
      expect(changed).toHaveBeenCalledOnce();
      expect(workspace.querySelector('#a input')).toBe(input);
      expect(value(workspace).closed).toEqual(['b']);
    });
  });
});

describe('workspace placement command validation', () => {
  it('uses a real panel named root independently from explicit workspace scope', () => {
    const layout = saved(split('horizontal', [1, 1], pane('root'), pane('a', 'companion')));
    const request = resolveWorkspacePlacement({
      layout,
      available: ['root', 'a', 'companion'],
      anchor: 'companion',
      placement: { operation: 'split', target: 'root', position: 'right' }
    });
    expect(request?.intent).toEqual({ kind: 'split', destination: { target: 'root', position: 'right' } });
    expect(isWorkspacePlacement({ operation: 'insert', scope: 'workspace', position: 'top' })).toBe(true);
  });
});
