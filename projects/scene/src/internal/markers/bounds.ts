// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { MARKER } from '../layouts/built-ins.js';
import type { Mat4 } from '../types.js';

const BLOCK_SIZE = 256;
const FACE_ALPHA_OFFSET = 43;
const OUTLINE_ALPHA_OFFSET = 47;
const FLOATS_PER_RECORD = MARKER.stride / Float32Array.BYTES_PER_ELEMENT;
const FRUSTUM_PLANES = [
  { firstRow: 3, secondRow: 0, secondScale: 1 },
  { firstRow: 3, secondRow: 0, secondScale: -1 },
  { firstRow: 3, secondRow: 1, secondScale: 1 },
  { firstRow: 3, secondRow: 1, secondScale: -1 },
  { firstRow: 2 },
  { firstRow: 3, secondRow: 2, secondScale: -1 }
] as const;

interface MarkerBoundsSource {
  readonly bytes: Uint8Array;
  readonly floats: Float32Array | null;
  readonly view: DataView | null;
}

interface FrustumPlaneRows {
  readonly firstRow: number;
  readonly secondRow?: number;
  readonly secondScale?: number;
}

export interface MarkerBounds {
  readonly maximumX: number;
  readonly maximumY: number;
  readonly maximumZ: number;
  readonly minimumX: number;
  readonly minimumY: number;
  readonly minimumZ: number;
}

export type MarkerFrustumRelation = 'inside' | 'intersecting' | 'outside';

/** Block-indexed local bounds for prefix queries and bounded partial updates. */
export class MarkerBoundsIndex {
  #blockCount = 0;
  #maximumX = new Float64Array();
  #maximumY = new Float64Array();
  #maximumZ = new Float64Array();
  #minimumX = new Float64Array();
  #minimumY = new Float64Array();
  #minimumZ = new Float64Array();
  #queryBounds = new Float64Array(6);
  #recordBounds = new Float64Array(6);

  clone(): MarkerBoundsIndex {
    const clone = new MarkerBoundsIndex();
    clone.#blockCount = this.#blockCount;
    clone.#maximumX = this.#maximumX.slice();
    clone.#maximumY = this.#maximumY.slice();
    clone.#maximumZ = this.#maximumZ.slice();
    clone.#minimumX = this.#minimumX.slice();
    clone.#minimumY = this.#minimumY.slice();
    clone.#minimumZ = this.#minimumZ.slice();
    return clone;
  }

