// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { ReactiveControllerHost } from 'lit';
import { isFocusable } from '@nvidia-elements/core/internal';

interface FullscreenOptions {
  supplied(anchor: string): boolean;
  group(anchor: string): string[];
  cancel(): void;
  focus(anchor: string): void;
  availabilityChanged(): void;
}

/** Projects one durable group while the browser owns fullscreen admission and lifetime. */
export class WorkspaceFullscreenController {
  readonly #host: HTMLElement & ReactiveControllerHost;
  readonly #options: FullscreenOptions;
  #document?: Document;
  #anchor?: string;
  #members: string[] = [];
  #trigger?: HTMLElement;
  #admitted = false;
  #request = 0;

  constructor(host: HTMLElement & ReactiveControllerHost, options: FullscreenOptions) {
    this.#host = host;
    this.#options = options;
    host.addController(this);
  }

  get active() {
    return this.#admitted && this.#native();
  }

  get anchor() {
    return this.active ? this.#anchor : undefined;
  }

  hostConnected() {
    this.#document = this.#host.ownerDocument;
    this.#document.addEventListener('fullscreenchange', this.#sync);
    this.#document.addEventListener('fullscreenerror', this.#sync);
  }

  hostDisconnected() {
    this.#document?.removeEventListener('fullscreenchange', this.#sync);
    this.#document?.removeEventListener('fullscreenerror', this.#sync);
    this.#document = undefined;
    this.exit();
  }

  hostUpdated() {
    if (!this.active || !this.#anchor) return;
    if (!this.#options.supplied(this.#anchor)) {
      this.exit();
      return;
    }
    const surviving = this.#options.group(this.#anchor);
    const fallback = this.#members.find(id => this.#options.group(id).length);
    if (surviving.length) this.#members = surviving;
    else if (fallback) {
      this.#anchor = fallback;
      this.#members = this.#options.group(fallback);
      this.#options.availabilityChanged();
      this.#host.requestUpdate();
    } else this.exit();
  }

  isCommandAvailable(command: string, anchor: string) {
    switch (command) {
      case '--exit-fullscreen':
        return this.#anchor !== undefined;
      case '--toggle-fullscreen':
        if (this.#anchor !== undefined) return true;
        break;
      case '--enter-fullscreen':
        if (this.#anchor !== undefined)
          return this.active && !this.#members.includes(anchor) && this.#options.group(anchor).length > 0;
        break;
      default:
        return false;
    }
    return (
      typeof this.#host.requestFullscreen === 'function' &&
      this.#host.ownerDocument.fullscreenEnabled &&
      this.#options.group(anchor).length > 0
    );
  }

  command(command: string | undefined, anchor: string, trigger?: HTMLElement | null) {
    switch (command) {
      case '--enter-fullscreen':
        this.enter(anchor, trigger);
        return true;
      case '--exit-fullscreen':
        this.exit();
        return true;
      case '--toggle-fullscreen':
        if (this.#anchor !== undefined) this.exit();
        else this.enter(anchor, trigger);
        return true;
      case undefined:
      default:
        return false;
    }
  }

  enter(anchor: string, trigger?: HTMLElement | null) {
    const members = this.#options.group(anchor);
    if (!members.length || typeof this.#host.requestFullscreen !== 'function') return;
    this.#options.cancel();
    this.#anchor = anchor;
    this.#members = members;
    this.#trigger = trigger ?? undefined;
    this.#options.availabilityChanged();
    if (this.active) {
      this.#host.requestUpdate();
      return;
    }
    // Request within the invoking gesture; only native admission activates the projection.
    const request = ++this.#request;
    void this.#host.requestFullscreen().then(
      () => {
        if (request === this.#request) this.#sync();
        else if (!this.#anchor && this.#native()) this.exit();
      },
      () => {
        if (request === this.#request) this.#reset();
      }
    );
  }

  exit() {
    ++this.#request;
    if (this.#native()) void this.#host.ownerDocument.exitFullscreen().catch(() => this.#sync());
    else this.#reset();
  }

  #native() {
    const root = this.#host.getRootNode();
    return (
      (root instanceof ShadowRoot ? root.fullscreenElement : this.#host.ownerDocument.fullscreenElement) === this.#host
    );
  }

  #sync = () => {
    if (this.#native() && this.#anchor) {
      if (!this.#admitted) this.#options.availabilityChanged();
      this.#admitted = true;
      this.#host.requestUpdate();
    } else if (this.#native()) this.exit();
    else this.#reset();
  };

  #reset() {
    const anchor = this.#anchor;
    const trigger = this.#trigger;
    const admitted = this.#admitted;
    this.#anchor = undefined;
    this.#members = [];
    this.#trigger = undefined;
    this.#admitted = false;
    if (anchor !== undefined || admitted) this.#options.availabilityChanged();
    this.#host.requestUpdate();
    if (admitted)
      void this.#host.updateComplete.then(() => {
        if (trigger?.isConnected && isFocusable(trigger) && trigger.checkVisibility({ visibilityProperty: true }))
          trigger.focus();
        else if (anchor) this.#options.focus(anchor);
      });
  }
}
