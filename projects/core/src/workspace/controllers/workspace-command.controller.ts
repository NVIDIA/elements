// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { ReactiveControllerHost } from 'lit';
import type { WorkspaceLayout } from '../utils/workspace-layout.utils.js';
import type { WorkspacePanel } from '../panel/panel.js';
import {
  workspaceCommandAvailable,
  workspaceCommandPanel,
  type WorkspaceCommandContext,
  type WorkspaceCommandEvent,
  type WorkspaceCommandSource,
  type WorkspacePlacementIntent
} from '../utils/workspace-command.utils.js';

interface CommandOptions {
  state(): { panels: WorkspacePanel[]; layout?: WorkspaceLayout; closable: boolean; rearrangeable: boolean };
  placementAvailable(source: string[], intent: WorkspacePlacementIntent): boolean;
  fullscreenAvailable(command: string, anchor: string): boolean;
  fullscreen(command: string, anchor: string, source?: WorkspaceCommandSource | null): boolean;
  activate(anchor: string, operation: 'open' | 'select'): void;
  close(anchor: string): void;
  place(anchor: string, placement: unknown): void;
}

export class WorkspaceCommandController {
  readonly #host: HTMLElement & ReactiveControllerHost;
  readonly #options: CommandOptions;
  #availabilityInvalid = false;

  constructor(host: HTMLElement & ReactiveControllerHost, options: CommandOptions) {
    this.#host = host;
    this.#options = options;
    host.addController(this);
  }

  hostConnected() {
    this.#host.addEventListener('command', this.#command, true);
    this.invalidateAvailability();
  }

  hostDisconnected() {
    this.#host.removeEventListener('command', this.#command, true);
    this.#availabilityInvalid = false;
  }

  isCommandAvailable(command: string, context: WorkspaceCommandContext = {}): boolean {
    const state = this.#options.state();
    return workspaceCommandAvailable({
      command,
      context,
      ...state,
      available: state.panels.map(panel => panel.id),
      placementAvailable: this.#options.placementAvailable,
      fullscreenAvailable: anchor => this.#options.fullscreenAvailable(command, anchor)
    });
  }

  invalidateAvailability() {
    this.#availabilityInvalid = true;
    this.#host.requestUpdate();
  }

  flushAvailability() {
    if (!this.#availabilityInvalid || !this.#host.isConnected) return;
    this.#availabilityInvalid = false;
    this.#host.dispatchEvent(new Event('commandavailabilitychange', { bubbles: true, composed: true }));
  }

  #command = (event: WorkspaceCommandEvent) => {
    if (event.defaultPrevented || event.source?.disabled || event.source?.readOnly || !event.command) return;
    const panel = workspaceCommandPanel(this.#host, this.#options.state().panels, event);
    if (!panel || !this.isCommandAvailable(event.command, { value: panel.id, placement: event.source?.placement }))
      return;
    this.#dispatch(event.command, panel.id, event.source);
  };

  #dispatch(command: string, anchor: string, source?: WorkspaceCommandSource | null) {
    if (this.#options.fullscreen(command, anchor, source)) return;
    switch (command) {
      case '--open':
        this.#options.activate(anchor, 'open');
        break;
      case '--select':
        this.#options.activate(anchor, 'select');
        break;
      case '--close':
        this.#options.close(anchor);
        break;
      case '--place':
        this.#options.place(anchor, source?.placement);
        break;
    }
  }
}
