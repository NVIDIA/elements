// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { MARKER } from '../../records/layouts/built-ins.js';
import { getFieldOffset } from '../../records/layouts/define-layout.js';
import { normalizeQuaternion } from '../../math/quaternion.js';
import type { MutableQuaternion } from '../../records/packed-record-buffer.js';
import type { Quaternion } from '../../math/types.js';

const ORIENTATION_OFFSET = getFieldOffset(MARKER, 'orientation');
const SCALE_OFFSET = getFieldOffset(MARKER, 'scale');
const COLOR_OFFSET = getFieldOffset(MARKER, 'color');

export class MarkerQuaternionView implements MutableQuaternion {
  readonly #notifyMutation: () => void;
  readonly #offset: number;
  readonly #view: DataView;

  constructor(view: DataView, offset: number, notifyMutation: () => void) {
    this.#view = view;
    this.#offset = offset;
    this.#notifyMutation = notifyMutation;
  }

  get x(): number {
    return this.#view.getFloat32(this.#offset, true);
  }

  get y(): number {
    return this.#view.getFloat32(this.#offset + 4, true);
  }

  get z(): number {
    return this.#view.getFloat32(this.#offset + 8, true);
  }

  get w(): number {
    return this.#view.getFloat32(this.#offset + 12, true);
  }

  set(...components: Quaternion): this {
    writeMarkerQuaternion(this.#view, this.#offset, components);
    this.#notifyMutation();
    return this;
  }

  toArray(): Quaternion {
    return [this.x, this.y, this.z, this.w];
  }
}

export function initializeMarkerRecords(view: DataView, bytes: Uint8Array, capacity: number): void {
  for (let index = 0; index < capacity; index += 1) {
    const offset = index * MARKER.stride;
    view.setFloat32(offset + ORIENTATION_OFFSET + 12, 1, true);
    view.setFloat32(offset + SCALE_OFFSET, 1, true);
    view.setFloat32(offset + SCALE_OFFSET + 4, 1, true);
    view.setFloat32(offset + SCALE_OFFSET + 8, 1, true);
    bytes.fill(255, offset + COLOR_OFFSET, offset + COLOR_OFFSET + 4);
  }
}

export function writeMarkerQuaternion(view: DataView, offset: number, value: Readonly<Quaternion>): void {
  normalizeQuaternion(value).forEach((component, index) => view.setFloat32(offset + index * 4, component, true));
}
