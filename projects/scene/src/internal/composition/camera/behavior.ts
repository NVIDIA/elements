// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  CAMERA_FRAME_UNRESOLVED,
  CAMERA_PROPERTY_INACTIVE,
  CAMERA_RANGE,
  CAMERA_SLOT_CONFLICT,
  type SceneErrorCode
} from '../../diagnostics/errors.js';
import type { CameraField } from './state.js';
import { applyCameraInputRuntimeWrite, cameraInputIsExplicit } from './input.js';
import type { CameraElement, CameraPropertyName, SceneCameraBehavior, SceneCameraFollowMode } from './configuration.js';
import { diagnosticReporterService } from '../../diagnostics/reporter.service.js';
import type { SceneCameraProjection, CameraTarget } from './math.js';
import { normalizeQuaternion } from '../../math/quaternion.js';
import type { Quaternion, ScenePose, Vec3 } from '../../math/types.js';

interface OrbitCameraContribution {
  readonly fields: readonly CameraField[];
  readonly kind: 'orbit';
  readonly distance: number;
  readonly maxDistance: number;
  readonly minDistance: number;
  readonly polarAngle: number;
  readonly projection: SceneCameraProjection;
  readonly target: CameraTarget;
  readonly azimuth: number;
}

interface FollowCameraContribution {
  readonly fields: readonly ('target.position' | 'target.heading')[];
  readonly frame: string;
  readonly kind: 'follow';
  readonly followMode: SceneCameraFollowMode;
}

interface TopCameraContribution {
  readonly fields: readonly [
    'target.position',
    'target.heading',
    'offset.distance',
    'offset.polarAngle',
    'offset.azimuth',
    'projection'
  ];
  readonly altitude: number;
  readonly kind: 'top';
  readonly projection: SceneCameraProjection;
  readonly target: CameraTarget;
}

interface PoseCameraContribution {
  readonly fields: readonly ['pose', 'projection'];
  readonly frame: string;
  readonly kind: 'pose';
  readonly pose: ScenePose;
  readonly projection: SceneCameraProjection;
}

type CameraBehaviorContribution =
  | OrbitCameraContribution
  | FollowCameraContribution
  | TopCameraContribution
  | PoseCameraContribution;

interface CameraBehaviorState {
  configured: boolean;
  conflicted: boolean;
  frameResolved: boolean;
}

const cameraBehaviorStates = new WeakMap<CameraElement, CameraBehaviorState>();

/** Authoritative behavior compatibility for public camera configuration. */
export const SCENE_CAMERA_PROPERTY_BEHAVIORS = freezeBehaviorTable({
  altitude: ['top'],
  behavior: ['pose', 'orbit', 'follow', 'top'],
  disabled: ['pose', 'orbit', 'follow', 'top'],
  distance: ['orbit'],
  far: ['pose', 'orbit', 'top'],
  verticalFieldOfView: ['pose', 'orbit'],
  frame: ['pose', 'follow'],
  frustumHeight: ['pose', 'orbit', 'top'],
  heading: ['orbit', 'top'],
  maxDistance: ['orbit'],
  minDistance: ['orbit'],
  followMode: ['follow'],
  near: ['pose', 'orbit', 'top'],
  orientation: ['pose'],
  polarAngle: ['orbit'],
  position: ['pose'],
  projection: ['pose', 'orbit'],
  target: ['orbit', 'top'],
  azimuth: ['orbit']
} satisfies Readonly<Record<CameraPropertyName, readonly SceneCameraBehavior[]>>);

function freezeBehaviorTable<Table extends Readonly<Record<string, readonly SceneCameraBehavior[]>>>(
  table: Table
): Table {
  Object.values(table).forEach(Object.freeze);
  return Object.freeze(table);
}

/** Applies camera navigation state without treating it as a new authored override. */
export function setCameraRuntimeProperty<Property extends CameraPropertyName>(
  camera: CameraElement,
  propertyName: Property,
  value: CameraElement[Property]
): void {
  applyCameraInputRuntimeWrite(camera, () => {
    camera[propertyName] = value;
  });
}

