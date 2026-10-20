// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { property } from 'lit/decorators/property.js';
import { LitElement, nothing, type PropertyValues } from 'lit';
import { validateFrameName } from '../internal/composition/frame/registry.js';
import {
  getFramePose,
  setFrameTransform,
  registerFrameState,
  invalidateFrameTransform,
  notifyFrameStateChange
} from '../internal/composition/frame/state.js';
import { captureJointAxis, composeJointMotion, type SceneJointType } from '../internal/composition/joint/motion.js';
import {
  disconnectJoint,
  getJointMimicValue,
  publishJointValue,
  registerJoint
} from '../internal/composition/joint/state.js';
import {
  FRAME_TRANSFORM,
  JOINT_AXIS,
  JOINT_LIMIT,
  JOINT_MIMIC,
  JOINT_TYPE,
  JOINT_VALUE,
  type SceneErrorCode
} from '../internal/diagnostics/errors.js';
import { diagnosticReporterService } from '../internal/diagnostics/reporter.service.js';
import type { Quaternion, ScenePose, Vec3 } from '../internal/math/types.js';

interface JointInputs {
  position: Vec3 | null;
  orientation: Quaternion | null;
  type: SceneJointType;
  axis: Vec3;
  value: number;
  lower: number | null;
  upper: number | null;
  offset: number;
  scale: number;
  mimic: string | null;
  mimicMultiplier: number;
  mimicOffset: number;
}

export type { SceneJointType } from '../internal/composition/joint/motion.js';

/**
 * @element nve-scene-joint
 * @description A connection that moves a child rigid body relative to a parent body.
 * Parent and child name bodies in the same model scope, independently of DOM order.
 * Position and orientation define the joint origin in parent-body coordinates.
 * The child pose is `parent × origin × motion`. Assign value for live motion; assignments
 * in one task become visible together at the next render boundary.
 * @since 0.0.0
 * @entrypoint \@nvidia-elements/scene/joint
 * @stable false
 */
export class SceneJoint extends LitElement {
  static readonly metadata = { tag: 'nve-scene-joint', version: '0.0.0' };

  /** Joint identifier in this model's joint namespace. */
  @property({ type: String }) name: string | null = null;

  /** Required parent body name in this model scope. */
  @property({ type: String }) parent: string | null = null;

  /** Child body name in this model scope. Each child accepts exactly one incoming joint. */
  @property({ type: String }) child: string | null = null;

  /** Current parent-to-child pose, including origin and motion. */
  get pose(): ScenePose {
    return getFramePose(this);
  }

  render() {
    return nothing;
  }

  protected override updated(changes: PropertyValues<this>): void {
    if (changes.has('name')) validateFrameName(this);
    if (changes.has('name') || changes.has('parent') || changes.has('child')) notifyFrameStateChange(this);
  }

