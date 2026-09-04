// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useStyles } from '@nvidia-elements/core/internal';
import { LitElement, type PropertyValues } from 'lit';
import { property } from 'lit/decorators/property.js';
import { CAMERA_FRAME_UNRESOLVED, CAMERA_RANGE, CAMERA_SLOT_CONFLICT } from '../errors.js';
import type { CameraField } from '../internal/camera/state.js';
import { DiagnosticEpisodes } from '../internal/diagnostic-episodes.js';
import {
  DEFAULT_FAR,
  DEFAULT_NEAR,
  DEFAULT_ORBIT_CAMERA_STATE,
  type CameraPose,
  type CameraProjection,
  type CameraTarget
} from '../internal/math/camera.js';
import { normalizeQuaternion } from '../internal/math/quaternion.js';
import type { Quaternion, Vec3 } from '../internal/types.js';
import { notifyOwningScene } from '../internal/label/notifications.js';
import styles from './camera.css?inline';

export type SceneCameraBehavior = 'orbit' | 'follow' | 'top' | 'pose';
export type SceneCameraFollowMode = 'position' | 'pose';
export type SceneCameraProjection = CameraProjection['mode'];

interface OrbitCameraContribution {
  readonly fields: readonly CameraField[];
  readonly kind: 'orbit';
  readonly distance: number;
  readonly maxDistance: number;
  readonly minDistance: number;
  readonly phi: number;
  readonly projection: CameraProjection;
  readonly target: CameraTarget;
  readonly theta: number;
}

interface FollowCameraContribution {
  readonly fields: readonly ('target.position' | 'target.heading')[];
  readonly frame: string;
  readonly kind: 'follow';
  readonly mode: SceneCameraFollowMode;
}

interface TopCameraContribution {
  readonly fields: readonly [
    'target.position',
    'target.heading',
    'offset.distance',
    'offset.phi',
    'offset.theta',
    'projection'
  ];
  readonly height: number;
  readonly kind: 'top';
  readonly projection: CameraProjection;
  readonly target: CameraTarget;
}

interface PoseCameraContribution {
  readonly fields: readonly ['pose', 'projection'];
  readonly frame: string;
  readonly kind: 'pose';
  readonly pose: CameraPose;
  readonly projection: CameraProjection;
}

type CameraBehaviorContribution =
  | OrbitCameraContribution
  | FollowCameraContribution
  | TopCameraContribution
  | PoseCameraContribution;

interface CameraBehaviorState {
  configured: boolean;
  conflicted: boolean;
  readonly diagnostics: DiagnosticEpisodes;
  frameResolved: boolean;
}

const cameraBehaviorStates = new WeakMap<SceneCamera, CameraBehaviorState>();

const cameraBehaviorConverter = {
  fromAttribute(value: string | null): SceneCameraBehavior {
    if (value === 'orbit' || value === 'follow' || value === 'top') return value;
    return 'pose';
  }
};

const cameraFollowModeConverter = {
  fromAttribute(value: string | null): SceneCameraFollowMode {
    return value === 'pose' ? 'pose' : 'position';
  }
};

const cameraProjectionConverter = {
  fromAttribute(value: string | null): SceneCameraProjection {
    return value === 'ortho' ? 'ortho' : 'perspective';
  }
};

const minDistanceConverter = {
  fromAttribute(value: string | null): number {
    return value === null ? 0.5 : Number(value);
  }
};

const maxDistanceConverter = {
  fromAttribute(value: string | null): number {
    return value === null ? 200 : Number(value);
  }
};

function numberConverter(fallback: number): { fromAttribute(value: string | null): number } {
  return {
    fromAttribute(value: string | null): number {
      return value === null ? fallback : Number(value);
    }
  };
}

const distanceConverter = numberConverter(DEFAULT_ORBIT_CAMERA_STATE.offset.distance);
const phiConverter = numberConverter(DEFAULT_ORBIT_CAMERA_STATE.offset.phi);
const thetaConverter = numberConverter(DEFAULT_ORBIT_CAMERA_STATE.offset.theta);
const headingConverter = numberConverter(DEFAULT_ORBIT_CAMERA_STATE.target.heading);
const fovyConverter = numberConverter(
  DEFAULT_ORBIT_CAMERA_STATE.projection.mode === 'perspective'
    ? DEFAULT_ORBIT_CAMERA_STATE.projection.fovy
    : Math.PI / 4
);
const frustumHeightConverter = numberConverter(40);
const nearConverter = numberConverter(DEFAULT_NEAR);
const farConverter = numberConverter(DEFAULT_FAR);

/**
 * @element nve-scene-camera
 * @description Configures one repeatable camera behavior for the owning scene.
 * @since 0.0.0
 * @entrypoint \@nvidia-elements/scene/camera
 * @stable false
 */
