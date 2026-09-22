// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import { useStyles } from '@nvidia-elements/core/internal';
import {
  getLabelLayerCount,
  getLabelLayerSource,
  publishLabelLayer,
  reconcileLabelLayerChildren,
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
  getLayerInteractive,
  registerInteractiveLayer,
  setLayerInteractive
} from '../internal/interactive-layer-state.js';
import styles from '../internal/styles/host.css?inline';

const scaleUnitConverter = { fromAttribute: normalizeLabelScaleUnit };

/**
 * @element nve-scene-labels
 * @description Renders streamed, camera-facing SDF text labels in 3D space.
 * @since 0.0.0
 * @entrypoint \@nvidia-elements/scene/labels
 * @event {SceneClick} nve-scene-click - Dispatched when pointer activation resolves to this layer.
 * @event {ScenePointerEnter} nve-scene-pointerenter - Dispatched when the pointer enters this layer.
 * @event {ScenePointerLeave} nve-scene-pointerleave - Dispatched when the pointer leaves this layer.
 * @stable false
 */
export class SceneLabels extends LitElement implements SceneInteractionTarget {
  static styles = useStyles([styles]);

  static readonly layout = LABEL;

  static readonly metadata = {
    tag: 'nve-scene-labels',
    version: '0.0.0'
  };

  constructor() {
    super();
    registerInteractiveLayer(this);
    registerLabelLayer(this);
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
    return getLabelLayerSource(this) as LabelSource | null;
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
  scaleUnit: LabelScaleUnit = 'pixel';

  /** Captures changed records and publishes the selected active source prefix to this layer. */
  publish(options?: ScenePublishOptions): void {
    publishLabelLayer(this, options);
  }

  render() {
    return html`<slot @slotchange=${this.#handleSlotChange}></slot>`;
  }

  protected override updated(): void {
    notifyOwningScene(this);
  }

  #handleSlotChange(): void {
    reconcileLabelLayerChildren(this);
  }
}
