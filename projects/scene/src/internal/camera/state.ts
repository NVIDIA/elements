// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  assertOrbitCameraState,
  copyOrbitCameraState,
  DEFAULT_ORBIT_CAMERA_STATE,
  type SceneCameraProjection,
  type CameraTarget,
  type OrbitCameraState
} from '../math/camera.js';

export type CameraField =
  | 'pose'
  | 'target.position'
  | 'target.heading'
  | 'offset.distance'
  | 'offset.polarAngle'
  | 'offset.azimuth'
  | 'projection';

interface CameraStatePatch {
  readonly target?: Partial<CameraTarget>;
  readonly offset?: Partial<OrbitCameraState['offset']>;
  readonly projection?: SceneCameraProjection;
}

export interface CameraContribution {
  readonly fields: readonly CameraField[];
  readonly patch: CameraStatePatch;
}

interface CameraResolutionInputs {
  readonly prior?: OrbitCameraState;
  readonly contributions?: readonly CameraContribution[];
}

/** Resolves camera behavior contributions over the prior state. */
export function resolveCameraState(inputs: CameraResolutionInputs = {}): OrbitCameraState {
  const state = copyOrbitCameraState(inputs.prior ?? DEFAULT_ORBIT_CAMERA_STATE);
  for (const contribution of inputs.contributions ?? []) applyPatch(state, contribution.patch);
  assertOrbitCameraState(state);
  return state;
}

export function applyCameraPatch(state: OrbitCameraState, patch: CameraStatePatch | undefined): void {
  applyPatch(state, patch);
  assertOrbitCameraState(state);
}

function applyPatch(state: OrbitCameraState, patch: CameraStatePatch | undefined): void {
  if (!patch) return;
  if (patch.target) {
    if (patch.target.position) state.target.position = [...patch.target.position] as CameraTarget['position'];
    if (patch.target.heading !== undefined) state.target.heading = patch.target.heading;
  }
  if (patch.offset) {
    if (patch.offset.distance !== undefined) state.offset.distance = patch.offset.distance;
    if (patch.offset.polarAngle !== undefined) state.offset.polarAngle = patch.offset.polarAngle;
    if (patch.offset.azimuth !== undefined) state.offset.azimuth = patch.offset.azimuth;
  }
  if (patch.projection) state.projection = { ...patch.projection };
}
