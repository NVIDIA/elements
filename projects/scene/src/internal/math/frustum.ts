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

type FrustumPlaneRows =
  | { readonly firstRow: 2; readonly secondRow?: never; readonly secondScale?: never }
  | { readonly firstRow: 3; readonly secondRow: 0 | 1 | 2; readonly secondScale: 1 | -1 };

const FRUSTUM_PLANES = [
  { firstRow: 3, secondRow: 0, secondScale: 1 },
  { firstRow: 3, secondRow: 0, secondScale: -1 },
  { firstRow: 3, secondRow: 1, secondScale: 1 },
  { firstRow: 3, secondRow: 1, secondScale: -1 },
  { firstRow: 2 },
  { firstRow: 3, secondRow: 2, secondScale: -1 }
] as const satisfies readonly FrustumPlaneRows[];

/** Rejects a support interval wholly below zero in an inward-facing half-space. Touching remains a candidate. */
export function isOutsideHalfSpace(centerDistance: number, supportRadius: number): boolean {
  return centerDistance + supportRadius < 0;
}

/**
 * Sphere support tests generated from the CPU classifier's six WebGPU clip planes.
 * Uses float32 shader arithmetic without plane normalization or tolerances, including touching spheres.
 * Callers supply a finite local center, nonnegative radius, and validated local-to-clip matrix.
 */
export const FRUSTUM_WGSL = /* wgsl */ `
fn nve_frustum_outside_half_space(centerDistance: f32, supportRadius: f32) -> bool {
  return centerDistance + supportRadius < 0.0;
}

fn nve_frustum_sphere_outside_plane(plane: vec4f, point: vec4f, radius: f32) -> bool {
  return nve_frustum_outside_half_space(dot(plane, point), radius * length(plane.xyz));
}

fn nve_frustum_intersects_sphere(transform: mat4x4f, center: vec3f, radius: f32) -> bool {
  let point = vec4f(center, 1.0);
  let row0 = vec4f(transform[0].x, transform[1].x, transform[2].x, transform[3].x);
  let row1 = vec4f(transform[0].y, transform[1].y, transform[2].y, transform[3].y);
  let row2 = vec4f(transform[0].z, transform[1].z, transform[2].z, transform[3].z);
  let row3 = vec4f(transform[0].w, transform[1].w, transform[2].w, transform[3].w);
  return !(
    ${FRUSTUM_PLANES.map(rows => `nve_frustum_sphere_outside_plane(${planeExpression(rows)}, point, radius)`).join(' ||\n    ')}
  );
}
`;

function planeExpression(rows: FrustumPlaneRows): string {
  if (rows.secondRow === undefined) return `row${rows.firstRow}`;
  return `row${rows.firstRow} ${rows.secondScale === 1 ? '+' : '-'} row${rows.secondRow}`;
}

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
    if (isOutsideHalfSpace(distance, radius)) return 'outside';
    if (distance - radius < 0) relation = 'intersecting';
  }
  return relation;
}

function planeCoefficient(transform: Matrix4, column: number, rows: FrustumPlaneRows): number {
  const offset = column * 4;
  const first = transform[offset + rows.firstRow]!;
  if (rows.secondRow === undefined) return first;
  return first + transform[offset + rows.secondRow]! * rows.secondScale;
}
