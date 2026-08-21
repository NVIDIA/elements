// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { property } from 'lit/decorators/property.js';
import { useStyles } from '@nvidia-elements/core/internal';
import { MarkerLayerElement } from '../internal/markers/layer-element.js';
import {
  connectModelLayer,
  disconnectModelLayer,
  registerModelLayer,
  setModelLayerParts
} from '../internal/model/layer-state.js';
import { MARKER } from '../internal/layouts/built-ins.js';
import type { ModelPart } from '../internal/model/compile.js';
import styles from './model.css?inline';

/**
 * @element nve-scene-model
 * @description One compound mesh composed from primitive parts and placed by marker instances.
 * @slot - Contains direct scene part and scene marker children.
 * @since 0.0.0
 * @entrypoint \@nvidia-elements/scene/model
 * @stable false
 */
export class SceneModel extends MarkerLayerElement {
  static styles = useStyles([styles]);
  static readonly layout = MARKER;
  static readonly metadata = { tag: 'nve-scene-model', version: '0.0.0' };

  #parts: ModelPart[] | null = null;

  /**
   * Bulk primitive geometry. A non-null value takes precedence over part children.
   * The setter snapshots assigned arrays and nested tuples immediately, so later in-place
   * edits take effect only after reassigning `parts` again, even with the same array.
   * Part edits rebuild geometry; use markers or frames for per-frame movement.
   */
  @property({ attribute: false })
  get parts(): ModelPart[] | null {
    return this.#parts;
  }

  set parts(value: ModelPart[] | null) {
    const previous = this.#parts;
    setModelLayerParts(this, value);
    this.#parts = value;
    this.requestUpdate('parts', previous);
  }

  constructor() {
    super('cube');
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
