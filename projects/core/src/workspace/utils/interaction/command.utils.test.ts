// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi } from 'vitest';

import {
  findWorkspaceCommandPanel,
  isWorkspaceCommandAvailable,
  isWorkspacePlacement,
  resolveWorkspacePlacement
} from './command.utils.js';

import type { WorkspaceCommandEvent } from './command.utils.js';

import type { WorkspaceLayout } from '../model/layout.utils.js';

describe('workspace command targets', () => {
  it('uses the invoker value for workspace commands and the target for direct panel commands', () => {
    const host = document.createElement('div');
    const panel = document.createElement('nve-workspace-panel');
    panel.id = 'editor';
    const source = Object.assign(document.createElement('button'), { value: panel.id });
    const event: WorkspaceCommandEvent = Object.assign(new Event('command'), { source });
    host.dispatchEvent(event);
    expect(findWorkspaceCommandPanel(host, [panel], event)).toBe(panel);
    panel.dispatchEvent(event);
    source.value = 'missing';
    expect(findWorkspaceCommandPanel(host, [panel], event)).toBe(panel);
    host.dispatchEvent(event);
    expect(findWorkspaceCommandPanel(host, [panel], event)).toBeUndefined();
  });

  it('ignores unrelated application targets even when their invoker names a supplied panel', () => {
    const host = document.createElement('div');
    const panel = document.createElement('nve-workspace-panel');
    panel.id = 'editor';
    const control = document.createElement('button');
    const event: WorkspaceCommandEvent = Object.assign(new Event('command'), { source: control });
    control.value = panel.id;
    control.dispatchEvent(event);
    expect(findWorkspaceCommandPanel(host, [panel], event)).toBeUndefined();
  });
});

describe('workspace placement command validation', () => {
  it('accepts supported source modes', () => {
    const placement = { operation: 'split', target: 'b', position: 'left' };
    for (const source of [undefined, 'panel', 'group']) {
      expect(isWorkspacePlacement({ ...placement, source })).toBe(true);
    }
  });

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
      name: 'an unsupported source mode',
      placement: { operation: 'split', source: 'unknown', target: 'b', position: 'left' }
    }
  ])('rejects $name', ({ placement }) => {
    expect(isWorkspacePlacement(placement)).toBe(false);
  });

  it('uses a real panel named root independently from explicit workspace scope', () => {
    const layout: WorkspaceLayout = {
      version: 1,
      closed: [],
      root: {
        type: 'split',
        axis: 'horizontal',
        weights: [1, 1],
        children: [
          { type: 'group', panels: ['root'], active: 'root' },
          { type: 'group', panels: ['a', 'companion'], active: 'companion' }
        ]
      }
    };
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

describe('workspace command availability', () => {
  function createInput() {
    const layout: WorkspaceLayout = {
      version: 1,
      closed: [],
      root: { type: 'group', panels: ['a', 'companion'], active: 'companion' }
    };
    return {
      command: '--close',
      context: { value: 'a' },
      layout,
      available: ['a', 'companion'],
      closable: true,
      rearrangeable: true,
      placementAvailable: () => true,
      canEnterFullscreen: () => false,
      canExitFullscreen: () => false,
      isFullscreenGroup: () => false
    };
  }

  it.each([
    { state: 'inactive', value: 'a', closed: [], expected: [true, true, true] },
    { state: 'active', value: 'companion', closed: [], expected: [false, false, true] },
    { state: 'closed', value: 'a', closed: ['a'], expected: [true, false, false] }
  ])('distinguishes opening, selecting, and closing an $state panel', ({ value, closed, expected }) => {
    const current = createInput();
    current.context.value = value;
    current.layout.closed = closed;
    expect(
      ['--open', '--select', '--close'].map(command => isWorkspaceCommandAvailable({ ...current, command }))
    ).toEqual(expected);
  });

  it.each([
    { name: 'an unknown command', command: '--unknown', context: { value: 'a' } },
    { name: 'a missing panel value', command: '--close', context: {} },
    { name: 'an unavailable panel', command: '--close', context: { value: 'missing' } }
  ])('rejects $name', ({ command, context }) => {
    expect(isWorkspaceCommandAvailable({ ...createInput(), command, context })).toBe(false);
  });

  it('requires a current layout and honors the close capability', () => {
    expect(isWorkspaceCommandAvailable({ ...createInput(), layout: undefined })).toBe(false);
    expect(isWorkspaceCommandAvailable({ ...createInput(), closable: false })).toBe(false);
  });

  it.each([
    { enter: false, exit: false, current: false, expected: [false, false, false] },
    { enter: true, exit: false, current: false, expected: [true, false, true] },
    { enter: false, exit: true, current: true, expected: [false, true, true] },
    { enter: true, exit: false, current: true, expected: [true, false, false] }
  ])(
    'uses fullscreen availability for entry=$enter, exit=$exit, current=$current',
    ({ enter, exit, current, expected }) => {
      const state = {
        ...createInput(),
        canEnterFullscreen: () => enter,
        canExitFullscreen: () => exit,
        isFullscreenGroup: () => current
      };
      expect(
        ['--enter-fullscreen', '--exit-fullscreen', '--toggle-fullscreen'].map(command =>
          isWorkspaceCommandAvailable({ ...state, command })
        )
      ).toEqual(expected);
    }
  );

  it('resolves a valid placement before querying its admission', () => {
    const current = createInput();
    const placement = { operation: 'join', target: 'companion' } as const;
    const placementAvailable = vi.fn(() => true);
    const request = { ...current, command: '--place', context: { value: 'a', placement }, placementAvailable };

    expect(isWorkspaceCommandAvailable(request)).toBe(true);
    expect(placementAvailable).toHaveBeenCalledExactlyOnceWith(['a'], {
      kind: 'tab',
      destination: { target: 'companion', position: 'tab', index: undefined }
    });
    placementAvailable.mockReturnValue(false);
    expect(isWorkspaceCommandAvailable(request)).toBe(false);
  });

  it('rejects disabled or unresolved placements before querying admission', () => {
    const placementAvailable = vi.fn(() => true);
    const request = { ...createInput(), command: '--place', placementAvailable };
    const placement = { operation: 'join', target: 'companion' } as const;

    expect(isWorkspaceCommandAvailable({ ...request, context: { value: 'a' } })).toBe(false);
    expect(isWorkspaceCommandAvailable({ ...request, context: { value: 'a', placement }, rearrangeable: false })).toBe(
      false
    );
    expect(
      isWorkspaceCommandAvailable({
        ...request,
        context: { value: 'a', placement: { ...placement, target: 'missing' } }
      })
    ).toBe(false);
    expect(placementAvailable).not.toHaveBeenCalled();
  });
});
