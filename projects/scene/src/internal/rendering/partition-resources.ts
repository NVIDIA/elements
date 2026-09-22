// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { SceneGPUBuffer, SceneGPUBufferDescriptor } from '../gpu/platform.js';

interface PartitionUniformResources {
  readonly buffer: SceneGPUBuffer;
  readonly firstRecord: number;
  readonly recordCount: number;
  readonly uniform: SceneGPUBuffer;
  readonly uniformValues: Float32Array;
}

interface PartitionUniformDevice {
  createBuffer(descriptor: SceneGPUBufferDescriptor): SceneGPUBuffer;
}

interface PartitionLease {
  readonly partitions: readonly {
    readonly buffer: SceneGPUBuffer;
    readonly firstRecord: number;
    readonly recordCount: number;
  }[];
  release(): void;
}

/** Allocates one stable uniform record per storage partition and rolls back atomically. */
export function createPartitionUniformResources(options: {
  readonly device: PartitionUniformDevice;
  readonly instance: PartitionLease;
  readonly uniformLength: number;
  readonly uniformUsage: number;
}): readonly PartitionUniformResources[] {
  const resources: PartitionUniformResources[] = [];
  try {
    for (const partition of options.instance.partitions) {
      resources.push({
        buffer: partition.buffer,
        firstRecord: partition.firstRecord,
        recordCount: partition.recordCount,
        uniform: options.device.createBuffer({
          size: options.uniformLength * Float32Array.BYTES_PER_ELEMENT,
          usage: options.uniformUsage
        }),
        uniformValues: new Float32Array(options.uniformLength).fill(Number.NaN)
      });
    }
    return resources;
  } catch (error) {
    resources.forEach(resource => resource.uniform.destroy());
    options.instance.release();
    throw error;
  }
}

/** Releases partition uniforms before the shared instance lease exactly once. */
export function destroyPartitionUniformResources(
  instance: PartitionLease,
  resources: readonly PartitionUniformResources[]
): void {
  resources.forEach(resource => resource.uniform.destroy());
  instance.release();
}

export function hasSameUniformValues(left: Float32Array, right: Float32Array): boolean {
  for (let index = 0; index < left.length; index += 1) {
    if (left[index] !== right[index]) return false;
  }
  return true;
}
