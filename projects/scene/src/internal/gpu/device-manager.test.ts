// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, describe, expect, it, vi } from 'vitest';
import { configureSceneTesting, resetSceneTesting } from '../testing.js';
import { sharedDeviceManager, type SharedDeviceListener } from './device-manager.js';
import type { SceneGPUAdapter, SceneGPUDevice, SceneGPUDeviceLostInfo } from './platform.js';

describe('sharedDeviceManager', () => {
  afterEach(() => {
    resetSceneTesting();
    vi.restoreAllMocks();
  });

  it('clears a rejected request so the next acquire can retry', async () => {
    const device = createFakeDevice();
    const adapter: SceneGPUAdapter = {
      requestDevice: vi
        .fn<SceneGPUAdapter['requestDevice']>()
        .mockRejectedValueOnce(new Error('request failed'))
        .mockResolvedValueOnce(device)
    };
    configureManagerPlatform(adapter);

    const first = sharedDeviceManager.acquire();
    await expect(first).rejects.toThrow('request failed');
    expect(sharedDeviceManager.getSnapshot()).toMatchObject({ hasDevice: false, requestDeviceCount: 1 });

    const second = sharedDeviceManager.acquire();
    expect(second).not.toBe(first);
    await expect(second).resolves.toMatchObject({ device, format: 'bgra8unorm' });
    expect(adapter.requestDevice).toHaveBeenCalledTimes(2);
  });

  it('destroys superseded devices and keeps the newer generation active', async () => {
    const firstRequest = createDeferred<SceneGPUDevice>();
    const secondRequest = createDeferred<SceneGPUDevice>();
    const adapter: SceneGPUAdapter = {
      requestDevice: vi
        .fn<SceneGPUAdapter['requestDevice']>()
        .mockReturnValueOnce(firstRequest.promise)
        .mockReturnValueOnce(secondRequest.promise)
    };
    configureManagerPlatform(adapter);

    const superseded = sharedDeviceManager.acquire();
    sharedDeviceManager.reset();
    const current = sharedDeviceManager.acquire();

    const staleDevice = createFakeDevice();
    firstRequest.resolve(staleDevice);
    await expect(superseded).rejects.toMatchObject({ name: 'AbortError' });
    expect(staleDevice.destroy).toHaveBeenCalledOnce();

    const currentDevice = createFakeDevice();
    secondRequest.resolve(currentDevice);
    await expect(current).resolves.toMatchObject({ device: currentDevice, format: 'bgra8unorm' });
    expect(sharedDeviceManager.getSnapshot()).toMatchObject({ hasDevice: true });
  });

  it('ignores loss notifications from stale devices after a newer device is active', async () => {
    const staleDevice = createFakeDevice();
    const currentDevice = createFakeDevice();
    const adapter: SceneGPUAdapter = {
      requestDevice: vi
        .fn<SceneGPUAdapter['requestDevice']>()
        .mockResolvedValueOnce(staleDevice)
        .mockResolvedValueOnce(currentDevice)
    };
    configureManagerPlatform(adapter);
    const listener = createListener();

    await sharedDeviceManager.acquire();
    sharedDeviceManager.reset();
    sharedDeviceManager.subscribe(listener);
    await sharedDeviceManager.acquire();

    staleDevice.lose({ message: 'stale loss', reason: 'unknown' });
    await Promise.resolve();

    expect(listener.deviceLost).not.toHaveBeenCalled();
    expect(listener.deviceRecovered).not.toHaveBeenCalled();
    expect(listener.recoveryFailed).not.toHaveBeenCalled();
    expect(sharedDeviceManager.getSnapshot()).toMatchObject({ hasDevice: true });
  });

  it('blocks automatic recovery after a rapid second loss and resumes after reconnect allowance', async () => {
    let now = 1_000;
    const firstDevice = createFakeDevice();
    const secondDevice = createFakeDevice();
    const thirdDevice = createFakeDevice();
    const adapter: SceneGPUAdapter = {
      requestDevice: vi
        .fn<SceneGPUAdapter['requestDevice']>()
        .mockResolvedValueOnce(firstDevice)
        .mockResolvedValueOnce(secondDevice)
        .mockResolvedValueOnce(thirdDevice)
    };
    configureManagerPlatform(adapter, { now: () => now });
    const listener = createListener();
    sharedDeviceManager.subscribe(listener);

    await sharedDeviceManager.acquire();
    now = 1_500;
    firstDevice.lose({ message: 'first loss', reason: 'unknown' });
    await vi.waitFor(() => expect(listener.deviceRecovered).toHaveBeenCalledTimes(1));
    expect(adapter.requestDevice).toHaveBeenCalledTimes(2);

    now = 2_000;
    secondDevice.lose({ message: 'second loss', reason: 'unknown' });
    await vi.waitFor(() => expect(listener.deviceLost).toHaveBeenCalledTimes(2));
    expect(sharedDeviceManager.getSnapshot()).toMatchObject({ recoveryBlocked: true });
    expect(adapter.requestDevice).toHaveBeenCalledTimes(2);

    sharedDeviceManager.allowRecoveryAfterReconnect();
    await expect(sharedDeviceManager.acquire()).resolves.toMatchObject({ device: thirdDevice, format: 'bgra8unorm' });
    expect(sharedDeviceManager.getSnapshot()).toMatchObject({ hasDevice: true, recoveryBlocked: false });
    expect(adapter.requestDevice).toHaveBeenCalledTimes(3);
  });

  it('notifies listeners when recovery fails after device loss', async () => {
    const firstDevice = createFakeDevice();
    const recoveryError = new Error('recovery failed');
    const adapter: SceneGPUAdapter = {
      requestDevice: vi
        .fn<SceneGPUAdapter['requestDevice']>()
        .mockResolvedValueOnce(firstDevice)
        .mockRejectedValueOnce(recoveryError)
    };
    configureManagerPlatform(adapter, { now: () => 5_000 });
    const listener = createListener();
    sharedDeviceManager.subscribe(listener);

    await sharedDeviceManager.acquire();
    firstDevice.lose({ message: 'device lost', reason: 'unknown' });

    await vi.waitFor(() => expect(listener.recoveryFailed).toHaveBeenCalledWith(recoveryError));
    expect(listener.deviceRecovered).not.toHaveBeenCalled();
    expect(sharedDeviceManager.getSnapshot()).toMatchObject({ hasDevice: false, recoveryBlocked: false });
  });
});

