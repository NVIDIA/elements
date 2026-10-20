// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { unitScaleEnclosingRadius, type SceneBounds } from './bounds.js';
import type { PrimitiveKind } from './primitive-geometry.js';

const CENTERED_UNIT_BOUNDS: SceneBounds = { minimum: [-0.5, -0.5, -0.5], maximum: [0.5, 0.5, 0.5] };

/**
 * Local bounds of each unit primitive before record scale, orientation, and position. Every `createPrimitiveGeometry`
 * vertex stays inside them. Centered primitives span one unit; an arrow starts at its origin, ends at z = 1, and has
 * a head radius of 1. This module stays separate from the tessellation code so bounds queries do not load it. The
 * tuples stay unfrozen because hot loops read them, and frozen array elements load more slowly.
 */
export const PRIMITIVE_BOUNDS: Readonly<Record<PrimitiveKind, SceneBounds>> = {
  arrow: { minimum: [-1, -1, 0], maximum: [1, 1, 1] },
  cone: CENTERED_UNIT_BOUNDS,
  cube: CENTERED_UNIT_BOUNDS,
  cylinder: CENTERED_UNIT_BOUNDS,
  pyramid: CENTERED_UNIT_BOUNDS,
  sphere: CENTERED_UNIT_BOUNDS
};

const CENTERED_UNIT_RADIUS = unitScaleEnclosingRadius(CENTERED_UNIT_BOUNDS);

/** The `unitScaleEnclosingRadius` of each primitive's local bounds, for `scaledEnclosingRadius` queries. */
export const PRIMITIVE_ENCLOSING_RADII: Readonly<Record<PrimitiveKind, number>> = Object.freeze({
  arrow: unitScaleEnclosingRadius(PRIMITIVE_BOUNDS.arrow),
  cone: CENTERED_UNIT_RADIUS,
  cube: CENTERED_UNIT_RADIUS,
  cylinder: CENTERED_UNIT_RADIUS,
  pyramid: CENTERED_UNIT_RADIUS,
  sphere: CENTERED_UNIT_RADIUS
});
