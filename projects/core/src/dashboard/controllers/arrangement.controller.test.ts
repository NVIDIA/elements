// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createFixture, removeFixture } from '@internals/testing';

import { DashboardArrangementController } from './arrangement.controller.js';
import { serializeDashboardValue } from '../utils/layout.utils.js';

import type { DashboardPanel } from '../panel/panel.js';

import type { DashboardLayout } from '../dashboard.types.js';

import '../define.js';

const initial: DashboardLayout = {
  version: 1,
  grid: { flow: 'vertical', tracks: 6 },
  items: [
    { id: 'a', column: 0, row: 0, columnSpan: 2, rowSpan: 2 },
    { id: 'b', column: 2, row: 0, columnSpan: 2, rowSpan: 2 }
  ]
};
const destination = { column: 0, row: 4, columnSpan: 2, rowSpan: 2 };

describe('dashboard arrangement controller', () => {
  let fixture: HTMLElement;

  afterEach(() => removeFixture(fixture));

  async function createArrangementFixture() {
    fixture = await createFixture(
      html`<nve-dashboard-panel id="a"></nve-dashboard-panel><nve-dashboard-panel id="b"></nve-dashboard-panel>`
    );

    let panels = [...fixture.querySelectorAll<DashboardPanel>('nve-dashboard-panel')];
    const first = panels[0]!;
    const host = {
      value: serializeDashboardValue(initial),
      rearrangeable: true,
      autoSettle: false,
      matches: () => false
    };
    let layout = initial;
    let ready = true;
    let fullscreen = false;
    const known = new Set(['a', 'b']);
    const order: string[] = [];
    const commit = vi.fn((next: DashboardLayout) => {
      order.push('commit');
      layout = next;
      host.value = serializeDashboardValue(next);

      return true;
    });
    const controller = new DashboardArrangementController(host, {
      getPanels: () => panels,
      getOwnedPanels: () => panels,
      isReady: () => ready,
      getKnown: () => known,
      getLayout: () => layout,
      isFullscreenActive: () => fullscreen,
      cancel: () => order.push('cancel'),
      commit
    });

    return {
      host,
      first,
      controller,
      commit,
      order,
      setReady: (value: boolean) => {
        ready = value;
      },
      setFullscreen: (value: boolean) => {
        fullscreen = value;
      },
      removePeer: () => {
        panels = [first];
      }
    };
  }

  it('uses live parent and panel permissions for placement and independent operations', async () => {
    const { host, first, controller, setFullscreen } = await createArrangementFixture();
    const request = { kind: 'command', command: '--place', placement: destination } as const;

    expect(controller.findLayoutProposal(initial, 'a', request)?.items[0]).toEqual({ id: 'a', ...destination });

    first.moveDisabled = true;

    expect(controller.isActionAllowed(first, 'move')).toBe(false);
    expect(controller.isActionAllowed(first, 'resize')).toBe(true);
    expect(controller.findLayoutProposal(initial, 'a', request)).toBeUndefined();

    first.moveDisabled = false;
    first.resizeDisabled = true;

    expect(controller.isActionAllowed(first, 'move')).toBe(true);
    expect(controller.isActionAllowed(first, 'resize')).toBe(false);

    host.rearrangeable = false;

    expect(controller.findLayoutProposal(initial, 'a', request)).toBeUndefined();

    host.rearrangeable = true;
    setFullscreen(true);

    expect(controller.isActionAllowed(first, 'move')).toBe(false);
    expect(controller.isActionAllowed(first, 'resize')).toBe(false);
    expect(controller.findLayoutProposal(initial, 'a', request)).toBeUndefined();
  });

  it('cancels input before requesting a commit and propagates the parent commit result', async () => {
    const { host, controller, commit, order } = await createArrangementFixture();
    const value = host.value;

    commit.mockImplementationOnce(() => {
      order.push('commit');
      return false;
    });

    expect(controller.place('a', destination)).toBe(false);
    expect(commit).toHaveBeenCalledOnce();
    expect(commit.mock.calls[0]?.[0].items[0]).toEqual({ id: 'a', ...destination });
    expect(order).toEqual(['cancel', 'commit']);
    expect(host.value).toBe(value);

    expect(controller.place('a', destination)).toBe(true);
    expect(order).toEqual(['cancel', 'commit', 'cancel', 'commit']);
    expect(JSON.parse(host.value).items[0]).toEqual({ id: 'a', ...destination });
  });

  it('rejects unknown operations after valid membership and permission checks', async () => {
    const { first, controller } = await createArrangementFixture();

    expect(controller.isActionAllowed(first, 'move')).toBe(true);
    expect(
      controller.findLayoutProposal(initial, 'a', { kind: 'command', command: '--place', placement: destination })
    ).toBeDefined();
    expect(controller.findLayoutProposal(initial, 'a', { kind: 'command', command: '--unknown' })).toBeUndefined();
  });

  it('rejects unready panels and proposals requiring constraint normalization', async () => {
    const { controller, first, setReady } = await createArrangementFixture();
    const proposal = controller.findLayoutProposal(initial, 'a', {
      kind: 'command',
      command: '--place',
      placement: destination
    })!;

    expect(controller.canCommit(proposal)).toBe(true);
    expect(controller.canCommit(initial)).toBe(false);

    setReady(false);

    expect(controller.canCommit(proposal)).toBe(false);
    expect(
      controller.findLayoutProposal(initial, 'a', { kind: 'command', command: '--place', placement: destination })
    ).toBeUndefined();

    setReady(true);
    first.maxColumnSpan = 1;

    expect(controller.canCommit(proposal)).toBe(false);
  });

  it('rejects stale proposals that still contain a removed panel', async () => {
    const { controller, removePeer } = await createArrangementFixture();
    const proposal = controller.findLayoutProposal(initial, 'a', {
      kind: 'command',
      command: '--place',
      placement: destination
    })!;

    removePeer();

    expect(controller.canCommit(proposal)).toBe(false);
    expect(controller.findLayoutProposal(initial, 'b', { kind: 'command', command: '--move-right' })).toBeUndefined();
  });

  it('reads changed span limits without caching panel constraints', async () => {
    const { first, controller } = await createArrangementFixture();
    const request = { kind: 'command', command: '--place', placement: { ...destination, columnSpan: 3 } } as const;

    expect(controller.findLayoutProposal(initial, 'a', request)).toBeDefined();

    first.maxColumnSpan = 2;

    expect(controller.findLayoutProposal(initial, 'a', request)).toBeUndefined();
  });

  it('changes its arrangement state key for policy, constraints, and membership but not content', async () => {
    const { host, first, controller, removePeer } = await createArrangementFixture();
    let arrangementStateKey = controller.getArrangementStateKey();

    first.append(document.createTextNode('Application content'));

    expect(controller.getArrangementStateKey()).toBe(arrangementStateKey);

    for (const change of [
      () => {
        host.rearrangeable = false;
      },
      () => {
        host.autoSettle = true;
      },
      () => {
        first.minColumnSpan = 2;
      },
      () => {
        first.resizeDisabled = true;
      },
      () => {
        host.value = '';
      },
      removePeer
    ]) {
      change();

      expect(controller.getArrangementStateKey()).not.toBe(arrangementStateKey);

      arrangementStateKey = controller.getArrangementStateKey();
    }
  });

  it('permits a bottom-left anchored placement while movement is disabled and still requires resizing permission', async () => {
    const { controller, first } = await createArrangementFixture();

    first.moveDisabled = true;

    const layout: DashboardLayout = {
      ...initial,
      items: [
        { id: 'a', column: 2, row: 3, columnSpan: 2, rowSpan: 2 },
        { id: 'b', column: 0, row: 0, columnSpan: 2, rowSpan: 2 }
      ]
    };
    const placement = { column: 1, row: 3, columnSpan: 3, rowSpan: 3 };
    const request = { kind: 'command', command: '--place', placement } as const;

    expect(controller.findLayoutProposal(layout, 'a', request)?.items[0]).toEqual({ id: 'a', ...placement });

    first.resizeDisabled = true;

    expect(controller.findLayoutProposal(layout, 'a', request)).toBeUndefined();
  });
});
