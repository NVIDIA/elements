// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { property } from 'lit/decorators/property.js';
import { SceneFrame } from '../frame/frame.js';
import { invalidateFrameTransform, notifyFrameStateChange } from '../internal/composition/frame/state.js';
import { captureJointAxis, composeJointMotion, type SceneJointType } from '../internal/composition/joint/motion.js';
import {
  disconnectJoint,
  getJointMimicValue,
  publishJointValue,
  registerJoint
} from '../internal/composition/joint/state.js';
import {
  JOINT_AXIS,
  JOINT_LIMIT,
  JOINT_MIMIC,
  JOINT_TYPE,
  JOINT_VALUE,
  type SceneErrorCode
} from '../internal/diagnostics/errors.js';
import { diagnosticReporterService } from '../internal/diagnostics/reporter.service.js';
import type { ScenePose, Vec3 } from '../internal/math/types.js';

interface JointInputs {
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
 * @description A coordinate frame with one degree of freedom, composed after its declarative origin.
 * @since 0.0.0
 * @entrypoint \@nvidia-elements/scene/joint
 * @slot - Contains nested frames and renderable scene elements.
 * @stable false
 */
export class SceneJoint extends SceneFrame {
  static readonly metadata = { tag: 'nve-scene-joint', version: '0.0.0' };

  #inputs: JointInputs = {
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
    registerJoint(
      this,
      () => this.applyDeclarativeTransform(),
      () => this.mimic
    );
  }

  /** Selects revolute, continuous, prismatic, or fixed motion. */
  @property({ type: String })
  get type(): SceneJointType {
    return this.#inputs.type;
  }
  set type(value: SceneJointType) {
    this.#set('type', value);
  }

  /** Joint-local axis, normalized when captured. Ignored for fixed joints. */
  @property({ type: Array })
  get axis(): Vec3 {
    return [...this.#inputs.axis];
  }
  set axis(value: Vec3) {
    this.#set('axis', value);
  }

  /** Current joint input in radians or metres. Applies synchronously. */
  @property({ type: Number, reflect: true })
  get value(): number {
    return this.#inputs.value;
  }
  set value(value: number) {
    this.#set('value', value);
  }

  /** Optional lower limit on the effective value. Values are never clamped. */
  @property({ type: Number })
  get lower(): number | null {
    return this.#inputs.lower;
  }
  set lower(value: number | null) {
    this.#set('lower', value);
  }

  /** Optional upper limit on the effective value. Values are never clamped. */
  @property({ type: Number })
  get upper(): number | null {
    return this.#inputs.upper;
  }
  set upper(value: number | null) {
    this.#set('upper', value);
  }

  /** Calibration offset added after scaling the input value. */
  @property({ type: Number })
  get offset(): number {
    return this.#inputs.offset;
  }
  set offset(value: number) {
    this.#set('offset', value);
  }

  /** Calibration multiplier applied to the input value. */
  @property({ type: Number })
  get scale(): number {
    return this.#inputs.scale;
  }
  set scale(value: number) {
    this.#set('scale', value);
  }

  /** Names one non-mimic joint in the same scene and name scope. Ignores its own value. */
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

  protected override captureDeclarativePose(): ScenePose | false {
    const revision = this.#inputRevision;
    const origin = super.captureDeclarativePose() || { position: [0, 0, 0], orientation: [0, 0, 0, 1] };
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
