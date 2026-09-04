// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { LINE_VERTEX } from '../internal/layouts/built-ins.js';
import { writeLineVertex } from '../internal/layouts/helpers.js';
import type { RGBA } from '../internal/types.js';

const AXIS_COLORS: Record<'x' | 'y' | 'z', RGBA> = {
  x: [229 / 255, 57 / 255, 53 / 255, 1],
  y: [67 / 255, 160 / 255, 71 / 255, 1],
  z: [30 / 255, 136 / 255, 229 / 255, 1]
};

/** Signed directions rendered by each frame-local axis. */
export type SceneAxesDirection = 'positive' | 'bidirectional';

/** Number of line vertices in one frame-local axes triad. */
export const AXES_VERTEX_COUNT = 6;

/**
 * Builds three disjoint axis line segments in frame-local coordinates.
 *
 * The caller owns the returned bytes.
 */
export function createAxesVertices(options: {
  readonly direction: SceneAxesDirection;
  readonly length: number;
  readonly width: number;
}): Uint8Array {
  const { direction, length, width } = options;
  const vertices = new Uint8Array(LINE_VERTEX.stride * AXES_VERTEX_COUNT);
  const start = direction === 'bidirectional' ? -length : 0;
  const records: Parameters<typeof writeLineVertex>[2][] = [
    { color: AXIS_COLORS.x, position: [start, 0, 0], width },
    { color: AXIS_COLORS.x, position: [length, 0, 0], width },
    { color: AXIS_COLORS.y, position: [0, start, 0], width },
    { color: AXIS_COLORS.y, position: [0, length, 0], width },
    { color: AXIS_COLORS.z, position: [0, 0, start], width },
    { color: AXIS_COLORS.z, position: [0, 0, length], width }
  ];

  records.forEach((record, index) => writeLineVertex(vertices, index, record));
  return vertices;
}
