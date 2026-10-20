// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  partitionSequence,
  mapSequenceSourceRanges,
  type SequencePartitionOptions
} from '../algorithms/sequence-partitioning.js';
import { maximumStoragePartitionByteLength, planStoragePartitions } from '../gpu/partition.js';
import type { StoragePartition, StoragePartitionSourceRange } from '../gpu/partition.js';
import type { SceneGPUDevice } from '../gpu/platform.js';
import { lineJoinCount, lineSegmentCount } from '../algorithms/line-topology.js';
import { LINE_VERTEX, MARKER, POINT, TRIANGLE_VERTEX } from '../records/layouts/built-ins.js';
import { PICK_UNIFORM_OFFSETS } from './picking/uniform-offsets.js';
import type { LineRenderItem, SceneRenderItem } from './render-items.js';
import { isMarkerRenderItem } from './render-items.js';

export interface ConnectedLineDrawPartition {
  readonly joinCount: number;
  readonly joinStart: number;
  readonly segmentBase: number;
  readonly segmentCount: number;
  readonly segmentStart: number;
  readonly sourceCount: number;
}

export interface InstanceAllocation {
  readonly byteLength: number;
  readonly key: string;
  readonly linePartitions?: readonly ConnectedLineDrawPartition[];
  readonly partitions?: readonly StoragePartition[];
  readonly primitiveRecordCount: number;
  readonly stride: number;
}

export function getInstanceAllocation(item: SceneRenderItem, device: SceneGPUDevice): InstanceAllocation {
  if (isMarkerRenderItem(item)) {
    return {
      byteLength: item.data.count * MARKER.stride,
      key: `marker/${item.data.count}`,
      primitiveRecordCount: 1,
      stride: MARKER.stride
    };
  }
  if (item.type === 'mesh') throw new TypeError('Mesh geometry uses its own instance partition owner.');
  if (item.type === 'line') return getLineAllocation(item, device);
  const stride = item.type === 'point' ? POINT.stride : TRIANGLE_VERTEX.stride;
  const primitiveRecordCount = item.type === 'triangle' ? 3 : 1;
  return {
    byteLength: item.data.count * stride,
    key: `${item.type}/${item.data.count}`,
    primitiveRecordCount,
    stride
  };
}

export function getPartitionPickId(item: SceneRenderItem, firstRecord: number, pickId: number): number {
  if ('type' in item && item.type === 'line') return pickId;
  if (!('type' in item) || item.type === 'point') return pickId + firstRecord;
  return pickId + (item.type === 'triangle' ? firstRecord / 3 : firstRecord);
}

export function getPickUniformOffset(item: SceneRenderItem): number {
  if (isMarkerRenderItem(item)) return PICK_UNIFORM_OFFSETS.marker;
  return item.type === 'line' ? PICK_UNIFORM_OFFSETS.line : PICK_UNIFORM_OFFSETS.stream;
}

export function itemRequiresGeometry(item: SceneRenderItem): boolean {
  if (!item.data.ready) return false;
  if ('type' in item && item.type === 'mesh') return item.data.identityInstance || (item.instances?.count ?? 0) > 0;
  return item.data.count > 0;
}

export function writeInstancePartitionUniforms(
  uniforms: Float32Array,
  options: {
    readonly item: SceneRenderItem;
    readonly line: ConnectedLineDrawPartition | undefined;
    readonly recordCount: number;
  }
): void {
  uniforms[36] = options.recordCount;
  if (!('type' in options.item) || options.item.type !== 'line') return;
  const { line } = options;
  if (!line) throw new TypeError('Connected line partition metadata is unavailable.');
  uniforms.set(
    [line.sourceCount, line.segmentStart, line.segmentCount, line.joinStart, line.joinCount, line.segmentBase],
    39
  );
}

function getLineAllocation(item: LineRenderItem, device: SceneGPUDevice): InstanceAllocation {
  const byteLength = item.data.count * LINE_VERTEX.stride;
  if (item.topology === 'segments') return getSegmentLineAllocation(item, device, byteLength);
  return getConnectedLineAllocation(item, device, byteLength);
}

