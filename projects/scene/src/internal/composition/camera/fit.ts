// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { boundsCorners, type SceneBounds } from '../../math/bounds.js';
import { composePreciseMat4 } from '../../math/mat4.js';
import type { Vec3 } from '../../math/types.js';
import { assertCameraState, type SceneCameraState } from './math.js';

export interface SceneCameraFitOptions {
  /** Fraction of each viewport dimension reserved at each edge. Defaults to 0.1. */
  readonly padding?: number;
  /** Positive viewport width divided by height. Defaults to the scene's current aspect. */
  readonly aspect?: number;
}

interface CameraFitInputs {
  readonly state: SceneCameraState;
  readonly bounds: SceneBounds;
  readonly aspect: number;
  readonly padding?: number;
  readonly target?: Readonly<Vec3>;
  readonly minimumDistance?: number;
}

/** Fits a world box using target-relative arithmetic and the existing optical basis. */
export function fitCameraToBounds(inputs: CameraFitInputs): {
  readonly state: SceneCameraState;
  readonly target: Vec3;
  readonly distance: number;
} {
  assertCameraState(inputs.state);
  assertBounds(inputs.bounds);
  const fraction = fitViewportFraction(inputs.padding ?? 0.1, inputs.aspect);
  const geometry = fittingGeometry(inputs);
  const { target, corners, forward, slack } = geometry;
  const projection = inputs.state.projection;
  const distance = fittingDistance({ ...geometry, inputs, fraction });
  const near = distance + geometry.minimumDepth - slack;
  const far = distance + geometry.maximumDepth + slack;
  const position: Vec3 = [
    target[0] - forward[0] * distance,
    target[1] - forward[1] * distance,
    target[2] - forward[2] * distance
  ];
  const state: SceneCameraState = {
    pose: { position, orientation: [...inputs.state.pose.orientation] },
    projection:
      projection.mode === 'perspective'
        ? { ...projection, near, far }
        : {
            ...projection,
            near,
            far,
            frustumHeight:
              (2 *
                Math.max(
                  ...corners.map(corner => Math.max(Math.abs(corner[0]) / inputs.aspect, Math.abs(corner[1])))
                )) /
                fraction +
              2 * slack
          }
  };
  assertCameraState(state);
  if (!target.every(Number.isFinite) || !Number.isFinite(distance) || distance <= 0) {
    throw new RangeError('Camera fit arithmetic must remain finite.');
  }
  return { state, target, distance };
}

function fittingGeometry(inputs: CameraFitInputs) {
  const target: Vec3 = inputs.target ? [...inputs.target] : boundsCenter(inputs.bounds);
  const diagonal = Math.hypot(...target.map((_, axis) => inputs.bounds.maximum[axis]! - inputs.bounds.minimum[axis]!));
  const basis = composePreciseMat4([0, 0, 0], inputs.state.pose.orientation);
  const right: Vec3 = [basis[0]!, basis[1]!, basis[2]!];
  const down: Vec3 = [basis[4]!, basis[5]!, basis[6]!];
  const forward: Vec3 = [basis[8]!, basis[9]!, basis[10]!];
  const corners = relativeCorners(inputs.bounds, target, diagonal === 0).map(
    delta => [dot(right, delta), dot(down, delta), dot(forward, delta)] as Vec3
  );
  const span = diagonal === 0 ? Math.sqrt(3) : diagonal;
  return {
    target,
    corners,
    forward,
    span,
    slack: Math.max(span * 0.01, 32 * Number.EPSILON * Math.max(1, ...target.map(Math.abs))),
    minimumDepth: Math.min(...corners.map(corner => corner[2])),
    maximumDepth: Math.max(...corners.map(corner => corner[2]))
  };
}

function fittingDistance(options: {
  readonly corners: readonly Vec3[];
  readonly inputs: CameraFitInputs;
  readonly fraction: number;
  readonly slack: number;
  readonly span: number;
  readonly minimumDepth: number;
}): number {
  const { inputs, corners, fraction, slack, span, minimumDepth } = options;
  let distance = Math.max(inputs.minimumDistance ?? 0, -minimumDepth + 2 * slack);
  if (inputs.state.projection.mode === 'perspective') {
    const tangent = Math.tan(inputs.state.projection.verticalFieldOfView / 2);
    for (const [x, y, z] of corners) {
      distance = Math.max(
        distance,
        Math.abs(x) / (fraction * tangent * inputs.aspect) - z,
        Math.abs(y) / (fraction * tangent) - z
      );
    }
  } else distance = Math.max(distance, span / 2);
  return distance + slack;
}

function relativeCorners(bounds: SceneBounds, target: Readonly<Vec3>, pointLike: boolean): Vec3[] {
  if (!pointLike) return [...boundsCorners(bounds)].map(corner => subtract(corner, target));
  // A point has no natural viewing scale. Fit a one-metre box about its anchor.
  const center = subtract(bounds.minimum, target);
  return [...boundsCorners({ minimum: [-0.5, -0.5, -0.5], maximum: [0.5, 0.5, 0.5] })].map(corner => [
    center[0] + corner[0],
    center[1] + corner[1],
    center[2] + corner[2]
  ]);
}

function boundsCenter(bounds: SceneBounds): Vec3 {
  return [0, 1, 2].map(axis => bounds.minimum[axis]! + (bounds.maximum[axis]! - bounds.minimum[axis]!) / 2) as Vec3;
}

function fitViewportFraction(padding: number, aspect: number): number {
  if (!Number.isFinite(padding) || padding < 0 || padding >= 0.5) {
    throw new RangeError('Fit padding must be finite and in [0, 0.5).');
  }
  if (!Number.isFinite(aspect) || aspect <= 0) {
    throw new RangeError('Fit aspect must be positive and finite; wait for layout or supply aspect.');
  }
  return 1 - 2 * padding;
}

function assertBounds(bounds: SceneBounds): void {
  if (
    !bounds ||
    !finiteVector(bounds.minimum) ||
    !finiteVector(bounds.maximum) ||
    bounds.minimum.some((value, axis) => value > bounds.maximum[axis]!)
  ) {
    throw new RangeError('Bounds must contain ordered, finite three-component minimum and maximum vectors.');
  }
}

function finiteVector(value: Readonly<Vec3>): boolean {
  return Array.isArray(value) && value.length === 3 && value.every(Number.isFinite);
}

function subtract(left: Readonly<Vec3>, right: Readonly<Vec3>): Vec3 {
  return [left[0] - right[0], left[1] - right[1], left[2] - right[2]];
}

function dot(left: Readonly<Vec3>, right: Readonly<Vec3>): number {
  return left[0] * right[0] + left[1] * right[1] + left[2] * right[2];
}
