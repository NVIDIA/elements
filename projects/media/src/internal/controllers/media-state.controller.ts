// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { ReactiveController, ReactiveElement } from 'lit';
import { getCommandTarget } from '../command-target.js';
import { getTargetMediaState, isMediaState, mediaStateChange, type MediaState } from '../media-state.js';

type MediaStateHost = ReactiveElement & {
  commandForElement: HTMLElement | null;
};

type MediaStateCallback = (state: MediaState | null) => void;

type StateSyncTiming = 'immediate' | 'microtask';

export class MediaStateController<T extends MediaStateHost> implements ReactiveController {
  #commandTarget: HTMLElement | null = null;

  constructor(
    private host: T,
    private callback: MediaStateCallback
  ) {
    this.host.addController(this);
  }

  hostConnected() {
    this.#syncCommandTarget();
  }

  hostUpdate() {
    this.#syncCommandTarget();
  }

  hostUpdated() {
    this.#syncCommandTarget('microtask');
  }

  hostDisconnected() {
    this.#disconnectCommandTarget();
  }

  #syncCommandTarget(stateSyncTiming: StateSyncTiming = 'immediate') {
    const commandTarget = getCommandTarget(this.host);
    if (commandTarget === this.#commandTarget) {
      return;
    }

    this.#disconnectCommandTarget();
    this.#commandTarget = commandTarget;
    this.#commandTarget?.addEventListener(mediaStateChange, this.#onMediaStateChange);

    const syncState = () => {
      if (commandTarget === this.#commandTarget) {
        this.callback(getTargetMediaState(commandTarget));
      }
    };

    if (stateSyncTiming === 'microtask') {
      queueMicrotask(syncState);
    } else {
      syncState();
    }
  }

  #disconnectCommandTarget() {
    this.#commandTarget?.removeEventListener(mediaStateChange, this.#onMediaStateChange);
    this.#commandTarget = null;
  }

  #onMediaStateChange = (event: Event) => {
    if (event instanceof CustomEvent && isMediaState(event.detail)) {
      this.callback(event.detail);
    }
  };
}
