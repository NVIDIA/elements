// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, LitElement, type PropertyValues, type TemplateResult } from 'lit';
import { property } from 'lit/decorators/property.js';
import { getFrameReference, setFrameReference } from '../internal/composition/frame/state.js';
import { useStyles } from '@nvidia-elements/core/internal';
import { validateFrameName } from '../internal/composition/frame/registry.js';
import { FRAME_TRANSFORM } from '../internal/diagnostics/errors.js';
import { diagnosticReporterService } from '../internal/diagnostics/reporter.service.js';
import {
  clearFrameTransform,
  getFramePose,
  getFrameWorldMatrix,
  getFrameWorldMatrixPrecise,
  invalidateFrameTransform,
  registerFrameState,
  setFrameTransform,
  notifyFrameStateChange
} from '../internal/composition/frame/state.js';
import type { Matrix4, Quaternion, ScenePose, Vec3 } from '../internal/math/types.js';
import { transformPointMat4 } from '../internal/math/mat4.js';
import styles from '../internal/dom/host.css?inline';

/**
 * @element nve-scene-frame
 * @description A coordinate frame that groups scene content under a shared transform.
 * @since 0.0.0
 * @entrypoint \@nvidia-elements/scene/frame
 * @event {SceneErrorDetail} nve-scene-error - Dispatched when the frame reports an invalid transform.
 * @slot - Contains nested frames and renderable scene elements.
 * @stable false
 */
export class SceneFrame extends LitElement {
  /** Names the owning coordinate frame; an omitted value uses DOM ancestry. */
  @property({ type: String })
  get frame(): string | null {
    return getFrameReference(this);
  }