/** Scene's internal lifecycle contract for camera elements. */
export const sceneCameraController = {
  getContribution(camera: CameraElement): CameraBehaviorContribution | null {
    updateCompatibilityDiagnostics(camera);
    if (camera.disabled) {
      clearBehaviorConfiguration(camera);
      return null;
    }

    switch (camera.behavior) {
      case 'orbit':
        return getOrbitContribution(camera);
      case 'follow':
        return getFollowContribution(camera);
      case 'top':
        return getTopContribution(camera);
      case 'pose':
        return getPoseContribution(camera);
      default: {
        const exhaustiveCheck: never = camera.behavior;
        throw new TypeError(`Unsupported camera behavior: ${exhaustiveCheck}`);
      }
    }
  },

  isActive(camera: CameraElement): boolean {
    const state = getCameraBehaviorState(camera);
    return !camera.disabled && state.configured && state.frameResolved && !state.conflicted;
  },

  isResolvable(camera: CameraElement): boolean {
    const state = getCameraBehaviorState(camera);
    return !camera.disabled && state.configured && state.frameResolved;
  },

  setConflict(camera: CameraElement, active: boolean): void {
    const state = getCameraBehaviorState(camera);
    state.conflicted = active;
    diagnosticReporterService.update({
      active,
      code: CAMERA_SLOT_CONFLICT,
      element: camera,
      message: 'Another camera behavior in this scene writes the same camera state field.',
      severity: 'error'
    });
  },

  setFrameResolved(camera: CameraElement, resolved: boolean): void {
    const state = getCameraBehaviorState(camera);
    state.frameResolved = resolved;
    diagnosticReporterService.update({
      active: !resolved,
      code: CAMERA_FRAME_UNRESOLVED,
      element: camera,
      message: 'The camera frame must resolve to one uniquely named valid frame in this scene.',
      severity: 'error'
    });
  }
};

function getCameraBehaviorState(camera: CameraElement): CameraBehaviorState {
  let state = cameraBehaviorStates.get(camera);
  if (!state) {
    state = {
      configured: true,
      conflicted: false,
      frameResolved: true
    };
    cameraBehaviorStates.set(camera, state);
  }
  return state;
}

function getOrbitContribution(camera: CameraElement): OrbitCameraContribution | null {
  sceneCameraController.setFrameResolved(camera, true);
  const target = getCameraTarget(camera);
  const projection = getCameraProjection(camera);
  const valid =
    target !== null &&
    projection !== null &&
    isValidOrbitPose(camera) &&
    isValidOrbitRange(camera) &&
    camera.distance >= camera.minDistance &&
    camera.distance <= camera.maxDistance;
  getCameraBehaviorState(camera).configured = valid;
  updateCameraBehaviorDiagnostic(camera, {
    active: !valid,
    code: CAMERA_RANGE,
    message:
      'Camera orbit target and angles must be finite; distance and limits must be positive with min-distance no greater than distance and distance no greater than max-distance; polarAngle must be in [0, π], and the active projection size must be valid.'
  });
  return valid && target && projection
    ? {
        fields: ['offset.distance', 'offset.polarAngle', 'offset.azimuth', 'projection'],
        kind: 'orbit',
        distance: camera.distance,
        maxDistance: camera.maxDistance,
        minDistance: camera.minDistance,
        polarAngle: camera.polarAngle,
        projection,
        target,
        azimuth: camera.azimuth
      }
    : null;
}

function isValidOrbitPose(camera: CameraElement): boolean {
  return (
    Number.isFinite(camera.distance) &&
    Number.isFinite(camera.polarAngle) &&
    Number.isFinite(camera.azimuth) &&
    camera.distance > 0 &&
    camera.polarAngle >= 0 &&
    camera.polarAngle <= Math.PI
  );
}

function isValidOrbitRange(camera: CameraElement): boolean {
  return (
    Number.isFinite(camera.minDistance) &&
    Number.isFinite(camera.maxDistance) &&
    camera.minDistance > 0 &&
    camera.maxDistance > 0 &&
    camera.minDistance <= camera.maxDistance
  );
}

function getFollowContribution(camera: CameraElement): FollowCameraContribution | null {
  updateCameraBehaviorDiagnostic(camera, { active: false, code: CAMERA_RANGE, message: '' });
  const frame = camera.frame?.trim() ?? '';
  const valid = frame.length > 0;
  getCameraBehaviorState(camera).configured = valid;
  updateCameraBehaviorDiagnostic(camera, {
    active: !valid,
    code: CAMERA_FRAME_UNRESOLVED,
    message: 'The camera follow frame must resolve to one uniquely named frame in this scene.'
  });
  return valid
    ? {
        fields: camera.followMode === 'pose' ? ['target.position', 'target.heading'] : ['target.position'],
        frame,
        kind: 'follow',
        followMode: camera.followMode
      }
    : null;
}

function getTopContribution(camera: CameraElement): TopCameraContribution | null {
  sceneCameraController.setFrameResolved(camera, true);
  const target = getCameraTarget(camera);
  const projection = getTopCameraProjection(camera);
  const altitude = getTopAltitude(camera);
  const valid = target !== null && projection !== null && Number.isFinite(altitude) && altitude > 0;
  getCameraBehaviorState(camera).configured = valid;
  updateCameraBehaviorDiagnostic(camera, {
    active: !valid,
    code: CAMERA_RANGE,
    message:
      'Camera top target must be finite; altitude and orthographic extent must be positive and finite; and clipping distances must satisfy 0 < near < far.'
  });
  return valid && target && projection
    ? {
        fields: [
          'target.position',
          'target.heading',
          'offset.distance',
          'offset.polarAngle',
          'offset.azimuth',
          'projection'
        ],
        altitude,
        kind: 'top',
        projection,
        target
      }
    : null;
}

