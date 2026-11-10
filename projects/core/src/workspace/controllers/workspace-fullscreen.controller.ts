// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { ReactiveControllerHost } from 'lit';

import { NativeFullscreenController } from '@nvidia-elements/core/internal';

interface WorkspaceFullscreenHost extends HTMLElement, ReactiveControllerHost {
  readonly fullscreenable: boolean;
}

interface WorkspaceFullscreenDelegate {
  readonly getGroup: (targetPanelId: string) => readonly string[];
  readonly cancelInteractions: () => void;
  readonly invalidateCommandAvailability: () => void;
}

/** Selects the fullscreen group and preserves surviving companions when its anchor disappears. */
export class WorkspaceFullscreenController {
  readonly #host: WorkspaceFullscreenHost;
  readonly #delegate: WorkspaceFullscreenDelegate;
  readonly #native: NativeFullscreenController;
  #targetPanelId?: string;
  #groupPanelIds: readonly string[] = [];

  constructor(host: WorkspaceFullscreenHost, delegate: WorkspaceFullscreenDelegate) {
    this.#host = host;
    this.#delegate = delegate;
    this.#native = new NativeFullscreenController(host, this.#nativeChanged);
    host.addController(this);
  }

  get active() {
    return this.#targetPanelId !== undefined && this.#native.active;
  }

  get targetPanelId() {
    return this.active ? this.#targetPanelId : undefined;
  }

  get canExit() {
    return this.#targetPanelId !== undefined && this.#native.canExit;
  }

  hostUpdate() {
    if (!this.#targetPanelId) return;
    const groupPanelIds = this.#delegate.getGroup(this.#targetPanelId);
    if (groupPanelIds.length) {
      this.#groupPanelIds = groupPanelIds;
      return;
    }
    const fallback = this.#groupPanelIds.find(id => this.#delegate.getGroup(id).length);
    if (fallback) {
      this.#targetPanelId = fallback;
      this.#groupPanelIds = this.#delegate.getGroup(fallback);
      this.#invalidate();
    } else this.exit();
  }

  isSelectedGroup(targetPanelId: string) {
    return this.#targetPanelId !== undefined && this.#delegate.getGroup(targetPanelId).includes(this.#targetPanelId);
  }

  canEnter(targetPanelId: string) {
    if (
      this.isSelectedGroup(targetPanelId) ||
      !this.#host.fullscreenable ||
      !this.#delegate.getGroup(targetPanelId).length
    )
      return false;
    return this.#native.canEnter;
  }

  enter(targetPanelId: string) {
    if (!this.canEnter(targetPanelId)) return;

    const groupPanelIds = this.#delegate.getGroup(targetPanelId);
    const switching = this.#targetPanelId !== undefined;
    this.#delegate.cancelInteractions();
    this.#targetPanelId = targetPanelId;
    this.#groupPanelIds = groupPanelIds;
    if (switching) this.#invalidate();
    else this.#native.enter();
  }

  exit() {
    this.#native.exit();
  }

  #nativeChanged = () => {
    if (!this.#native.canExit) {
      this.#targetPanelId = undefined;
      this.#groupPanelIds = [];
    }
    this.#invalidate();
  };

  #invalidate() {
    this.#delegate.invalidateCommandAvailability();
    this.#host.requestUpdate();
  }
}
