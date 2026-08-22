// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { PickCompletion, PickHit, PickRequest, PickRequestKind } from './types.js';

interface PickCoordinatorOptions<T = PickHit> {
  readonly now?: () => number;
  readonly onComplete?: (completion: PickCompletion<T>) => void;
  readonly onHoverLatency?: (latency: number, request: PickRequest) => void;
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

interface PendingHover<T> {
  readonly reject: (reason?: unknown) => void;
  readonly requestedAt: number;
  readonly request: PickRequest;
  readonly resolve: (hit: T | null) => void;
  readonly resolver: (request: PickRequest) => T | null | PromiseLike<T | null>;
}

/**
 * Coordinates asynchronous GPU readbacks without imposing GPU ordering. Down,
 * up, and click leave the coordinator in request order. Hover keeps at most one
 * resolver in flight and one latest request queued.
 */
export class PickCoordinator<T = PickHit> {
  #nextSequence = 0;
  #nextOrdered = 1;
  #nextOrderedToRelease = 1;
  #activeHover?: PendingHover<T>;
  #queuedHover?: PendingHover<T>;
  #ordered = new Map<number, PendingOrdered<T>>();
  #now: () => number;
  #onComplete?: (completion: PickCompletion<T>) => void;
  #onHoverLatency?: (latency: number, request: PickRequest) => void;
  #onStaleHover?: (request: PickRequest) => void;

  constructor(options: PickCoordinatorOptions<T> = {}) {
    this.#now = options.now ?? (() => 0);
    this.#onComplete = options.onComplete;
    this.#onHoverLatency = options.onHoverLatency;
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
    let resolveResult!: (hit: T | null) => void;
    let rejectResult!: (reason?: unknown) => void;
    const result = new Promise<T | null>((resolve, reject) => {
      resolveResult = resolve;
      rejectResult = reject;
    });
    const pending: PendingHover<T> = {
      reject: rejectResult,
      requestedAt: this.#now(),
      request,
      resolve: resolveResult,
      resolver
    };
    if (!this.#activeHover) {
      this.#startHover(pending);
    } else {
      if (this.#queuedHover) this.#settleStaleHover(this.#queuedHover);
      this.#queuedHover = pending;
    }
    return result;
  }

  #startHover(pending: PendingHover<T>): void {
    this.#activeHover = pending;
    void Promise.resolve()
      .then(() => pending.resolver(pending.request))
      .then(
        hit => this.#settleActiveHover(pending, { hit }),
        error => this.#settleActiveHover(pending, { error })
      );
  }

  #settleActiveHover(pending: PendingHover<T>, outcome: { readonly error?: unknown; readonly hit?: T | null }): void {
    try {
      if (this.#queuedHover) {
        this.#settleStaleHover(pending);
      } else if ('error' in outcome) {
        pending.reject(outcome.error);
      } else {
        const hit = outcome.hit ?? null;
        this.#onHoverLatency?.(Math.max(0, this.#now() - pending.requestedAt), pending.request);
        this.#onComplete?.({ request: pending.request, hit });
        pending.resolve(hit);
      }
    } catch (error) {
      pending.reject(error);
    } finally {
      if (this.#activeHover === pending) this.#activeHover = undefined;
      const queued = this.#queuedHover;
      this.#queuedHover = undefined;
      if (queued) this.#startHover(queued);
    }
  }

  #settleStaleHover(pending: PendingHover<T>): void {
    try {
      this.#onStaleHover?.(pending.request);
      pending.resolve(null);
    } catch (error) {
      pending.reject(error);
    }
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
