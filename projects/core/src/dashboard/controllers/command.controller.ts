// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { isServer, type ReactiveControllerHost } from 'lit';

import type { DashboardFullscreenController } from './fullscreen.controller.js';
import type { DashboardArrangementRequest, DashboardCommandEvent } from '../utils/intent.types.js';

import type { DashboardPanel } from '../panel/panel.js';

import type { DashboardCommandContext, DashboardLayout } from '../dashboard.types.js';

interface DashboardCommandHost extends HTMLElement, ReactiveControllerHost {
  readonly value: string;
}

interface DashboardCommandDelegate {
  getPanels(): DashboardPanel[];
  getLayout(): DashboardLayout | undefined;
  findLayoutProposal(
    layout: DashboardLayout,
    id: string,
    request: DashboardArrangementRequest
  ): DashboardLayout | undefined;
  canCommit(layout: DashboardLayout): boolean;
  cancel(): void;
  commit(layout: DashboardLayout): boolean;
  readonly fullscreen: Pick<
    DashboardFullscreenController,
    'canEnter' | 'canExit' | 'isSelectedPanel' | 'enter' | 'exit'
  >;
}

/** Routes Invoker commands and publishes command availability. */
export class DashboardCommandController {
  readonly #host: DashboardCommandHost;
  readonly #delegate: DashboardCommandDelegate;
  #dirty = true;

  constructor(host: DashboardCommandHost, delegate: DashboardCommandDelegate) {
    this.#host = host;
    this.#delegate = delegate;
    host.addController(this);
  }

  hostConnected() {
    if (!isServer) {
      this.#host.addEventListener('command', this.#handleCommand, true);
    }
  }

  hostDisconnected() {
    this.#host.removeEventListener('command', this.#handleCommand, true);
  }

  invalidate() {
    this.#dirty = true;
  }

  flush() {
    if (!this.#dirty || !this.#host.isConnected) return;

    this.#dirty = false;
    this.#host.dispatchEvent(new Event('commandavailabilitychange', { bubbles: true, composed: true }));
  }

  isCommandAvailable(command: string, context: DashboardCommandContext = {}): boolean {
    if (!context.value) return false;

    const fullscreen = this.#getFullscreenCommandAvailability(command, context.value);
    if (fullscreen !== undefined) return fullscreen;

    const layout = this.#delegate.getLayout();
    if (!layout) return false;

    const next = this.#delegate.findLayoutProposal(layout, context.value, {
      kind: 'command',
      command,
      placement: context.placement
    });

    return !!next && this.#delegate.canCommit(next);
  }

  #findCommandPanel(event: DashboardCommandEvent) {
    if (event.defaultPrevented || event.source?.disabled || event.source?.readOnly) {
      return undefined;
    }
    if (event.target === this.#host) return this.#delegate.getPanels().find(panel => panel.id === event.source?.value);

    return this.#delegate.getPanels().find(panel => panel === event.target);
  }

  #handleCommand = (event: DashboardCommandEvent) => {
    if (!event.command) return;

    const panel = this.#findCommandPanel(event);
    if (!panel || this.#handleFullscreenCommand(event.command, panel.id)) return;

    const layout = this.#delegate.getLayout();
    if (!layout) return;

    const placement = event.source?.placement;
    const next = this.#delegate.findLayoutProposal(layout, panel.id, {
      kind: 'command',
      command: event.command,
      placement
    });

    if (next) {
      this.#delegate.cancel();
      this.#delegate.commit(next);
    }
  };

  #getFullscreenCommandAvailability(command: string, id: string): boolean | undefined {
    if (!this.#delegate.getPanels().some(panel => panel.id === id)) return undefined;

    switch (command) {
      case '--enter-fullscreen':
        return this.#delegate.fullscreen.canEnter(id);
      case '--exit-fullscreen':
        return this.#delegate.fullscreen.canExit;
      case '--toggle-fullscreen':
        return this.#delegate.fullscreen.isSelectedPanel(id)
          ? this.#delegate.fullscreen.canExit
          : this.#delegate.fullscreen.canEnter(id);
      default:
        return undefined;
    }
  }

  #handleFullscreenCommand(command: string, id: string): boolean {
    const available = this.#getFullscreenCommandAvailability(command, id);
    if (available === undefined) return false;

    if (available) {
      if (
        command === '--exit-fullscreen' ||
        (command === '--toggle-fullscreen' && this.#delegate.fullscreen.isSelectedPanel(id))
      ) {
        this.#delegate.fullscreen.exit();
      } else {
        this.#delegate.fullscreen.enter(id);
      }
    }

    return true;
  }
}
