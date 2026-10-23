// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Quaternion, Vec3 } from './types.js';

export function isFiniteVec3(value: unknown): value is Vec3 {
  return isFiniteTuple(value, 3);
}

export function isFiniteQuaternion(value: unknown): value is Quaternion {
  return isFiniteTuple(value, 4);
}

/** Copies a finite Vec3 so callers never retain the caller-owned array. */
export function toFiniteVec3(value: unknown): Vec3 | null {
  return isFiniteVec3(value) ? [value[0], value[1], value[2]] : null;
}

function isFiniteTuple(value: unknown, length: number): boolean {
  return Array.isArray(value) && value.length === length && value.every(component => Number.isFinite(component));
}
