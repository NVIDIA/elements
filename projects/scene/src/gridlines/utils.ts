// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { LINE_VERTEX } from '../internal/layouts/built-ins.js';
import { writeLineVertex } from '../internal/layouts/helpers.js';
import type { RGBA, Vec3 } from '../internal/types.js';

/** Private allocation ceiling for one finite reference grid. */
const MAX_GRID_VERTEX_BYTES = 4 * 1024 * 1024;

/** Largest count whose vertex records fit in the private grid allocation ceiling. */
export const MAX_GRID_COUNT = Math.floor((MAX_GRID_VERTEX_BYTES / LINE_VERTEX.stride - 4) / 8);

/** Returns the number of disjoint line vertices for a grid count. */
export function gridVertexCount(count: number): number {
  return 8 * count + 4;
}

/**
 * Builds X-parallel segments followed by Y-parallel segments on frame-local Z = 0.
 *
 * The caller owns the returned bytes. Inputs must already meet the element's
 * finite, positive, allocation-safe constraints.
 */
export function createGridVertices(options: {
  readonly spacing: number;
  readonly count: number;
  readonly color: RGBA;
  readonly width: number;
}): Uint8Array {
  const { spacing, count, color, width } = options;
  const vertexCount = gridVertexCount(count);
  const byteLength = vertexCount * LINE_VERTEX.stride;
  const extent = count * spacing;
  if (
    !Number.isFinite(spacing) ||
    spacing <= 0 ||
    !Number.isSafeInteger(count) ||
    count < 1 ||
    byteLength > MAX_GRID_VERTEX_BYTES ||
    !Number.isSafeInteger(byteLength) ||
    !Number.isFinite(extent)
  ) {
    throw new RangeError('Grid geometry must be finite and fit the private allocation ceiling.');
  }

  const vertices = new Uint8Array(byteLength);
  writeGridAxis({ axis: 'x', color, count, extent, spacing, vertices, width });
  writeGridAxis({ axis: 'y', color, count, extent, spacing, vertices, width });
  return vertices;
}

function writeGridAxis(options: {
  readonly axis: 'x' | 'y';
  readonly color: RGBA;
  readonly count: number;
  readonly extent: number;
  readonly spacing: number;
  readonly vertices: Uint8Array;
  readonly width: number;
}): void {
  const { axis, color, count, extent, spacing, vertices, width } = options;
  const start = axis === 'x' ? 0 : 4 * count + 2;
  for (let index = -count; index <= count; index += 1) {
    const offset = index * spacing;
    const positions: [Vec3, Vec3] =
      axis === 'x'
        ? [
            [-extent, offset, 0],
            [extent, offset, 0]
          ]
        : [
            [offset, -extent, 0],
            [offset, extent, 0]
          ];
    const vertex = start + (index + count) * 2;
    writeLineVertex(vertices, vertex, { color, position: positions[0], width });
    writeLineVertex(vertices, vertex + 1, { color, position: positions[1], width });
  }
}
