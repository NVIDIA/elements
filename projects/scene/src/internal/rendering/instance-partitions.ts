// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { maximumStoragePartitionByteLength, planStoragePartitions } from '../gpu/partition.js';
import type { StoragePartition, StoragePartitionSourceRange } from '../gpu/partition.js';
import type { SceneGPUDevice } from '../gpu/platform.js';
import { LINE_VERTEX, MARKER, POINT, TRIANGLE_VERTEX } from '../layouts/built-ins.js';
import { PICK_UNIFORM_OFFSETS } from '../pick/uniform-offsets.js';
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
      segmentBase: partition.firstRecord / 2,
      segmentCount: partition.recordCount / 2,
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
  const planned =
    item.topology === 'loop'
      ? planLoopLinePartitions(item.data.count, maximumRecords)
      : planStripLinePartitions(item.data.count, maximumRecords);
  return {
    byteLength,
    key: `line/${item.topology}/${item.data.count}/${maximumRecords}`,
    linePartitions: planned.map(entry => entry.draw),
    partitions: planned.map(entry => entry.storage),
    primitiveRecordCount: 1,
    stride: LINE_VERTEX.stride
  };
}

function completeConnectedLineDraw(item: LineRenderItem): ConnectedLineDrawPartition {
  return {
    joinCount: item.topology === 'loop' ? item.data.count : Math.max(0, item.data.count - 2),
    joinStart: 0,
    segmentBase: 0,
    segmentCount: item.topology === 'loop' ? item.data.count : Math.max(0, item.data.count - 1),
    segmentStart: 0,
    sourceCount: item.data.count
  };
}

function planStripLinePartitions(
  count: number,
  maximumRecords: number
): Array<{ readonly draw: ConnectedLineDrawPartition; readonly storage: StoragePartition }> {
  const result: Array<{ draw: ConnectedLineDrawPartition; storage: StoragePartition }> = [];
  let segmentBase = 0;
  while (segmentBase < count - 1) {
    const segmentStart = segmentBase === 0 ? 0 : 1;
    const segmentCount = Math.min(maximumRecords - segmentStart - 1, count - 1 - segmentBase);
    const sourceFirstRecord = segmentBase - segmentStart;
    const recordCount = segmentStart + segmentCount + 1;
    const lastSegment = segmentBase + segmentCount - 1;
    const firstJoin = Math.max(1, segmentBase);
    const lastJoin = Math.min(count - 2, lastSegment);
    result.push({
      draw: {
        joinCount: Math.max(0, lastJoin - firstJoin + 1),
        joinStart: firstJoin - sourceFirstRecord - 1,
        segmentBase,
        segmentCount,
        segmentStart,
        sourceCount: count
      },
      storage: createLineStoragePartition({
        circular: false,
        firstRecord: segmentBase,
        firstSourceRecord: sourceFirstRecord,
        recordCount,
        sourceCount: count
      })
    });
    segmentBase += segmentCount;
  }
  return result;
}

function planLoopLinePartitions(
  count: number,
  maximumRecords: number
): Array<{ readonly draw: ConnectedLineDrawPartition; readonly storage: StoragePartition }> {
  const result: Array<{ draw: ConnectedLineDrawPartition; storage: StoragePartition }> = [];
  const maximumSegments = maximumRecords - 2;
  for (let segmentBase = 0; segmentBase < count; segmentBase += maximumSegments) {
    const segmentCount = Math.min(maximumSegments, count - segmentBase);
    result.push({
      draw: {
        joinCount: segmentCount,
        joinStart: 1,
        segmentBase,
        segmentCount,
        segmentStart: 1,
        sourceCount: count
      },
      storage: createLineStoragePartition({
        circular: true,
        firstRecord: segmentBase,
        firstSourceRecord: segmentBase - 1,
        recordCount: segmentCount + 2,
        sourceCount: count
      })
    });
  }
  return result;
}

function createLineStoragePartition(options: {
  readonly circular: boolean;
  readonly firstRecord: number;
  readonly firstSourceRecord: number;
  readonly recordCount: number;
  readonly sourceCount: number;
}): StoragePartition {
  const { circular, firstRecord, firstSourceRecord, recordCount, sourceCount } = options;
  const normalizedFirst = circular ? (firstSourceRecord + sourceCount) % sourceCount : firstSourceRecord;
  return {
    byteLength: recordCount * LINE_VERTEX.stride,
    byteOffset: normalizedFirst * LINE_VERTEX.stride,
    firstRecord,
    recordCount,
    sourceRanges: createLineSourceRanges({ circular, firstRecord: normalizedFirst, recordCount, sourceCount })
  };
}

function createLineSourceRanges(options: {
  readonly circular: boolean;
  readonly firstRecord: number;
  readonly recordCount: number;
  readonly sourceCount: number;
}): readonly StoragePartitionSourceRange[] {
  const { circular, firstRecord, recordCount, sourceCount } = options;
  const firstCount = circular ? Math.min(recordCount, sourceCount - firstRecord) : recordCount;
  const ranges: StoragePartitionSourceRange[] = [createSourceRange(firstRecord, 0, firstCount)];
  const remaining = recordCount - firstCount;
  if (remaining > 0) ranges.push(createSourceRange(0, firstCount, remaining));
  return ranges;
}

function createSourceRange(
  sourceFirstRecord: number,
  targetFirstRecord: number,
  recordCount: number
): StoragePartitionSourceRange {
  return {
    byteLength: recordCount * LINE_VERTEX.stride,
    sourceByteOffset: sourceFirstRecord * LINE_VERTEX.stride,
    targetByteOffset: targetFirstRecord * LINE_VERTEX.stride
  };
}
