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

const group = (...panels: string[]): WorkspaceNode => ({ type: 'group', panels, active: panels.at(-1)! });
const split = (axis: 'horizontal' | 'vertical', weights: number[], ...children: WorkspaceNode[]): WorkspaceNode => ({
  type: 'split',
  axis,
  weights,
  children
});
const saved = (root: WorkspaceNode, closed: string[] = []): WorkspaceLayout => ({ version: 1, root, closed });
const nested = () =>
  saved(split('horizontal', [2, 3], group('a', 'companion'), split('vertical', [1, 1], group('b'), group('c'))));
const peers = () => saved(split('horizontal', [2, 5, 3], group('a'), group('b'), group('c')));

describe('workspace placement command validation', () => {
  it('accepts panel and group sources and rejects the former pane source', () => {
    const placement = { operation: 'split', target: 'b', position: 'left' };
    for (const source of [undefined, 'panel', 'group'])
      expect(isWorkspacePlacement({ ...placement, source })).toBe(true);
    expect(isWorkspacePlacement({ ...placement, source: 'pane' })).toBe(false);
  });

  it('uses a real panel named root independently from explicit workspace scope', () => {
    const layout = saved(split('horizontal', [1, 1], group('root'), group('a', 'companion')));
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
                <nve-workspace-panel-header>${id}</nve-workspace-panel-header>
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

  function control<T extends HTMLElement = HTMLElement>(workspace: Workspace, selector: string) {
    return workspace.shadowRoot!.querySelector<T>(selector)!;
  }

  describe('command availability', () => {
    it('reads current capability flags without mutating the arrangement or emitting arrangement changes', async () => {
      const { workspace, changed } = await setup();
      const initial = workspace.value;
      const context = { value: 'a' };
      expect(workspace.isCommandAvailable('--close', context)).toBe(false);
      workspace.closable = true;
      expect(workspace.isCommandAvailable('--close', context)).toBe(true);
      workspace.closable = false;
      expect(workspace.isCommandAvailable('--close', context)).toBe(false);
      expect(workspace.isCommandAvailable('--unknown', context)).toBe(false);
      expect(workspace.isCommandAvailable('--close')).toBe(false);
      expect(workspace.isCommandAvailable('--close', { value: 'missing' })).toBe(false);
      expect(workspace.value).toBe(initial);
      expect(changed).not.toHaveBeenCalled();
    });

    it('distinguishes activation, reopening, and repeated commands', async () => {
      const { workspace, button } = await setup();
      workspace.closable = true;
      expect(workspace.isCommandAvailable('--select', { value: 'a' })).toBe(true);
      expect(workspace.isCommandAvailable('--open', { value: 'a' })).toBe(true);
      expect(workspace.isCommandAvailable('--select', { value: 'companion' })).toBe(false);
      await invoke(workspace, button, { command: '--select' });
      expect(workspace.isCommandAvailable('--select', { value: 'a' })).toBe(false);
      expect(workspace.isCommandAvailable('--open', { value: 'a' })).toBe(false);
      await invoke(workspace, button, { command: '--close' });
      expect(workspace.isCommandAvailable('--close', { value: 'a' })).toBe(false);
      expect(workspace.isCommandAvailable('--select', { value: 'a' })).toBe(false);
      expect(workspace.isCommandAvailable('--open', { value: 'a' })).toBe(true);
    });

    it('uses the same placement admission as execution and rechecks changed capabilities', async () => {
      const { workspace, button, changed } = await setup();
      const placement: WorkspacePlacement = { operation: 'split', target: 'b', position: 'left' };
      const context = { value: 'a', placement };
      expect(workspace.isCommandAvailable('--place', context)).toBe(false);
      workspace.rearrangeable = true;
      expect(workspace.isCommandAvailable('--place', context)).toBe(true);
      workspace.rearrangeable = false;
      const initial = workspace.value;
      await invoke(workspace, button, { command: '--place', placement });
      expect(workspace.value).toBe(initial);
      expect(changed).not.toHaveBeenCalled();
      workspace.rearrangeable = true;
      await invoke(workspace, button, { command: '--place', placement });
      expect(changed).toHaveBeenCalledOnce();
    });

    it('rejects unchanged placements and destinations that exceed panel minimums', async () => {
      const { workspace, changed } = await setup(peers());
      workspace.rearrangeable = true;
      expect(
        workspace.isCommandAvailable('--place', {
          value: 'b',
          placement: { operation: 'reorder', target: 'c', position: 'before' }
        })
      ).toBe(false);
      workspace.querySelector('nve-workspace-panel')!.setAttribute('min-height', '480');
      await elementIsStable(workspace);
      const initial = workspace.value;
      expect(
        workspace.isCommandAvailable('--place', {
          value: 'b',
          placement: { operation: 'split', target: 'a', position: 'top' }
        })
      ).toBe(false);
      expect(workspace.value).toBe(initial);
      expect(changed).not.toHaveBeenCalled();
    });
  });

  describe('command availability notifications', () => {
    it('batches capability changes into one payload-free notification', async () => {
      const { workspace, changed } = await setup();
      const available = vi.fn();
      workspace.addEventListener('commandavailabilitychange', available);
      workspace.closable = true;
      workspace.rearrangeable = true;
      workspace.closable = false;
      workspace.rearrangeable = false;
      await elementIsStable(workspace);
      expect(available).toHaveBeenCalledOnce();
      const event = available.mock.calls[0]![0] as Event;
      expect(event.bubbles).toBe(true);
      expect(event.composed).toBe(true);
      expect(event.cancelable).toBe(false);
      expect(event).not.toHaveProperty('detail');
      expect(changed).not.toHaveBeenCalled();
    });

    it('announces restoration without emitting an arrangement change', async () => {
      const { workspace, changed } = await setup();
      const answers: boolean[] = [];
      workspace.addEventListener('commandavailabilitychange', () => {
        answers.push(workspace.isCommandAvailable('--open', { value: 'a' }));
      });
      const restored = value(workspace);
      restored.closed = ['a'];
      workspace.value = JSON.stringify(restored);
      await elementIsStable(workspace);
      expect(answers.length).toBeGreaterThan(0);
      expect(answers.every(Boolean)).toBe(true);
      expect(changed).not.toHaveBeenCalled();
    });

    it('keeps unchanged assignments, queries, and unrelated updates quiet', async () => {
      const { workspace } = await setup();
      const available = vi.fn();
      workspace.addEventListener('commandavailabilitychange', available);
      workspace.value = workspace.value;
      workspace.isCommandAvailable('--open', { value: 'a' });
      workspace.requestUpdate();
      await elementIsStable(workspace);
      expect(available).not.toHaveBeenCalled();
    });

    it('allows a notification listener to schedule a subsequent capability change', async () => {
      const { workspace } = await setup();
      const answers: boolean[] = [];
      workspace.addEventListener('commandavailabilitychange', () => {
        answers.push(workspace.isCommandAvailable('--close', { value: 'a' }));
        if (workspace.closable) workspace.closable = false;
      });
      workspace.closable = true;
      await elementIsStable(workspace);
      expect(answers).toEqual([true, false]);
    });

    it('announces command commits', async () => {
      const { workspace, button } = await setup();
      workspace.closable = true;
      await elementIsStable(workspace);
      const available = vi.fn();
      workspace.addEventListener('commandavailabilitychange', available);
      await invoke(workspace, button, { command: '--close' });
      expect(available).toHaveBeenCalled();
      expect(workspace.isCommandAvailable('--open', { value: 'a' })).toBe(true);
    });

    it('announces supplied panel additions and removals after reconciliation', async () => {
      const { workspace } = await setup();
      const answers: boolean[] = [];
      workspace.addEventListener('commandavailabilitychange', () => {
        answers.push(workspace.isCommandAvailable('--open', { value: 'added' }));
      });
      const panel = document.createElement('nve-workspace-panel');
      panel.id = 'added';
      panel.innerHTML = '<nve-workspace-panel-header>Added</nve-workspace-panel-header>';
      workspace.append(panel);
      await elementIsStable(workspace);
      expect(answers.at(-1)).toBe(true);
      panel.remove();
      await elementIsStable(workspace);
      expect(answers.at(-1)).toBe(false);
    });

    it('announces panel constraint changes', async () => {
      const { workspace } = await setup();
      const available = vi.fn();
      workspace.addEventListener('commandavailabilitychange', available);
      workspace.querySelector('#b')!.setAttribute('min-height', '480');
      await elementIsStable(workspace);
      expect(available).toHaveBeenCalled();
    });

    it('announces changed viewport measurements', async () => {
      const { workspace } = await setup();
      const available = vi.fn();
      workspace.addEventListener('commandavailabilitychange', available);
      workspace.style.width = '600px';
      await vi.waitFor(() => expect(available).toHaveBeenCalled());
      await elementIsStable(workspace);
      available.mockClear();
      workspace.requestUpdate();
      await elementIsStable(workspace);
      expect(available).not.toHaveBeenCalled();
    });
  });

  describe('command targeting', () => {
    it('captures native nonbubbling direct-panel commands and leaves focus on the invoker', async () => {
      const { workspace, button, changed } = await setup();
      button.focus();
      await invoke(workspace, button, { command: '--select' });

      const root = value(workspace).root;
      if (root?.type !== 'split' || root.children[0]?.type !== 'group') throw new Error('Expected group');
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
    it('honors a self-target tab index and keeps repeated placement silent without changing active preference', async () => {
      const { workspace, button, changed } = await setup(saved(group('a', 'companion', 'b', 'c')));
      workspace.rearrangeable = true;
      await elementIsStable(workspace);
      const request = { command: '--place', placement: { operation: 'join' as const, target: 'a', index: 4 } };
      await invoke(workspace, button, request);
      expect(value(workspace).root).toEqual({ type: 'group', panels: ['companion', 'b', 'c', 'a'], active: 'c' });
      expect(changed).toHaveBeenCalledOnce();
      await invoke(workspace, button, request);
      expect(changed).toHaveBeenCalledOnce();
    });

    it('distinguishes same-axis splitting from peer ordering with the same durable source and target', async () => {
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
      expect(divided.children.slice(0, 2).map(node => node.type === 'group' && node.panels[0])).toEqual(['b', 'a']);
      expect(divided.weights).not.toEqual([0.5, 0.2, 0.3]);
      expect(changed).toHaveBeenCalledOnce();
      workspace.value = JSON.stringify(peers());
      await elementIsStable(workspace);
      await invoke(workspace, button, {
        command: '--place',
        anchor: 'b',
        placement: { operation: 'reorder', target: 'a', position: 'before' }
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
            group('a'),
            split('vertical', [1 / 2, 1 / 2], group('b'), group('c')),
            group('companion')
          )
        )
      );
      if (result.root?.type !== 'split') throw new Error('Expected owner');
      const weights = result.root.weights;
      expect(weights).toHaveLength(3);
      [4 / 15, 2 / 5, 1 / 3].forEach((weight, index) => expect(weights[index]).toBeCloseTo(weight, 10));
      expect(changed).toHaveBeenCalledOnce();
    });

    it('preserves the whole tabbed group and traveling weights when ordering beside a peer arrangement', async () => {
      const { workspace, button } = await setup();
      workspace.rearrangeable = true;
      await invoke(workspace, button, {
        command: '--place',
        anchor: 'a',
        placement: {
          operation: 'reorder',
          source: 'group',
          target: 'c',
          position: 'after'
        }
      });
      const root = value(workspace).root;
      if (root?.type !== 'split') throw new Error('Expected peers');
      expect(root.weights).toEqual([0.6, 0.4]);
      expect(root.children[1]).toEqual(group('a', 'companion'));
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
      expect(root?.type === 'split' && root.children[0]).toEqual(group('companion'));
      workspace.value = JSON.stringify(nested());
      await elementIsStable(workspace);
      await invoke(workspace, button, {
        command: '--place',
        anchor: 'companion',
        placement: { operation: 'join', target: 'b', index: 0 }
      });
      const result = value(workspace).root;
      if (result?.type !== 'split' || result.children[1]?.type !== 'split') throw new Error('Expected column');
      expect(result.children[1].children[0]).toEqual({
        type: 'group',
        panels: ['companion', 'b'],
        active: 'companion'
      });
      expect(changed).toHaveBeenCalledTimes(2);
    });

    it('keeps a valid original peer-order no-op and invalid cross-owner ordering silent', async () => {
      const { workspace, button, changed } = await setup();
      workspace.rearrangeable = true;
      const initial = workspace.value;
      await invoke(workspace, button, {
        command: '--place',
        anchor: 'b',
        placement: { operation: 'reorder', target: 'c', position: 'before' }
      });
      await invoke(workspace, button, {
        command: '--place',
        anchor: 'b',
        placement: { operation: 'reorder', target: 'a', position: 'before' }
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
      if (root?.type !== 'split' || root.children[0]?.type !== 'group') throw new Error('Expected group');
      expect(root.children[0].active).toBe('a');
      expect(workspace.querySelector('#a')!.hasAttribute('hidden')).toBe(false);
      await invoke(workspace, button, { command: '--open' });
      expect(changed).toHaveBeenCalledTimes(2);
    });

    it('accepts a native HTML invoker and respects capability changes', async () => {
      const { workspace, button, changed } = await setup();
      const native: HTMLButtonElement & WorkspaceCommandSource = document.createElement('button');
      native.command = '--select';
      native.commandForElement = workspace.querySelector('#a');
      native.textContent = 'Select';
      fixture.append(native);
      await emulateClick(native);
      await elementIsStable(workspace);
      expect(changed).toHaveBeenCalledOnce();
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

  describe('invalid placement requests', () => {
    it.each([
      { name: 'an unsupported operation', placement: { operation: 'unknown', target: 'b' } },
      { name: 'a nonfinite tab index', placement: { operation: 'join', target: 'b', index: Number.NaN } },
      { name: 'a negative tab index', placement: { operation: 'join', target: 'b', index: -1 } },
      { name: 'an invalid split direction', placement: { operation: 'split', target: 'b', position: 'diagonal' } },
      { name: 'an invalid insertion scope', placement: { operation: 'insert', scope: 'root', position: 'top' } },
      {
        name: 'a workspace insertion with a target',
        placement: { operation: 'insert', scope: 'workspace', target: 'b', position: 'top' }
      },
      {
        name: 'the former pane source mode',
        placement: { operation: 'split', source: 'pane', target: 'b', position: 'left' }
      }
    ])('rejects $name without mutation', async ({ placement }) => {
      const { workspace, button, changed } = await setup();
      workspace.rearrangeable = true;
      button.command = '--place';
      button.commandForElement = workspace.querySelector('#a');
      Object.assign(button, { placement });
      const initial = workspace.value;
      expect(workspace.isCommandAvailable('--place', { value: 'a', placement: button.placement })).toBe(false);
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
        placement: { operation: 'join', target: 'b' }
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
