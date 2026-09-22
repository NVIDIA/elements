// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { property } from 'lit/decorators/property.js';
import { useStyles } from '@nvidia-elements/core/internal';
import { MarkerLayerElement } from '../internal/markers/layer-element.js';
import { MarkerBuffer, type MarkerInit, type MarkerSource } from '../internal/markers/buffer.js';
import {
  connectModelLayer,
  disconnectModelLayer,
  registerModelLayer,
  setModelLayerParts
} from '../internal/model/layer-state.js';
import { MARKER } from '../internal/layouts/built-ins.js';
import type { ModelPart } from '../internal/model/compile.js';
import {
  getElementFeatureId,
  registerElementFeatureId,
  sceneFeatureIdConverter,
  setElementFeatureId
} from '../internal/element-feature-id.js';
import styles from '../internal/styles/host.css?inline';

export type ModelInstanceSource = MarkerSource;

/**
 * @element nve-scene-model
 * @description One compound mesh composed from primitive parts and placed by source records.
 * @slot - Contains direct scene part children that define model geometry.
 * @since 0.0.0
 * @entrypoint \@nvidia-elements/scene/model
 * @stable false
 */
export class SceneModel extends MarkerLayerElement<ModelInstanceSource, MarkerInit> {
  static styles = useStyles([styles]);
  static readonly layout = MARKER;
  static readonly metadata = { tag: 'nve-scene-model', version: '0.0.0' };

  #parts: readonly ModelPart[] | null = null;

  /** Stable application identity returned when picking the uninstanced model. */
  @property({ attribute: 'feature-id', converter: sceneFeatureIdConverter })
  get featureId(): number | undefined {
    return getElementFeatureId(this);
  }

  set featureId(value: number | undefined) {
    setElementFeatureId(this, value);
  }

  /**
   * Bulk primitive geometry. A non-null value takes precedence over part children.
   * The setter snapshots assigned arrays and nested tuples immediately, so later in-place
   * edits take effect only after reassigning `parts` again, even with the same array.
   * Part edits rebuild geometry; use source records or frames for per-frame movement.
   */
  @property({ attribute: false })
  get parts(): readonly ModelPart[] | null {
    return this.#parts;
  }

  set parts(value: readonly ModelPart[] | null) {
    const previous = this.#parts;
    setModelLayerParts(this, value);
    this.#parts = value;
    this.requestUpdate('parts', previous);
  }

  constructor() {
    super('cube', { create: records => new MarkerBuffer({ records }), kind: 'marker' });
    registerElementFeatureId(this);
    registerModelLayer(this);
  }

  override connectedCallback(): void {
    super.connectedCallback();
    connectModelLayer(this);
  }

  override disconnectedCallback(): void {
    disconnectModelLayer(this);
    super.disconnectedCallback();
  }
}
