// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { SceneGPUBuffer, SceneGPUBufferDescriptor, SceneGPUDevice, SceneGPUQueue } from './platform.js';
import { planStoragePartitions, type StoragePartition } from './partition.js';

const BUFFER_COPY_DST = 0x08;
const BUFFER_STORAGE = 0x80;

export interface SharedInstanceBufferDevice extends SceneGPUDevice {
  readonly queue: SceneGPUQueue & { writeBuffer(buffer: SceneGPUBuffer, offset: number, data: ArrayBufferView): void };
  createBuffer(descriptor: SceneGPUBufferDescriptor): SceneGPUBuffer;
}

interface SharedInstanceBufferPartition extends StoragePartition {
  readonly buffer: SceneGPUBuffer;
}

export interface SharedInstanceBufferLease {
  /** First partition retained for the single-partition fast path. */
  readonly buffer: SceneGPUBuffer;
  readonly bytes: Uint8Array;
  readonly byteLength: number;
  readonly partitions: readonly SharedInstanceBufferPartition[];
  release(): void;
  tryReassign(bytes: Uint8Array): boolean;
}

interface SharedInstanceBufferEntry {
  readonly partitions: readonly SharedInstanceBufferPartition[];
  references: number;
}

interface SharedInstanceBufferOptions {
  readonly byteLength?: number;
  readonly onValidationError?: (error: unknown) => void;
  readonly partitions?: readonly StoragePartition[];
  readonly primitiveRecordCount?: number;
  readonly stride?: number;
}

interface WriteSharedInstanceBufferOptions {
  readonly bytes: Uint8Array;
  readonly device: SharedInstanceBufferDevice;
  readonly lease: SharedInstanceBufferLease;
  readonly range: { readonly offset: number; readonly size: number };
}

interface ResolvedSharedInstanceBufferOptions {
  readonly byteLength: number;
  readonly key: string;
  readonly partitions: readonly StoragePartition[];
  readonly primitiveRecordCount: number;
  readonly stride: number;
}

const deviceCaches = new WeakMap<
  SharedInstanceBufferDevice,
  WeakMap<Uint8Array, Map<string, SharedInstanceBufferEntry>>
>();

/** Acquires bounded GPU storage partitions for an immutable CPU byte snapshot. */
export function acquireSharedInstanceBuffer(
  device: SharedInstanceBufferDevice,
  bytes: Uint8Array,
  options: SharedInstanceBufferOptions = {}
): SharedInstanceBufferLease {
  const resolved = resolveSharedInstanceBufferOptions(device, bytes, options);
  const cache = getDeviceCache(device);
  const entries = getSnapshotEntries(cache, bytes);
  let entry = entries.get(resolved.key);
  if (!entry) {
    entry = createEntry(device, bytes, {
      byteLength: resolved.byteLength,
      onValidationError: options.onValidationError ?? (() => undefined),
      partitions: resolved.partitions,
      primitiveRecordCount: resolved.primitiveRecordCount,
      stride: resolved.stride
    });
    entries.set(resolved.key, entry);
  }
  entry.references += 1;
  return createLease({ byteLength: resolved.byteLength, bytes, cache, entry, key: resolved.key });
}

/** Routes one byte update across every intersecting GPU partition. */
export function writeSharedInstanceBuffer(options: WriteSharedInstanceBufferOptions): void {
  const { bytes, device, lease, range } = options;
  if (
    lease.partitions.length === 1 &&
    range.offset === 0 &&
    range.size >= lease.byteLength &&
    bytes.byteLength === lease.byteLength
  ) {
    device.queue.writeBuffer(lease.buffer, 0, bytes);
    return;
  }
  const rangeEnd = Math.min(range.offset + range.size, lease.byteLength);
  for (const partition of lease.partitions) {
    const sourceRanges = partition.sourceRanges ?? [
      { byteLength: partition.byteLength, sourceByteOffset: partition.byteOffset, targetByteOffset: 0 }
    ];
    for (const sourceRange of sourceRanges) {
      const start = Math.max(range.offset, sourceRange.sourceByteOffset);
      const end = Math.min(rangeEnd, sourceRange.sourceByteOffset + sourceRange.byteLength);
      if (start >= end) continue;
      const targetOffset = sourceRange.targetByteOffset + start - sourceRange.sourceByteOffset;
      // eslint-disable-next-line local-performance/no-gpu-upload-in-loop -- @hotpath Boundary records can update more than one allocation.
      device.queue.writeBuffer(partition.buffer, targetOffset, bytes.subarray(start, end));
    }
  }
}

