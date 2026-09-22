// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useStyles } from '@nvidia-elements/core/internal';
import { LitElement, type PropertyValues } from 'lit';
import { property } from 'lit/decorators/property.js';
import {
  applyCameraInputAttribute,
  recordCameraInputAssignment,
  registerCameraInput
} from '../internal/composition/camera/input.js';
import { cameraPropertyFromAttribute } from '../internal/composition/camera/behavior.js';
import type {
  CameraConfiguration,
  CameraPropertyName,
  SceneCameraBehavior,
  SceneCameraFollowMode,
  SceneCameraProjectionMode
} from '../internal/composition/camera/configuration.js';
import { DEFAULT_FAR, DEFAULT_NEAR, DEFAULT_ORBIT_CAMERA_STATE } from '../internal/composition/camera/math.js';
import type { Quaternion, Vec3 } from '../internal/math/types.js';
import { notifyOwningScene } from '../internal/composition/scene/notifications.js';
import styles from '../internal/dom/host.css?inline';

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

/**
 * @element nve-scene-camera
 * @description Configures one repeatable camera behavior for the owning scene.
 * @since 0.0.0
 * @entrypoint \@nvidia-elements/scene/camera
 * @stable false
 */
export class SceneCamera extends LitElement implements CameraConfiguration {
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