  reset(recordCount: number): void {
    const blockCount = Math.ceil(recordCount / BLOCK_SIZE);
    if (blockCount !== this.#blockCount) this.#resize(blockCount);
    this.#clearBlocks(0, blockCount);
  }

  includeRecord(index: number, source: MarkerBoundsSource): void {
    if (!this.#readRecord(index, source)) return;
    this.#includeBounds(index);
  }

  // eslint-disable-next-line max-params -- Avoid allocating one tuple per marker during full source validation.
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
    const block = Math.floor(index / BLOCK_SIZE);
    this.#minimumX[block] = Math.min(at(this.#minimumX, block), at(this.#recordBounds, 0));
    this.#minimumY[block] = Math.min(at(this.#minimumY, block), at(this.#recordBounds, 1));
    this.#minimumZ[block] = Math.min(at(this.#minimumZ, block), at(this.#recordBounds, 2));
    this.#maximumX[block] = Math.max(at(this.#maximumX, block), at(this.#recordBounds, 3));
    this.#maximumY[block] = Math.max(at(this.#maximumY, block), at(this.#recordBounds, 4));
    this.#maximumZ[block] = Math.max(at(this.#maximumZ, block), at(this.#recordBounds, 5));
  }

  updateBlocks(
    options: MarkerBoundsSource & { readonly count: number; readonly recordCount: number; readonly start: number }
  ): void {
    if (options.count === 0) return;
    const firstBlock = Math.floor(options.start / BLOCK_SIZE);
    const lastBlock = Math.floor((options.start + options.count - 1) / BLOCK_SIZE);
    this.#clearBlocks(firstBlock, lastBlock + 1);
    const firstRecord = firstBlock * BLOCK_SIZE;
    const lastRecord = Math.min(options.recordCount, (lastBlock + 1) * BLOCK_SIZE);
    for (let index = firstRecord; index < lastRecord; index += 1) this.includeRecord(index, options);
  }

  getBounds(count: number, source: MarkerBoundsSource): MarkerBounds | null {
    const fullBlocks = Math.floor(count / BLOCK_SIZE);
    resetBounds(this.#queryBounds);
    for (let block = 0; block < fullBlocks; block += 1) this.#includeBlock(block);
    for (let index = fullBlocks * BLOCK_SIZE; index < count; index += 1) {
      if (this.#readRecord(index, source)) extendBounds(this.#queryBounds, this.#recordBounds);
    }
    return createBounds(this.#queryBounds);
  }

  #resize(blockCount: number): void {
    this.#maximumX = new Float64Array(blockCount);
    this.#maximumY = new Float64Array(blockCount);
    this.#maximumZ = new Float64Array(blockCount);
    this.#minimumX = new Float64Array(blockCount);
    this.#minimumY = new Float64Array(blockCount);
    this.#minimumZ = new Float64Array(blockCount);
    this.#blockCount = blockCount;
  }

  #includeBlock(block: number): void {
    this.#recordBounds[0] = at(this.#minimumX, block);
    this.#recordBounds[1] = at(this.#minimumY, block);
    this.#recordBounds[2] = at(this.#minimumZ, block);
    this.#recordBounds[3] = at(this.#maximumX, block);
    this.#recordBounds[4] = at(this.#maximumY, block);
    this.#recordBounds[5] = at(this.#maximumZ, block);
    extendBounds(this.#queryBounds, this.#recordBounds);
  }

  #clearBlocks(start: number, end: number): void {
    this.#minimumX.fill(Number.POSITIVE_INFINITY, start, end);
    this.#minimumY.fill(Number.POSITIVE_INFINITY, start, end);
    this.#minimumZ.fill(Number.POSITIVE_INFINITY, start, end);
    this.#maximumX.fill(Number.NEGATIVE_INFINITY, start, end);
    this.#maximumY.fill(Number.NEGATIVE_INFINITY, start, end);
    this.#maximumZ.fill(Number.NEGATIVE_INFINITY, start, end);
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
  #plane = new Float64Array(4);
  #transform = new Float64Array(16);

  classify(bounds: MarkerBounds | null | undefined, viewProjection: Mat4, frame: Mat4): MarkerFrustumRelation {
    if (bounds === undefined) return 'intersecting';
    if (bounds === null) return 'outside';
    multiplyInto(this.#transform, viewProjection, frame);
    let relation: MarkerFrustumRelation = 'inside';
    for (const rows of FRUSTUM_PLANES) {
      this.#writePlane(rows);
      relation = mergeRelation(relation, classifyAabbPlane(bounds, this.#plane));
    }
    return relation;
  }

  #writePlane(rows: FrustumPlaneRows): void {
    for (let column = 0; column < 4; column += 1) {
      this.#plane[column] = planeCoefficient(this.#transform, column, rows);
    }
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

function multiplyInto(result: Float64Array, left: Mat4, right: Mat4): void {
  for (let column = 0; column < 4; column += 1) {
    for (let row = 0; row < 4; row += 1) {
      let value = 0;
      for (let index = 0; index < 4; index += 1) {
        value += (left[index * 4 + row] ?? 0) * (right[column * 4 + index] ?? 0);
      }
      result[column * 4 + row] = value;
    }
  }
}

function planeCoefficient(transform: Float64Array, column: number, rows: FrustumPlaneRows): number {
  const offset = column * 4;
  const first = transform[offset + rows.firstRow] ?? 0;
  if (rows.secondRow === undefined) return first;
  return first + (transform[offset + rows.secondRow] ?? 0) * (rows.secondScale ?? 0);
}

function classifyAabbPlane(bounds: MarkerBounds, plane: Float64Array): MarkerFrustumRelation {
  const centerX = (bounds.minimumX + bounds.maximumX) * 0.5;
  const centerY = (bounds.minimumY + bounds.maximumY) * 0.5;
  const centerZ = (bounds.minimumZ + bounds.maximumZ) * 0.5;
  const extentX = (bounds.maximumX - bounds.minimumX) * 0.5;
  const extentY = (bounds.maximumY - bounds.minimumY) * 0.5;
  const extentZ = (bounds.maximumZ - bounds.minimumZ) * 0.5;
  const distance = at(plane, 0) * centerX + at(plane, 1) * centerY + at(plane, 2) * centerZ + at(plane, 3);
  const radius = Math.abs(at(plane, 0)) * extentX + Math.abs(at(plane, 1)) * extentY + Math.abs(at(plane, 2)) * extentZ;
  if (distance + radius < 0) return 'outside';
  return distance - radius < 0 ? 'intersecting' : 'inside';
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

function mergeRelation(left: MarkerFrustumRelation, right: MarkerFrustumRelation): MarkerFrustumRelation {
  if (left === 'outside' || right === 'outside') return 'outside';
  return left === 'intersecting' || right === 'intersecting' ? 'intersecting' : 'inside';
}
