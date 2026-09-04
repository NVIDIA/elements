// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useStyles } from '@nvidia-elements/core/internal';
import { LitElement, type PropertyValues } from 'lit';
import { property } from 'lit/decorators/property.js';
import {
  CAMERA_FRAME_UNRESOLVED,
  CAMERA_PROPERTY_INACTIVE,
  CAMERA_RANGE,
  CAMERA_SLOT_CONFLICT,
  type SceneErrorCode
} from '../errors.js';
import type { CameraField } from '../internal/camera/state.js';
import {
  applyCameraInputAttribute,
  applyCameraInputRuntimeWrite,
  cameraInputIsExplicit,
  recordCameraInputAssignment,
  registerCameraInput
} from '../internal/camera/input.js';
import { DiagnosticEpisodes } from '../internal/diagnostic-episodes.js';
import {
  DEFAULT_FAR,
  DEFAULT_NEAR,
  DEFAULT_ORBIT_CAMERA_STATE,
  type SceneCameraProjection,
  type CameraTarget
} from '../internal/math/camera.js';
import { normalizeQuaternion } from '../internal/math/quaternion.js';
import type { Quaternion, ScenePose, Vec3 } from '../internal/types.js';
import { notifyOwningScene } from '../internal/scene/notifications.js';
import styles from '../internal/host.css?inline';