function getSegmentLineAllocation(
  item: LineRenderItem,
  device: SceneGPUDevice,
  byteLength: number
): InstanceAllocation {
  const partitions = planStoragePartitions({
    byteLength,
    device,
    primitiveRecordCount: 2,
    stride: LINE_VERTEX.stride
  });
  return {
    byteLength,
    key: `line/segments/${item.data.count}/${partitions[0]?.byteLength ?? 0}`,
    linePartitions: partitions.map(partition => ({
      joinCount: 0,
      joinStart: 0,
      segmentBase: lineSegmentCount(partition.firstRecord, 'segments'),
      segmentCount: lineSegmentCount(partition.recordCount, 'segments'),
      segmentStart: 0,
      sourceCount: item.data.count
    })),
    partitions,
    primitiveRecordCount: 2,
    stride: LINE_VERTEX.stride
  };
}

function getConnectedLineAllocation(
  item: LineRenderItem,
  device: SceneGPUDevice,
  byteLength: number
): InstanceAllocation {
  const maximum = maximumStoragePartitionByteLength(device);
  if (byteLength <= maximum) {
    const partitions = planStoragePartitions({
      byteLength,
      device,
      primitiveRecordCount: item.data.count,
      stride: LINE_VERTEX.stride
    });
    return {
      byteLength,
      key: `line/${item.topology}/${item.data.count}/single`,
      linePartitions: [completeConnectedLineDraw(item)],
      partitions,
      primitiveRecordCount: item.data.count,
      stride: LINE_VERTEX.stride
    };
  }
  const maximumRecords = Math.floor(maximum / LINE_VERTEX.stride);
  if (maximumRecords < 3) {
    throw new RangeError('The device cannot bind the records required for one connected line segment.');
  }
  // Source capture checks line records; this path has count > maximumRecords >= 3.
  const planned = planConnectedLinePartitions(item, maximumRecords);
  return {
    byteLength,
    key: `line/${item.topology}/${item.data.count}/${maximumRecords}`,
    ...planned,
    primitiveRecordCount: 1,
    stride: LINE_VERTEX.stride
  };
}

function completeConnectedLineDraw(item: LineRenderItem): ConnectedLineDrawPartition {
  return {
    joinCount: lineJoinCount(item.data.count, item.topology),
    joinStart: 0,
    segmentBase: 0,
    segmentCount: lineSegmentCount(item.data.count, item.topology),
    segmentStart: 0,
    sourceCount: item.data.count
  };
}

function planConnectedLinePartitions(
  item: LineRenderItem,
  capacity: number
): { linePartitions: ConnectedLineDrawPartition[]; partitions: StoragePartition[] } {
  const count = item.data.count;
  const loop = item.topology === 'loop';
  const partitionLimit = Math.ceil(count / (capacity - 2));
  const linePartitions = new Array<ConnectedLineDrawPartition>(partitionLimit);
  const partitions = new Array<StoragePartition>(partitionLimit);
  let partitionCount = 0;
  const options: SequencePartitionOptions = {
    count: lineSegmentCount(count, item.topology),
    sourceCount: count,
    capacity,
    before: 1,
    after: 1,
    boundary: loop ? 'wrap' : 'clamp'
  };
  partitionSequence(options, appendPartition);
  linePartitions.length = partitionCount;
  partitions.length = partitionCount;
  return { linePartitions, partitions };

  // eslint-disable-next-line max-params -- @hotpath Scalar spans avoid allocating temporary partition objects.
  function appendPartition(
    offset: number,
    assigned: number,
    windowOffset: number,
    windowCount: number,
    sourceOffset: number
  ): void {
    // Each segment owns its starting join, except the first segment of a strip.
    linePartitions[partitionCount] = {
      joinCount: assigned - (!loop && offset === 0 ? 1 : 0),
      joinStart: loop ? 1 : 0,
      segmentBase: offset,
      segmentCount: assigned,
      segmentStart: windowOffset,
      sourceCount: count
    };
    partitions[partitionCount++] = {
      byteLength: windowCount * LINE_VERTEX.stride,
      byteOffset: sourceOffset * LINE_VERTEX.stride,
      firstRecord: offset,
      recordCount: windowCount,
      sourceRanges: mapSequenceSourceRanges(count, sourceOffset, windowCount, toStorageSourceRange)
    };
  }
}

function toStorageSourceRange(sourceOffset: number, targetOffset: number, count: number): StoragePartitionSourceRange {
  return {
    byteLength: count * LINE_VERTEX.stride,
    sourceByteOffset: sourceOffset * LINE_VERTEX.stride,
    targetByteOffset: targetOffset * LINE_VERTEX.stride
  };
}
