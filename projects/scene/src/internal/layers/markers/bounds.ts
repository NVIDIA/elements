// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { MARKER } from '../../records/layouts/built-ins.js';
import { getFieldOffset } from '../../records/layouts/define-layout.js';
import type { Matrix4 } from '../../math/types.js';
import { multiplyMat4Into } from '../../math/mat4.js';
import { BoundsSegmentTree } from '../../structures/bounds-segment-tree.js';
import { classifyAabbFrustum, type AabbBounds, type FrustumRelation } from '../../math/frustum.js';

const BLOCK_SIZE = 256;
const FACE_ALPHA_OFFSET = getFieldOffset(MARKER, 'color') + 3;
const OUTLINE_ALPHA_OFFSET = getFieldOffset(MARKER, 'outline-color') + 3;
const FLOATS_PER_RECORD = MARKER.stride / Float32Array.BYTES_PER_ELEMENT;

interface MarkerBoundsSource {
  readonly bytes: Uint8Array;
  readonly floats: Float32Array | null;
  readonly view: DataView | null;
}

export type MarkerBounds = AabbBounds;

export type MarkerFrustumRelation = FrustumRelation;

/** Block-indexed local bounds for prefix queries and bounded partial updates. */
export class MarkerBoundsIndex {
  #blocks = new BoundsSegmentTree();
  #queryBounds = new Float64Array(6);
  #recordBounds = new Float64Array(6);

  clone(): MarkerBoundsIndex {
    const clone = new MarkerBoundsIndex();
    clone.#blocks = this.#blocks.clone();
    return clone;
  }

  reset(recordCount: number): void {
    this.#blocks.reset(Math.ceil(recordCount / BLOCK_SIZE));
  }

  includeRecord(index: number, source: MarkerBoundsSource): void {
    if (!this.#readRecord(index, source)) return;
    this.#includeBounds(index);
  }

  // eslint-disable-next-line max-params -- @hotpath This bulk scan avoids allocating one tuple per marker record.
  includeRecordValues(index: number, positionX: number, positionY: number, positionZ: number, radius: number): void {
    this.#recordBounds[0] = positionX - radius;
    this.#recordBounds[1] = positionY - radius;
    this.#recordBounds[2] = positionZ - radius;
    this.#recordBounds[3] = positionX + radius;
    this.#recordBounds[4] = positionY + radius;
    this.#recordBounds[5] = positionZ + radius;
    this.#includeBounds(index);
  }

  #includeBounds(index: number): void {
    this.#blocks.include(Math.floor(index / BLOCK_SIZE), this.#recordBounds);
  }

  updateBlocks(
    options: MarkerBoundsSource & { readonly count: number; readonly recordCount: number; readonly start: number }
  ): void {
    if (options.count === 0) return;
    const firstBlock = Math.floor(options.start / BLOCK_SIZE);
    const lastBlock = Math.floor((options.start + options.count - 1) / BLOCK_SIZE);
    this.#blocks.clear(firstBlock, lastBlock + 1);
    const firstRecord = firstBlock * BLOCK_SIZE;
    const lastRecord = Math.min(options.recordCount, (lastBlock + 1) * BLOCK_SIZE);
    for (let index = firstRecord; index < lastRecord; index += 1) this.includeRecord(index, options);
  }

  getBounds(count: number, source: MarkerBoundsSource): MarkerBounds | null {
    const fullBlocks = Math.floor(count / BLOCK_SIZE);
    resetBounds(this.#queryBounds);
    this.#blocks.extendPrefix(fullBlocks, this.#queryBounds);
    for (let index = fullBlocks * BLOCK_SIZE; index < count; index += 1) {
      if (this.#readRecord(index, source)) extendBounds(this.#queryBounds, this.#recordBounds);
    }
    return createBounds(this.#queryBounds);
  }

  #readRecord(index: number, source: MarkerBoundsSource): boolean {
    const byteOffset = index * MARKER.stride;
    if (!recordIsVisible(source.bytes, byteOffset)) return false;
    const floatOffset = index * FLOATS_PER_RECORD;
    const positionX = readFloat(source, floatOffset, byteOffset);
    const positionY = readFloat(source, floatOffset + 1, byteOffset + 4);
    const positionZ = readFloat(source, floatOffset + 2, byteOffset + 8);
    const radius = readRadius(source, floatOffset, byteOffset);
    if (!Number.isFinite(positionX + positionY + positionZ + radius)) return false;
    this.#recordBounds[0] = positionX - radius;
    this.#recordBounds[1] = positionY - radius;
    this.#recordBounds[2] = positionZ - radius;
    this.#recordBounds[3] = positionX + radius;
    this.#recordBounds[4] = positionY + radius;
    this.#recordBounds[5] = positionZ + radius;
    return true;
  }
}

/** Allocation-free local-AABB classification against a WebGPU clip-space frustum. */
export class MarkerBoundsClassifier {
  #transform = new Float64Array(16);

  classify(bounds: MarkerBounds | null | undefined, viewProjection: Matrix4, frame: Matrix4): MarkerFrustumRelation {
    if (bounds === undefined) return 'intersecting';
    if (bounds === null) return 'outside';
    multiplyMat4Into(viewProjection, frame, this.#transform);
    return classifyAabbFrustum(bounds, this.#transform);
  }
}

function recordIsVisible(bytes: Uint8Array, byteOffset: number): boolean {
  return (bytes[byteOffset + FACE_ALPHA_OFFSET] ?? 0) > 0 || (bytes[byteOffset + OUTLINE_ALPHA_OFFSET] ?? 0) > 0;
}

function readFloat(source: MarkerBoundsSource, floatOffset: number, byteOffset: number): number {
  if (source.floats) return source.floats[floatOffset] ?? Number.NaN;
  return source.view?.getFloat32(byteOffset, true) ?? Number.NaN;
}

function readRadius(source: MarkerBoundsSource, floatOffset: number, byteOffset: number): number {
  return Math.max(
    Math.abs(readFloat(source, floatOffset + 7, byteOffset + 28)),
    Math.abs(readFloat(source, floatOffset + 8, byteOffset + 32)),
    Math.abs(readFloat(source, floatOffset + 9, byteOffset + 36))
  );
}

function resetBounds(bounds: Float64Array): void {
  bounds[0] = Number.POSITIVE_INFINITY;
  bounds[1] = Number.POSITIVE_INFINITY;
  bounds[2] = Number.POSITIVE_INFINITY;
  bounds[3] = Number.NEGATIVE_INFINITY;
  bounds[4] = Number.NEGATIVE_INFINITY;
  bounds[5] = Number.NEGATIVE_INFINITY;
}

function extendBounds(target: Float64Array, source: Float64Array): void {
  target[0] = Math.min(at(target, 0), at(source, 0));
  target[1] = Math.min(at(target, 1), at(source, 1));
  target[2] = Math.min(at(target, 2), at(source, 2));
  target[3] = Math.max(at(target, 3), at(source, 3));
  target[4] = Math.max(at(target, 4), at(source, 4));
  target[5] = Math.max(at(target, 5), at(source, 5));
}

function createBounds(values: Float64Array): MarkerBounds | null {
  return Number.isFinite(at(values, 0))
    ? {
        maximumX: at(values, 3),
        maximumY: at(values, 4),
        maximumZ: at(values, 5),
        minimumX: at(values, 0),
        minimumY: at(values, 1),
        minimumZ: at(values, 2)
      }
    : null;
}

function at(values: Float64Array, index: number): number {
  return values[index] ?? 0;
}