export class SceneCamera extends LitElement {
  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'nve-scene-camera',
    version: '0.0.0'
  };

  /** Chooses the camera behavior configured by this element. Defaults to a static pose. */
  @property({ converter: cameraBehaviorConverter }) behavior: SceneCameraBehavior = 'pose';

  /** Sets the camera target in x y z order. */
  @property({ type: Array }) target: Vec3 = [...DEFAULT_ORBIT_CAMERA_STATE.target.position];

  /** Sets the camera target heading in radians. */
  @property({ converter: headingConverter }) heading = DEFAULT_ORBIT_CAMERA_STATE.target.heading;

  /** Sets the orbit distance from the target in meters. */
  @property({ converter: distanceConverter }) distance = DEFAULT_ORBIT_CAMERA_STATE.offset.distance;

  /** Sets the orbit polar angle in radians from positive Z. */
  @property({ converter: phiConverter }) phi = DEFAULT_ORBIT_CAMERA_STATE.offset.phi;

  /** Sets the orbit azimuth in radians relative to the target heading. */
  @property({ converter: thetaConverter }) theta = DEFAULT_ORBIT_CAMERA_STATE.offset.theta;

  /** Chooses the active camera projection. */
  @property({ converter: cameraProjectionConverter }) projection: SceneCameraProjection = 'perspective';

  /** Sets the perspective vertical field of view in radians for the Y axis. */
  @property({ converter: fovyConverter }) fovy = Math.PI / 4;

  /** Sets the orthographic projection height in meters. */
  @property({ attribute: 'frustum-height', converter: frustumHeightConverter }) frustumHeight = 40;

  /** Sets the camera translation in x y z order. Used by the pose behavior. */
  @property({ type: Array }) position: Vec3 = [0, 0, 0];

  /** Sets the normalized XYZW world-from-optical-camera rotation. Used by the pose behavior. */
  @property({ type: Array }) orientation: Quaternion = [0, 0, 0, 1];

  /** Sets the positive near clipping distance in meters. */
  @property({ converter: nearConverter }) near = DEFAULT_NEAR;

  /** Sets the far clipping distance in meters. */
  @property({ converter: farConverter }) far = DEFAULT_FAR;

  /** The smallest permitted orbit distance in meters. Used by the orbit behavior. */
  @property({ attribute: 'min-distance', converter: minDistanceConverter }) minDistance = 0.5;

  /** The largest permitted orbit distance in meters. Used by the orbit behavior. */
  @property({ attribute: 'max-distance', converter: maxDistanceConverter }) maxDistance = 200;

  /** Names the scene-local frame tracked by the follow or pose behavior. */
  @property({ type: String }) frame = '';

  /** Chooses whether the follow behavior tracks position only or the frame pose. */
  @property({ converter: cameraFollowModeConverter }) mode: SceneCameraFollowMode = 'position';

  /** Defines the orthographic camera height in meters. Used by the top behavior. */
  @property({ type: Number }) height = 40;

  /** Disables this declarative camera behavior by attribute presence. */
  @property({ type: Boolean, reflect: true }) disabled = false;

  protected override updated(changedProperties: PropertyValues<this>): void {
    if (changedProperties.size > 0) notifyOwningScene(this);
  }
}

/** Scene's internal lifecycle contract for camera elements. */
export const sceneCameraController = {
  getContribution(camera: SceneCamera): CameraBehaviorContribution | null {
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

  isActive(camera: SceneCamera): boolean {
    const state = getCameraBehaviorState(camera);
    return !camera.disabled && state.configured && state.frameResolved && !state.conflicted;
  },

  isResolvable(camera: SceneCamera): boolean {
    const state = getCameraBehaviorState(camera);
    return !camera.disabled && state.configured && state.frameResolved;
  },

  setConflict(camera: SceneCamera, active: boolean): void {
    const state = getCameraBehaviorState(camera);
    state.conflicted = active;
    state.diagnostics.update({
      active,
      code: CAMERA_SLOT_CONFLICT,
      element: camera,
      message: 'Another camera behavior in this scene writes the same camera state field.',
      severity: 'error'
    });
  },

  setFrameResolved(camera: SceneCamera, resolved: boolean): void {
    const state = getCameraBehaviorState(camera);
    state.frameResolved = resolved;
    state.diagnostics.update({
      active: !resolved,
      code: CAMERA_FRAME_UNRESOLVED,
      element: camera,
      message: 'The camera frame must resolve to one uniquely named valid frame in this scene.',
      severity: 'error'
    });
  }
};

function getCameraBehaviorState(camera: SceneCamera): CameraBehaviorState {
  let state = cameraBehaviorStates.get(camera);
  if (!state) {
    state = {
      configured: true,
      conflicted: false,
      diagnostics: new DiagnosticEpisodes(),
      frameResolved: true
    };
    cameraBehaviorStates.set(camera, state);
  }
  return state;
}

function getOrbitContribution(camera: SceneCamera): OrbitCameraContribution | null {
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
      'Camera orbit target and angles must be finite; distance and limits must be positive with min-distance no greater than distance and distance no greater than max-distance; phi must be in [0, π], and the active projection size must be valid.'
  });
  return valid && target && projection
    ? {
        fields: ['offset.distance', 'offset.phi', 'offset.theta', 'projection'],
        kind: 'orbit',
        distance: camera.distance,
        maxDistance: camera.maxDistance,
        minDistance: camera.minDistance,
        phi: camera.phi,
        projection,
        target,
        theta: camera.theta
      }
    : null;
}

