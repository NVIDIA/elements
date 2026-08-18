// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  createUnitPrimitiveGeometry,
  type PrimitiveGeometry,
  type UnitPrimitiveKind
} from '../internal/primitive-geometry.js';

/** The unit shapes that may compose a scene model. */
type ModelPrimitive = UnitPrimitiveKind;
type ModelPrimitiveGeometry = PrimitiveGeometry;

/**
 * Returns the exact unit tessellation used by the corresponding marker layer.
 * The geometry stores interleaved xyz position and xyz normal vertex data.
 */
export function createModelPrimitiveGeometry(shape: ModelPrimitive): ModelPrimitiveGeometry {
  return createUnitPrimitiveGeometry(shape);
}
