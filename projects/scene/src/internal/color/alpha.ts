// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export type AlphaClass = 'zero' | 'partial' | 'opaque';

/** Additive counts of zero, partial, and opaque alpha channels. */
export interface AlphaSummary {
  readonly zero: number;
  readonly partial: number;
  readonly opaque: number;
}

export interface AlphaSpan {
  readonly values: ArrayLike<number>;
  readonly offset: number;
  readonly stride: number;
  readonly count: number;
  readonly opaqueValue: 1 | 255;
}

export const EMPTY_ALPHA_SUMMARY: AlphaSummary = Object.freeze({ zero: 0, partial: 0, opaque: 0 });

/** Classifies caller-validated alpha without clamping, quantization, or color transfer. */
export function classifyAlpha(value: number, opaqueValue: 1 | 255): AlphaClass {
  if (value === 0) return 'zero';
  return value < opaqueValue ? 'partial' : 'opaque';
}

/** Counts a strided span in linear time and constant space; callers validate channel values. */
export function summarizeAlpha(span: AlphaSpan): AlphaSummary {
  assertSpan(span);
  let zero = 0;
  let partial = 0;
  let opaque = 0;
  let offset = span.offset;
  for (let index = 0; index < span.count; index += 1, offset += span.stride) {
    const classification = classifyAlpha(span.values[offset]!, span.opaqueValue);
    if (classification === 'zero') zero += 1;
    else if (classification === 'partial') partial += 1;
    else opaque += 1;
  }
  return { zero, partial, opaque };
}

/** Counts complete RGBA records, retaining float alpha precision and byte alpha thresholds. */
export function summarizeRGBAAlpha(colors: Float32Array | Uint8Array | null): AlphaSummary {
  if (colors === null) return EMPTY_ALPHA_SUMMARY;
  return summarizeAlpha({
    values: colors,
    offset: 3,
    stride: 4,
    count: Math.floor(colors.length / 4),
    opaqueValue: colors instanceof Uint8Array ? 255 : 1
  });
}

/** Combines independent summaries without changing either input. */
export function mergeAlphaSummaries(left: AlphaSummary, right: AlphaSummary): AlphaSummary {
  return { zero: left.zero + right.zero, partial: left.partial + right.partial, opaque: left.opaque + right.opaque };
}

/** Replaces a contained contribution without changing the total or either span summary. */
export function replaceAlphaSummary(total: AlphaSummary, before: AlphaSummary, after: AlphaSummary): AlphaSummary {
  return {
    zero: total.zero - before.zero + after.zero,
    partial: total.partial - before.partial + after.partial,
    opaque: total.opaque - before.opaque + after.opaque
  };
}

function assertSpan(span: AlphaSpan): void {
  const { offset, stride, count, values } = span;
  if (
    !Number.isSafeInteger(offset) ||
    offset < 0 ||
    !Number.isSafeInteger(stride) ||
    stride < 1 ||
    !Number.isSafeInteger(count) ||
    count < 0
  ) {
    throw new RangeError('Alpha spans require a nonnegative offset and count and a positive stride.');
  }
  const last = offset + (count - 1) * stride;
  if (count > 0 && (!Number.isSafeInteger(last) || last >= values.length)) {
    throw new RangeError('Alpha span exceeds the available values.');
  }
}
