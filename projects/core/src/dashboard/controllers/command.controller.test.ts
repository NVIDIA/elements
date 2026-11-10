// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, LitElement } from 'lit';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createFixture, elementIsStable, removeFixture } from '@internals/testing';

import { DashboardCommandController } from './command.controller.js';
import { serializeDashboardValue } from '../utils/layout.utils.js';

import type { DashboardArrangementRequest } from '../utils/intent.types.js';

import type { DashboardPanel } from '../panel/panel.js';

import type { DashboardLayout } from '../dashboard.types.js';

import '../define.js';

const initial: DashboardLayout = {
  version: 1,
  grid: { flow: 'vertical', tracks: 4 },
  items: [{ id: 'a', column: 0, row: 0, columnSpan: 2, rowSpan: 2 }]
};
const proposed: DashboardLayout = { ...initial, items: [{ id: 'a', column: 0, row: 2, columnSpan: 2, rowSpan: 2 }] };

class CommandTestHost extends LitElement {
  value = serializeDashboardValue(initial);
  layout: DashboardLayout | undefined = initial;
  proposal: DashboardLayout | undefined = proposed;
  selected?: string;
  entryAllowed = true;
  commitAllowed = true;
  readonly order: string[] = [];
  readonly findLayoutProposal = vi.fn(
    (_layout: DashboardLayout, _id: string, _request: DashboardArrangementRequest) => this.proposal
  );
  readonly enter = vi.fn((id: string) => {
    this.selected = id;
    this.fullscreen.canExit = true;
  });
  readonly exit = vi.fn(() => {
    this.selected = undefined;
    this.fullscreen.canExit = false;
  });
  readonly fullscreen = {
    canEnter: () => this.entryAllowed,
    canExit: false,
    isSelectedPanel: (id: string) => this.selected === id,
    enter: (id: string) => this.enter(id),
    exit: () => this.exit()
  };
  readonly commands = new DashboardCommandController(this, {
    getPanels: () => [...this.querySelectorAll<DashboardPanel>('nve-dashboard-panel')],
    getLayout: () => this.layout,
    findLayoutProposal: (layout, id, request) => this.findLayoutProposal(layout, id, request),
    canCommit: layout => this.commitAllowed && serializeDashboardValue(layout) !== this.value,
    cancel: () => this.order.push('cancel'),
    commit: next => {
      this.order.push('commit');
      this.value = serializeDashboardValue(next);

      return true;
    },
    fullscreen: this.fullscreen
  });
}

const tag = 'dashboard-command-test-host';
customElements.define(tag, CommandTestHost);

function invoke(target: HTMLElement, command: string, options: { source?: HTMLElement; prevented?: boolean } = {}) {
  const event = new CommandEvent('command', { command, source: options.source, cancelable: true });

  if (options.prevented) {
    event.preventDefault();
  }

  target.dispatchEvent(event);
}

