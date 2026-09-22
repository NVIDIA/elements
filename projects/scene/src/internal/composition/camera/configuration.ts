// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { SceneCameraProjection } from './math.js';
import type { Quaternion, Vec3 } from '../../math/types.js';

export type SceneCameraBehavior = 'orbit' | 'follow' | 'top' | 'pose';
export type SceneCameraFollowMode = 'position' | 'pose';
export type SceneCameraProjectionMode = SceneCameraProjection['mode'];

/** Configuration consumed by camera behavior resolution and navigation. */
export interface CameraConfiguration {
  altitude: number;
  behavior: SceneCameraBehavior;
  disabled: boolean;
  distance: number;
  far: number;
  verticalFieldOfView: number;
  frame: string | null;
  frustumHeight: number;
  heading: number;
  maxDistance: number;
  minDistance: number;
  followMode: SceneCameraFollowMode;
  near: number;
  orientation: Quaternion;
  polarAngle: number;
  position: Vec3;
  projection: SceneCameraProjectionMode;
  target: Vec3;
  azimuth: number;
}

export type CameraElement = HTMLElement & CameraConfiguration;
export type CameraPropertyName = keyof CameraConfiguration;
