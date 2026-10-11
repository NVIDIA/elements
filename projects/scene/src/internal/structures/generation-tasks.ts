// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export type GenerationTaskState = 'pending' | 'completed' | 'failed' | 'cancelled' | 'superseded';

/** One generation's input and terminal transitions. Settled tasks can never become current again. */
export interface GenerationTask<Input> {
  readonly value: Input;
  readonly state: GenerationTaskState;
  readonly isCurrent: () => boolean;
  /** Completes only a current task and releases its key. */
  complete(): boolean;
  /** Fails only a current task and releases its key. */
  fail(): boolean;
}

interface OwnedGenerationTask<Input> extends GenerationTask<Input> {
  cancel(reason: 'cancelled' | 'superseded'): void;
}

/** Owns one pending generation per key, independently of scheduling, results, and resource cleanup. */
export class GenerationTasks<Key, Input> {
  readonly #tasks = new Map<Key, OwnedGenerationTask<Input>>();

  get(key: Key): Input | undefined {
    return this.#tasks.get(key)?.value;
  }

  /** Supersedes pending work even when its replacement reuses the same input. */
  start(key: Key, value: Input): GenerationTask<Input> {
    this.#tasks.get(key)?.cancel('superseded');
    const task = createGenerationTask(value, () => this.#tasks.delete(key));
    this.#tasks.set(key, task);
    return task;
  }

  cancel(key: Key): void {
    this.#tasks.get(key)?.cancel('cancelled');
  }

  /** Cancels every task whose key no longer belongs to the owner. */
  retain(keys: ReadonlySet<Key>): void {
    for (const [key, task] of this.#tasks) {
      if (!keys.has(key)) task.cancel('cancelled');
    }
  }

  clear(): void {
    for (const task of this.#tasks.values()) task.cancel('cancelled');
  }
}

function createGenerationTask<Input>(value: Input, release: () => void): OwnedGenerationTask<Input> {
  let state: GenerationTaskState = 'pending';
  let releaseKey: (() => void) | undefined = release;
  const settle = (next: Exclude<GenerationTaskState, 'pending'>): boolean => {
    if (state !== 'pending') return false;
    state = next;
    releaseKey?.();
    releaseKey = undefined;
    return true;
  };
  return {
    value,
    get state() {
      return state;
    },
    isCurrent: () => state === 'pending',
    complete: () => settle('completed'),
    fail: () => settle('failed'),
    cancel: reason => {
      settle(reason);
    }
  };
}