  #inputs: JointInputs = {
    position: null,
    orientation: null,
    type: 'revolute',
    axis: [1, 0, 0] as Vec3,
    value: 0,
    lower: null as number | null,
    upper: null as number | null,
    offset: 0,
    scale: 1,
    mimic: null as string | null,
    mimicMultiplier: 1,
    mimicOffset: 0
  };
  #limitEpisode = '';
  #inputRevision = 0;

  constructor() {
    super();
    registerFrameState(this);
    registerJoint(
      this,
      () => this.applyDeclarativeTransform(),
      () => this.mimic
    );
  }

  /** Joint origin translation in parent-body coordinates, in meters. Applies synchronously. */
  @property({ type: Array })
  get position(): Vec3 | null {
    return this.#inputs.position;
  }
  set position(value: Vec3 | null) {
    this.#set('position', value ?? null);
  }

  /** Joint origin orientation as an XYZW quaternion in parent-body coordinates. Applies synchronously. */
  @property({ type: Array })
  get orientation(): Quaternion | null {
    return this.#inputs.orientation;
  }
  set orientation(value: Quaternion | null) {
    this.#set('orientation', value ?? null);
  }

  /**
   * Selects motion, defaulting to revolute. Revolute and continuous rotate about axis
   * in radians; continuous allows rotations past ±π and ignores limits. Prismatic
   * translates along axis in meters. Fixed contributes identity motion and ignores axis.
   * Unknown types report joint-type and invalidate this transform until corrected.
   */
  @property({ type: String })
  get type(): SceneJointType {
    return this.#inputs.type;
  }
  set type(value: SceneJointType) {
    this.#set('type', value);
  }

  /**
   * Joint-local axis, defaulting to [1, 0, 0], normalized on capture.
   * Zero or non-finite axes report joint-axis and invalidate the transform until corrected.
   * Ignored for fixed joints.
   */
  @property({ type: Array })
  get axis(): Vec3 {
    return [...this.#inputs.axis];
  }
  set axis(value: Vec3) {
    this.#set('axis', value);
  }

  /**
   * Reflected input in radians for rotation or meters for translation; defaults to zero.
   * Applies synchronously with effective value `scale * value + offset`, unless mimic
   * supplies the effective value. Non-finite numeric inputs report joint-value and invalidate
   * the transform until corrected. The application owns the current value.
   */
  @property({ type: Number, reflect: true })
  get value(): number {
    return this.#inputs.value;
  }
  set value(value: number) {
    this.#set('value', value);
  }

  /**
   * Optional lower limit on the effective value. A crossing reports joint-limit once
   * per episode while applying the value and keeping the chain valid; never clamps.
   * Lower greater than upper reports joint-limit and disables checking. Continuous joints
   * ignore limits. A non-finite limit reports joint-value and invalidates the transform.
   */
  @property({ type: Number })
  get lower(): number | null {
    return this.#inputs.lower;
  }
  set lower(value: number | null) {
    this.#set('lower', value);
  }

  /**
   * Optional upper limit on the effective value. Crossings report joint-limit without
   * clamping or invalidating the chain. Reversed limits disable checking; continuous
   * joints ignore limits. A non-finite limit reports joint-value and invalidates the transform.
   */
  @property({ type: Number })
  get upper(): number | null {
    return this.#inputs.upper;
  }
  set upper(value: number | null) {
    this.#set('upper', value);
  }

  /** Calibration offset in joint units, default zero: effective = scale * value + offset. Non-finite input reports joint-value. */
  @property({ type: Number })
  get offset(): number {
    return this.#inputs.offset;
  }
  set offset(value: number) {
    this.#set('offset', value);
  }

  /** Calibration multiplier, default one, to reconcile recorded and model zeros or directions. Non-finite input reports joint-value. */
  @property({ type: Number })
  get scale(): number {
    return this.#inputs.scale;
  }
  set scale(value: number) {
    this.#set('scale', value);
  }

  /**
   * Joint name resolved in the nearest model scope, then outward. Target must be one
   * non-mimic joint in this scene; otherwise joint-mimic invalidates this transform.
   * Effective value is `mimicMultiplier * target.effectiveValue + mimicOffset`; own value,
   * scale, and offset do not drive motion. Dependents update synchronously. One level only.
   */
  @property({ type: String })
  get mimic(): string | null {
    return this.#inputs.mimic;
  }
  set mimic(value: string | null) {
    this.#set('mimic', value);
    notifyFrameStateChange(this);
  }

  /** Multiplies the target joint's effective value. */
  @property({ type: Number, attribute: 'mimic-multiplier' })
  get mimicMultiplier(): number {
    return this.#inputs.mimicMultiplier;
  }
  set mimicMultiplier(value: number) {
    this.#set('mimicMultiplier', value);
  }

  /** Offset added after multiplying the target joint's effective value. */
  @property({ type: Number, attribute: 'mimic-offset' })
  get mimicOffset(): number {
    return this.#inputs.mimicOffset;
  }
  set mimicOffset(value: number) {
    this.#set('mimicOffset', value);
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.applyDeclarativeTransform();
  }

  override disconnectedCallback(): void {
    disconnectJoint(this);
    super.disconnectedCallback();
  }

  protected captureDeclarativePose(): ScenePose | false {
    const revision = this.#inputRevision;
    const origin = captureOrigin(this.position, this.orientation);
    const effective = this.#captureValue();
    const axis = this.type === 'fixed' ? ([1, 0, 0] as Vec3) : captureJointAxis(this.#inputs.axis);
    const validAxis = this.#diagnostic(
      JOINT_AXIS,
      axis === null,
      'Joint axis must contain three finite components and have nonzero length.'
    );
    if (revision !== this.#inputRevision) return false;
    publishJointValue(this, effective);
    if (effective === null || !validAxis || !axis) return false;
    this.#checkLimits(effective);
    return composeJointMotion(origin, { type: this.type, axis, value: effective });
  }

  protected applyDeclarativeTransform(): void {
    const revision = this.#inputRevision;
    try {
      const pose = this.captureDeclarativePose();
      if (revision !== this.#inputRevision) return;
      if (pose === false) invalidateFrameTransform(this);
      else setFrameTransform(this, pose);
      this.#diagnostic(FRAME_TRANSFORM, false, 'Joint origin must contain finite values and a nonzero quaternion.');
    } catch {
      this.#diagnostic(FRAME_TRANSFORM, true, 'Joint origin must contain finite values and a nonzero quaternion.');
    }
  }

  #set<Key extends keyof JointInputs>(key: Key, value: JointInputs[Key]): void {
    const previous = this.#inputs[key];
    this.#inputs[key] = value;
    this.#inputRevision += 1;
    this.applyDeclarativeTransform();
    this.requestUpdate(key, previous);
  }

  #captureValue(): number | null {
    const validType = this.#diagnostic(
      JOINT_TYPE,
      !['revolute', 'continuous', 'prismatic', 'fixed'].includes(this.type),
      'Joint type must be revolute, continuous, prismatic, or fixed.'
    );
    const numeric = [
      this.value,
      this.offset,
      this.scale,
      this.mimicMultiplier,
      this.mimicOffset,
      this.lower ?? 0,
      this.upper ?? 0
    ];
    const validNumbers = this.#diagnostic(
      JOINT_VALUE,
      !numeric.every(value => typeof value === 'number' && Number.isFinite(value)),
      'Joint values, calibration, and limits must be finite numbers.'
    );
    const effective = this.#captureMimicValue();
    const finite = effective !== null && Number.isFinite(effective);
    if (validNumbers && effective !== null && !finite)
      this.#diagnostic(JOINT_VALUE, true, 'The effective joint value must be finite.');
    return validType && validNumbers && finite ? effective : null;
  }

  #captureMimicValue(): number | null {
    const target = getJointMimicValue(this);
    const mimics = Boolean(this.mimic?.trim());
    const valid = this.#diagnostic(
      JOINT_MIMIC,
      mimics && target === null,
      'Mimic must name one non-mimic joint in the same scene and scope.'
    );
    if (!valid) return null;
    return mimics ? this.mimicMultiplier * (target ?? 0) + this.mimicOffset : this.scale * this.value + this.offset;
  }

  #checkLimits(value: number): void {
    const episode =
      this.type === 'continuous'
        ? ''
        : this.lower !== null && this.upper !== null && this.lower > this.upper
          ? 'reversed'
          : this.lower !== null && value < this.lower
            ? 'lower'
            : this.upper !== null && value > this.upper
              ? 'upper'
              : '';
    if (episode !== this.#limitEpisode)
      this.#diagnostic(JOINT_LIMIT, false, 'Joint value is outside its limits, or the limits are reversed.');
    this.#limitEpisode = episode;
    this.#diagnostic(JOINT_LIMIT, episode !== '', 'Joint value is outside its limits, or the limits are reversed.');
  }

  #diagnostic(code: SceneErrorCode, active: boolean, message: string): boolean {
    if (active && code !== JOINT_LIMIT) invalidateFrameTransform(this);
    diagnosticReporterService.update({
      element: this,
      code,
      active,
      message,
      severity: code === JOINT_LIMIT ? 'warning' : 'error'
    });
    return !active;
  }
}

function validTuple(value: unknown, length: number): boolean {
  return (
    Array.isArray(value) &&
    value.length === length &&
    value.every(item => typeof item === 'number' && Number.isFinite(item))
  );
}

function captureOrigin(position: Vec3 | null, orientation: Quaternion | null): ScenePose {
  const origin: ScenePose = { position: position ?? [0, 0, 0], orientation: orientation ?? [0, 0, 0, 1] };
  if (!validTuple(origin.position, 3) || !validTuple(origin.orientation, 4) || Math.hypot(...origin.orientation) === 0)
    throw new TypeError('Invalid joint origin.');
  return origin;
}
