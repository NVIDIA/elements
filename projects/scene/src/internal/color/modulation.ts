// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { copyRGBA } from './rgba.js';
import { decodeSrgbChannel, encodeSrgbChannel } from './transfer.js';
import type { RGBA } from './types.js';

type ColorStorage = Float32Array | Float64Array | RGBA;

/**
 * Captures a normalized sRGB tint for repeated, unpremultiplied RGBA modulation.
 * RGB channels multiply in linear light and return to sRGB; alpha multiplies directly.
 * Preparation takes constant time and space; each write allocates no storage.
 */
export class PreparedRGBAModulation {
  readonly #linearTint: Readonly<RGBA>;

  constructor(tint: Readonly<RGBA>) {
    const linearTint = copyRGBA(tint);
    linearTint[0] = decodeSrgbChannel(linearTint[0]);
    linearTint[1] = decodeSrgbChannel(linearTint[1]);
    linearTint[2] = decodeSrgbChannel(linearTint[2]);
    this.#linearTint = linearTint;
  }

  /**
   * Writes a color from valid normalized RGBA spans, returning the destination.
   * Reads all channels before writing, supporting overlapping spans. Callers validate
   * source channels and storage; rounding occurs only in the destination storage.
   */
  // eslint-disable-next-line max-params -- @hotpath Scalar offsets avoid allocating source and destination span wrappers.
  writeColor<T extends ColorStorage>(
    source: ArrayLike<number>,
    sourceOffset: number,
    target: T,
    targetOffset: number
  ): T {
    const red = source[sourceOffset]!,
      green = source[sourceOffset + 1]!,
      blue = source[sourceOffset + 2]!,
      alpha = source[sourceOffset + 3]!;
    const tint = this.#linearTint;
    target[targetOffset] = encodeSrgbChannel(decodeSrgbChannel(red) * tint[0]);
    target[targetOffset + 1] = encodeSrgbChannel(decodeSrgbChannel(green) * tint[1]);
    target[targetOffset + 2] = encodeSrgbChannel(decodeSrgbChannel(blue) * tint[2]);
    target[targetOffset + 3] = alpha * tint[3];
    return target;
  }
}
