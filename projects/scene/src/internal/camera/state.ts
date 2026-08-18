// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  assertCameraState,
  copyCameraState,
  DEFAULT_CAMERA_STATE,
  type CameraProjection,
  type CameraState,
  type CameraTarget
} from '../math/camera.js';

export type CameraField =
  | 'target.position'
  | 'target.heading'
  | 'offset.distance'
  | 'offset.phi'
  | 'offset.theta'
  | 'projection';

interface CameraStatePatch {
  readonly target?: Partial<CameraTarget>;
  readonly offset?: Partial<CameraState['offset']>;
  readonly projection?: CameraProjection;
}

export interface CameraContribution {
  readonly fields: readonly CameraField[];
  readonly patch: CameraStatePatch;
}

interface CameraResolutionInputs {
  readonly prior?: CameraState;
  readonly contributions?: readonly CameraContribution[];
}

/** Resolves camera behavior contributions over the prior state. */
export function resolveCameraState(inputs: CameraResolutionInputs = {}): CameraState {
  const state = copyCameraState(inputs.prior ?? DEFAULT_CAMERA_STATE);
  for (const contribution of inputs.contributions ?? []) applyPatch(state, contribution.patch);
  assertCameraState(state);
  return state;
}

export function applyCameraPatch(state: CameraState, patch: CameraStatePatch | undefined): void {
  applyPatch(state, patch);
  assertCameraState(state);
}

function applyPatch(state: CameraState, patch: CameraStatePatch | undefined): void {
  if (!patch) return;
  if (patch.target) {
    if (patch.target.position) state.target.position = [...patch.target.position] as CameraTarget['position'];
    if (patch.target.heading !== undefined) state.target.heading = patch.target.heading;
  }
  if (patch.offset) {
    if (patch.offset.distance !== undefined) state.offset.distance = patch.offset.distance;
    if (patch.offset.phi !== undefined) state.offset.phi = patch.offset.phi;
    if (patch.offset.theta !== undefined) state.offset.theta = patch.offset.theta;
  }
  if (patch.projection) state.projection = { ...patch.projection };
}
