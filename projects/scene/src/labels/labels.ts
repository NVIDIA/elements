// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import { useStyles } from '@nvidia-elements/core/internal';
import {
  connectLabelLayer,
  disconnectLabelLayer,
  getLabelLayerCount,
  getLabelLayerSource,
  publishLabelLayer,
  registerLabelLayer,
  setLabelLayerCount,
  setLabelLayerSource
} from '../internal/labels/layer-state.js';
import { normalizeLabelScaleUnit, type LabelScaleUnit } from '../internal/labels/data.js';
import { LABEL } from '../internal/layouts/built-ins.js';
import { notifyOwningScene } from '../internal/scene/notifications.js';
import type { LabelSource } from '../internal/labels/buffer.js';
import type { SceneInteractionTarget } from '../internal/interaction.js';
import type { ScenePublishOptions } from '../internal/packed-record-source.js';
import {
  getLayerFeatureIds,
  getLayerInteractive,
  registerFeatureIdentifiedLayer,
  setLayerFeatureIds,
  setLayerInteractive
} from '../internal/interactive-layer-state.js';
import type { SceneFeatureIds } from '../internal/feature-ids.js';
import styles from '../internal/host.css?inline';

const scaleUnitConverter = { fromAttribute: normalizeLabelScaleUnit };

/**
 * @element nve-scene-labels
 * @description Renders streamed, camera-facing SDF text labels in 3D space.
 * @since 0.0.0
 * @entrypoint \@nvidia-elements/scene/labels
 * @event {ScenePickHit} nve-scene-click - Dispatched when pointer activation resolves to this layer.
 * @event {ScenePickHit} nve-scene-pointerenter - Dispatched when the pointer enters this layer.
 * @event {ScenePickHit} nve-scene-pointerleave - Dispatched when the pointer leaves this layer.
 * @stable false
 */
export class SceneLabels extends LitElement implements SceneInteractionTarget {
  #scaleUnit: LabelScaleUnit = 'pixel';

  static styles = useStyles([styles]);

  static readonly layout = LABEL;

  static readonly metadata = {
    tag: 'nve-scene-labels',
    version: '0.0.0'
  };

  constructor() {
    super();
    registerFeatureIdentifiedLayer(this);
    registerLabelLayer(this);
  }

  /** Stable uint32 identities for labels resolved by picking. */
  @property({ attribute: false })
  get featureIds(): SceneFeatureIds | null {
    return getLayerFeatureIds(this);
  }

  set featureIds(value: SceneFeatureIds | null) {
    setLayerFeatureIds(this, value);
  }

  /** Enables automatic pointer hit testing and routed interaction events for this layer. */
  @property({ type: Boolean })
  get interactive(): boolean {
    return getLayerInteractive(this);
  }

  set interactive(value: boolean) {
    setLayerInteractive(this, value);
  }

  /** Replaces the label records or renders nothing when null. */
  get source(): LabelSource | null {
    return getLabelLayerSource(this);
  }

  set source(value: LabelSource | null) {
    setLabelLayerSource(this, value);
  }

  /** Limits how many records render; undefined renders the complete source. */
  get countLimit(): number | undefined {
    return getLabelLayerCount(this);
  }

  set countLimit(value: number | undefined) {
    setLabelLayerCount(this, value);
  }

  /** Unit used by each record's scale. Defaults to CSS pixels. */
  @property({ attribute: 'scale-unit', converter: scaleUnitConverter })
  get scaleUnit(): LabelScaleUnit {
    return this.#scaleUnit;
  }

  set scaleUnit(value: LabelScaleUnit) {
    const previous = this.#scaleUnit;
    const next = normalizeLabelScaleUnit(value);
    if (next === previous) return;
    this.#scaleUnit = next;
    this.requestUpdate('scaleUnit', previous);
  }

  /** Captures changed records and publishes the selected active source prefix to this layer. */
  publish(options?: ScenePublishOptions): void {
    publishLabelLayer(this, options);
  }

  render() {
    return html`<slot></slot>`;
  }

  protected override updated(): void {
    notifyOwningScene(this);
  }

  override connectedCallback(): void {
    super.connectedCallback();
    connectLabelLayer(this);
  }

  override disconnectedCallback(): void {
    disconnectLabelLayer(this);
    super.disconnectedCallback();
  }
}
