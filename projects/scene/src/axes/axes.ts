// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { LitElement, nothing, type PropertyValues } from 'lit';
import { property } from 'lit/decorators/property.js';
import { useStyles } from '@nvidia-elements/core/internal';
import { LINE_VERTEX } from '../internal/layouts/built-ins.js';
import {
  connectStreamingLayer,
  disconnectStreamingLayer,
  registerStreamingLayer,
  setStreamingLayerCount,
  setStreamingLayerSource
} from '../internal/streaming-layer-state.js';
import { AXES_VERTEX_COUNT, createAxesVertices } from './utils.js';
import styles from './axes.css?inline';

const DEFAULT_LENGTH = 1;
const DEFAULT_WIDTH = 2;

const positiveFiniteNumberConverter = (fallback: number) => ({
  fromAttribute(value: string | null): number {
    const parsed = value === null ? fallback : Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  }
});

/**
 * @element nve-scene-axes
 * @description Renders the local positive X, Y, and Z basis as fixed-color reference lines.
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

  #length = DEFAULT_LENGTH;
  #width = DEFAULT_WIDTH;

  /** World-unit length of each positive axis segment. */
  @property({ converter: positiveFiniteNumberConverter(DEFAULT_LENGTH), reflect: true })
  get length(): number {
    return this.#length;
  }

  set length(value: number) {
    const next = normalizePositiveFiniteNumber(value, DEFAULT_LENGTH);
    const previous = this.#length;
    if (next !== previous) {
      this.#length = next;
      this.requestUpdate('length', previous);
    }
  }

  /** Screen-space line width in CSS pixels. */
  @property({ converter: positiveFiniteNumberConverter(DEFAULT_WIDTH), reflect: true })
  get width(): number {
    return this.#width;
  }

  set width(value: number) {
    const next = normalizePositiveFiniteNumber(value, DEFAULT_WIDTH);
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
    if (name === 'length') {
      this.#normalizeReflectedAttribute('length', this.length);
    } else if (name === 'width') {
      this.#normalizeReflectedAttribute('width', this.width);
    }
  }

  protected override willUpdate(changed: PropertyValues<this>): void {
    if (changed.has('length') || changed.has('width')) {
      this.#replaceVertices();
    }
  }

  protected override updated(): void {
    this.#normalizeReflectedAttribute('length', this.length);
    this.#normalizeReflectedAttribute('width', this.width);
  }

  #replaceVertices(): void {
    setStreamingLayerSource(this, createAxesVertices(this.length, this.width));
    setStreamingLayerCount(this, AXES_VERTEX_COUNT);
  }

  #normalizeReflectedAttribute(name: 'length' | 'width', value: number): void {
    const serialized = String(value);
    if (this.getAttribute(name) !== serialized) {
      this.setAttribute(name, serialized);
    }
  }
}

function normalizePositiveFiniteNumber(value: number, fallback: number): number {
  return Number.isFinite(value) && value > 0 ? value : fallback;
}
