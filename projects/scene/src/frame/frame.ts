// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, LitElement, type PropertyValues } from 'lit';
import { property } from 'lit/decorators/property.js';
import { useStyles } from '@nvidia-elements/core/internal';
import { FRAME_TRANSFORM, type SceneErrorDetail } from '../errors.js';
import {
  clearFrameTransform,
  getFrameTransform,
  getFrameWorldMatrix,
  invalidateFrameTransform,
  registerFrameState,
  setFrameTransform,
  touchFrameState
} from '../internal/frame/state.js';
import type { Quaternion, Vec3 } from '../internal/types.js';
import styles from './frame.css?inline';
import type { FrameTransform } from '../internal/frame/types.js';

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
  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'nve-scene-frame',
    version: '0.0.0'
  };

  #declarativeTransform = false;
  #transformErrorActive = false;

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

  /** Gets a copy of the current transform or clears it when set to null. */
  get transform(): FrameTransform | null {
    return getFrameTransform(this);
  }

  set transform(value: FrameTransform | null) {
    if (value === null) {
      clearFrameTransform(this);
      if (this.#transformErrorActive) {
        invalidateFrameTransform(this);
      } else {
        this.#declarativeTransform = false;
      }
    } else {
      this.setTransform(value);
    }
  }

  /** Replaces the current transform. */
  setTransform(transform: FrameTransform): void {
    setFrameTransform(this, transform);
    if (this.#transformErrorActive) {
      invalidateFrameTransform(this);
      return;
    }
    this.#declarativeTransform = false;
    this.#clearTransformError();
  }

  /** Resolves a copy of this frame's current world matrix. */
  getWorldMatrix(): Float32Array {
    if (arguments.length > 0) {
      throw new TypeError('World matrix resolution does not accept a time.');
    }
    return getFrameWorldMatrix(this);
  }

  render() {
    return html`<slot></slot>`;
  }

  protected override updated(changedProperties: PropertyValues<this>): void {
    if (changedProperties.has('name')) {
      touchFrameState(this);
    }
    if (changedProperties.has('position') || changedProperties.has('orientation')) {
      this.#applyDeclarativeTransform();
    }
  }

  #applyDeclarativeTransform(): void {
    if (this.position === null && this.orientation === null) {
      this.#clearDeclarativeTransform();
      return;
    }

    const position: Vec3 | null = this.position === null ? [0, 0, 0] : toVec3(this.position);
    const orientation: Quaternion | null = this.orientation === null ? [0, 0, 0, 1] : toQuaternion(this.orientation);
    if (position === null || orientation === null) {
      this.#rejectDeclarativeTransform();
      return;
    }

    this.#clearTransformError();
    setFrameTransform(this, { position, orientation });
    this.#declarativeTransform = true;
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
    if (this.#transformErrorActive) {
      return;
    }
    this.#transformErrorActive = true;
    const detail: SceneErrorDetail = {
      code: FRAME_TRANSFORM,
      message: 'Scene frame position and orientation attributes must contain finite values and a nonzero quaternion.',
      element: this,
      severity: 'error'
    };
    console.error(`[${detail.code}] ${detail.message}`, this);
    this.dispatchEvent(
      new CustomEvent<SceneErrorDetail>('nve-scene-error', {
        bubbles: true,
        composed: true,
        cancelable: false,
        detail
      })
    );
  }

  #clearTransformError(): void {
    this.#transformErrorActive = false;
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
