// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { ReactiveControllerHost } from 'lit';

/** Owns a managed native fullscreen session without choosing its content or presentation. */
export class NativeFullscreenController {
  readonly #host: HTMLElement & ReactiveControllerHost;
  readonly #onChange: () => void;
  #listeningDocument?: Document;
  #managed = false;
  #pendingRequest?: Promise<void>;
  #exiting = false;

  constructor(host: HTMLElement & ReactiveControllerHost, onChange: () => void) {
    this.#host = host;
    this.#onChange = onChange;
    host.addController(this);
  }

  get active() {
    return this.#managed && this.#isNativeFullscreen();
  }

  get canExit() {
    return this.#managed;
  }

  get canEnter() {
    return (
      !this.#exiting &&
      (this.#managed ||
        (typeof this.#host.requestFullscreen === 'function' && this.#host.ownerDocument.fullscreenEnabled))
    );
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

  enter() {
    if (this.#managed || !this.canEnter) return;
    this.#managed = true;
    this.#onChange();
    void this.#requestFullscreen();
  }

  exit() {
    if (!this.#managed || this.#exiting) return;

    this.#pendingRequest = undefined;
    if (this.#isNativeFullscreen()) void this.#exitFullscreen();
    else this.#reset();
  }

  async #requestFullscreen() {
    const request = this.#host.requestFullscreen();
    this.#pendingRequest = request;
    try {
      await request;
      if (this.#pendingRequest === request) this.#sync();
      else if (!this.#managed && this.#isNativeFullscreen()) void this.#exitFullscreen();
    } catch {
      if (this.#pendingRequest === request) this.#reset();
    } finally {
      if (this.#pendingRequest === request) this.#pendingRequest = undefined;
    }
  }

  async #exitFullscreen() {
    if (this.#exiting) return;

    this.#exiting = true;
    this.#onChange();

    try {
      while (this.#isNativeFullscreen() && this.#isOwnedTopmostFullscreen()) {
        await this.#host.ownerDocument.exitFullscreen();

        if (!this.#host.isConnected) return;
      }
    } catch {
      // Keep managed ownership after a rejected exit so another attempt remains possible.
    } finally {
      this.#exiting = false;
      if (this.#managed) this.#sync();
      else this.#onChange();
    }
  }

  #isNativeFullscreen() {
    return this.#host.matches(':fullscreen');
  }

  #isOwnedTopmostFullscreen() {
    const root = this.#host.getRootNode();
    const topmost = isShadowRoot(root) ? root.fullscreenElement : this.#host.ownerDocument.fullscreenElement;

    return !!topmost && (topmost === this.#host || this.#host.contains(topmost));
  }

  #sync = () => {
    if (!this.#managed) return;
    if (this.#isNativeFullscreen() || this.#exiting) this.#onChange();
    else this.#reset();
  };

  #reset() {
    this.#pendingRequest = undefined;
    this.#managed = false;
    this.#onChange();
  }
}

function isShadowRoot(node: Node): node is ShadowRoot {
  return node.nodeType === Node.DOCUMENT_FRAGMENT_NODE && 'host' in node;
}
