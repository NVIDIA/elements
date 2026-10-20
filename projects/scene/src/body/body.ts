// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { property } from 'lit/decorators/property.js';
import { isServer } from 'lit';
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
import { BodyAssetLoader } from '../internal/layers/body/asset-loader.js';
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
 * @description One rigid compound of shapes, assigned geometry, or a geometry file, placed by source records.
 * @slot - Contains direct scene shape children that define body geometry.
 * @since 0.0.0
 * @entrypoint \@nvidia-elements/scene/body
 * @stable false
 */
export class SceneBody extends MarkerLayerElement<BodyInstanceSource, MarkerInit> {
  static styles = useStyles([styles]);
  static readonly layout = MARKER;
  static readonly metadata = { tag: 'nve-scene-body', version: '0.0.0' };

  #tint = '#ffffff';
  readonly #loader = new BodyAssetLoader(this);

  /** Geometry file URL. The extension selects a lazy decoder; the fragment selects a sub-asset. */
  @property({
    type: String,
    reflect: true,
    converter: { fromAttribute: (value: string | null) => value ?? '', toAttribute: (value: string) => value || null }
  })
  get src(): string {
    return this.#loader.src;
  }

  set src(value: string) {
    this.#loader.src = value;
  }

  /** Current request; resolves after geometry capture, before GPU presentation. */
  get loadComplete(): Promise<void> {
    return this.#loader.loadComplete;
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
   * Current resolved body nodes from direct assignment, file decoding, or shape children.
   * Assignment captures arrays and transforms, cancels loading, and clears src.
   * In-place edits take effect only after reassignment. Null restores shape children.
   * Use source records or frames for per-frame movement instead of rebuilding geometry.
   */
  @property({ attribute: false })
  get geometry(): SceneBodyGeometry | null {
    return getBodyLayerGeometry(this);
  }

  set geometry(value: SceneBodyGeometry | null) {
    const previous = this.geometry;
    setBodyLayerGeometry(this, value);
    this.#loader.geometryAssigned();
    this.requestUpdate('geometry', previous);
  }

  constructor() {
    super('cube', { create: records => new MarkerBuffer({ records }), kind: 'marker' });
    registerElementFeatureId(this);
    registerBodyLayer(this);
  }

  override connectedCallback(): void {
    super.connectedCallback();
    connectBodyLayer(this);
    this.#loader.connect();
  }

  override disconnectedCallback(): void {
    this.#loader.disconnect();
    disconnectBodyLayer(this);
    super.disconnectedCallback();
  }
}
