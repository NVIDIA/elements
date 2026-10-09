// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Matrix4 } from './types.js';

/** A finite, ordered axis-aligned box with scalar coordinates. */
export interface AabbBounds {
  readonly maximumX: number;
  readonly maximumY: number;
  readonly maximumZ: number;
  readonly minimumX: number;
  readonly minimumY: number;
  readonly minimumZ: number;
}

export type FrustumRelation = 'inside' | 'intersecting' | 'outside';

interface FrustumPlaneRows {
  readonly firstRow: number;
  readonly secondRow?: number;
  readonly secondScale?: number;
}

const FRUSTUM_PLANES = [
  { firstRow: 3, secondRow: 0, secondScale: 1 },
  { firstRow: 3, secondRow: 0, secondScale: -1 },
  { firstRow: 3, secondRow: 1, secondScale: 1 },
  { firstRow: 3, secondRow: 1, secondScale: -1 },
  { firstRow: 2 },
  { firstRow: 3, secondRow: 2, secondScale: -1 }
] as const;

/**
 * Classifies a local box against the WebGPU clip volume: -w <= x,y <= w and 0 <= z <= w.
 * Callers supply finite, ordered bounds and a validated column-major local-to-clip matrix.
 * Uses JavaScript precision without plane normalization, tolerances, or temporary arrays.
 * Touching a plane does not reject the box. Intersecting means a conservative candidate;
 * passing all plane tests does not establish an exact box/frustum intersection.
 */
export function classifyAabbFrustum(bounds: AabbBounds, localToClip: Matrix4): FrustumRelation {
  const centerX = (bounds.minimumX + bounds.maximumX) * 0.5,
    centerY = (bounds.minimumY + bounds.maximumY) * 0.5,
    centerZ = (bounds.minimumZ + bounds.maximumZ) * 0.5,
    extentX = (bounds.maximumX - bounds.minimumX) * 0.5,
    extentY = (bounds.maximumY - bounds.minimumY) * 0.5,
    extentZ = (bounds.maximumZ - bounds.minimumZ) * 0.5;
  let relation: FrustumRelation = 'inside';
  for (const rows of FRUSTUM_PLANES) {
    const x = planeCoefficient(localToClip, 0, rows);
    const y = planeCoefficient(localToClip, 1, rows);
    const z = planeCoefficient(localToClip, 2, rows);
    const w = planeCoefficient(localToClip, 3, rows);
    const distance = x * centerX + y * centerY + z * centerZ + w;
    const radius = Math.abs(x) * extentX + Math.abs(y) * extentY + Math.abs(z) * extentZ;
    if (distance + radius < 0) return 'outside';
    if (distance - radius < 0) relation = 'intersecting';
  }
  return relation;
}

function planeCoefficient(transform: Matrix4, column: number, rows: FrustumPlaneRows): number {
  const offset = column * 4;
  const first = transform[offset + rows.firstRow]!;
  if (rows.secondRow === undefined) return first;
  return first + transform[offset + rows.secondRow]! * (rows.secondScale ?? 0);
}
