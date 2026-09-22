// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { SceneGPUDevice } from './platform.js';

const DEFAULT_MAX_BUFFER_SIZE = 256 * 1024 * 1024;
const DEFAULT_MAX_STORAGE_BINDING_SIZE = 128 * 1024 * 1024;

export interface StoragePartition {
  readonly byteLength: number;
  readonly byteOffset: number;
  readonly firstRecord: number;
  readonly recordCount: number;
  /** Maps original snapshot bytes into this allocation when a partition retains boundary records. */
  readonly sourceRanges?: readonly StoragePartitionSourceRange[];
}

export interface StoragePartitionSourceRange {
  readonly byteLength: number;
  readonly sourceByteOffset: number;
  readonly targetByteOffset: number;
}

/** Returns the largest storage allocation the device can bind. */
export function maximumStoragePartitionByteLength(device: SceneGPUDevice): number {
  return Math.min(
    device.limits?.maxBufferSize ?? DEFAULT_MAX_BUFFER_SIZE,
    device.limits?.maxStorageBufferBindingSize ?? DEFAULT_MAX_STORAGE_BINDING_SIZE
  );
}

interface ResolvedStoragePartitionOptions {
  readonly byteLength: number;
  readonly partitionBytes: number;
  readonly stride: number;
}

interface StoragePartitionValidationOptions {
  readonly byteLength: number;
  readonly device: SceneGPUDevice;
  readonly primitiveRecordCount: number;
  readonly stride: number;
}

/** Divides packed records into allocations that fit the device's storage limits. */
export function planStoragePartitions(options: {
  readonly byteLength: number;
  readonly device: SceneGPUDevice;
  readonly primitiveRecordCount?: number;
  readonly stride: number;
}): StoragePartition[] {
  const { byteLength, device, primitiveRecordCount = 1, stride } = options;
  const partitionBytes = validateStoragePartitionOptions({ byteLength, device, primitiveRecordCount, stride });
  return createStoragePartitions({ byteLength, partitionBytes, stride });
}

function validateStoragePartitionOptions(options: StoragePartitionValidationOptions): number {
  const { byteLength, device, primitiveRecordCount, stride } = options;
  if (![byteLength, stride, primitiveRecordCount].every(Number.isSafeInteger) || byteLength < 0 || stride <= 0) {
    throw new RangeError('Storage partition inputs must be nonnegative safe integers with a positive stride.');
  }
  const recordBlockBytes = stride * primitiveRecordCount;
  if (byteLength % recordBlockBytes !== 0) {
    throw new RangeError('Storage bytes must contain complete records and primitives.');
  }
  const maximum = maximumStoragePartitionByteLength(device);
  const partitionBytes = Math.floor(maximum / recordBlockBytes) * recordBlockBytes;
  if (!Number.isSafeInteger(partitionBytes) || partitionBytes <= 0) {
    throw new RangeError('The device cannot bind one complete packed primitive.');
  }
  return partitionBytes;
}

function createStoragePartitions(options: ResolvedStoragePartitionOptions): StoragePartition[] {
  const { byteLength, partitionBytes, stride } = options;
  const result: StoragePartition[] = [];
  for (let byteOffset = 0; byteOffset < byteLength; byteOffset += partitionBytes) {
    const partitionLength = Math.min(partitionBytes, byteLength - byteOffset);
    result.push({
      byteLength: partitionLength,
      byteOffset,
      firstRecord: byteOffset / stride,
      recordCount: partitionLength / stride
    });
  }
  return result;
}
