// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

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
export function resizeSizes(
  sizes: readonly number[],
  minima: readonly number[],
  options: { boundary: number; delta: number; policy: 'stop' | 'propagate' }
): number[] {
  validSizes(sizes, minima);
  const { boundary, delta, policy } = options;
  if (!Number.isInteger(boundary) || boundary < 0 || boundary >= sizes.length - 1 || !Number.isFinite(delta))
    throw new TypeError('Invalid split boundary');
  const result = [...sizes];
  const receiving = delta > 0 ? boundary : boundary + 1;
  const donors =
    policy === 'stop'
      ? [delta > 0 ? boundary + 1 : boundary]
      : delta > 0
        ? sizes.map((_, i) => i).slice(boundary + 1)
        : sizes
            .map((_, i) => i)
            .slice(0, boundary + 1)
            .reverse();
  let remaining = Math.abs(delta);
  donors.forEach(i => {
    const amount = Math.min(remaining, Math.max(0, result[i]! - minima[i]!));
    result[i]! -= amount;
    result[receiving]! += amount;
    remaining -= amount;
  });
  return result;
}
