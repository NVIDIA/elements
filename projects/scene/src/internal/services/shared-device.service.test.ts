// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, describe, expect, it, vi } from 'vitest';
import { configureSceneTesting, resetSceneTesting } from '../testing.js';
import type { SceneGPUAdapter, SceneGPUDevice, SceneGPUDeviceLostInfo } from '../gpu/platform.js';
import { sharedDeviceService, type SharedDeviceListener } from './shared-device.service.js';

describe('sharedDeviceService', () => {
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
    configureServicePlatform(adapter);

    const first = sharedDeviceService.acquire();
    await expect(first).rejects.toThrow('request failed');
    expect(adapter.requestDevice).toHaveBeenCalledOnce();

    const second = sharedDeviceService.acquire();
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
    configureServicePlatform(adapter);

    const superseded = sharedDeviceService.acquire();
    sharedDeviceService.reset();
    const current = sharedDeviceService.acquire();

    const staleDevice = createFakeDevice();
    firstRequest.resolve(staleDevice);
    await expect(superseded).rejects.toMatchObject({ name: 'AbortError' });
    expect(staleDevice.destroy).toHaveBeenCalledOnce();

    const currentDevice = createFakeDevice();
    secondRequest.resolve(currentDevice);
    await expect(current).resolves.toMatchObject({ device: currentDevice, format: 'bgra8unorm' });
    expect(adapter.requestDevice).toHaveBeenCalledTimes(2);
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
    configureServicePlatform(adapter);
    const listener = createListener();

    await sharedDeviceService.acquire();
    sharedDeviceService.reset();
    sharedDeviceService.subscribe(listener);
    await sharedDeviceService.acquire();

    staleDevice.lose({ message: 'stale loss', reason: 'unknown' });
    await Promise.resolve();

    expect(listener.deviceLost).not.toHaveBeenCalled();
    expect(listener.deviceRecovered).not.toHaveBeenCalled();
    expect(listener.recoveryFailed).not.toHaveBeenCalled();
    await expect(sharedDeviceService.acquire()).resolves.toMatchObject({ device: currentDevice });
    expect(adapter.requestDevice).toHaveBeenCalledTimes(2);
  });

  it('resumes blocked recovery for the listeners that were already subscribed when reconnect starts', async () => {
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
    configureServicePlatform(adapter, { now: () => now });
    const retainedA = createListener();
    const retainedB = createListener();
    const reconnecting = createListener();
    sharedDeviceService.subscribe(retainedA);
    sharedDeviceService.subscribe(retainedB);
    const unsubscribeReconnecting = sharedDeviceService.subscribe(reconnecting);

    await sharedDeviceService.acquire();
    now = 1_500;
    firstDevice.lose({ message: 'first loss', reason: 'unknown' });
    await vi.waitFor(() => expect(retainedA.deviceRecovered).toHaveBeenCalledTimes(1));
    expect(adapter.requestDevice).toHaveBeenCalledTimes(2);
    expect(retainedB.deviceRecovered).toHaveBeenCalledTimes(1);
    expect(reconnecting.deviceRecovered).toHaveBeenCalledTimes(1);

    now = 2_000;
    secondDevice.lose({ message: 'second loss', reason: 'unknown' });
    await vi.waitFor(() => expect(retainedA.deviceLost).toHaveBeenCalledTimes(2));
    expect(adapter.requestDevice).toHaveBeenCalledTimes(2);

    unsubscribeReconnecting();
    const lateSubscriber = createListener();
    const recovery = sharedDeviceService.resumeRecoveryAfterReconnect();
    sharedDeviceService.subscribe(lateSubscriber);

    await expect(recovery).resolves.toMatchObject({ device: thirdDevice, format: 'bgra8unorm' });
    expect(adapter.requestDevice).toHaveBeenCalledTimes(3);
    expect(retainedA.deviceRecovered).toHaveBeenCalledTimes(2);
    expect(retainedB.deviceRecovered).toHaveBeenCalledTimes(2);
    expect(reconnecting.deviceRecovered).toHaveBeenCalledTimes(1);
    expect(lateSubscriber.deviceRecovered).not.toHaveBeenCalled();
  });

  it('does not broadcast on a healthy reconnect and resets the rapid-loss window', async () => {
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
    configureServicePlatform(adapter, { now: () => now });
    const listener = createListener();
    sharedDeviceService.subscribe(listener);

    await sharedDeviceService.acquire();
    now = 1_500;
    firstDevice.lose({ message: 'first loss', reason: 'unknown' });
    await vi.waitFor(() => expect(listener.deviceRecovered).toHaveBeenCalledTimes(1));
    expect(adapter.requestDevice).toHaveBeenCalledTimes(2);

    const healthyReconnect = await sharedDeviceService.resumeRecoveryAfterReconnect();
    expect(healthyReconnect).toMatchObject({ device: secondDevice, format: 'bgra8unorm' });
    expect(listener.deviceRecovered).toHaveBeenCalledTimes(1);

    now = 2_000;
    secondDevice.lose({ message: 'second loss', reason: 'unknown' });
    await vi.waitFor(() => expect(adapter.requestDevice).toHaveBeenCalledTimes(3));
    await vi.waitFor(() => expect(listener.deviceRecovered).toHaveBeenCalledTimes(2));
    expect(listener.deviceRecovered).toHaveBeenLastCalledWith({ device: thirdDevice, format: 'bgra8unorm' });
    expect(listener.recoveryFailed).not.toHaveBeenCalled();
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
    configureServicePlatform(adapter, { now: () => 5_000 });
    const listener = createListener();
    sharedDeviceService.subscribe(listener);

    await sharedDeviceService.acquire();
    firstDevice.lose({ message: 'device lost', reason: 'unknown' });

    await vi.waitFor(() => expect(listener.recoveryFailed).toHaveBeenCalledWith(recoveryError));
    expect(listener.deviceRecovered).not.toHaveBeenCalled();
    expect(adapter.requestDevice).toHaveBeenCalledTimes(2);
  });
});

function configureServicePlatform(adapter: SceneGPUAdapter, overrides: Partial<{ now: () => number }> = {}): void {
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
