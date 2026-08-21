// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Mat4, Vec3 } from '../../internal/types.js';
import type { PickHit, PickTableEntry } from './types.js';

interface PickClientRect {
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly height: number;
}

interface PickDeviceSize {
  readonly deviceWidth: number;
  readonly deviceHeight: number;
}

interface DevicePixelCoordinate {
  readonly outside: false;
  readonly x: number;
  readonly y: number;
}

interface OutsideDevicePixelCoordinate {
  readonly outside: true;
}

type PickPixel = DevicePixelCoordinate | OutsideDevicePixelCoordinate;

export interface ClientToDevicePixelOptions extends PickClientRect, PickDeviceSize {
  readonly clientX: number;
  readonly clientY: number;
}

/**
 * Converts a client-space point to the pixel that a WebGPU copy operation
 * should read. The outside result is intentional: callers can return a miss
 * without submitting an ID pass for a point outside the canvas.
 */
export function mapClientToDevicePixel(options: ClientToDevicePixelOptions): PickPixel {
  assertClientRect(options);
  assertDeviceSize(options);
  assertFinite(options.clientX, 'Client X');
  assertFinite(options.clientY, 'Client Y');

  const relativeX = options.clientX - options.left;
  const relativeY = options.clientY - options.top;
  if (relativeX < 0 || relativeY < 0 || relativeX >= options.width || relativeY >= options.height) {
    return { outside: true };
  }

  return {
    outside: false,
    x: Math.min(options.deviceWidth - 1, Math.floor((relativeX / options.width) * options.deviceWidth)),
    y: Math.min(options.deviceHeight - 1, Math.floor((relativeY / options.height) * options.deviceHeight))
  };
}

interface ReconstructWorldPositionOptions extends ClientToDevicePixelOptions {
  /** WebGPU depth sample, whose range is [0, 1]. */
  readonly depth: number;
  /** Inverse of the view-projection matrix used for the matching ID pass. */
  readonly inverseViewProjection: Mat4;
  /** Defaults to true; use the center of the copied pixel as the sample point. */
  readonly pixelCenter?: boolean;
}

/**
 * Reconstructs a world point from an ID-pass depth sample. Returns null for
 * points outside the canvas, matching scene.pick's miss behavior.
 */
export function reconstructWorldPosition(options: ReconstructWorldPositionOptions): Vec3 | null {
  assertFinite(options.depth, 'Depth');
  if (options.depth < 0 || options.depth > 1) {
    throw new RangeError('Depth must be in the [0, 1] range.');
  }
  assertMat4(options.inverseViewProjection);
  const pixel = mapClientToDevicePixel(options);
  if (pixel.outside) return null;

  const center = (options.pixelCenter ?? true) ? 0.5 : 0;
  const ndcX = ((pixel.x + center) / options.deviceWidth) * 2 - 1;
  const ndcY = 1 - ((pixel.y + center) / options.deviceHeight) * 2;
  const matrix = options.inverseViewProjection;
  const [worldX, worldY, worldZ, worldW] = multiplyVec4(matrix, [ndcX, ndcY, options.depth, 1]);
  if (!Number.isFinite(worldW) || Math.abs(worldW) < Number.EPSILON) {
    throw new RangeError('The inverse view-projection produced an invalid homogeneous coordinate.');
  }
  const inverseW = 1 / worldW;
  return assertWorldPosition([worldX * inverseW, worldY * inverseW, worldZ * inverseW]);
}

/** Creates a fresh, deeply immutable public hit from a retained ID-table row. */
export function createPickHit(entry: PickTableEntry, worldPosition: Readonly<Vec3>): PickHit {
  if (!Number.isInteger(entry.instanceIndex) || entry.instanceIndex < 0) {
    throw new RangeError('Pick instance index must be a nonnegative integer.');
  }
  if (!(entry.layer instanceof Element)) {
    throw new TypeError('Pick layer must be an Element.');
  }
  if (entry.marker !== undefined && !(entry.marker instanceof Element)) {
    throw new TypeError('Pick marker must be an Element.');
  }
  if (worldPosition.length !== 3 || worldPosition.some(value => !Number.isFinite(value))) {
    throw new RangeError('Pick world position must contain three finite values.');
  }

  const position = Object.freeze([worldPosition[0], worldPosition[1], worldPosition[2]] as Vec3);
  return Object.freeze({
    element: entry.marker ?? entry.layer,
    layer: entry.layer,
    instanceIndex: entry.instanceIndex,
    worldPosition: position
  });
}

export function createPickHitFromId(
  id: number,
  table: ReadonlyMap<number, PickTableEntry>,
  worldPosition: Readonly<Vec3>
): PickHit | null {
  if (!Number.isInteger(id) || id < 0) {
    throw new RangeError('Pick IDs must be nonnegative integers.');
  }
  if (id === 0) return null;
  const entry = table.get(id);
  return entry === undefined ? null : createPickHit(entry, worldPosition);
}

function assertClientRect(options: PickClientRect): void {
  assertFinite(options.left, 'Canvas left');
  assertFinite(options.top, 'Canvas top');
  assertFinite(options.width, 'Canvas width');
  assertFinite(options.height, 'Canvas height');
  if (options.width <= 0 || options.height <= 0) {
    throw new RangeError('Canvas dimensions must be greater than zero.');
  }
}

function assertDeviceSize(options: PickDeviceSize): void {
  if (
    !Number.isInteger(options.deviceWidth) ||
    !Number.isInteger(options.deviceHeight) ||
    options.deviceWidth <= 0 ||
    options.deviceHeight <= 0
  ) {
    throw new RangeError('Device dimensions must be positive integers.');
  }
}

function assertMat4(matrix: Mat4): void {
  if (matrix.length !== 16 || matrix.some(value => !Number.isFinite(value))) {
    throw new RangeError('Inverse view-projection must contain 16 finite values.');
  }
}

function assertFinite(value: number, name: string): void {
  if (!Number.isFinite(value)) throw new RangeError(`${name} must be finite.`);
}

function multiplyVec4(
  matrix: Mat4,
  vector: readonly [number, number, number, number]
): [number, number, number, number] {
  return [
    matrix[0]! * vector[0] + matrix[4]! * vector[1] + matrix[8]! * vector[2] + matrix[12]! * vector[3],
    matrix[1]! * vector[0] + matrix[5]! * vector[1] + matrix[9]! * vector[2] + matrix[13]! * vector[3],
    matrix[2]! * vector[0] + matrix[6]! * vector[1] + matrix[10]! * vector[2] + matrix[14]! * vector[3],
    matrix[3]! * vector[0] + matrix[7]! * vector[1] + matrix[11]! * vector[2] + matrix[15]! * vector[3]
  ];
}

function assertWorldPosition(position: Vec3): Vec3 {
  if (position.some(value => !Number.isFinite(value))) {
    throw new RangeError('The inverse view-projection produced a nonfinite world position.');
  }
  return position;
}
