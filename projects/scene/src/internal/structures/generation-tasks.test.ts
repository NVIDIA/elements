// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { GenerationTasks, type GenerationTask, type GenerationTaskState } from './generation-tasks.js';

interface Attempt {
  readonly key: number;
  state: GenerationTaskState;
  readonly task: GenerationTask<number>;
}

describe(GenerationTasks.name, () => {
  it.each(['complete', 'fail'] as const)('releases a current key through %s exactly once', settle => {
    const tasks = new GenerationTasks<string, { version: number }>();
    const value = { version: 1 };
    const task = tasks.start('mesh', value);
    const isCurrent = task.isCurrent;
    expect(tasks.get('mesh')).toBe(value);
    expect(task.value).toBe(value);
    expect(task.state).toBe('pending');
    expect(isCurrent()).toBe(true);
    expect(task[settle]()).toBe(true);
    expect(task.state).toBe(settle === 'complete' ? 'completed' : 'failed');
    expect(isCurrent()).toBe(false);
    expect(tasks.get('mesh')).toBeUndefined();
    expect(task.complete()).toBe(false);
    expect(task.fail()).toBe(false);
    tasks.cancel('mesh');
    tasks.clear();
    expect(task.state).toBe(settle === 'complete' ? 'completed' : 'failed');
  });

  it('supersedes reused inputs without allowing an old success or failure to remove its replacement', () => {
    const tasks = new GenerationTasks<string, object>();
    const value = {};
    const first = tasks.start('mesh', value);
    const second = tasks.start('mesh', value);
    expect(first.state).toBe('superseded');
    expect(first.isCurrent()).toBe(false);
    expect(first.complete()).toBe(false);
    expect(first.fail()).toBe(false);
    expect(second.isCurrent()).toBe(true);
    expect(tasks.get('mesh')).toBe(value);
    expect(second.complete()).toBe(true);
    expect(tasks.get('mesh')).toBeUndefined();
  });

  it('cancels removed owners while retaining independent keys and mutable task input', () => {
    const tasks = new GenerationTasks<object, { source: number }>();
    const firstKey = {};
    const secondKey = {};
    const first = tasks.start(firstKey, { source: 1 });
    const second = tasks.start(secondKey, { source: 2 });
    tasks.get(secondKey)!.source = 3;
    tasks.retain(new Set([secondKey]));
    expect(first.state).toBe('cancelled');
    expect(first.complete()).toBe(false);
    expect(first.fail()).toBe(false);
    expect(tasks.get(firstKey)).toBeUndefined();
    expect(second.value.source).toBe(3);
    expect(second.isCurrent()).toBe(true);
    tasks.cancel({});
    tasks.cancel(firstKey);
    expect(second.isCurrent()).toBe(true);
    tasks.cancel(secondKey);
    expect(second.state).toBe('cancelled');
    expect(tasks.get(secondKey)).toBeUndefined();
  });

  it('invalidates every pending task on clear and permits a fresh generation for the same key', () => {
    const tasks = new GenerationTasks<string, number>();
    const settled = tasks.start('settled', 0);
    settled.complete();
    const first = tasks.start('first', 1);
    const second = tasks.start('second', 2);
    tasks.clear();
    tasks.clear();
    expect(first.state).toBe('cancelled');
    expect(second.state).toBe('cancelled');
    expect(settled.state).toBe('completed');
    const next = tasks.start('first', 1);
    expect(first.complete()).toBe(false);
    expect(second.fail()).toBe(false);
    expect(next.isCurrent()).toBe(true);
    expect(tasks.get('first')).toBe(1);
    expect(tasks.get('second')).toBeUndefined();
    tasks.retain(new Set());
    expect(next.state).toBe('cancelled');
  });

  it('preserves generation ownership through a deterministic mixed sequence of late settlements', () => {
    const tasks = new GenerationTasks<number, number>();
    const owners = new Map<number, number>();
    const attempts: Attempt[] = [];
    let seed = 17;
    for (let step = 0; step < 200; step += 1) {
      seed = (Math.imul(seed, 1_664_525) + 1_013_904_223) >>> 0;
      const key = seed % 5;
      const operation = (seed >>> 8) % 5;
      if (operation === 0 || attempts.length === 0) {
        const previous = owners.get(key);
        if (previous !== undefined) attempts[previous]!.state = 'superseded';
        owners.set(key, attempts.length);
        attempts.push({ key, state: 'pending', task: tasks.start(key, step) });
      } else if (operation === 1) {
        const previous = owners.get(key);
        if (previous !== undefined) attempts[previous]!.state = 'cancelled';
        owners.delete(key);
        tasks.cancel(key);
      } else if (operation === 2) {
        for (const previous of owners.values()) attempts[previous]!.state = 'cancelled';
        owners.clear();
        tasks.clear();
      } else {
        const index = (seed >>> 16) % attempts.length;
        settleAttempt(attempts, owners, { index, operation });
      }
      expectOwnership(tasks, owners, attempts);
    }
  });
});

function settleAttempt(
  attempts: Attempt[],
  owners: Map<number, number>,
  options: { readonly index: number; readonly operation: number }
): void {
  const attempt = attempts[options.index]!;
  const current = owners.get(attempt.key) === options.index;
  expect(options.operation === 3 ? attempt.task.complete() : attempt.task.fail()).toBe(current);
  if (current) {
    attempt.state = options.operation === 3 ? 'completed' : 'failed';
    owners.delete(attempt.key);
  }
}

function expectOwnership(
  tasks: GenerationTasks<number, number>,
  owners: Map<number, number>,
  attempts: Attempt[]
): void {
  for (const [index, attempt] of attempts.entries()) {
    expect(attempt.task.state).toBe(attempt.state);
    expect(attempt.task.isCurrent()).toBe(owners.get(attempt.key) === index);
  }
  for (let ownerKey = 0; ownerKey < 5; ownerKey += 1) {
    const index = owners.get(ownerKey);
    expect(tasks.get(ownerKey)).toBe(index === undefined ? undefined : attempts[index]!.task.value);
  }
}
