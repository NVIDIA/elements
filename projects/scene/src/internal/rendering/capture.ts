// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { createPreparationContext, PREPARATION_CHUNK_SIZE, type PreparationContext } from './preparation.js';

/** A synchronous assignment must fit one preparation chunk before allocating snapshots. */
export class SynchronousCaptureLimitError extends RangeError {
  constructor(property: 'geometry' | 'grid') {
    super(`Input exceeds the synchronous capture limit; assign ${property} and await loadComplete for large inputs.`);
  }
}

export function assertSynchronousCapture(length: number, property: 'geometry' | 'grid'): void {
  if (length > PREPARATION_CHUNK_SIZE) throw new SynchronousCaptureLimitError(property);
}

const CAPTURE_COMPLETE = Promise.resolve();

/** Tracks one borrowed input until the caller can atomically publish its private snapshot. */
export class SnapshotCapture {
  #generation = 0;
  readonly #onFailure?: (error: unknown) => void;
  complete: Promise<void> = CAPTURE_COMPLETE;

  constructor(onFailure?: (error: unknown) => void) {
    this.#onFailure = onFailure;
  }

  cancel(): void {
    this.#generation += 1;
    this.complete = CAPTURE_COMPLETE;
  }

  run(capture: (context: PreparationContext) => Promise<void>, signal?: AbortSignal): Promise<void> {
    const generation = ++this.#generation;
    const context = createPreparationContext(() => generation === this.#generation && !signal?.aborted);
    const pending = capture(context)
      .then(() => {
        if (!context.isCurrent()) throw new DOMException('Snapshot capture cancelled.', 'AbortError');
      })
      .catch((error: unknown) => {
        if (context.isCurrent()) this.#onFailure?.(error);
        throw error;
      });
    this.complete = pending;
    void pending.catch(() => {});
    return pending;
  }
}

/** Copies and validates 16,384-scalar ranges, yielding after at most four ranges per task. */
export function* copySnapshot<T extends Float32Array | Uint32Array | Uint8Array>(
  source: T,
  target: T,
  validate: (values: T) => void
): Generator<void, T> {
  for (let start = 0; start < source.length; start += PREPARATION_CHUNK_SIZE) {
    const end = Math.min(source.length, start + PREPARATION_CHUNK_SIZE);
    target.set(source.subarray(start, end), start);
    validate(target.subarray(start, end) as T);
    if (end < source.length && end % (PREPARATION_CHUNK_SIZE * 4) === 0) yield;
  }
  return target;
}
