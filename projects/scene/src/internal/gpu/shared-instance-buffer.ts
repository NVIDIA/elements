// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { SceneGPUBuffer, SceneGPUDevice, SceneGPUQueue } from './platform.js';

const BUFFER_COPY_DST = 0x08;
const BUFFER_STORAGE = 0x80;

export interface SharedInstanceBufferDevice extends SceneGPUDevice {
  readonly queue: SceneGPUQueue & { writeBuffer(buffer: SceneGPUBuffer, offset: number, data: ArrayBufferView): void };
  createBuffer(descriptor: unknown): SceneGPUBuffer;
}

export interface SharedInstanceBufferLease {
  readonly buffer: SceneGPUBuffer;
  readonly bytes: Uint8Array;
  release(): void;
  tryReassign(bytes: Uint8Array): boolean;
}

interface SharedInstanceBufferEntry {
  readonly buffer: SceneGPUBuffer;
  references: number;
}

const deviceCaches = new WeakMap<SharedInstanceBufferDevice, WeakMap<Uint8Array, SharedInstanceBufferEntry>>();

/** Acquires one GPU storage buffer for an immutable CPU byte snapshot on a shared device. */
export function acquireSharedInstanceBuffer(
  device: SharedInstanceBufferDevice,
  bytes: Uint8Array
): SharedInstanceBufferLease {
  const cache = getDeviceCache(device);
  let entry = cache.get(bytes);
  if (!entry) {
    entry = createEntry(device, bytes);
    cache.set(bytes, entry);
  }
  entry.references += 1;
  let released = false;
  let source = bytes;
  return {
    buffer: entry.buffer,
    get bytes() {
      return source;
    },
    release: () => {
      if (released) return;
      released = true;
      entry.references -= 1;
      if (entry.references !== 0) return;
      cache.delete(source);
      entry.buffer.destroy();
    },
    tryReassign: next => {
      if (released || entry.references !== 1 || next.byteLength !== source.byteLength || cache.has(next)) {
        return false;
      }
      cache.delete(source);
      source = next;
      cache.set(source, entry);
      return true;
    }
  };
}

function getDeviceCache(device: SharedInstanceBufferDevice): WeakMap<Uint8Array, SharedInstanceBufferEntry> {
  let cache = deviceCaches.get(device);
  if (!cache) {
    cache = new WeakMap<Uint8Array, SharedInstanceBufferEntry>();
    deviceCaches.set(device, cache);
  }
  return cache;
}

function createEntry(device: SharedInstanceBufferDevice, bytes: Uint8Array): SharedInstanceBufferEntry {
  const buffer = device.createBuffer({ size: bytes.byteLength, usage: BUFFER_COPY_DST | BUFFER_STORAGE });
  try {
    device.queue.writeBuffer(buffer, 0, bytes);
  } catch (error) {
    buffer.destroy();
    throw error;
  }
  return { buffer, references: 0 };
}