function isValidOrbitPose(camera: SceneCamera): boolean {
  return (
    Number.isFinite(camera.distance) &&
    Number.isFinite(camera.phi) &&
    Number.isFinite(camera.theta) &&
    camera.distance > 0 &&
    camera.phi >= 0 &&
    camera.phi <= Math.PI
  );
}

function isValidOrbitRange(camera: SceneCamera): boolean {
  return (
    Number.isFinite(camera.minDistance) &&
    Number.isFinite(camera.maxDistance) &&
    camera.minDistance > 0 &&
    camera.maxDistance > 0 &&
    camera.minDistance <= camera.maxDistance
  );
}

function getFollowContribution(camera: SceneCamera): FollowCameraContribution | null {
  updateCameraBehaviorDiagnostic(camera, { active: false, code: CAMERA_RANGE, message: '' });
  const frame = camera.frame.trim();
  const valid = frame.length > 0;
  getCameraBehaviorState(camera).configured = valid;
  updateCameraBehaviorDiagnostic(camera, {
    active: !valid,
    code: CAMERA_FRAME_UNRESOLVED,
    message: 'The camera follow frame must resolve to one uniquely named frame in this scene.'
  });
  return valid
    ? {
        fields: camera.mode === 'pose' ? ['target.position', 'target.heading'] : ['target.position'],
        frame,
        kind: 'follow',
        mode: camera.mode
      }
    : null;
}

function getTopContribution(camera: SceneCamera): TopCameraContribution | null {
  sceneCameraController.setFrameResolved(camera, true);
  const target = getCameraTarget(camera);
  const projection = getTopCameraProjection(camera);
  const valid = target !== null && projection !== null && Number.isFinite(camera.height) && camera.height > 0;
  getCameraBehaviorState(camera).configured = valid;
  updateCameraBehaviorDiagnostic(camera, {
    active: !valid,
    code: CAMERA_RANGE,
    message:
      'Camera top target must be finite, height must be positive and finite, and clipping distances must satisfy 0 < near < far.'
  });
  return valid && target && projection
    ? {
        fields: ['target.position', 'target.heading', 'offset.distance', 'offset.phi', 'offset.theta', 'projection'],
        height: camera.height,
        kind: 'top',
        projection,
        target
      }
    : null;
}

function getPoseContribution(camera: SceneCamera): PoseCameraContribution | null {
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
        frame: camera.frame.trim(),
        kind: 'pose',
        pose,
        projection
      }
    : null;
}

function getCameraTarget(camera: SceneCamera): CameraTarget | null {
  const position = toVec3(camera.target);
  return position && Number.isFinite(camera.heading) ? { position, heading: camera.heading } : null;
}

function getCameraProjection(camera: SceneCamera): CameraProjection | null {
  if (!isValidClipping(camera.near, camera.far)) return null;
  if (camera.projection === 'ortho') {
    return Number.isFinite(camera.frustumHeight) && camera.frustumHeight > 0
      ? { mode: 'ortho', frustumHeight: camera.frustumHeight, near: camera.near, far: camera.far }
      : null;
  }
  return Number.isFinite(camera.fovy) && camera.fovy > 0 && camera.fovy < Math.PI
    ? { mode: 'perspective', fovy: camera.fovy, near: camera.near, far: camera.far }
    : null;
}

function getTopCameraProjection(camera: SceneCamera): CameraProjection | null {
  return isValidClipping(camera.near, camera.far)
    ? { mode: 'ortho', frustumHeight: camera.height, near: camera.near, far: camera.far }
    : null;
}

function getCameraPose(camera: SceneCamera): CameraPose | null {
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

function clearBehaviorConfiguration(camera: SceneCamera): void {
  getCameraBehaviorState(camera).configured = true;
  updateCameraBehaviorDiagnostic(camera, { active: false, code: CAMERA_RANGE, message: '' });
  sceneCameraController.setFrameResolved(camera, true);
}

function updateCameraBehaviorDiagnostic(
  camera: SceneCamera,
  options: {
    readonly active: boolean;
    readonly code: string;
    readonly message: string;
    readonly severity?: 'error' | 'warning';
  }
): void {
  getCameraBehaviorState(camera).diagnostics.update({
    active: options.active,
    code: options.code,
    element: camera,
    message: options.message,
    severity: options.severity ?? 'error'
  });
}
