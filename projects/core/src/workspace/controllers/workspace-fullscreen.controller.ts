// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { ReactiveControllerHost } from 'lit';

interface WorkspaceFullscreenHost extends HTMLElement, ReactiveControllerHost {
  readonly fullscreenable: boolean;
}

interface WorkspaceFullscreenDelegate {
  readonly getGroup: (targetPanelId: string) => string[];
  readonly cancelInteractions: () => void;
  readonly invalidateCommandAvailability: () => void;
}

/** Projects one durable group while the browser owns fullscreen admission and lifetime. */
export class WorkspaceFullscreenController {
  readonly #host: WorkspaceFullscreenHost;
  readonly #delegate: WorkspaceFullscreenDelegate;
  #listeningDocument?: Document;
  #targetPanelId?: string;
  #groupPanelIds: string[] = [];
  #pendingRequest?: Promise<void>;

  constructor(host: WorkspaceFullscreenHost, delegate: WorkspaceFullscreenDelegate) {
    this.#host = host;
    this.#delegate = delegate;
    host.addController(this);
  }

  get active() {
    return this.#targetPanelId !== undefined && this.#isNativeFullscreen();
  }

  get targetPanelId() {
    return this.active ? this.#targetPanelId : undefined;
  }

  get canExit() {
    return this.#targetPanelId !== undefined;
  }

  hostConnected() {
    this.#listeningDocument = this.#host.ownerDocument;
    this.#listeningDocument.addEventListener('fullscreenchange', this.#sync);
  }

  hostDisconnected() {
    this.#listeningDocument?.removeEventListener('fullscreenchange', this.#sync);
    this.#listeningDocument = undefined;
    this.exit();
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
      this.#delegate.invalidateCommandAvailability();
    } else {
      this.exit();
    }
  }

  isSelectedGroup(targetPanelId: string) {
    return this.#targetPanelId !== undefined && this.#delegate.getGroup(targetPanelId).includes(this.#targetPanelId);
  }

  canEnter(targetPanelId: string) {
    if (this.isSelectedGroup(targetPanelId)) {
      return false;
    }
    if (!this.#host.fullscreenable || !this.#delegate.getGroup(targetPanelId).length) {
      return false;
    }
    return (
      this.canExit || (typeof this.#host.requestFullscreen === 'function' && this.#host.ownerDocument.fullscreenEnabled)
    );
  }

  enter(targetPanelId: string) {
    const groupPanelIds = this.#delegate.getGroup(targetPanelId);
    if (!groupPanelIds.length) return;

    const switching = this.#targetPanelId !== undefined;

    this.#delegate.cancelInteractions();
    this.#targetPanelId = targetPanelId;
    this.#groupPanelIds = groupPanelIds;
    this.#delegate.invalidateCommandAvailability();
    if (!switching) {
      void this.#requestFullscreen();
    }
  }

  exit() {
    this.#pendingRequest = undefined;

    if (this.#isNativeFullscreen()) {
      void this.#exitFullscreen();
    } else {
      this.#reset();
    }
  }

  async #requestFullscreen() {
    const request = this.#host.requestFullscreen();
    this.#pendingRequest = request;

    try {
      await request;

      if (this.#pendingRequest === request) {
        this.#sync();
      } else if (!this.#targetPanelId && this.#isNativeFullscreen()) {
        this.exit();
      }
    } catch {
      if (this.#pendingRequest === request) {
        this.#reset();
      }
    } finally {
      if (this.#pendingRequest === request) {
        this.#pendingRequest = undefined;
      }
    }
  }

  async #exitFullscreen() {
    try {
      await this.#host.ownerDocument.exitFullscreen();
    } catch {
      this.#sync();
    }
  }

  #isNativeFullscreen() {
    const root = this.#host.getRootNode();

    return (
      (root instanceof ShadowRoot ? root.fullscreenElement : this.#host.ownerDocument.fullscreenElement) === this.#host
    );
  }

  #sync = () => {
    if (this.#isNativeFullscreen() && this.#targetPanelId) {
      this.#delegate.invalidateCommandAvailability();
      this.#host.requestUpdate();
    } else if (this.#isNativeFullscreen()) {
      this.exit();
    } else {
      this.#reset();
    }
  };

  #reset() {
    const shouldInvalidateAvailability = this.#targetPanelId !== undefined;

    this.#pendingRequest = undefined;
    this.#targetPanelId = undefined;
    this.#groupPanelIds = [];

    if (shouldInvalidateAvailability) {
      this.#delegate.invalidateCommandAvailability();
    }

    this.#host.requestUpdate();
  }
}
