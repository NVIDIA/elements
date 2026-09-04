// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, test, vi } from 'vitest';
import { createDeferredResource, DeferredResourceTask, type DeferredResource } from './deferred-resource.js';

function deferred<T>(): { promise: Promise<T>; reject(error: unknown): void; resolve(value: T): void } {
  let reject!: (error: unknown) => void;
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, reject, resolve };
}

function resource() {
  return { activate: vi.fn<() => void>(), dispose: vi.fn<() => void>() } satisfies DeferredResource;
}

describe('DeferredResourceTask', () => {
  test('allocates only on activation and releases an allocated value', () => {
    const create = vi.fn(() => ({ id: 1 }));
    const install = vi.fn();
    const release = vi.fn();
    const resourceTask = createDeferredResource(create, install, release);

    resourceTask.dispose();
    expect(create).not.toHaveBeenCalled();
    expect(release).not.toHaveBeenCalled();
    resourceTask.activate();
    resourceTask.dispose();
    expect(install).toHaveBeenCalledWith({ id: 1 });
    expect(release).toHaveBeenCalledWith({ id: 1 });
  });

  test('deduplicates loading and activates one current resource', async () => {
    const task = new DeferredResourceTask();
    const loaded = deferred<DeferredResource>();
    const onReady = vi.fn();
    const options = { isCurrent: () => true, load: () => loaded.promise, onFailure: vi.fn(), onReady };
    const first = task.start(options);
    expect(task.start(options)).toBe(first);
    const value = resource();
    loaded.resolve(value);
    await first;
    expect(task.status).toBe('ready');
    expect(value.activate).toHaveBeenCalledOnce();
    expect(onReady).toHaveBeenCalledOnce();
  });

  test('disposes an obsolete resolution without reporting or disturbing a new attempt', async () => {
    const task = new DeferredResourceTask();
    const oldLoad = deferred<DeferredResource>();
    const newLoad = deferred<DeferredResource>();
    const onFailure = vi.fn();
    const old = task.start({ isCurrent: () => true, load: () => oldLoad.promise, onFailure, onReady: vi.fn() });
    task.reset();
    const current = task.start({ isCurrent: () => true, load: () => newLoad.promise, onFailure, onReady: vi.fn() });
    const oldResource = resource();
    oldLoad.resolve(oldResource);
    await old;
    expect(oldResource.activate).not.toHaveBeenCalled();
    expect(oldResource.dispose).toHaveBeenCalledOnce();
    expect(task.status).toBe('loading');
    newLoad.resolve(resource());
    await current;
    expect(task.status).toBe('ready');
    expect(onFailure).not.toHaveBeenCalled();
  });

  test('silences an obsolete rejection and reports one current activation failure', async () => {
    const task = new DeferredResourceTask();
    const oldLoad = deferred<DeferredResource>();
    const failures = vi.fn();
    const old = task.start({
      isCurrent: () => true,
      load: () => oldLoad.promise,
      onFailure: failures,
      onReady: vi.fn()
    });
    task.reset();
    oldLoad.reject(new Error('old'));
    await old;
    expect(failures).not.toHaveBeenCalled();

    const failed = resource();
    failed.activate.mockImplementation(() => {
      throw new Error('activate');
    });
    await task.start({ isCurrent: () => true, load: async () => failed, onFailure: failures, onReady: vi.fn() });
    expect(task.status).toBe('failed');
    expect(failed.dispose).toHaveBeenCalledOnce();
    expect(failures).toHaveBeenCalledOnce();
  });

  test('does not reload a settled task and suppresses completion invalidated by an activation', async () => {
    const task = new DeferredResourceTask();
    const load = vi.fn(async () => resource());
    const onReady = vi.fn();
    await task.start({ isCurrent: () => true, load, onFailure: vi.fn(), onReady });
    await task.start({ isCurrent: () => true, load, onFailure: vi.fn(), onReady });
    expect(load).toHaveBeenCalledOnce();
    expect(onReady).toHaveBeenCalledOnce();

    const invalidated = new DeferredResourceTask();
    let current = true;
    const activating = resource();
    activating.activate.mockImplementation(() => {
      current = false;
    });
    const nextReady = vi.fn();
    await invalidated.start({
      isCurrent: () => current,
      load: async () => activating,
      onFailure: vi.fn(),
      onReady: nextReady
    });
    expect(invalidated.status).toBe('loading');
    expect(nextReady).not.toHaveBeenCalled();
    invalidated.reset();
    expect(activating.dispose).toHaveBeenCalledOnce();
  });

  test('disposes a resource when activation invalidates the owning generation', async () => {
    const task = new DeferredResourceTask();
    let current = true;
    const invalidated = resource();
    invalidated.activate.mockImplementation(() => {
      current = false;
    });
    const onReady = vi.fn();

    await task.start({ isCurrent: () => current, load: async () => invalidated, onFailure: vi.fn(), onReady });
    expect(invalidated.dispose).toHaveBeenCalledOnce();
    expect(onReady).not.toHaveBeenCalled();
    task.reset();
    expect(invalidated.dispose).toHaveBeenCalledOnce();
  });

  test('releases a reset resource once when activation also fails', async () => {
    const task = new DeferredResourceTask();
    const failures = vi.fn();
    const failing = resource();
    failing.activate.mockImplementation(() => {
      task.reset();
      throw new Error('activation reset');
    });

    await task.start({ isCurrent: () => true, load: async () => failing, onFailure: failures, onReady: vi.fn() });
    expect(failing.dispose).toHaveBeenCalledOnce();
    expect(failures).not.toHaveBeenCalled();
    expect(task.status).toBe('idle');
  });
});
