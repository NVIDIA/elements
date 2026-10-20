// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { multiplyQuaternions, normalizeQuaternion, rotateVectorByQuaternion } from '../../math/quaternion.js';
import type { ScenePose, Vec3 } from '../../math/types.js';

export type SceneJointType = 'revolute' | 'continuous' | 'prismatic' | 'fixed';

export function captureJointAxis(value: unknown): Vec3 | null {
  if (
    !Array.isArray(value) ||
    value.length !== 3 ||
    ![value[0], value[1], value[2]].every(component => Number.isFinite(component))
  )
    return null;
  if (value.every(component => component === 0)) return null;
  const normalized = normalizeQuaternion([value[0], value[1], value[2], 0]);
  return [normalized[0], normalized[1], normalized[2]];
}

export function composeJointMotion(
  origin: ScenePose,
  motion: { type: SceneJointType; axis: Vec3; value: number }
): ScenePose {
  const { type, axis, value } = motion;
  if (type === 'fixed') return origin;
  const orientation = normalizeQuaternion(origin.orientation);
  if (type === 'prismatic') {
    const delta = rotateVectorByQuaternion([axis[0] * value, axis[1] * value, axis[2] * value], orientation);
    return {
      position: [origin.position[0] + delta[0], origin.position[1] + delta[1], origin.position[2] + delta[2]],
      orientation
    };
  }
  const sine = Math.sin(value / 2);
  return {
    position: origin.position,
    orientation: multiplyQuaternions(orientation, [axis[0] * sine, axis[1] * sine, axis[2] * sine, Math.cos(value / 2)])
  };
}
