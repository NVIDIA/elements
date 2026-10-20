// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { isServer } from 'lit';
import { property } from 'lit/decorators/property.js';
import { SceneFrame } from '../frame/frame.js';
import type { SceneJoint } from '../joint/joint.js';
import type { SceneBody } from '../body/body.js';
import { setFrameConstraint } from '../internal/composition/frame/constraints.js';
import { getElementName } from '../internal/composition/frame/registry.js';
import { setModelTint } from '../internal/composition/model/tint.js';
import { refreshBodyLayerTint, isBodyLayerRegistered } from '../internal/layers/body/layer-state.js';
import { MODEL_JOINT } from '../internal/diagnostics/errors.js';
import { diagnosticReporterService } from '../internal/diagnostics/reporter.service.js';

/** A live view of the joint elements owned directly by one model's name scope. */
export interface SceneModelJoints {
  /** Returns the named joint element. Unknown names report model-joint and invalidate the model chain. */
  get(name: string): SceneJoint | undefined;
  /** Assigns the named joint's synchronous value. Unknown names report model-joint and invalidate the model chain. */
  set(name: string, value: number): void;
  /**
   * Assigns each record entry with one membership lookup, in key order. Accepts the shape values() returns.
   * Any unknown name reports model-joint and invalidates the model chain; known joints still update.
   */
  set(values: Readonly<Record<string, number>>): void;
  /** Tests membership without reporting an unknown-name diagnostic. */
  has(name: string): boolean;
  /** Returns the current joint names in this scope, excluding nested models. */
  names(): string[];
  /** Returns a plain object of authored joint values, including stored values on mimic joints. */
  values(): Record<string, number>;
  /** Zeros every non-mimic joint; calibration and mimic rules still apply. */
  reset(): void;
}

/** A live, read-only view of the bodies named directly in one model's frame namespace. */
export interface SceneModelBodies {
  /** Returns the named body, or undefined for unknown names and names shared with another frame. */
  get(name: string): SceneBody | undefined;
  /** Tests whether the name identifies one body in this scope. */
  has(name: string): boolean;
  /** Returns the current body names in this scope, excluding nested models. */
  names(): string[];
}

/**
 * @element nve-scene-model
 * @description An entity frame owning a name scope, joint access, and body tint.
 * Groups the bodies, joints, and coordinate frames of one entity. Inherited position,
 * orientation, and frame move the whole model; hidden and removal follow
 * ordinary DOM lifecycle. Bodies retain their own picking identities and instance sources.
 * The current model has no file loading or src property.
 *
 * Bodies own coordinate frames; joints connect bodies through parent and child names.
 * Body/frame names and joint names use separate namespaces within the model.
 * Members belong to their nearest enclosing model's scope. Unqualified frame and mimic
 * references search that scope first, then enclosing scopes and the scene. Two models
 * may reuse the same internal names. From outside, use qualified references such as
 * `arm/tcp`; nested models extend the path with `/`. Bare names cannot contain `/`.
 * Duplicate-name validation is per scope. A model needs no name until another element
 * addresses its members with a qualified reference; an inaccessible unnamed scope reports model-name.
 * @since 0.0.0
 * @entrypoint \@nvidia-elements/scene/model
 * @slot - Contains this entity's bodies, joints, and coordinate frames.
 * @stable false
 */
export class SceneModel extends SceneFrame {
  static readonly metadata = { tag: 'nve-scene-model', version: '0.0.0' };
  #tint = '#ffffff';

  /**
   * Live read-only view of this scope's joints, excluding nested models. get(name) returns
   * an element; set(name, value) assigns synchronously. has(), names(), and values() inspect
   * membership or authored values; reset() zeros non-mimic joints. Unknown get/set names
   * report model-joint and invalidate the chain. Connect, disconnect, and rename update membership.
   */
  get joints(): SceneModelJoints {
    return this.#joints;
  }

  readonly #joints: SceneModelJoints = Object.freeze({
    get: (name: string) => this.#joint(name),
    set: (target: string | Readonly<Record<string, number>>, value?: number) => {
      const joints = this.#jointMap();
      const entries = typeof target === 'string' ? [[target, value!] as const] : Object.entries(target);
      let missing = false;
      for (const [name, next] of entries) {
        const joint = joints.get(name.trim());
        if (joint) joint.value = next;
        else missing = true;
      }
      this.#jointDiagnostic(missing);
    },
    has: (name: string) => this.#jointMap().has(name.trim()),
    names: () => [...this.#jointMap().keys()],
    values: () => Object.fromEntries([...this.#jointMap()].map(([name, joint]) => [name, joint.value])),
    reset: () => {
      for (const joint of this.#jointMap().values()) if (!joint.mimic?.trim()) joint.value = 0;
      this.#jointDiagnostic(false);
    }
  });

  /**
   * Live read-only view of the bodies named in this scope, excluding nested models. Bodies share
   * the frame namespace, so a name also used by a frame or nested model resolves to undefined.
   * Lookups report no diagnostics. Connect, disconnect, and rename update membership.
   */
  get bodies(): SceneModelBodies {
    return this.#bodies;
  }

  readonly #bodies: SceneModelBodies = Object.freeze({
    get: (name: string) => this.#bodyMap().get(name.trim()),
    has: (name: string) => this.#bodyMap().has(name.trim()),
    names: () => [...this.#bodyMap().keys()]
  });

  /**
   * CSS color multiplier composed with every descendant body's own tint, including
   * bodies in nested models. Defaults to white, preserving authored body colors.
   * Model pose, scope, and tint do not change the bodies' feature IDs or instance state.
   */
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
    return this.#scopeNames<SceneJoint>('nve-scene-joint');
  }

  /** Bodies share the frame namespace with frames and nested model names. */
  #bodyMap(): Map<string, SceneBody> {
    const names = this.#scopeNames<HTMLElement>('nve-scene-frame, nve-scene-body, nve-scene-model');
    return new Map(
      [...names].flatMap(([name, element]) =>
        element.localName === 'nve-scene-body' ? [[name, element as SceneBody] as const] : []
      )
    );
  }

  /** Maps unique valid names owned directly by this scope; duplicate names map to nothing. */
  #scopeNames<T extends HTMLElement>(selector: string): Map<string, T> {
    const scene = this.closest('nve-scene');
    const names = new Map<string, T | null>();
    for (const element of this.querySelectorAll<T>(selector)) {
      if (element.parentElement?.closest('nve-scene-model') !== this || element.closest('nve-scene') !== scene)
        continue;
      const name = getElementName(element);
      if (name && !name.includes('/')) names.set(name, names.has(name) ? null : element);
    }
    return new Map([...names].flatMap(([name, element]) => (element ? [[name, element] as const] : [])));
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