function resolveSharedInstanceBufferOptions(
  device: SharedInstanceBufferDevice,
  bytes: Uint8Array,
  options: SharedInstanceBufferOptions
): ResolvedSharedInstanceBufferOptions {
  const byteLength = options.byteLength ?? bytes.byteLength;
  const stride = options.stride ?? byteLength;
  const primitiveRecordCount = options.primitiveRecordCount ?? 1;
  if (byteLength <= 0 || byteLength > bytes.byteLength) {
    throw new RangeError('Shared instance buffer length must be positive and within its byte snapshot.');
  }
  const partitions = options.partitions ?? planStoragePartitions({ byteLength, device, primitiveRecordCount, stride });
  return {
    byteLength,
    key: `${byteLength}/${stride}/${primitiveRecordCount}/${partitionSignature(partitions)}`,
    partitions,
    primitiveRecordCount,
    stride
  };
}

function getSnapshotEntries(
  cache: WeakMap<Uint8Array, Map<string, SharedInstanceBufferEntry>>,
  bytes: Uint8Array
): Map<string, SharedInstanceBufferEntry> {
  const existing = cache.get(bytes);
  if (existing) return existing;
  const entries = new Map<string, SharedInstanceBufferEntry>();
  cache.set(bytes, entries);
  return entries;
}

function createLease(options: {
  readonly byteLength: number;
  readonly bytes: Uint8Array;
  readonly cache: WeakMap<Uint8Array, Map<string, SharedInstanceBufferEntry>>;
  readonly entry: SharedInstanceBufferEntry;
  readonly key: string;
}): SharedInstanceBufferLease {
  let released = false;
  let source = options.bytes;
  const { byteLength, cache, entry, key } = options;
  return {
    buffer: entry.partitions[0]!.buffer,
    byteLength,
    get bytes() {
      return source;
    },
    partitions: entry.partitions,
    release: () => {
      if (released) return;
      released = true;
      entry.references -= 1;
      if (entry.references !== 0) return;
      cache.get(source)?.delete(key);
      for (const partition of entry.partitions) partition.buffer.destroy();
    },
    tryReassign: next => {
      const nextEntries = cache.get(next);
      if (released || entry.references !== 1 || next.byteLength !== source.byteLength || nextEntries?.has(key)) {
        return false;
      }
      cache.get(source)?.delete(key);
      source = next;
      const entries = nextEntries ?? new Map<string, SharedInstanceBufferEntry>();
      entries.set(key, entry);
      cache.set(source, entries);
      return true;
    }
  };
}

function getDeviceCache(
  device: SharedInstanceBufferDevice
): WeakMap<Uint8Array, Map<string, SharedInstanceBufferEntry>> {
  let cache = deviceCaches.get(device);
  if (!cache) {
    cache = new WeakMap();
    deviceCaches.set(device, cache);
  }
  return cache;
}

function createEntry(
  device: SharedInstanceBufferDevice,
  bytes: Uint8Array,
  options: Required<Omit<SharedInstanceBufferOptions, 'partitions'>> & {
    readonly partitions: readonly StoragePartition[];
  }
): SharedInstanceBufferEntry {
  return withValidationScope(device, options.onValidationError, () => {
    const partitions: SharedInstanceBufferPartition[] = [];
    try {
      for (const partition of options.partitions) {
        const buffer = device.createBuffer({ size: partition.byteLength, usage: BUFFER_COPY_DST | BUFFER_STORAGE });
        partitions.push({ ...partition, buffer });
        // eslint-disable-next-line local-performance/no-gpu-upload-in-loop -- @hotpath Each bounded allocation requires one upload.
        device.queue.writeBuffer(buffer, 0, partitionUpload(bytes, partition, options.partitions.length === 1));
      }
    } catch (error) {
      for (const partition of partitions) partition.buffer.destroy();
      throw error;
    }
    return { partitions, references: 0 };
  });
}

function partitionUpload(bytes: Uint8Array, partition: StoragePartition, onlyPartition: boolean): Uint8Array {
  const ranges = partition.sourceRanges;
  if (!ranges) {
    return onlyPartition && partition.byteLength === bytes.byteLength
      ? bytes
      : bytes.subarray(partition.byteOffset, partition.byteOffset + partition.byteLength);
  }
  const upload = new Uint8Array(partition.byteLength);
  for (const range of ranges) {
    upload.set(
      bytes.subarray(range.sourceByteOffset, range.sourceByteOffset + range.byteLength),
      range.targetByteOffset
    );
  }
  return upload;
}

function partitionSignature(partitions: readonly StoragePartition[]): string {
  return partitions
    .map(partition => {
      const ranges = partition.sourceRanges
        ?.map(range => `${range.sourceByteOffset},${range.targetByteOffset},${range.byteLength}`)
        .join(':');
      return `${partition.byteOffset},${partition.byteLength},${partition.firstRecord},${partition.recordCount},${ranges ?? ''}`;
    })
    .join(';');
}

function withValidationScope<T>(
  device: SharedInstanceBufferDevice,
  onValidationError: (error: unknown) => void,
  operation: () => T
): T {
  if (!device.pushErrorScope || !device.popErrorScope) return operation();
  device.pushErrorScope('validation');
  try {
    return operation();
  } finally {
    void device.popErrorScope().then(error => {
      if (error !== null) onValidationError(error);
    }, onValidationError);
  }
}
