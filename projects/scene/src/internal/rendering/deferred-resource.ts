// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/** A resource whose installation belongs to one renderer/device generation. */
export interface DeferredResource {
  activate(): void;
  dispose(): void;
}

interface DeferredResourceOptions {
  /** Returns false as soon as the owning renderer has changed generation. */
  readonly isCurrent: () => boolean;
  readonly load: () => Promise<DeferredResource>;
  readonly onFailure: (error: unknown) => void;
  readonly onReady: () => void;
}

/** Creates a resource that allocates only when its current attempt activates. */
export function createDeferredResource<T>(
  create: () => T,
  install: (value: T) => void,
  release: (value: T) => void
): DeferredResource {
  let value: T | undefined;
  return {
    activate: () => {
      value = create();
      install(value);
    },
    dispose: () => {
      if (value !== undefined) release(value);
    }
  };
}

type DeferredResourceStatus = 'idle' | 'loading' | 'ready' | 'failed';

interface DeferredFailure {
  readonly attempt: number;
  readonly error: unknown;
  readonly resource: DeferredResource | undefined;
}

/**
 * Serializes lazy resource loading without allowing an obsolete completion to
 * mutate a newer renderer generation. The resource, rather than the caller,
 * owns cleanup for both activated and never-activated results.
 */
export class DeferredResourceTask {
  #attempt = 0;
  readonly #disposed = new WeakSet<DeferredResource>();
  #installed?: DeferredResource;
  #pending?: Promise<void>;
  #status: DeferredResourceStatus = 'idle';

  get status(): DeferredResourceStatus {
    return this.#status;
  }

  start(options: DeferredResourceOptions): Promise<void> {
    if (this.#status === 'loading' && this.#pending) return this.#pending;
    if (this.#status === 'ready' || this.#status === 'failed') return Promise.resolve();

    const attempt = ++this.#attempt;
    this.#status = 'loading';
    const pending = this.#startAttempt(attempt, options);
    this.#pending = pending;
    return pending;
  }

  /** Invalidates every outstanding completion before releasing its resource. */
  reset(): void {
    this.#attempt += 1;
    this.#pending = undefined;
    this.#status = 'idle';
    const installed = this.#installed;
    this.#installed = undefined;
    if (installed) this.#dispose(installed);
  }

  async #startAttempt(attempt: number, options: DeferredResourceOptions): Promise<void> {
    let resource: DeferredResource | undefined;
    try {
      resource = await options.load();
      this.#activateCurrent(attempt, options, resource);
    } catch (error) {
      this.#failCurrent(options, { attempt, error, resource });
    } finally {
      if (attempt === this.#attempt) this.#pending = undefined;
    }
  }

  #activateCurrent(attempt: number, options: DeferredResourceOptions, resource: DeferredResource): void {
    if (!this.#isCurrent(attempt, options)) {
      this.#dispose(resource);
      return;
    }
    this.#installed = resource;
    resource.activate();
    if (!this.#isCurrent(attempt, options) || this.#installed !== resource) {
      if (this.#installed === resource) this.#installed = undefined;
      this.#dispose(resource);
      return;
    }
    this.#status = 'ready';
    options.onReady();
  }

  #failCurrent(options: DeferredResourceOptions, failure: DeferredFailure): void {
    if (failure.resource && this.#installed !== failure.resource) this.#dispose(failure.resource);
    if (!this.#isCurrent(failure.attempt, options)) return;
    const installed = this.#installed;
    this.#installed = undefined;
    if (installed) this.#dispose(installed);
    this.#status = 'failed';
    options.onFailure(failure.error);
  }

  #isCurrent(attempt: number, options: DeferredResourceOptions): boolean {
    return attempt === this.#attempt && options.isCurrent();
  }

  #dispose(resource: DeferredResource): void {
    if (this.#disposed.has(resource)) return;
    this.#disposed.add(resource);
    resource.dispose();
  }
}
