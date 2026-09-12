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
import { AXES_VERTEX_COUNT, createAxesVertices, type SceneAxesDirection } from './utils.js';
import { createLineVertexSource } from '../internal/external-record-sources.js';
import styles from '../internal/host.css?inline';

const DEFAULT_LENGTH = 1;
const DEFAULT_DIRECTION: SceneAxesDirection = 'positive';
const DEFAULT_WIDTH = 2;

const positiveFiniteNumberConverter = (fallback: number) => ({
  fromAttribute(value: string | null): number {
    const parsed = value === null ? fallback : Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  }
});

const directionConverter = {
  fromAttribute: normalizeDirection
};

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

  #direction: SceneAxesDirection = DEFAULT_DIRECTION;
  #length = DEFAULT_LENGTH;
  #width = DEFAULT_WIDTH;

  /** Chooses whether each axis extends positively or in both signed directions. */
  @property({ converter: directionConverter, reflect: true })
  get direction(): SceneAxesDirection {
    return this.#direction;
  }

  set direction(value: SceneAxesDirection) {
    const next = normalizeDirection(value);
    const previous = this.#direction;
    if (next !== previous) {
      this.#direction = next;
      this.requestUpdate('direction', previous);
    }
  }

  /** World-unit length from the origin to each rendered axis endpoint. */
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
    if (name === 'direction') {
      this.#normalizeReflectedAttribute('direction', this.direction);
    } else if (name === 'length') {
      this.#normalizeReflectedAttribute('length', this.length);
    } else if (name === 'width') {
      this.#normalizeReflectedAttribute('width', this.width);
    }
  }

  protected override willUpdate(changed: PropertyValues<this>): void {
    if (changed.has('direction') || changed.has('length') || changed.has('width')) {
      this.#replaceVertices();
    }
  }

  protected override updated(): void {
    this.#normalizeReflectedAttribute('direction', this.direction);
    this.#normalizeReflectedAttribute('length', this.length);
    this.#normalizeReflectedAttribute('width', this.width);
  }

  #replaceVertices(): void {
    const bytes = createAxesVertices({ direction: this.direction, length: this.length, width: this.width });
    const source = createLineVertexSource({ bytes, count: AXES_VERTEX_COUNT });
    setStreamingLayerSource(this, source);
    setStreamingLayerCount(this, AXES_VERTEX_COUNT);
  }

  #normalizeReflectedAttribute(name: 'direction' | 'length' | 'width', value: number | string): void {
    const serialized = String(value);
    if (this.getAttribute(name) !== serialized) {
      this.setAttribute(name, serialized);
    }
  }
}

function normalizePositiveFiniteNumber(value: number, fallback: number): number {
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function normalizeDirection(value: unknown): SceneAxesDirection {
  return value === 'bidirectional' ? value : DEFAULT_DIRECTION;
}