  set frame(value: string | null) {
    const previous = this.frame;
    setFrameReference(this, value);
    this.requestUpdate('frame', previous);
  }

  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'nve-scene-frame',
    version: '0.0.0'
  };

  #declarativeTransform = false;
  #explicitAuthority = false;
  #captureRevision = 0;

  /** Identifies the frame for scene-local lookup. */
  @property({ type: String }) name: string | null = null;

  /** Defines a static translation in x y z order. */
  @property({ type: Array }) position: Vec3 | null = null;

  /** Defines a static orientation as an x y z w quaternion. */
  @property({ type: Array }) orientation: Quaternion | null = null;

  constructor() {
    super();
    registerFrameState(this);
  }

  /** Gets a copy of the current effective pose. */
  get pose(): ScenePose {
    return getFramePose(this);
  }

  /** Captures an authoritative pose immediately, or releases authority to current declarative inputs. */
  setPose(pose: ScenePose | null): void {
    if (pose === null) {
      this.#releasePoseAuthority();
      return;
    }
    this.#explicitAuthority = true;
    try {
      setFrameTransform(this, pose);
      this.#declarativeTransform = false;
      this.#clearTransformError();
    } catch {
      invalidateFrameTransform(this);
      this.#dispatchTransformError();
    }
  }

  /** Resolves a copy of this frame's current world matrix. */
  getWorldMatrix(): Float32Array {
    if (arguments.length > 0) {
      throw new TypeError('World matrix resolution does not accept a time.');
    }
    return getFrameWorldMatrix(this);
  }

  /** Converts a frame-local point through the current effective ancestor chain. */
  getWorldPoint(localPoint: Readonly<Vec3>): Readonly<Vec3> | null {
    if (!this.#hasOwningScene() || !isFiniteVec3(localPoint)) return null;
    try {
      return Object.freeze(transformPointMat4(getFrameWorldMatrixPrecise(this), localPoint));
    } catch {
      return null;
    }
  }

  /** Converts a world point into this frame's current effective coordinates. */
  getLocalPoint(worldPoint: Readonly<Vec3>): Readonly<Vec3> | null {
    if (!this.#hasOwningScene() || !isFiniteVec3(worldPoint)) return null;
    try {
      return Object.freeze(transformPointByInverseRigidMatrix(getFrameWorldMatrixPrecise(this), worldPoint));
    } catch {
      return null;
    }
  }

  render(): TemplateResult<1> {
    return html`<slot></slot>`;
  }

  protected override updated(changedProperties: PropertyValues<this>): void {
    if (changedProperties.has('name')) {
      validateFrameName(this);
      notifyFrameStateChange(this);
    }
    if (changedProperties.has('position') || changedProperties.has('orientation')) {
      this.applyDeclarativeTransform();
    }
  }

  /** Captures the declarative origin. Specialisations may append motion or reject their own inputs. */
  protected captureDeclarativePose(): ScenePose | null | false {
    if (this.position === null && this.orientation === null) return null;
    const position = this.position === null ? ([0, 0, 0] as Vec3) : toVec3(this.position);
    const orientation = this.orientation === null ? ([0, 0, 0, 1] as Quaternion) : toQuaternion(this.orientation);
    if (position === null || orientation === null) throw new TypeError('Invalid frame origin.');
    return { position, orientation };
  }

  /** Applies current declarative inputs unless setPose holds explicit authority. */
  protected applyDeclarativeTransform(): void {
    if (this.#explicitAuthority) return;
    const revision = ++this.#captureRevision;
    try {
      const pose = this.captureDeclarativePose();
      if (revision !== this.#captureRevision || this.#explicitAuthority) return;
      if (pose === null) {
        this.#clearDeclarativeTransform();
        return;
      }
      if (pose === false) {
        invalidateFrameTransform(this);
      } else {
        setFrameTransform(this, pose);
      }
      this.#clearTransformError();
      this.#declarativeTransform = true;
    } catch {
      if (revision !== this.#captureRevision || this.#explicitAuthority) return;
      this.#rejectDeclarativeTransform();
    }
  }

  #clearDeclarativeTransform(): void {
    this.#clearTransformError();
    if (this.#declarativeTransform) {
      clearFrameTransform(this);
      this.#declarativeTransform = false;
    }
  }

  #rejectDeclarativeTransform(): void {
    invalidateFrameTransform(this);
    this.#declarativeTransform = true;
    this.#dispatchTransformError();
  }

  #dispatchTransformError(): void {
    diagnosticReporterService.update({
      active: true,
      code: FRAME_TRANSFORM,
      element: this,
      message: 'Scene frame position and orientation attributes must contain finite values and a nonzero quaternion.',
      severity: 'error'
    });
  }

  #clearTransformError(): void {
    diagnosticReporterService.update({
      active: false,
      code: FRAME_TRANSFORM,
      element: this,
      message: 'Scene frame position and orientation attributes must contain finite values and a nonzero quaternion.',
      severity: 'error'
    });
  }

  #releasePoseAuthority(): void {
    this.#explicitAuthority = false;
    // Explicit capture clears the declarative flag; release must also restore an absent origin.
    this.#declarativeTransform = true;
    this.applyDeclarativeTransform();
  }

  #hasOwningScene(): boolean {
    return this.isConnected && this.closest('nve-scene') !== null;
  }
}

function toVec3(value: unknown): Vec3 | null {
  return isVec3(value) ? [value[0], value[1], value[2]] : null;
}

function toQuaternion(value: unknown): Quaternion | null {
  return !isQuaternion(value) || Math.hypot(...value) === 0 ? null : [value[0], value[1], value[2], value[3]];
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

function isFiniteVec3(value: unknown): value is Readonly<Vec3> {
  return Array.isArray(value) && value.length === 3 && value.every(component => Number.isFinite(component));
}

function transformPointByInverseRigidMatrix(matrix: Matrix4, point: Readonly<Vec3>): Vec3 {
  const x = point[0] - matrix[12]!;
  const y = point[1] - matrix[13]!;
  const z = point[2] - matrix[14]!;
  return [
    matrix[0]! * x + matrix[1]! * y + matrix[2]! * z,
    matrix[4]! * x + matrix[5]! * y + matrix[6]! * z,
    matrix[8]! * x + matrix[9]! * y + matrix[10]! * z
  ];
}
