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
  invalidateFrameTransform,
  registerFrameState,
  setFrameTransform,
  notifyFrameStateChange
} from '../internal/composition/frame/state.js';
import type { Quaternion, ScenePose, Vec3 } from '../internal/math/types.js';
import { getWorldPoint, getLocalPoint } from '../internal/composition/frame/points.js';
import styles from '../internal/dom/host.css?inline';

/**
 * @element nve-scene-frame
 * @description A rigid coordinate frame that groups scene content under one current translation and orientation.
 * Frames never include scale. An unauthored pose is a valid identity transform.
 *
 * Scene uses a right-handed, REP-103-aligned world: +X forward, +Y left, +Z up.
 * Linear values use meters; angles use radians. Positive rotation is counterclockwise
 * when viewed from the positive axis toward the origin. Quaternions use XYZW order;
 * capture normalizes finite, nonzero quaternions and rejects all others.
 * Nested and referenced frames compose as `world = parent × local`.
 * Camera-local axes use the optical basis: +X image right, +Y image down, +Z forward.
 *
 * Named parents and DOM nesting compose together, independently of document order.
 * Registry updates resolve dependencies in order and reject self references and longer
 * cycles. Every layer can also select its owning frame by name; cameras share this lookup.
 * Unqualified names search the nearest model scope then outward; qualified paths such as
 * arm/tcp address members from outside. Nested scenes have independent registries.
 *
 * Frame and camera composition uses double-precision CPU values before GPU conversion.
 * Keep packed Float32 positions near their frame origin and express large translations
 * with frames: composition preserves small local offsets but cannot recover precision
 * already lost in producer buffers. Public matrices remain column-major Float32Array values.
 *
 * Applications own transport, timestamps, history, clocks, buffering, interpolation,
 * extrapolation, and replay. Select a coherent current snapshot and assign its position and orientation.
 * @since 0.0.0
 * @entrypoint \@nvidia-elements/scene/frame
 * @event {SceneErrorDetail} nve-scene-error - Dispatched when the frame reports an invalid transform.
 * @slot - Contains nested frames and renderable scene elements.
 * @stable false
 */
export class SceneFrame extends LitElement {
  /**
   * Named transform parent for position and orientation; omission uses DOM
   * ancestry. Lookup searches the nearest model scope then outward; arm/tcp qualifies a
   * model member. Missing, ambiguous, cross-scene, or cyclic targets report frame-unresolved
   * and invalidate this chain. Removal never reparents to the origin. Hidden or invalid
   * resolved ancestors suppress content.
   */
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

  /**
   * Trimmed identifier in the nearest model scope, or the scene outside a model. A bare
   * name containing `/` reports frame-name and invalidates this chain. Duplicate names
   * report frame-name-duplicate and exclude every occurrence from named lookup; valid
   * DOM-nested children still render. Renaming or removing duplicates restores lookup.
   */
  @property({ type: String }) name: string | null = null;

  /**
   * Parent-local translation in XYZ meters; null defaults to [0, 0, 0]. Assignment applies
   * synchronously, so the next query sees it. Invalid input reports frame-transform and
   * suppresses this chain without substituting identity; a valid assignment recovers it.
   */
  @property({ type: Array })
  get position(): Vec3 | null {
    return this.#position;
  }

  set position(value: Vec3 | null) {
    const previous = this.#position;
    this.#position = value ?? null;
    this.#applyTransform();
    this.requestUpdate('position', previous);
  }

  #position: Vec3 | null = null;

  /**
   * Parent-from-local XYZW quaternion; null defaults to [0, 0, 0, 1]. Assignment applies
   * synchronously and normalizes finite, nonzero values. Invalid input reports
   * frame-transform and suppresses this chain until a valid assignment.
   */
  @property({ type: Array })
  get orientation(): Quaternion | null {
    return this.#orientation;
  }

  set orientation(value: Quaternion | null) {
    const previous = this.#orientation;
    this.#orientation = value ?? null;
    this.#applyTransform();
    this.requestUpdate('orientation', previous);
  }

  #orientation: Quaternion | null = null;

  constructor() {
    super();
    registerFrameState(this);
  }

  /** Gets a defensive copy of the effective local pose. Throws InvalidStateError while this frame is invalid. */
  get pose(): ScenePose {
    return getFramePose(this);
  }

  /**
   * Returns an independent column-major Float32Array world matrix for the current chain.
   * Throws InvalidStateError if this frame or an ancestor is invalid. Float32 conversion
   * can round small offsets at large world origins; use point conversions for precise CPU results.
   * This method accepts no timestamp and does not query transform history.
   */
  getWorldMatrix(): Float32Array {
    if (arguments.length > 0) {
      throw new TypeError('World matrix resolution does not accept a time.');
    }
    return getFrameWorldMatrix(this);
  }

  /**
   * Converts a frame-local point through the current effective ancestor chain.
   * Returns a fresh immutable XYZ tuple, or null for invalid input, a disconnected frame,
   * a frame outside a Scene, or an invalid chain. Uses precise current CPU transforms,
   * independently of the public Float32 matrix and any earlier pick snapshot.
   */
  getWorldPoint(localPoint: Readonly<Vec3>): Readonly<Vec3> | null {
    return getWorldPoint(this, localPoint);
  }

  /** Converts a world point into this frame's coordinates; returns null for a disconnected or invalid frame. */
  getLocalPoint(worldPoint: Readonly<Vec3>): Readonly<Vec3> | null {
    return getLocalPoint(this, worldPoint);
  }

  render(): TemplateResult<1> {
    return html`<slot></slot>`;
  }

  protected override updated(changedProperties: PropertyValues<this>): void {
    if (changedProperties.has('name')) {
      validateFrameName(this);
      notifyFrameStateChange(this);
    }
  }

  #applyTransform(): void {
    const unauthored = this.#position === null && this.#orientation === null;
    const position = this.#position === null ? ([0, 0, 0] as Vec3) : toVec3(this.#position);
    const orientation = this.#orientation === null ? ([0, 0, 0, 1] as Quaternion) : toQuaternion(this.#orientation);
    const valid = position !== null && orientation !== null;
    if (unauthored) clearFrameTransform(this);
    else if (valid) setFrameTransform(this, { position, orientation });
    else invalidateFrameTransform(this);
    diagnosticReporterService.update({
      active: !valid,
      code: FRAME_TRANSFORM,
      element: this,
      message: 'Scene frame position and orientation must contain finite values and a nonzero quaternion.',
      severity: 'error'
    });
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
