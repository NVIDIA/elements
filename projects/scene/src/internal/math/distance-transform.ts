// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export interface DistanceTransformWorkspace {
  readonly boundaries: Float64Array;
  readonly line: Float64Array;
  readonly sites: Uint32Array;
}

interface DistanceGridOptions {
  readonly distances: Float64Array;
  readonly height: number;
  readonly width: number;
  readonly workspace: DistanceTransformWorkspace;
}

interface DistanceLineOptions {
  readonly distances: Float64Array;
  readonly length: number;
  readonly offset: number;
  readonly stride: number;
  readonly workspace: DistanceTransformWorkspace;
}

/** Allocates independent scratch arrays for reuse across grids with axes up to maximumLength. */
export function createDistanceTransformWorkspace(maximumLength: number): DistanceTransformWorkspace {
  if (!Number.isSafeInteger(maximumLength) || maximumLength < 0 || maximumLength > 0xffff_ffff) {
    throw new RangeError('Distance transform capacity must be a nonnegative Uint32 integer.');
  }
  return {
    boundaries: new Float64Array(maximumLength + 1),
    line: new Float64Array(maximumLength),
    sites: new Uint32Array(maximumLength)
  };
}

/**
 * Replaces row-major costs with min(cost(q) + squared pixel distance(p, q)) in place.
 * Costs must be nonnegative numbers; positive infinity marks an absent site.
 * An all-absent grid stays infinite. Transforms only width * height values, leaving any tail unchanged.
 * Dimensions must be nonnegative safe integers. Empty grids need no scratch capacity.
 * Use an independent workspace from createDistanceTransformWorkspace; calls can reuse it sequentially.
 * Takes linear time in the grid area and scratch space linear in the longest axis.
 */
export function squaredEuclideanDistanceTransform(options: DistanceGridOptions): void {
  const { distances, height, width, workspace } = options;
  const length = assertDistanceGrid(options);
  if (length === 0) return;
  for (let x = 0; x < width; x += 1) {
    transformLine({ distances, length: height, offset: x, stride: width, workspace });
  }
  for (let y = 0; y < height; y += 1) {
    transformLine({ distances, length: width, offset: y * width, stride: 1, workspace });
  }
}

function assertDistanceGrid(options: DistanceGridOptions): number {
  const { distances, height, width, workspace } = options;
  const length = assertGridDimensions(width, height, distances.length);
  const maximumLength = length === 0 ? 0 : Math.max(width, height);
  if (
    workspace.line.length < maximumLength ||
    workspace.sites.length < maximumLength ||
    workspace.boundaries.length < maximumLength + 1
  ) {
    throw new RangeError('Distance transform workspace must fit both grid axes.');
  }
  for (let index = 0; index < length; index += 1) {
    const cost = distances[index]!;
    if (Number.isNaN(cost) || cost < 0) throw new RangeError('Distance costs must be nonnegative numbers.');
  }
  return length;
}

function assertGridDimensions(width: number, height: number, capacity: number): number {
  const length = width * height;
  if (
    !Number.isSafeInteger(width) ||
    !Number.isSafeInteger(height) ||
    width < 0 ||
    height < 0 ||
    !Number.isSafeInteger(length) ||
    length > capacity
  ) {
    throw new RangeError('Distance grid dimensions must fit the supplied array.');
  }
  return length;
}

// Separable exact Euclidean distance transform described by Felzenszwalb and Huttenlocher:
// https://cs.brown.edu/people/pfelzens/papers/dt-final.pdf
// eslint-disable-next-line max-statements -- The linear-time lower-envelope algorithm is clearest as one pass.
function transformLine(options: DistanceLineOptions): void {
  const { distances, length, offset, stride, workspace } = options;
  const { boundaries, line, sites } = workspace;
  let envelopeEnd = -1;

  for (let candidate = 0; candidate < length; candidate += 1) {
    const cost = distances[offset + candidate * stride]!;
    line[candidate] = cost;
    if (cost === Infinity) continue;
    let intersection = -Infinity;
    while (envelopeEnd >= 0) {
      const site = sites[envelopeEnd]!;
      intersection = (cost - line[site]!) / (2 * (candidate - site)) + (candidate + site) / 2;
      if (intersection > boundaries[envelopeEnd]!) break;
      envelopeEnd -= 1;
    }
    envelopeEnd += 1;
    sites[envelopeEnd] = candidate;
    boundaries[envelopeEnd] = envelopeEnd === 0 ? -Infinity : intersection;
    boundaries[envelopeEnd + 1] = Infinity;
  }

  const hasSites = envelopeEnd >= 0;
  envelopeEnd = 0;
  for (let point = 0; point < length; point += 1) {
    if (!hasSites) {
      distances[offset + point * stride] = Infinity;
      continue;
    }
    while (boundaries[envelopeEnd + 1]! < point) envelopeEnd += 1;
    const site = sites[envelopeEnd]!;
    const delta = point - site;
    distances[offset + point * stride] = line[site]! + delta * delta;
  }
}
