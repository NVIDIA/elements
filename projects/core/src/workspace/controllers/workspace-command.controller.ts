// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { ReactiveControllerHost } from 'lit';

import {
  findWorkspaceCommandPanel,
  isWorkspaceCommandAvailable,
  isWorkspacePlacement,
  resolveWorkspacePlacement
} from '../utils/interaction/command.utils.js';

import type {
  WorkspaceCommandContext,
  WorkspaceCommandEvent,
  WorkspacePlacementIntent
} from '../utils/interaction/command.utils.js';
import type { WorkspaceLayout } from '../utils/model/layout.utils.js';

import type { WorkspacePanel } from '../panel/panel.js';

type WorkspaceCommandHost = HTMLElement &
  ReactiveControllerHost & {
    readonly closable: boolean;
    readonly rearrangeable: boolean;
  };

interface WorkspaceCommandDelegate {
  readonly getState: () => {
    panels: WorkspacePanel[];
    layout?: WorkspaceLayout;
  };
  readonly isRearrangementAllowed: () => boolean;
  readonly isPlacementAvailable: (source: string[], intent: WorkspacePlacementIntent) => boolean;
  readonly canEnterFullscreen: (targetPanelId: string) => boolean;
  readonly canExitFullscreen: () => boolean;
  readonly isFullscreenGroup: (targetPanelId: string) => boolean;
  readonly enterFullscreen: (targetPanelId: string) => void;
  readonly exitFullscreen: () => void;
  readonly activatePanel: (anchor: string, operation: 'open' | 'select') => void;
  readonly closePanel: (anchor: string) => void;
  readonly placePanel: (source: string[], intent: WorkspacePlacementIntent) => void;
}

export class WorkspaceCommandController {
  readonly #host: WorkspaceCommandHost;
  readonly #delegate: WorkspaceCommandDelegate;
  #availabilityInvalid = false;

  constructor(host: WorkspaceCommandHost, delegate: WorkspaceCommandDelegate) {
    this.#host = host;
    this.#delegate = delegate;
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
    if (command === '--place' && !this.#delegate.isRearrangementAllowed()) {
      return false;
    }

    const state = this.#delegate.getState();
    return isWorkspaceCommandAvailable({
      command,
      context,
      ...state,
      closable: this.#host.closable,
      rearrangeable: this.#host.rearrangeable,
      available: state.panels.map(panel => panel.id),
      placementAvailable: this.#delegate.isPlacementAvailable,
      canEnterFullscreen: this.#delegate.canEnterFullscreen,
      canExitFullscreen: this.#delegate.canExitFullscreen,
      isFullscreenGroup: this.#delegate.isFullscreenGroup
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
    if (!event.command || !this.#allowsCommand(event)) return;
    const panel = findWorkspaceCommandPanel(this.#host, this.#delegate.getState().panels, event);
    if (!panel) return;
    if (event.command === '--place') {
      this.#place(panel.id, event.source?.placement);
      return;
    }
    if (!this.isCommandAvailable(event.command, { value: panel.id, placement: event.source?.placement })) return;
    this.#dispatch(event.command, panel.id);
  };

  #place(anchor: string, placement: unknown) {
    if (!this.#host.rearrangeable || !this.#delegate.isRearrangementAllowed() || !isWorkspacePlacement(placement)) {
      return;
    }
    const { layout, panels } = this.#delegate.getState();
    if (!layout) {
      return;
    }
    const request = resolveWorkspacePlacement({
      layout,
      available: panels.map(panel => panel.id),
      anchor,
      placement
    });
    if (request) {
      this.#delegate.placePanel(request.source, request.intent);
    }
  }

  #allowsCommand(event: WorkspaceCommandEvent) {
    return !event.defaultPrevented && !event.source?.disabled && !event.source?.readOnly;
  }

  #dispatch(command: string, anchor: string) {
    switch (command) {
      case '--open':
        this.#delegate.activatePanel(anchor, 'open');
        break;
      case '--select':
        this.#delegate.activatePanel(anchor, 'select');
        break;
      case '--close':
        this.#delegate.closePanel(anchor);
        break;
      case '--enter-fullscreen':
        this.#delegate.enterFullscreen(anchor);
        break;
      case '--exit-fullscreen':
        this.#delegate.exitFullscreen();
        break;
      case '--toggle-fullscreen':
        if (this.#delegate.isFullscreenGroup(anchor)) {
          this.#delegate.exitFullscreen();
        } else {
          this.#delegate.enterFullscreen(anchor);
        }
        break;
    }
  }
}
