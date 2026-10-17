// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

interface ResizeOptions {
  boundary: number;
  delta: number;
  policy: 'stop' | 'propagate';
}

function validSizes(values: readonly number[], minima: readonly number[]) {
  if (
    values.length !== minima.length ||
    !values.every(value => Number.isFinite(value) && value > 0) ||
    !minima.every(value => Number.isFinite(value) && value >= 0)
  )
    throw new TypeError('Invalid split sizes');
  if (
    !Number.isFinite(values.reduce((sum, value) => sum + value, 0)) ||
    !Number.isFinite(minima.reduce((sum, value) => sum + value, 0))
  )
    throw new TypeError('Split size total exceeds the supported range');
}

function resizeDonors(sizes: readonly number[], { boundary, delta, policy }: ResizeOptions) {
  if (policy === 'stop') return [delta > 0 ? boundary + 1 : boundary];
  const indices = sizes.map((_, i) => i);
  if (delta > 0) return indices.slice(boundary + 1);
  return indices.slice(0, boundary + 1).reverse();
}

/** Fits preferred proportions without rewriting them when constraints intervene. */
export function fitSizes(weights: readonly number[], minima: readonly number[], available: number): number[] {
  validSizes(weights, minima);
  if (!Number.isFinite(available)) throw new TypeError('Invalid available extent');
  const extent = Math.max(
    available,
    minima.reduce((a, b) => a + b, 0)
  );
  const result = weights.map(() => 0);
  const pending = new Set(weights.map((_, i) => i));
  let remaining = extent;
  while (pending.size) {
    const total = [...pending].reduce((sum, i) => sum + weights[i]!, 0);
    const constrained = [...pending].filter(i => (remaining * weights[i]!) / total < minima[i]!);
    if (!constrained.length) {
      pending.forEach(i => {
        result[i] = (remaining * weights[i]!) / total;
      });
      break;
    }
    constrained.forEach(i => {
      result[i] = minima[i]!;
      remaining -= minima[i]!;
      pending.delete(i);
    });
  }
  return result;
}

/** Exchanges adjacent space, optionally consuming farther neighbors at limits. */
export function resizeSizes(sizes: readonly number[], minima: readonly number[], options: ResizeOptions): number[] {
  validSizes(sizes, minima);
  const { boundary, delta } = options;
  if (!Number.isInteger(boundary) || boundary < 0 || boundary >= sizes.length - 1 || !Number.isFinite(delta))
    throw new TypeError('Invalid split boundary');
  const result = [...sizes];
  const receiving = delta > 0 ? boundary : boundary + 1;
  const donors = resizeDonors(sizes, options);
  let remaining = Math.abs(delta);
  donors.forEach(i => {
    const amount = Math.min(remaining, Math.max(0, result[i]! - minima[i]!));
    result[i]! -= amount;
    result[receiving]! += amount;
    remaining -= amount;
  });
  return result;
}
