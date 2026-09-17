// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { ReactiveController, ReactiveControllerHost } from 'lit';

export interface KeyStateControllerOptions {
  readonly watchedCodes: ReadonlyArray<string>;
}

type KeyStateHost = ReactiveControllerHost & Pick<HTMLElement, 'ownerDocument'>;

interface KeyStateSubscriber {
  readonly watchedCodes: ReadonlySet<string>;
  readonly requestUpdate: () => void;
}

/** Owns the keyboard state and global listeners shared by active controllers in one document. */
class DocumentKeyStateSource {
  readonly #document: Document;
  readonly #pressedCodes = new Set<string>();
  readonly #subscribers = new Set<KeyStateSubscriber>();

  constructor(document: Document) {
    this.#document = document;
  }

  subscribe(subscriber: KeyStateSubscriber): void {
    if (this.#subscribers.has(subscriber)) return;
    if (this.#subscribers.size === 0) this.#addListeners();
    this.#subscribers.add(subscriber);
  }

  unsubscribe(subscriber: KeyStateSubscriber): void {
    if (!this.#subscribers.delete(subscriber) || this.#subscribers.size > 0) return;
    this.#removeListeners();
    this.#pressedCodes.clear();
  }

  isPressed(code: string): boolean {
    return this.#pressedCodes.has(code);
  }

  #addListeners(): void {
    const view = this.#document.defaultView;
    view?.addEventListener('keydown', this.#handleKeyDown, true);
    view?.addEventListener('keyup', this.#handleKeyUp, true);
    view?.addEventListener('blur', this.#clear);
    this.#document.addEventListener('visibilitychange', this.#handleVisibilityChange);
  }

  #removeListeners(): void {
    const view = this.#document.defaultView;
    view?.removeEventListener('keydown', this.#handleKeyDown, true);
    view?.removeEventListener('keyup', this.#handleKeyUp, true);
    view?.removeEventListener('blur', this.#clear);
    this.#document.removeEventListener('visibilitychange', this.#handleVisibilityChange);
  }

  #handleKeyDown = (event: KeyboardEvent): void => {
    if (this.#pressedCodes.has(event.code)) return;
    this.#pressedCodes.add(event.code);
    this.#notifySubscribers(event.code);
  };

  #handleKeyUp = (event: KeyboardEvent): void => {
    if (!this.#pressedCodes.delete(event.code)) return;
    this.#notifySubscribers(event.code);
  };

  #handleVisibilityChange = (): void => {
    if (this.#document.visibilityState === 'hidden') this.#clear();
  };

  #clear = (): void => {
    if (this.#pressedCodes.size === 0) return;
    const changedCodes = [...this.#pressedCodes];
    this.#pressedCodes.clear();
    for (const subscriber of this.#subscribers) {
      if (changedCodes.some(code => subscriber.watchedCodes.has(code))) subscriber.requestUpdate();
    }
  };

  #notifySubscribers(code: string): void {
    for (const subscriber of this.#subscribers) {
      if (subscriber.watchedCodes.has(code)) subscriber.requestUpdate();
    }
  }
}

const documentKeyStateSources = new WeakMap<Document, DocumentKeyStateSource>();

function keyStateSourceFor(document: Document): DocumentKeyStateSource {
  let source = documentKeyStateSources.get(document);
  if (!source) {
    source = new DocumentKeyStateSource(document);
    documentKeyStateSources.set(document, source);
  }
  return source;
}

/** Provides host-scoped access to shared raw keyboard state without assigning interaction semantics to any key. */
export class KeyStateController implements ReactiveController {
  readonly #host: KeyStateHost;
  readonly #subscriber: KeyStateSubscriber;
  #connected = false;
  #enabled = false;
  #source?: DocumentKeyStateSource;

  constructor(host: KeyStateHost, { watchedCodes }: KeyStateControllerOptions) {
    this.#host = host;
    this.#subscriber = {
      watchedCodes: new Set(watchedCodes),
      requestUpdate: () => host.requestUpdate()
    };
    host.addController(this);
  }

  /** Enables shared keyboard tracking during the host's connected lifecycle. */
  get enabled(): boolean {
    return this.#enabled;
  }

  set enabled(value: boolean) {
    if (value === this.#enabled) return;
    this.#enabled = value;
    this.#syncSubscription();
  }

  /** Returns whether a key identified by `KeyboardEvent.code` is currently held. */
  isPressed(code: string): boolean {
    return this.#source?.isPressed(code) ?? false;
  }

  hostConnected(): void {
    this.#connected = true;
    this.#syncSubscription();
  }

  hostDisconnected(): void {
    this.#connected = false;
    this.#syncSubscription();
  }

  #syncSubscription(): void {
    const source = this.#connected && this.#enabled ? keyStateSourceFor(this.#host.ownerDocument) : undefined;
    if (source === this.#source) return;
    this.#source?.unsubscribe(this.#subscriber);
    this.#source = source;
    this.#source?.subscribe(this.#subscriber);
  }
}
