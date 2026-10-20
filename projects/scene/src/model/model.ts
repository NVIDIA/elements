// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { isServer } from 'lit';
import { property } from 'lit/decorators/property.js';
import { SceneFrame } from '../frame/frame.js';
import type { SceneJoint } from '../joint/joint.js';
import { setFrameConstraint } from '../internal/composition/frame/constraints.js';
import { getElementName } from '../internal/composition/frame/registry.js';
import { setModelTint } from '../internal/composition/model/tint.js';
import { refreshBodyLayerTint, isBodyLayerRegistered } from '../internal/layers/body/layer-state.js';
import { MODEL_JOINT } from '../internal/diagnostics/errors.js';
import { diagnosticReporterService } from '../internal/diagnostics/reporter.service.js';

/** A live view of the joint elements owned directly by one model's name scope. */
export interface SceneModelJoints {
  get(name: string): SceneJoint | undefined;
  set(name: string, value: number): void;
  has(name: string): boolean;
  names(): string[];
  values(): Record<string, number>;
  reset(): void;
}

/**
 * @element nve-scene-model
 * @description An entity frame owning a name scope, joint access, and body tint.
 * @since 0.0.0
 * @entrypoint \@nvidia-elements/scene/model
 * @slot - Contains this entity's bodies, joints, and coordinate frames.
 * @stable false
 */
export class SceneModel extends SceneFrame {
  static readonly metadata = { tag: 'nve-scene-model', version: '0.0.0' };
  #tint = '#ffffff';

  /** Live, read-only joint view. Set assigns a joint's synchronous value property. */
  get joints(): SceneModelJoints {
    return this.#joints;
  }

  readonly #joints: SceneModelJoints = Object.freeze({
    get: (name: string) => this.#joint(name),
    set: (name: string, value: number) => {
      const joint = this.#joint(name);
      if (joint) joint.value = value;
    },
    has: (name: string) => this.#jointMap().has(name.trim()),
    names: () => [...this.#jointMap().keys()],
    values: () => Object.fromEntries([...this.#jointMap()].map(([name, joint]) => [name, joint.value])),
    reset: () => {
      for (const joint of this.#jointMap().values()) if (!joint.mimic?.trim()) joint.value = 0;
      this.#jointDiagnostic(false);
    }
  });

  /** CSS color multiplier composed with every descendant body's own tint. */
  @property({ type: String })
  get tint(): string {
    return this.#tint;
  }
  set tint(value: string) {
    const previous = this.#tint;
    this.#tint = value ?? '#ffffff';
    if (!isServer) {
      setModelTint(this, this.#tint);
      this.#refreshTints();
    }
    this.requestUpdate('tint', previous);
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.#refreshTints();
  }

  #refreshTints(): void {
    for (const body of this.querySelectorAll<HTMLElement>('nve-scene-body')) {
      if (isBodyLayerRegistered(body)) refreshBodyLayerTint(body);
    }
  }

  #jointMap(): Map<string, SceneJoint> {
    const names = new Map<string, SceneJoint | null>();
    for (const joint of this.querySelectorAll<SceneJoint>('nve-scene-joint')) {
      if (joint.closest('nve-scene-model') !== this || joint.closest('nve-scene') !== this.closest('nve-scene'))
        continue;
      const name = getElementName(joint);
      if (name && !name.includes('/')) names.set(name, names.has(name) ? null : joint);
    }
    return new Map([...names].flatMap(([name, joint]) => (joint ? [[name, joint]] : [])));
  }

  #joint(name: string): SceneJoint | undefined {
    const joint = this.#jointMap().get(name.trim());
    this.#jointDiagnostic(!joint);
    return joint;
  }

  #jointDiagnostic(active: boolean): void {
    setFrameConstraint(this, MODEL_JOINT, !active);
    diagnosticReporterService.update({
      element: this,
      code: MODEL_JOINT,
      active,
      severity: 'error',
      message: 'The joint name must identify one joint in this model scope.'
    });
  }
}