function getPoseContribution(camera: CameraElement): PoseCameraContribution | null {
  const pose = getCameraPose(camera);
  const projection = getCameraProjection(camera);
  const valid = pose !== null && projection !== null;
  getCameraBehaviorState(camera).configured = valid;
  updateCameraBehaviorDiagnostic(camera, {
    active: !valid,
    code: CAMERA_RANGE,
    message:
      'Camera pose position and orientation must be finite, orientation must be nonzero, and the active projection and clipping distances must be valid.'
  });
  return valid && pose && projection
    ? {
        fields: ['pose', 'projection'],
        frame: camera.frame?.trim() ?? '',
        kind: 'pose',
        pose,
        projection
      }
    : null;
}

function getCameraTarget(camera: CameraElement): CameraTarget | null {
  const position = toVec3(camera.target);
  return position && Number.isFinite(camera.heading) ? { position, heading: camera.heading } : null;
}

function getCameraProjection(camera: CameraElement): SceneCameraProjection | null {
  if (!isValidClipping(camera.near, camera.far)) return null;
  if (camera.projection === 'orthographic') {
    return Number.isFinite(camera.frustumHeight) && camera.frustumHeight > 0
      ? { mode: 'orthographic', frustumHeight: camera.frustumHeight, near: camera.near, far: camera.far }
      : null;
  }
  return Number.isFinite(camera.verticalFieldOfView) &&
    camera.verticalFieldOfView > 0 &&
    camera.verticalFieldOfView < Math.PI
    ? { mode: 'perspective', verticalFieldOfView: camera.verticalFieldOfView, near: camera.near, far: camera.far }
    : null;
}

function getTopCameraProjection(camera: CameraElement): SceneCameraProjection | null {
  return Number.isFinite(camera.frustumHeight) && camera.frustumHeight > 0 && isValidClipping(camera.near, camera.far)
    ? { mode: 'orthographic', frustumHeight: camera.frustumHeight, near: camera.near, far: camera.far }
    : null;
}

function getTopAltitude(camera: CameraElement): number {
  return camera.altitude;
}

function updateCompatibilityDiagnostics(camera: CameraElement): void {
  for (const [name, behaviors] of Object.entries(SCENE_CAMERA_PROPERTY_BEHAVIORS)) {
    const propertyName = name as CameraPropertyName;
    const compatibleBehaviors = behaviors as readonly SceneCameraBehavior[];
    const active = isExplicit(camera, propertyName) && !compatibleBehaviors.includes(camera.behavior);
    diagnosticReporterService.update({
      active,
      code: CAMERA_PROPERTY_INACTIVE,
      element: camera,
      episodeKey: `${CAMERA_PROPERTY_INACTIVE}:${propertyName}`,
      message: `Camera ${propertyName} does not control the ${camera.behavior} behavior.`,
      severity: 'warning'
    });
  }
}

function isExplicit(camera: CameraElement, propertyName: CameraPropertyName): boolean {
  return cameraInputIsExplicit(camera, propertyName);
}

export function cameraPropertyFromAttribute(attribute: string): CameraPropertyName | undefined {
  const propertyName = attribute.replace(/-([a-z])/g, (_match, letter: string) => letter.toUpperCase());
  return propertyName in SCENE_CAMERA_PROPERTY_BEHAVIORS ? (propertyName as CameraPropertyName) : undefined;
}

function getCameraPose(camera: CameraElement): ScenePose | null {
  const position = toVec3(camera.position);
  if (!position || !isQuaternion(camera.orientation)) return null;
  try {
    return { position, orientation: normalizeQuaternion(camera.orientation) };
  } catch {
    return null;
  }
}

function isValidClipping(near: number, far: number): boolean {
  return Number.isFinite(near) && Number.isFinite(far) && near > 0 && near < far;
}

function toVec3(value: unknown): Vec3 | null {
  return isVec3(value) ? [value[0], value[1], value[2]] : null;
}

function isVec3(value: unknown): value is Vec3 {
  return (
    Array.isArray(value) &&
    value.length === 3 &&
    value.every(component => typeof component === 'number' && Number.isFinite(component))
  );
}

function isQuaternion(value: unknown): value is Quaternion {
  return (
    Array.isArray(value) &&
    value.length === 4 &&
    value.every(component => typeof component === 'number' && Number.isFinite(component))
  );
}

function clearBehaviorConfiguration(camera: CameraElement): void {
  getCameraBehaviorState(camera).configured = true;
  updateCameraBehaviorDiagnostic(camera, { active: false, code: CAMERA_RANGE, message: '' });
  sceneCameraController.setFrameResolved(camera, true);
}

function updateCameraBehaviorDiagnostic(
  camera: CameraElement,
  options: {
    readonly active: boolean;
    readonly code: SceneErrorCode;
    readonly message: string;
    readonly severity?: 'error' | 'warning';
  }
): void {
  diagnosticReporterService.update({
    active: options.active,
    code: options.code,
    element: camera,
    message: options.message,
    severity: options.severity ?? 'error'
  });
}
