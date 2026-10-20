// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { property } from 'lit/decorators/property.js';
import { isServer, type PropertyValues } from 'lit';
import { validateFrameName } from '../internal/composition/frame/registry.js';
import {
  getFrameWorldMatrix,
  registerFrameState,
  notifyFrameStateChange
} from '../internal/composition/frame/state.js';
import { getWorldPoint, getLocalPoint } from '../internal/composition/frame/points.js';
import type { Vec3 } from '../internal/math/types.js';
import { useStyles } from '@nvidia-elements/core/internal';
import { MarkerLayerElement } from '../internal/layers/markers/layer-element.js';
import { MarkerBuffer, type MarkerInit, type MarkerSource } from '../internal/layers/markers/buffer.js';
import {
  connectBodyLayer,
  disconnectBodyLayer,
  registerBodyLayer,
  setBodyLayerGeometry,
  getBodyLayerGeometry,
  setBodyLayerTint
} from '../internal/layers/body/layer-state.js';
import { MARKER } from '../internal/records/layouts/built-ins.js';
import type { SceneBodyGeometry } from '../internal/layers/body/types.js';
import { isSceneBodyPart } from '../internal/layers/registry.js';
import type { SceneMesh } from '../mesh/mesh.js';
import {
  getElementFeatureId,
  registerElementFeatureId,
  sceneFeatureIdConverter,
  setElementFeatureId
} from '../internal/interaction/element-feature-id.js';
import styles from '../internal/dom/host.css?inline';

export type BodyInstanceSource = MarkerSource;

/**
 * @element nve-scene-body
 * @description A rigid body owning a named coordinate frame and compound visual geometry.
 * Joints connect parent and child bodies by name. The incoming joint determines this
 * body's pose; root bodies inherit the model placement. Empty bodies remain valid frames.
 * Direct nve-scene-shape children define declarative primitives, and direct nve-scene-mesh
 * children add triangle meshes from arrays or files.
 * @slot - Contains direct scene shape and mesh children that define body geometry.
 * @since 0.0.0
 * @entrypoint \@nvidia-elements/scene/body
 * @stable false
 */
export class SceneBody extends MarkerLayerElement<BodyInstanceSource, MarkerInit> {
  static styles = useStyles([styles]);
  static readonly layout = MARKER;
  static readonly metadata = { tag: 'nve-scene-body', version: '0.0.0' };

  /** Body frame name in the nearest model scope. Joint names use a separate namespace. */
  @property({ type: String }) name: string | null = null;

  /** Returns the current body frame's column-major world matrix, or throws for an invalid chain. */
  getWorldMatrix(): Float32Array {
    return getFrameWorldMatrix(this);
  }

  /** Converts a body-local point to world coordinates; returns null for a disconnected or invalid body. */
  getWorldPoint(point: Readonly<Vec3>): Readonly<Vec3> | null {
    return getWorldPoint(this, point);
  }

  /** Converts a world point to body-local coordinates; returns null for a disconnected or invalid body. */
  getLocalPoint(point: Readonly<Vec3>): Readonly<Vec3> | null {
    return getLocalPoint(this, point);
  }

  #tint = '#ffffff';

  /**
   * Resolves after every direct mesh child present at access time finishes its current src request.
   * Rejects when one of those requests fails or a newer request cancels it. Meshes without src resolve immediately.
   */
  get loadComplete(): Promise<void> {
    const parts = [...this.children].filter(isSceneBodyPart) as SceneMesh[];
    return Promise.all(parts.map(part => part.loadComplete)).then(() => undefined);
  }

  /** CSS color multiplier. White preserves node colors and texture samples. */
  @property({ type: String })
  get tint(): string {
    return this.#tint;
  }

  set tint(value: string) {
    const next = value ?? '#ffffff';
    if (!isServer) setBodyLayerTint(this, next);
    const previous = this.#tint;
    this.#tint = next;
    this.requestUpdate('tint', previous);
  }

  /** Stable application identity returned when picking the uninstanced body. */
  @property({ attribute: 'feature-id', converter: sceneFeatureIdConverter })
  get featureId(): number | undefined {
    return getElementFeatureId(this);
  }

  set featureId(value: number | undefined) {
    setElementFeatureId(this, value);
  }

  /**
   * Body nodes from assignment or from shape and mesh children. Assignment captures arrays
   * and transforms and overrides children; null restores them.
   * In-place edits require reassignment, even for the same object. Invalid assignments throw
   * before replacing accepted geometry. Use frames or source records for per-frame movement.
   */
  @property({ attribute: false })
  get geometry(): SceneBodyGeometry | null {
    return getBodyLayerGeometry(this);
  }

  set geometry(value: SceneBodyGeometry | null) {
    const previous = this.geometry;
    setBodyLayerGeometry(this, value);
    this.requestUpdate('geometry', previous);
  }

  constructor() {
    super('cube', { create: records => new MarkerBuffer({ records }), kind: 'marker' });
    registerFrameState(this);
    registerElementFeatureId(this);
    registerBodyLayer(this);
  }

  protected override updated(changes: PropertyValues<this>): void {
    super.updated(changes);
    if (changes.has('name')) {
      validateFrameName(this);
      notifyFrameStateChange(this);
    }
  }

  override connectedCallback(): void {
    super.connectedCallback();
    connectBodyLayer(this);
  }

  override disconnectedCallback(): void {
    disconnectBodyLayer(this);
    super.disconnectedCallback();
  }
}
