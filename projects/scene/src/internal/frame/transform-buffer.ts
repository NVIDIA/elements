// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { TransformSample } from './types.js';
import { composeMat4, identityMat4 } from '../math/mat4.js';
import { normalizeQuaternion, slerpQuaternions } from '../math/quaternion.js';
import type { Mat4, Quaternion, Vec3 } from '../types.js';

export const FRAME_SAMPLE_MAX_SPAN_MS = 10_000;
export const FRAME_SAMPLE_MAX_COUNT = 4_096;

interface StampedTransformSample extends TransformSample {
  stamp: number;
}

export interface FrameTransformBufferSnapshot {
  readonly sampleCount: number;
  readonly oldestStamp?: number;
  readonly newestStamp?: number;
  readonly staticTransform: boolean;
}

export class FrameTransformBuffer {
  #samples: StampedTransformSample[] = [];
  #staticTransform?: TransformSample;

  get hasTimestampedSamples(): boolean {
    return this.#samples.length > 0;
  }

  setTransform(sample: TransformSample): void {
    const normalized = normalizeTransformSample(sample);
    if (normalized.stamp === undefined) {
      this.#samples = [];
      this.#staticTransform = normalized;
      return;
    }

    if (this.#staticTransform) {
      this.#staticTransform = undefined;
      this.#samples = [];
    }

    const stamped = { ...normalized, stamp: normalized.stamp };
    const insertionIndex = findFirstAtOrAfter(this.#samples, stamped.stamp);
    if (this.#samples[insertionIndex]?.stamp === stamped.stamp) {
      this.#samples[insertionIndex] = stamped;
    } else {
      this.#samples.splice(insertionIndex, 0, stamped);
    }
    this.#evictOldSamples();
  }

  clear(): boolean {
    const changed = this.#staticTransform !== undefined || this.#samples.length > 0;
    this.#staticTransform = undefined;
    this.#samples = [];
    return changed;
  }

  getNewestTransform(): TransformSample | null {
    const sample = this.#staticTransform ?? this.#samples.at(-1);
    return sample ? cloneTransformSample(sample) : null;
  }

  resolve(time: number): Mat4 {
    assertFiniteTime(time);
    if (this.#staticTransform) {
      return composeTransform(this.#staticTransform);
    }
    return resolveStampedSamples(this.#samples, time);
  }

  getStaleness(sceneTime: number): number {
    assertFiniteTime(sceneTime);
    if (this.#staticTransform) {
      return 0;
    }
    const newest = this.#samples.at(-1);
    return newest ? Math.max(0, sceneTime - newest.stamp) : Number.POSITIVE_INFINITY;
  }

  getSnapshot(): FrameTransformBufferSnapshot {
    return {
      sampleCount: this.#samples.length,
      oldestStamp: this.#samples[0]?.stamp,
      newestStamp: this.#samples.at(-1)?.stamp,
      staticTransform: this.#staticTransform !== undefined
    };
  }

  #evictOldSamples(): void {
    const newestStamp = this.#samples.at(-1)?.stamp;
    if (newestStamp === undefined) {
      return;
    }
    while (
      this.#samples.length > FRAME_SAMPLE_MAX_COUNT ||
      newestStamp - (this.#samples[0]?.stamp ?? newestStamp) > FRAME_SAMPLE_MAX_SPAN_MS
    ) {
      this.#samples.shift();
    }
  }
}

function normalizeTransformSample(value: TransformSample): TransformSample {
  assertTransformSample(value);
  const position: Vec3 = [...value.position];
  const orientation = normalizeQuaternion(value.orientation);
  return value.stamp === undefined ? { position, orientation } : { stamp: value.stamp, position, orientation };
}

function assertTransformSample(value: unknown): asserts value is TransformSample {
  if (typeof value !== 'object' || value === null) {
    throw new TypeError('Transform sample must be an object.');
  }
  const position = Reflect.get(value, 'position');
  const orientation = Reflect.get(value, 'orientation');
  const stamp = Reflect.get(value, 'stamp');
  assertNumberTuple(position, 3, 'Position');
  assertNumberTuple(orientation, 4, 'Orientation');
  if (stamp !== undefined && typeof stamp !== 'number') {
    throw new TypeError('Transform timestamp must be a number.');
  }
  if (stamp !== undefined && !Number.isFinite(stamp)) {
    throw new RangeError('Transform timestamp must be finite.');
  }
}

function assertNumberTuple(value: unknown, length: number, label: string): asserts value is number[] {
  if (!Array.isArray(value) || value.length !== length || value.some(item => typeof item !== 'number')) {
    throw new TypeError(`${label} must contain exactly ${length} numbers.`);
  }
  if (value.some(item => !Number.isFinite(item))) {
    throw new RangeError(`${label} components must be finite.`);
  }
}

function composeTransform(sample: TransformSample): Mat4 {
  return composeMat4(sample.position, sample.orientation);
}

function resolveStampedSamples(samples: readonly StampedTransformSample[], time: number): Mat4 {
  if (samples.length === 0) {
    return identityMat4();
  }
  const endIndex = findFirstAtOrAfter(samples, time);
  const end = samples[Math.min(endIndex, samples.length - 1)];
  if (!end) {
    return identityMat4();
  }
  if (endIndex === 0 || end.stamp === time) {
    return composeTransform(end);
  }
  const start = samples[endIndex - 1];
  if (!start || endIndex >= samples.length) {
    return composeTransform(end);
  }
  const amount = (time - start.stamp) / (end.stamp - start.stamp);
  return composeMat4(
    interpolatePosition(start.position, end.position, amount),
    slerpQuaternions(start.orientation, end.orientation, amount)
  );
}

function interpolatePosition(start: Vec3, end: Vec3, amount: number): Vec3 {
  return [
    start[0] + (end[0] - start[0]) * amount,
    start[1] + (end[1] - start[1]) * amount,
    start[2] + (end[2] - start[2]) * amount
  ];
}

function cloneTransformSample(sample: TransformSample): TransformSample {
  const position: Vec3 = [...sample.position];
  const orientation: Quaternion = [...sample.orientation];
  return sample.stamp === undefined ? { position, orientation } : { stamp: sample.stamp, position, orientation };
}

function findFirstAtOrAfter(samples: readonly StampedTransformSample[], stamp: number): number {
  let low = 0;
  let high = samples.length;
  while (low < high) {
    const middle = Math.floor((low + high) / 2);
    const middleStamp = samples[middle]?.stamp;
    if (middleStamp !== undefined && middleStamp < stamp) {
      low = middle + 1;
    } else {
      high = middle;
    }
  }
  return low;
}

function assertFiniteTime(time: number): void {
  if (typeof time !== 'number') {
    throw new TypeError('Time must be a number.');
  }
  if (!Number.isFinite(time)) {
    throw new RangeError('Time must be finite.');
  }
}
