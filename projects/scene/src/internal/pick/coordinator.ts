// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { PickCompletion, PickHit, PickRequest, PickRequestKind } from './types.js';

interface PickCoordinatorOptions<T = PickHit> {
  readonly onComplete?: (completion: PickCompletion<T>) => void;
  readonly onStaleHover?: (request: PickRequest) => void;
}

interface PickRequestHandle<T = PickHit> {
  readonly request: PickRequest;
  /** Resolves in dispatch order for pointer requests; stale hovers resolve null. */
  readonly result: Promise<T | null>;
}

interface PendingOrdered<T> {
  readonly request: PickRequest;
  readonly reject: (reason?: unknown) => void;
  readonly resolve: (hit: T | null) => void;
  error?: unknown;
  failed: boolean;
  hit: T | null;
  settled: boolean;
}

/**
 * Coordinates asynchronous GPU readbacks without imposing GPU ordering. Down,
 * up, and click leave the coordinator in request order; hover accepts only the
 * newest completion.
 */
export class PickCoordinator<T = PickHit> {
  #nextSequence = 0;
  #nextOrdered = 1;
  #nextOrderedToRelease = 1;
  #latestHover = 0;
  #ordered = new Map<number, PendingOrdered<T>>();
  #onComplete?: (completion: PickCompletion<T>) => void;
  #onStaleHover?: (request: PickRequest) => void;

  constructor(options: PickCoordinatorOptions<T> = {}) {
    this.#onComplete = options.onComplete;
    this.#onStaleHover = options.onStaleHover;
  }

  get latestSequence(): number {
    return this.#nextSequence;
  }

  request(
    kind: PickRequestKind,
    resolver: (request: PickRequest) => T | null | PromiseLike<T | null>
  ): PickRequestHandle<T> {
    const request: PickRequest = Object.freeze({ kind, sequence: ++this.#nextSequence });
    const result = kind === 'hover' ? this.#requestHover(request, resolver) : this.#requestOrdered(request, resolver);
    return { request, result };
  }

  #requestHover(
    request: PickRequest,
    resolver: (request: PickRequest) => T | null | PromiseLike<T | null>
  ): Promise<T | null> {
    this.#latestHover = request.sequence;
    return Promise.resolve()
      .then(() => resolver(request))
      .then(
        hit => {
          if (request.sequence !== this.#latestHover) {
            this.#onStaleHover?.(request);
            return null;
          }
          this.#onComplete?.({ request, hit });
          return hit;
        },
        error => {
          if (request.sequence !== this.#latestHover) {
            this.#onStaleHover?.(request);
            return null;
          }
          throw error;
        }
      );
  }

  #requestOrdered(
    request: PickRequest,
    resolver: (request: PickRequest) => T | null | PromiseLike<T | null>
  ): Promise<T | null> {
    const order = this.#nextOrdered++;
    let resolveResult!: (hit: T | null) => void;
    let rejectResult!: (reason?: unknown) => void;
    const result = new Promise<T | null>((resolve, reject) => {
      resolveResult = resolve;
      rejectResult = reject;
    });
    const pending: PendingOrdered<T> = {
      request,
      reject: rejectResult,
      resolve: resolveResult,
      hit: null,
      settled: false,
      failed: false
    };
    this.#ordered.set(order, pending);
    void Promise.resolve()
      .then(() => resolver(request))
      .then(
        hit => {
          pending.hit = hit;
          pending.settled = true;
          this.#releaseOrdered();
        },
        error => {
          pending.error = error;
          pending.failed = true;
          pending.settled = true;
          this.#releaseOrdered();
        }
      );
    return result;
  }

  #releaseOrdered(): void {
    while (true) {
      const pending = this.#ordered.get(this.#nextOrderedToRelease);
      if (!pending?.settled) return;
      this.#ordered.delete(this.#nextOrderedToRelease);
      this.#nextOrderedToRelease += 1;
      if (pending.failed) {
        pending.reject(pending.error);
      } else {
        this.#onComplete?.({ request: pending.request, hit: pending.hit });
        pending.resolve(pending.hit);
      }
    }
  }
}

export type { PickCompletion } from './types.js';
