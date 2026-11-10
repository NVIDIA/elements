// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { ReactiveControllerHost } from 'lit';

import { NativeFullscreenController } from '@nvidia-elements/core/internal';

interface DashboardFullscreenHost extends HTMLElement, ReactiveControllerHost {
  readonly fullscreenable: boolean;
}

interface DashboardFullscreenDelegate {
  readonly hasPanel: (id: string) => boolean;
  readonly cancelInteractions: () => void;
  readonly invalidateCommandAvailability: () => void;
}

/** Selects one supplied dashboard panel for fullscreen presentation. */
export class DashboardFullscreenController {
  readonly #host: DashboardFullscreenHost;
  readonly #delegate: DashboardFullscreenDelegate;
  readonly #native: NativeFullscreenController;
  #targetPanelId?: string;

  constructor(host: DashboardFullscreenHost, delegate: DashboardFullscreenDelegate) {
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
    if (this.#targetPanelId && !this.#delegate.hasPanel(this.#targetPanelId)) {
      this.exit();
    }
  }

  isSelectedPanel(id: string) {
    return this.#targetPanelId === id;
  }

  canEnter(id: string) {
    if (this.isSelectedPanel(id) || !this.#host.fullscreenable || !this.#delegate.hasPanel(id)) {
      return false;
    }

    return this.#native.canEnter;
  }

  enter(id: string) {
    if (!this.canEnter(id)) return;

    const switching = this.#targetPanelId !== undefined;

    this.#delegate.cancelInteractions();
    this.#targetPanelId = id;

    if (switching) {
      this.#invalidate();
    } else {
      this.#native.enter();
    }
  }

  exit() {
    this.#native.exit();
  }

  #nativeChanged = () => {
    if (!this.#native.canExit) {
      this.#targetPanelId = undefined;
    }

    this.#invalidate();
  };

  #invalidate() {
    this.#delegate.invalidateCommandAvailability();
    this.#host.requestUpdate();
  }
}
