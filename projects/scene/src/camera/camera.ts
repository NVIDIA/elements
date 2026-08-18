// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useStyles } from '@nvidia-elements/core/internal';
import { LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import { CAMERA_FRAME_UNRESOLVED, CAMERA_RANGE, CAMERA_SLOT_CONFLICT } from '../errors.js';
import type { CameraField } from '../internal/camera/state.js';
import { DiagnosticEpisodes } from '../internal/diagnostic-episodes.js';
import { DEFAULT_CAMERA_STATE, type CameraProjection, type CameraTarget } from '../internal/math/camera.js';
import type { Vec3 } from '../internal/types.js';
import styles from './camera.css?inline';

export type SceneCameraBehavior = 'orbit' | 'follow' | 'top';
export type SceneCameraFollowMode = 'position' | 'pose';
type SceneCameraProjection = CameraProjection['mode'];

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
  readonly target: CameraTarget;
}

type CameraBehaviorContribution = OrbitCameraContribution | FollowCameraContribution | TopCameraContribution;

interface CameraBehaviorState {
  configured: boolean;
  conflicted: boolean;
  readonly diagnostics: DiagnosticEpisodes;
  frameResolved: boolean;
}

const cameraBehaviorStates = new WeakMap<SceneCamera, CameraBehaviorState>();

const cameraBehaviorConverter = {
  fromAttribute(value: string | null): SceneCameraBehavior {
    if (value === 'follow' || value === 'top') return value;
    return 'orbit';
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

const distanceConverter = numberConverter(DEFAULT_CAMERA_STATE.offset.distance);
const phiConverter = numberConverter(DEFAULT_CAMERA_STATE.offset.phi);
const thetaConverter = numberConverter(DEFAULT_CAMERA_STATE.offset.theta);
const headingConverter = numberConverter(DEFAULT_CAMERA_STATE.target.heading);
const fovyConverter = numberConverter(
  DEFAULT_CAMERA_STATE.projection.mode === 'perspective' ? DEFAULT_CAMERA_STATE.projection.fovy : Math.PI / 4
);
const frustumHeightConverter = numberConverter(40);

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

  /** Chooses the camera behavior configured by this element. */
  @property({ converter: cameraBehaviorConverter }) behavior: SceneCameraBehavior = 'orbit';

  /** Sets the camera target in x y z order. */
  @property({ type: Array }) target: Vec3 = [...DEFAULT_CAMERA_STATE.target.position];

  /** Sets the camera target heading in radians. */
  @property({ converter: headingConverter }) heading = DEFAULT_CAMERA_STATE.target.heading;

  /** Sets the orbit distance from the target in meters. */
  @property({ converter: distanceConverter }) distance = DEFAULT_CAMERA_STATE.offset.distance;

  /** Sets the orbit polar angle in radians from positive Z. */
  @property({ converter: phiConverter }) phi = DEFAULT_CAMERA_STATE.offset.phi;

  /** Sets the orbit azimuth in radians relative to the target heading. */
  @property({ converter: thetaConverter }) theta = DEFAULT_CAMERA_STATE.offset.theta;

  /** Chooses the orbit camera projection. */
  @property({ converter: cameraProjectionConverter }) projection: SceneCameraProjection = 'perspective';

  /** Sets the perspective vertical field of view in radians for the Y axis. */
  @property({ converter: fovyConverter }) fovy = Math.PI / 4;

  /** Sets the orthographic projection height in meters. */
  @property({ attribute: 'frustum-height', converter: frustumHeightConverter }) frustumHeight = 40;

  /** The smallest permitted orbit distance in meters. Used by the orbit behavior. */
  @property({ attribute: 'min-distance', converter: minDistanceConverter }) minDistance = 0.5;

  /** The largest permitted orbit distance in meters. Used by the orbit behavior. */
  @property({ attribute: 'max-distance', converter: maxDistanceConverter }) maxDistance = 200;

  /** Names the scene-local frame tracked by the follow behavior. */
  @property({ type: String }) frame = '';

  /** Chooses whether the follow behavior tracks position only or the frame pose. */
  @property({ converter: cameraFollowModeConverter }) mode: SceneCameraFollowMode = 'position';

  /** Defines the orthographic camera height in meters. Used by the top behavior. */
  @property({ type: Number }) height = 40;

  /** Disables this declarative camera behavior by attribute presence. */
  @property({ type: Boolean, reflect: true }) disabled = false;
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
      message: 'The camera follow frame must resolve to one uniquely named frame in this scene.',
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
  const valid = target !== null && Number.isFinite(camera.height) && camera.height > 0;
  getCameraBehaviorState(camera).configured = valid;
  updateCameraBehaviorDiagnostic(camera, {
    active: !valid,
    code: CAMERA_RANGE,
    message: 'Camera top target must be finite and height must be a positive finite number.'
  });
  return valid && target
    ? {
        fields: ['target.position', 'target.heading', 'offset.distance', 'offset.phi', 'offset.theta', 'projection'],
        height: camera.height,
        kind: 'top',
        target
      }
    : null;
}

function getCameraTarget(camera: SceneCamera): CameraTarget | null {
  const position = toVec3(camera.target);
  return position && Number.isFinite(camera.heading) ? { position, heading: camera.heading } : null;
}

function getCameraProjection(camera: SceneCamera): CameraProjection | null {
  if (camera.projection === 'ortho') {
    return Number.isFinite(camera.frustumHeight) && camera.frustumHeight > 0
      ? { mode: 'ortho', frustumHeight: camera.frustumHeight }
      : null;
  }
  return Number.isFinite(camera.fovy) && camera.fovy > 0 && camera.fovy < Math.PI
    ? { mode: 'perspective', fovy: camera.fovy }
    : null;
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