export type SceneCameraBehavior = 'orbit' | 'follow' | 'top' | 'pose';
export type SceneCameraFollowMode = 'position' | 'pose';
export type SceneCameraProjectionMode = SceneCameraProjection['mode'];

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
  fromAttribute(value: string | null): SceneCameraProjectionMode {
    return value === 'orthographic' ? 'orthographic' : 'perspective';
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
const polarAngleConverter = numberConverter(DEFAULT_ORBIT_CAMERA_STATE.offset.polarAngle);
const azimuthConverter = numberConverter(DEFAULT_ORBIT_CAMERA_STATE.offset.azimuth);
const headingConverter = numberConverter(DEFAULT_ORBIT_CAMERA_STATE.target.heading);
const verticalFieldOfViewConverter = numberConverter(
  DEFAULT_ORBIT_CAMERA_STATE.projection.mode === 'perspective'
    ? DEFAULT_ORBIT_CAMERA_STATE.projection.verticalFieldOfView
    : Math.PI / 4
);
const frustumHeightConverter = numberConverter(40);
const nearConverter = numberConverter(DEFAULT_NEAR);
const farConverter = numberConverter(DEFAULT_FAR);
const altitudeConverter = numberConverter(40);

type CameraPropertyName = Exclude<keyof SceneCamera, keyof LitElement | 'transform'>;

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

  #altitude = 40;
  #behavior: SceneCameraBehavior = 'pose';
  #disabled = false;
  #distance = DEFAULT_ORBIT_CAMERA_STATE.offset.distance;
  #far = DEFAULT_FAR;
  #verticalFieldOfView = Math.PI / 4;
  #frame: string | null = null;
  #frustumHeight = 40;
  #heading = DEFAULT_ORBIT_CAMERA_STATE.target.heading;
  #maxDistance = 200;
  #minDistance = 0.5;
  #followMode: SceneCameraFollowMode = 'position';
  #near = DEFAULT_NEAR;
  #orientation: Quaternion = [0, 0, 0, 1];
  #polarAngle = DEFAULT_ORBIT_CAMERA_STATE.offset.polarAngle;
  #position: Vec3 = [0, 0, 0];
  #projection: SceneCameraProjectionMode = 'perspective';
  #target: Vec3 = [...DEFAULT_ORBIT_CAMERA_STATE.target.position];
  #azimuth = DEFAULT_ORBIT_CAMERA_STATE.offset.azimuth;

  constructor() {
    super();
    registerCameraInput(this);
  }

  /** Chooses the camera behavior configured by this element. Defaults to a static pose. */
  @property({ converter: cameraBehaviorConverter, noAccessor: true })
  get behavior(): SceneCameraBehavior {
    return this.#behavior;
  }
  set behavior(value: SceneCameraBehavior) {
    this.#assign('behavior', this.#behavior, () => (this.#behavior = value));
  }

  /** Sets the camera target in x y z order for orbit and top behaviors. */
  @property({ noAccessor: true, type: Array })
  get target(): Vec3 {
    return this.#target;
  }
  set target(value: Vec3) {
    this.#assign('target', this.#target, () => (this.#target = value));
  }

  /** Sets the target heading in radians for orbit and top behaviors. */
  @property({ converter: headingConverter, noAccessor: true })
  get heading(): number {
    return this.#heading;
  }
  set heading(value: number) {
    this.#assign('heading', this.#heading, () => (this.#heading = value));
  }

  /** Sets the distance from the target in meters for the orbit behavior. */
  @property({ converter: distanceConverter, noAccessor: true })
  get distance(): number {
    return this.#distance;
  }
  set distance(value: number) {
    this.#assign('distance', this.#distance, () => (this.#distance = value));
  }

  /** Sets the polar angle in radians from positive Z for the orbit behavior. */
  @property({ attribute: 'polar-angle', converter: polarAngleConverter, noAccessor: true })
  get polarAngle(): number {
    return this.#polarAngle;
  }
  set polarAngle(value: number) {
    this.#assign('polarAngle', this.#polarAngle, () => (this.#polarAngle = value));
  }

  /** Sets the azimuth in radians relative to target heading for the orbit behavior. */
  @property({ converter: azimuthConverter, noAccessor: true })
  get azimuth(): number {
    return this.#azimuth;
  }
  set azimuth(value: number) {
    this.#assign('azimuth', this.#azimuth, () => (this.#azimuth = value));
  }

  /** Chooses the projection for pose and orbit behaviors. */
  @property({ converter: cameraProjectionConverter, noAccessor: true })
  get projection(): SceneCameraProjectionMode {
    return this.#projection;
  }
  set projection(value: SceneCameraProjectionMode) {
    this.#assign('projection', this.#projection, () => (this.#projection = value));
  }

  /** Sets the perspective vertical field of view in radians for pose and orbit behaviors. */
  @property({ attribute: 'vertical-field-of-view', converter: verticalFieldOfViewConverter, noAccessor: true })
  get verticalFieldOfView(): number {
    return this.#verticalFieldOfView;
  }
  set verticalFieldOfView(value: number) {
    this.#assign('verticalFieldOfView', this.#verticalFieldOfView, () => (this.#verticalFieldOfView = value));
  }

  /** Sets the orthographic extent in meters for pose, orbit, and top behaviors. */
  @property({ attribute: 'frustum-height', converter: frustumHeightConverter, noAccessor: true })
  get frustumHeight(): number {
    return this.#frustumHeight;
  }
  set frustumHeight(value: number) {
    this.#assign('frustumHeight', this.#frustumHeight, () => (this.#frustumHeight = value));
  }

  /** Sets the camera translation in x y z order. Used by the pose behavior. */
  @property({ noAccessor: true, type: Array })
  get position(): Vec3 {
    return this.#position;
  }
  set position(value: Vec3) {
    this.#assign('position', this.#position, () => (this.#position = value));
  }

  /** Sets the normalized XYZW world-from-optical-camera rotation. Used by the pose behavior. */
  @property({ noAccessor: true, type: Array })
  get orientation(): Quaternion {
    return this.#orientation;
  }
  set orientation(value: Quaternion) {
    this.#assign('orientation', this.#orientation, () => (this.#orientation = value));
  }

  /** Sets the positive near clipping distance in meters for pose, orbit, and top behaviors. */
  @property({ converter: nearConverter, noAccessor: true })
  get near(): number {
    return this.#near;
  }
  set near(value: number) {
    this.#assign('near', this.#near, () => (this.#near = value));
  }

  /** Sets the far clipping distance in meters for pose, orbit, and top behaviors. */
  @property({ converter: farConverter, noAccessor: true })
  get far(): number {
    return this.#far;
  }
  set far(value: number) {
    this.#assign('far', this.#far, () => (this.#far = value));
  }

  /** The smallest permitted orbit distance in meters. Used by the orbit behavior. */
  @property({ attribute: 'min-distance', converter: minDistanceConverter, noAccessor: true })
  get minDistance(): number {
    return this.#minDistance;
  }
  set minDistance(value: number) {
    this.#assign('minDistance', this.#minDistance, () => (this.#minDistance = value));
  }

  /** The largest permitted orbit distance in meters. Used by the orbit behavior. */
  @property({ attribute: 'max-distance', converter: maxDistanceConverter, noAccessor: true })
  get maxDistance(): number {
    return this.#maxDistance;
  }
  set maxDistance(value: number) {
    this.#assign('maxDistance', this.#maxDistance, () => (this.#maxDistance = value));
  }

  /** Names the scene-local frame tracked by the follow or pose behavior. */
  @property({ noAccessor: true, type: String })
  get frame(): string | null {
    return this.#frame;
  }
  set frame(value: string | null) {
    this.#assign('frame', this.#frame, () => (this.#frame = value));
  }

  /** Chooses whether the follow behavior tracks position only or the frame pose. */
  @property({ attribute: 'follow-mode', converter: cameraFollowModeConverter, noAccessor: true })
  get followMode(): SceneCameraFollowMode {
    return this.#followMode;
  }
  set followMode(value: SceneCameraFollowMode) {
    this.#assign('followMode', this.#followMode, () => (this.#followMode = value));
  }

  /** Sets the physical camera distance above the target for the top behavior. */
  @property({ converter: altitudeConverter, noAccessor: true })
  get altitude(): number {
    return this.#altitude;
  }
  set altitude(value: number) {
    this.#assign('altitude', this.#altitude, () => (this.#altitude = value));
  }

  /** Disables this declarative camera behavior by attribute presence. */
  @property({ noAccessor: true, reflect: true, type: Boolean })
  get disabled(): boolean {
    return this.#disabled;
  }
  set disabled(value: boolean) {
    this.#assign('disabled', this.#disabled, () => (this.#disabled = value));
  }

  override attributeChangedCallback(name: string, oldValue: string | null, value: string | null): void {
    const propertyName = cameraPropertyFromAttribute(name);
    if (propertyName) {
      applyCameraInputAttribute({
        apply: () => super.attributeChangedCallback(name, oldValue, value),
        camera: this,
        present: value !== null,
        property: propertyName
      });
    } else {
      super.attributeChangedCallback(name, oldValue, value);
    }
  }

  #assign<PropertyName extends CameraPropertyName, Value>(
    propertyName: PropertyName,
    previous: Value,
    apply: () => void
  ): void {
    apply();
    const explicit = recordCameraInputAssignment(this, propertyName);
    this.requestUpdate(propertyName, previous);
    if (explicit) notifyOwningScene(this);
  }

  protected override updated(changedProperties: PropertyValues<this>): void {
    if (changedProperties.size > 0) notifyOwningScene(this);
  }
}

