// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { LitElement, nothing, type PropertyValues } from 'lit';
import { property } from 'lit/decorators/property.js';
import { useStyles } from '@nvidia-elements/core/internal';
import { parseCSSColor } from '../internal/color.js';
import type { RGBA } from '../internal/types.js';
import { createGridVertices, gridVertexCount, MAX_GRID_COUNT } from './utils.js';
import {
  connectStreamingLayer,
  disconnectStreamingLayer,
  registerStreamingLayer,
  setStreamingLayerCount,
  setStreamingLayerSource
} from '../internal/streaming-layer-state.js';
import { LINE_VERTEX } from '../internal/layouts/built-ins.js';
import styles from './gridlines.css?inline';

const DEFAULT_SPACING = 1;
const DEFAULT_COUNT = 10;
const DEFAULT_COLOR = '#a2a2a2';
const DEFAULT_RGBA: RGBA = [162 / 255, 162 / 255, 162 / 255, 1];
const DEFAULT_WIDTH = 1;

const positiveFiniteNumberConverter = (fallback: number) => ({
  fromAttribute(value: string | null): number {
    return normalizeNumber(value === null ? fallback : Number(value), fallback);
  }
});

const countConverter = {
  fromAttribute(value: string | null): number {
    return normalizeCount(value === null ? DEFAULT_COUNT : Number(value));
  }
};

const colorConverter = {
  fromAttribute(value: string | null): string {
    return normalizeColor(value ?? DEFAULT_COLOR).source;
  }
};

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
  #color = DEFAULT_COLOR;
  #rgba = DEFAULT_RGBA;
  #width = DEFAULT_WIDTH;

  /** World-unit distance between adjacent grid lines. */
  @property({ converter: positiveFiniteNumberConverter(DEFAULT_SPACING), reflect: true })
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
  @property({ converter: countConverter, reflect: true })
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
  @property({ converter: colorConverter, reflect: true })
  get color(): string {
    return this.#color;
  }

  set color(value: string) {
    const next = normalizeColor(value);
    const previous = this.#color;
    if (next.source !== previous) {
      this.#color = next.source;
      this.#rgba = next.rgba;
      this.requestUpdate('color', previous);
    }
  }

  /** Screen-space line width in CSS pixels. */
  @property({ converter: positiveFiniteNumberConverter(DEFAULT_WIDTH), reflect: true })
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
      allowChildren: false,
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
    return nothing;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    connectStreamingLayer(this);
  }

  override disconnectedCallback(): void {
    disconnectStreamingLayer(this);
    super.disconnectedCallback();
  }

  override attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    super.attributeChangedCallback(name, oldValue, newValue);
    if (name === 'spacing') this.#normalizeReflectedAttribute('spacing', this.spacing);
    else if (name === 'count') this.#normalizeReflectedAttribute('count', this.count);
    else if (name === 'color') this.#normalizeReflectedAttribute('color', this.color);
    else if (name === 'width') this.#normalizeReflectedAttribute('width', this.width);
  }

  protected override willUpdate(changed: PropertyValues<this>): void {
    if (changed.has('spacing') || changed.has('count') || changed.has('color') || changed.has('width')) {
      this.#replaceVertices();
    }
  }

  protected override updated(): void {
    this.#normalizeReflectedAttribute('spacing', this.spacing);
    this.#normalizeReflectedAttribute('count', this.count);
    this.#normalizeReflectedAttribute('color', this.color);
    this.#normalizeReflectedAttribute('width', this.width);
  }

  #replaceVertices(): void {
    setStreamingLayerSource(
      this,
      createGridVertices({ color: this.#rgba, count: this.count, spacing: this.spacing, width: this.width })
    );
    setStreamingLayerCount(this, gridVertexCount(this.count));
  }

  #normalizeReflectedAttribute(name: 'spacing' | 'count' | 'color' | 'width', value: string | number): void {
    const serialized = String(value);
    if (this.getAttribute(name) !== serialized) this.setAttribute(name, serialized);
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

function normalizeColor(value: string): { readonly source: string; readonly rgba: RGBA } {
  const rgba = parseCSSColor(value);
  return rgba ? { rgba, source: value } : { rgba: DEFAULT_RGBA, source: DEFAULT_COLOR };
}
