// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, LitElement, type PropertyValues } from 'lit';
import { property } from 'lit/decorators/property.js';
import { useStyles } from '@nvidia-elements/core/internal';
import { LINE_VERTEX } from '../internal/layouts/built-ins.js';
import {
  reconcileStreamingLayerChildren,
  registerStreamingLayer,
  setStreamingLayerCount,
  setStreamingLayerSource
} from '../internal/streaming-layer-state.js';
import { AXES_VERTEX_COUNT, createAxesVertices, type SceneAxesDirection } from './utils.js';
import { createLineVertexSource } from '../internal/external-record-sources.js';
import { createPositiveFiniteNumberConverter } from '../internal/utils/converters.js';
import styles from '../internal/styles/host.css?inline';

const DEFAULT_LENGTH = 1;
const DEFAULT_DIRECTION: SceneAxesDirection = 'positive';
const DEFAULT_WIDTH = 2;

/**
 * @element nve-scene-axes
 * @description Renders the local X, Y, and Z basis as fixed-color reference lines.
 * @since 0.0.0
 * @entrypoint \@nvidia-elements/scene/axes
 * @stable false
 */
export class SceneAxes extends LitElement {
  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'nve-scene-axes',
    version: '0.0.0'
  };

  /** Chooses whether each axis extends positively or in both signed directions. */
  @property({
    converter: {
      fromAttribute: (value: unknown) => {
        return value === 'bidirectional' ? value : DEFAULT_DIRECTION;
      }
    }
  })
  direction: SceneAxesDirection = DEFAULT_DIRECTION;

  /** World-unit length from the origin to each rendered axis endpoint. */
  @property({ converter: createPositiveFiniteNumberConverter(DEFAULT_LENGTH) }) length = DEFAULT_LENGTH;

  /** Screen-space line width in CSS pixels. */
  @property({ converter: createPositiveFiniteNumberConverter(DEFAULT_WIDTH) }) width = DEFAULT_WIDTH;

  constructor() {
    super();
    registerStreamingLayer(this, {
      kind: 'line',
      layout: LINE_VERTEX,
      pickable: false,
      topology: 'segments',
      widthUnit: 'pixel'
    });
    this.#replaceVertices();
  }

  render() {
    return html`<slot hidden @slotchange=${this.#handleSlotChange}></slot>`;
  }

  protected override willUpdate(changed: PropertyValues<this>): void {
    if (changed.has('direction') || changed.has('length') || changed.has('width')) {
      this.#replaceVertices();
    }
  }

  #replaceVertices(): void {
    const bytes = createAxesVertices({ direction: this.direction, length: this.length, width: this.width });
    const source = createLineVertexSource({ bytes, count: AXES_VERTEX_COUNT });
    setStreamingLayerSource(this, source);
    setStreamingLayerCount(this, AXES_VERTEX_COUNT);
  }

  #handleSlotChange(): void {
    reconcileStreamingLayerChildren(this);
  }
}
