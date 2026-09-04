// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { scenePlatform, type SceneGPUDevice, type SceneGPUDeviceLostInfo } from './platform.js';

export interface SharedDeviceLease {
  readonly device: SceneGPUDevice;
  readonly format: string;
}

export interface SharedDeviceListener {
  deviceLost(info: SceneGPUDeviceLostInfo): void;
  deviceRecovered(lease: SharedDeviceLease): void;
  recoveryFailed(error: unknown): void;
}

const RAPID_LOSS_WINDOW_MS = 10_000;

class SharedDeviceManager {
  #device?: SceneGPUDevice;
  #format?: string;
  #request?: Promise<SharedDeviceLease>;
  #listeners = new Set<SharedDeviceListener>();
  #lastLoss?: number;
  #recoveryBlocked = false;
  #requestDeviceCount = 0;
  #generation = 0;

  acquire(): Promise<SharedDeviceLease> {
    if (this.#device && this.#format) {
      return Promise.resolve({ device: this.#device, format: this.#format });
    }
    this.#request ??= this.#requestDevice();
    return this.#request;
  }

  subscribe(listener: SharedDeviceListener): () => void {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  }

  async resumeRecoveryAfterReconnect(): Promise<SharedDeviceLease> {
    const recoveryListeners = this.#recoveryBlocked ? [...this.#listeners] : [];
    this.#recoveryBlocked = false;
    this.#lastLoss = undefined;
    try {
      const lease = await this.acquire();
      this.#notifyRecovered(recoveryListeners, lease);
      return lease;
    } catch (error) {
      this.#notifyRecoveryFailed(recoveryListeners, error);
      throw error;
    }
  }

  getSnapshot(): { requestDeviceCount: number; hasDevice: boolean; recoveryBlocked: boolean } {
    return {
      requestDeviceCount: this.#requestDeviceCount,
      hasDevice: this.#device !== undefined,
      recoveryBlocked: this.#recoveryBlocked
    };
  }

  reset(): void {
    this.#generation += 1;
    this.#device?.destroy();
    this.#device = undefined;
    this.#format = undefined;
    this.#request = undefined;
    this.#lastLoss = undefined;
    this.#recoveryBlocked = false;
    this.#requestDeviceCount = 0;
    this.#listeners.clear();
  }

  async #requestDevice(): Promise<SharedDeviceLease> {
    const generation = this.#generation;
    try {
      const adapter = await scenePlatform.requestAdapter();
      if (!adapter) {
        throw new DOMException('WebGPU is unavailable.', 'NotSupportedError');
      }

      const device = await this.#createDevice(adapter);
      const format = scenePlatform.getPreferredCanvasFormat();
      this.#storeDevice(generation, device, format);
      return { device, format };
    } catch (error) {
      if (generation === this.#generation) {
        this.#request = undefined;
      }
      throw error;
    }
  }

  async #createDevice(adapter: { requestDevice(): Promise<SceneGPUDevice> }): Promise<SceneGPUDevice> {
    this.#requestDeviceCount += 1;
    return adapter.requestDevice();
  }

  #storeDevice(generation: number, device: SceneGPUDevice, format: string): void {
    if (generation !== this.#generation) {
      device.destroy();
      throw new DOMException('The WebGPU request was superseded.', 'AbortError');
    }
    this.#device = device;
    this.#format = format;
    void device.lost.then(info => this.#handleLoss(device, info));
  }

  #handleLoss(device: SceneGPUDevice, info: SceneGPUDeviceLostInfo): void {
    if (device !== this.#device) {
      return;
    }

    this.#device = undefined;
    this.#format = undefined;
    this.#request = undefined;
    for (const listener of this.#listeners) {
      listener.deviceLost(info);
    }

    const now = scenePlatform.now();
    if (this.#lastLoss !== undefined && now - this.#lastLoss <= RAPID_LOSS_WINDOW_MS) {
      this.#recoveryBlocked = true;
      return;
    }
    this.#lastLoss = now;
    void this.#recover();
  }

  async #recover(): Promise<void> {
    if (this.#recoveryBlocked) {
      return;
    }
    try {
      const lease = await this.acquire();
      this.#notifyRecovered(this.#listeners, lease);
    } catch (error) {
      this.#notifyRecoveryFailed(this.#listeners, error);
    }
  }

  #notifyRecovered(listeners: Iterable<SharedDeviceListener>, lease: SharedDeviceLease): void {
    for (const listener of listeners) {
      if (this.#listeners.has(listener)) {
        listener.deviceRecovered(lease);
      }
    }
  }

  #notifyRecoveryFailed(listeners: Iterable<SharedDeviceListener>, error: unknown): void {
    for (const listener of listeners) {
      if (this.#listeners.has(listener)) {
        listener.recoveryFailed(error);
      }
    }
  }
}

export const sharedDeviceManager = new SharedDeviceManager();