describe('dashboard command controller', () => {
  let fixture: HTMLElement;
  let host: CommandTestHost;
  let panel: DashboardPanel;
  let source: HTMLInputElement;

  beforeEach(async () => {
    fixture = await createFixture(
      html`<dashboard-command-test-host><nve-dashboard-panel id="a"><span>Application</span></nve-dashboard-panel></dashboard-command-test-host><input aria-label="Command source" />`
    );

    host = fixture.querySelector<CommandTestHost>(tag)!;

    await elementIsStable(host);

    panel = host.querySelector<DashboardPanel>('nve-dashboard-panel')!;
    source = fixture.querySelector('input')!;
  });

  afterEach(() => removeFixture(fixture));

  it('routes panel and dashboard command events and leaves rejected proposals idle', () => {
    invoke(panel, '--move-down');

    expect(host.findLayoutProposal).toHaveBeenLastCalledWith(initial, 'a', {
      kind: 'command',
      command: '--move-down',
      placement: undefined
    });
    expect(host.order).toEqual(['cancel', 'commit']);

    source.value = 'a';

    const placement = { column: -1, row: 2, columnSpan: 2, rowSpan: 2 };

    Object.assign(source, { placement });
    invoke(host, '--place', { source });

    expect(host.findLayoutProposal).toHaveBeenLastCalledWith(initial, 'a', {
      kind: 'command',
      command: '--place',
      placement
    });

    host.proposal = undefined;
    host.findLayoutProposal.mockClear();
    invoke(panel, '--move-down');

    expect(host.findLayoutProposal).toHaveBeenCalledOnce();
    expect(host.findLayoutProposal).toHaveBeenLastCalledWith(initial, 'a', {
      kind: 'command',
      command: '--move-down',
      placement: undefined
    });
    expect(host.order).toEqual(['cancel', 'commit', 'cancel', 'commit']);
  });

  it('ignores cancelled command events', () => {
    invoke(panel, '--move-down', { source, prevented: true });

    expect(host.findLayoutProposal).not.toHaveBeenCalled();
    expect(host.order).toEqual([]);
  });

  it('ignores commands from a disabled source', () => {
    source.disabled = true;
    invoke(panel, '--move-down', { source });

    expect(host.findLayoutProposal).not.toHaveBeenCalled();
    expect(host.order).toEqual([]);
  });

  it('ignores commands from a read-only source', () => {
    source.readOnly = true;
    invoke(panel, '--move-down', { source });

    expect(host.findLayoutProposal).not.toHaveBeenCalled();
    expect(host.order).toEqual([]);
  });

  it('ignores commands identifying an absent panel', () => {
    source.value = 'missing';
    invoke(host, '--move-down', { source });

    expect(host.findLayoutProposal).not.toHaveBeenCalled();
    expect(host.order).toEqual([]);
  });

  it('ignores commands originating in application content', () => {
    invoke(panel.querySelector('span')!, '--move-down');

    expect(host.findLayoutProposal).not.toHaveBeenCalled();
    expect(host.order).toEqual([]);
  });

  it('ignores arrangement commands without a current layout', () => {
    host.layout = undefined;
    invoke(panel, '--move-down');

    expect(host.findLayoutProposal).not.toHaveBeenCalled();
    expect(host.order).toEqual([]);
  });

  it('queries normalized proposals without committing or changing availability state', () => {
    const changed = vi.fn();

    host.addEventListener('commandavailabilitychange', changed);
    host.commands.flush();
    changed.mockClear();

    expect(host.commands.isCommandAvailable('--move-down', { value: 'a' })).toBe(true);

    host.value = serializeDashboardValue(proposed);

    expect(host.commands.isCommandAvailable('--move-down', { value: 'a' })).toBe(false);
    expect(host.commands.isCommandAvailable('--move-down')).toBe(false);

    host.commands.flush();

    expect(host.order).toEqual([]);
    expect(changed).not.toHaveBeenCalled();
  });

  it('uses commit admission when reporting command availability', () => {
    expect(host.commands.isCommandAvailable('--move-down', { value: 'a' })).toBe(true);

    host.commitAllowed = false;

    expect(host.commands.isCommandAvailable('--move-down', { value: 'a' })).toBe(false);
    expect(host.order).toEqual([]);
  });

  it('coalesces invalidation while allowing a notification listener to invalidate the next flush', () => {
    host.commands.flush();

    const changed = vi.fn();

    host.addEventListener('commandavailabilitychange', changed);
    host.commands.invalidate();
    host.commands.invalidate();
    host.addEventListener('commandavailabilitychange', () => host.commands.invalidate(), { once: true });
    host.commands.flush();
    host.commands.flush();
    host.commands.flush();

    expect(changed).toHaveBeenCalledTimes(2);
  });

  it('retains dirty availability while disconnected and publishes it after reconnect', () => {
    host.commands.flush();

    const changed = vi.fn();

    host.addEventListener('commandavailabilitychange', changed);
    host.remove();
    host.commands.invalidate();
    host.commands.flush();

    expect(changed).not.toHaveBeenCalled();

    fixture.append(host);
    host.commands.flush();
    host.commands.flush();

    expect(changed).toHaveBeenCalledOnce();
  });

  it('removes and reattaches its native command listener exactly once across reconnect', async () => {
    host.remove();
    invoke(panel, '--move-down');

    expect(host.findLayoutProposal).not.toHaveBeenCalled();

    fixture.append(host);
    await elementIsStable(host);

    invoke(panel, '--move-down');

    expect(host.findLayoutProposal).toHaveBeenCalledTimes(1);
    expect(host.order).toEqual(['cancel', 'commit']);
  });

  it('routes fullscreen commands through capability queries without planning arrangements', () => {
    expect(host.commands.isCommandAvailable('--enter-fullscreen', { value: 'a' })).toBe(true);
    expect(host.enter).not.toHaveBeenCalled();

    invoke(panel, '--enter-fullscreen');

    expect(host.enter).toHaveBeenCalledWith('a');

    host.entryAllowed = false;
    invoke(panel, '--enter-fullscreen');

    expect(host.enter).toHaveBeenCalledTimes(1);
    expect(host.commands.isCommandAvailable('--exit-fullscreen', { value: 'a' })).toBe(true);

    invoke(panel, '--toggle-fullscreen');

    expect(host.exit).toHaveBeenCalledOnce();

    host.entryAllowed = true;
    invoke(panel, '--toggle-fullscreen');

    expect(host.enter).toHaveBeenCalledTimes(2);

    invoke(panel, '--exit-fullscreen');

    expect(host.exit).toHaveBeenCalledTimes(2);
    expect(host.findLayoutProposal).not.toHaveBeenCalled();
    expect(host.order).toEqual([]);
  });
});
