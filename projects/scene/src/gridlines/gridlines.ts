// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, LitElement, type PropertyValues } from 'lit';
import { property } from 'lit/decorators/property.js';
import { useStyles } from '@nvidia-elements/core/internal';
import { createCSSColorConverter, normalizeCSSColor, type CSSColor } from '../internal/utils/color.js';
import { createGridVertices, gridVertexCount, MAX_GRID_COUNT } from './utils.js';
import {
  reconcileStreamingLayerChildren,
  registerStreamingLayer,
  setStreamingLayerCount,
  setStreamingLayerSource
} from '../internal/streaming-layer-state.js';
import { LINE_VERTEX } from '../internal/layouts/built-ins.js';
import { createLineVertexSource } from '../internal/external-record-sources.js';
import { createPositiveFiniteNumberConverter } from '../internal/utils/converters.js';
import styles from '../internal/styles/host.css?inline';

const DEFAULT_SPACING = 1;
const DEFAULT_COUNT = 10;
const DEFAULT_COLOR = {
  rgba: [162 / 255, 162 / 255, 162 / 255, 1],
  source: '#a2a2a2'
} satisfies CSSColor;
const DEFAULT_WIDTH = 1;

const countConverter = {
  fromAttribute(value: string | null): number {
    return normalizeCount(value === null ? DEFAULT_COUNT : Number(value));
  }
};

const colorConverter = createCSSColorConverter(DEFAULT_COLOR);

/**
 * @element nve-scene-gridlines
 * @description Renders a finite, frame-local reference grid on Z = 0.
 * @since 0.0.0
 * @entrypoint \@nvidia-elements/scene/gridlines
 * @stable false
 */
export class SceneGridlines extends LitElement {
  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'nve-scene-gridlines',
    version: '0.0.0'
  };

  #spacing = DEFAULT_SPACING;
  #count = DEFAULT_COUNT;
  #color = DEFAULT_COLOR.source;
  #rgba = DEFAULT_COLOR.rgba;
  #width = DEFAULT_WIDTH;

  /** World-unit distance between adjacent grid lines. */
  @property({ converter: createPositiveFiniteNumberConverter(DEFAULT_SPACING) })
  get spacing(): number {
    return this.#spacing;
  }

  set spacing(value: number) {
    const next = normalizeSpacing(value);
    const previous = this.#spacing;
    if (next !== previous) {
      this.#spacing = next;
      this.requestUpdate('spacing', previous);
    }
  }

  /** Number of cells from the origin to each grid edge. */
  @property({ converter: countConverter })
  get count(): number {
    return this.#count;
  }

  set count(value: number) {
    const next = normalizeCount(value);
    const previous = this.#count;
    if (next !== previous) {
      this.#count = next;
      this.requestUpdate('count', previous);
    }
  }

  /** CSS color used for every reference-grid segment. */
  @property({ converter: colorConverter })
  get color(): string {
    return this.#color;
  }

  set color(value: string) {
    const next = normalizeCSSColor(value, DEFAULT_COLOR);
    const previous = this.#color;
    if (next.source !== previous) {
      this.#color = next.source;
      this.#rgba = next.rgba;
      this.requestUpdate('color', previous);
    }
  }

  /** Screen-space line width in CSS pixels. */
  @property({ converter: createPositiveFiniteNumberConverter(DEFAULT_WIDTH) })
  get width(): number {
    return this.#width;
  }

  set width(value: number) {
    const next = normalizeNumber(value, DEFAULT_WIDTH);
    const previous = this.#width;
    if (next !== previous) {
      this.#width = next;
      this.requestUpdate('width', previous);
    }
  }

  constructor() {
    super();
    registerStreamingLayer(this, {
      depthBias: true,
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
    if (changed.has('spacing') || changed.has('count') || changed.has('color') || changed.has('width')) {
      this.#replaceVertices();
    }
  }

  #replaceVertices(): void {
    const count = gridVertexCount(this.count);
    const bytes = createGridVertices({
      color: this.#rgba,
      count: this.count,
      spacing: this.spacing,
      width: this.width
    });
    const source = createLineVertexSource({ bytes, count });
    setStreamingLayerSource(this, source);
    setStreamingLayerCount(this, count);
  }

  #handleSlotChange(): void {
    reconcileStreamingLayerChildren(this);
  }
}

function normalizeSpacing(value: number): number {
  return Number.isFinite(value) && value > 0 && value <= Number.MAX_VALUE / MAX_GRID_COUNT ? value : DEFAULT_SPACING;
}

function normalizeNumber(value: number, fallback: number): number {
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function normalizeCount(value: number): number {
  return Number.isSafeInteger(value) && value >= 1 && value <= MAX_GRID_COUNT ? value : DEFAULT_COUNT;
}