/** Applies camera navigation state without treating it as a new authored override. */
export function setCameraRuntimeProperty<Property extends CameraPropertyName>(
  camera: SceneCamera,
  propertyName: Property,
  value: SceneCamera[Property]
): void {
  applyCameraInputRuntimeWrite(camera, () => {
    camera[propertyName] = value;
  });
}

/** Scene's internal lifecycle contract for camera elements. */
export const sceneCameraController = {
  getContribution(camera: SceneCamera): CameraBehaviorContribution | null {
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

function isValidOrbitPose(camera: SceneCamera): boolean {
  return (
    Number.isFinite(camera.distance) &&
    Number.isFinite(camera.polarAngle) &&
    Number.isFinite(camera.azimuth) &&
    camera.distance > 0 &&
    camera.polarAngle >= 0 &&
    camera.polarAngle <= Math.PI
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

function getTopContribution(camera: SceneCamera): TopCameraContribution | null {
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
        frame: camera.frame?.trim() ?? '',
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

function getCameraProjection(camera: SceneCamera): SceneCameraProjection | null {
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

function getTopCameraProjection(camera: SceneCamera): SceneCameraProjection | null {
  return Number.isFinite(camera.frustumHeight) && camera.frustumHeight > 0 && isValidClipping(camera.near, camera.far)
    ? { mode: 'orthographic', frustumHeight: camera.frustumHeight, near: camera.near, far: camera.far }
    : null;
}

function getTopAltitude(camera: SceneCamera): number {
  return camera.altitude;
}

function updateCompatibilityDiagnostics(camera: SceneCamera): void {
  const state = getCameraBehaviorState(camera);
  for (const [name, behaviors] of Object.entries(SCENE_CAMERA_PROPERTY_BEHAVIORS)) {
    const propertyName = name as CameraPropertyName;
    const compatibleBehaviors = behaviors as readonly SceneCameraBehavior[];
    const active = isExplicit(camera, propertyName) && !compatibleBehaviors.includes(camera.behavior);
    state.diagnostics.update({
      active,
      code: CAMERA_PROPERTY_INACTIVE,
      element: camera,
      episodeKey: `${CAMERA_PROPERTY_INACTIVE}:${propertyName}`,
      message: `Camera ${propertyName} does not control the ${camera.behavior} behavior.`,
      severity: 'warning'
    });
  }
}

function isExplicit(camera: SceneCamera, propertyName: CameraPropertyName): boolean {
  return cameraInputIsExplicit(camera, propertyName);
}

function cameraPropertyFromAttribute(attribute: string): CameraPropertyName | undefined {
  const propertyName = attribute.replace(/-([a-z])/g, (_match, letter: string) => letter.toUpperCase());
  return propertyName in SCENE_CAMERA_PROPERTY_BEHAVIORS ? (propertyName as CameraPropertyName) : undefined;
}

function getCameraPose(camera: SceneCamera): ScenePose | null {
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
    readonly code: SceneErrorCode;
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