function configureManagerPlatform(adapter: SceneGPUAdapter, overrides: Partial<{ now: () => number }> = {}): void {
  configureSceneTesting({
    requestAdapter: async () => adapter,
    getPreferredCanvasFormat: () => 'bgra8unorm',
    ...overrides
  });
}

function createListener(): SharedDeviceListener {
  return {
    deviceLost: vi.fn(),
    deviceRecovered: vi.fn(),
    recoveryFailed: vi.fn()
  };
}

function createDeferred<T>(): {
  readonly promise: Promise<T>;
  reject(error: unknown): void;
  resolve(value: T): void;
} {
  let resolve: (value: T) => void = () => undefined;
  let reject: (error: unknown) => void = () => undefined;
  const promise = new Promise<T>((promiseResolve, promiseReject) => {
    resolve = promiseResolve;
    reject = promiseReject;
  });
  return { promise, reject, resolve };
}

function createFakeDevice(): SceneGPUDevice & {
  readonly destroy: ReturnType<typeof vi.fn>;
  lose(info: SceneGPUDeviceLostInfo): void;
} {
  const lost = createDeferred<SceneGPUDeviceLostInfo>();
  const destroy = vi.fn();
  return {
    lost: lost.promise,
    queue: { submit: () => undefined },
    createCommandEncoder: () => ({ beginRenderPass: () => ({ end: () => undefined }), finish: () => ({}) }),
    destroy,
    lose: info => lost.resolve(info)
  };
}
