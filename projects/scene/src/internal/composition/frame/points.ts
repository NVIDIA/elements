// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { getFrameWorldMatrixPrecise } from './state.js';
import { transformPointMat4 } from '../../math/mat4.js';
import type { Matrix4, Vec3 } from '../../math/types.js';

export function getWorldPoint(element: HTMLElement, point: Readonly<Vec3>): Readonly<Vec3> | null {
  return convertPoint(element, point, transformPointMat4);
}

export function getLocalPoint(element: HTMLElement, point: Readonly<Vec3>): Readonly<Vec3> | null {
  return convertPoint(element, point, transformPointByInverseRigidMatrix);
}

function convertPoint(
  element: HTMLElement,
  point: Readonly<Vec3>,
  convert: (matrix: Matrix4, point: Readonly<Vec3>) => Vec3
): Readonly<Vec3> | null {
  if (!element.isConnected || !element.closest('nve-scene') || !isFiniteVec3(point)) return null;
  try {
    return Object.freeze(convert(getFrameWorldMatrixPrecise(element), point));
  } catch {
    return null;
  }
}

function isFiniteVec3(value: unknown): value is Readonly<Vec3> {
  return Array.isArray(value) && value.length === 3 && value.every(component => Number.isFinite(component));
}

function transformPointByInverseRigidMatrix(matrix: Matrix4, point: Readonly<Vec3>): Vec3 {
  const x = point[0] - matrix[12]!;
  const y = point[1] - matrix[13]!;
  const z = point[2] - matrix[14]!;
  return [
    matrix[0]! * x + matrix[1]! * y + matrix[2]! * z,
    matrix[4]! * x + matrix[5]! * y + matrix[6]! * z,
    matrix[8]! * x + matrix[9]! * y + matrix[10]! * z
  ];
}
