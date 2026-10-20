// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, LitElement, type TemplateResult } from 'lit';
import { property } from 'lit/decorators/property.js';
import { getFrameReference, setFrameReference } from '../internal/composition/frame/state.js';
import { useStyles } from '@nvidia-elements/core/internal';
import {
  getLabelLayerCount,
  getLabelLayerSource,
  publishLabelLayer,
  reconcileLabelLayerChildren,
  registerLabelLayer,
  setLabelLayerCount,
  setLabelLayerSource
} from '../internal/layers/labels/layer-state.js';
import { normalizeLabelScaleUnit, type LabelScaleUnit } from '../internal/layers/labels/data.js';
import { LABEL } from '../internal/records/layouts/built-ins.js';
import { notifyOwningScene } from '../internal/composition/scene/notifications.js';
import type { LabelSource } from '../internal/layers/labels/buffer.js';
import type { SceneInteractionTarget } from '../internal/interaction/target.js';
import type { ScenePublishOptions } from '../internal/records/packed-record-source.js';
import {
  getLayerInteractive,
  registerInteractiveLayer,
  setLayerInteractive
} from '../internal/interaction/layer-state.js';
import styles from '../internal/dom/host.css?inline';

const scaleUnitConverter = { fromAttribute: normalizeLabelScaleUnit };

/**
 * @element nve-scene-labels
 * @description Renders streamed, camera-facing SDF text labels in 3D space.
 * Depth-tested signed-distance-field glyphs use a built-in printable ASCII atlas and a
 * replacement glyph for unsupported characters. Records are visual annotations, not
 * individual DOM or keyboard targets. Provide an accessible name and fallback content on
 * the owning scene when labels convey required information. Enable interactive for
 * glyph-aware picking; transparent pixels around and inside glyphs do not produce hits.
 * @since 0.0.0
 * @entrypoint \@nvidia-elements/scene/labels
 * @event {SceneClick} nve-scene-click - Dispatched when pointer activation resolves to this layer.
 * @event {ScenePointerEnter} nve-scene-pointerenter - Dispatched when the pointer enters this layer.
 * @event {ScenePointerLeave} nve-scene-pointerleave - Dispatched when the pointer leaves this layer.
 * @stable false
 */
export class SceneLabels extends LitElement implements SceneInteractionTarget {
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

  /**
   * Enables automatic pointer hit testing and routed interaction events; default false.
   * Picking follows visible glyph coverage. Assign application identities through
   * source.featureIds on the LabelBuffer, then publish() to capture changes.
   */
  @property({ type: Boolean })
  get interactive(): boolean {
    return getLayerInteractive(this);
  }

  set interactive(value: boolean) {
    setLayerInteractive(this, value);
  }

  /**
   * LabelBuffer containing text, position, scale, and color, or a compatible external
   * packed source. Null renders nothing. Update record handles and call publish() to
   * capture changed numeric records. Each consumer owns its published snapshot.
   */
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

  /**
   * Unit used by every record's scale. Default pixel keeps stable CSS-pixel height as
   * the camera moves. Use world to size labels in scene units.
   */
  @property({ attribute: 'scale-unit', converter: scaleUnitConverter })
  scaleUnit: LabelScaleUnit = 'pixel';

  /**
   * Synchronously captures changed records and the selected active prefix for this layer.
   * start and count select records, not bytes; activeCount chooses the complete prefix.
   * Without options, uses the buffer's count. Other consumers of the same source remain
   * unchanged until they publish; recovery restores this layer's last captured state.
   */
  publish(options?: ScenePublishOptions): void {
    publishLabelLayer(this, options);
  }

  render(): TemplateResult<1> {
    return html`<slot @slotchange=${this.#handleSlotChange}></slot>`;
  }

  protected override updated(): void {
    notifyOwningScene(this);
  }

  #handleSlotChange(): void {
    reconcileLabelLayerChildren(this);
  }
}
