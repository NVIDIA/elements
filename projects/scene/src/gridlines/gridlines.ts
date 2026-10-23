// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, LitElement, type PropertyValues, type TemplateResult } from 'lit';
import { property } from 'lit/decorators/property.js';
import { getFrameReference, setFrameReference } from '../internal/composition/frame/state.js';
import { positiveFiniteOr, useStyles } from '@nvidia-elements/core/internal';
import { parseCSSColor } from '../internal/color/color.js';
import { sameRGBA } from '../internal/color/rgba.js';
import type { RGBA } from '../internal/color/types.js';
import { scenePlatform } from '../internal/gpu/platform.js';
import { createCheckerboardVertices, createGridVertices, gridVertexCount, MAX_GRID_COUNT } from './utils.js';
import { registerGridlinesStyleSampler, setGridlinesCheckerboard } from '../internal/layers/gridlines.js';
import {
  reconcileStreamingLayerChildren,
  registerStreamingLayer,
  setStreamingLayerCount,
  setStreamingLayerSource
} from '../internal/layers/streaming/layer-state.js';
import { LINE_VERTEX } from '../internal/records/layouts/built-ins.js';
import { createLineVertexSource } from '../internal/layers/sources/external-record-sources.js';
import { createPositiveFiniteNumberConverter } from '../internal/dom/attribute-converters.js';
import hostStyles from '../internal/dom/host.css?inline';
import styles from './gridlines.css?inline';

const DEFAULT_SPACING = 1;
const DEFAULT_COUNT = 10;
const DEFAULT_COLOR: RGBA = [162 / 255, 162 / 255, 162 / 255, 1];
const DEFAULT_WIDTH = 1;
const DEFAULT_ALTERNATE_COLOR: RGBA = [240 / 255, 240 / 255, 240 / 255, 1];

const patternConverter = {
  fromAttribute(value: string | null): 'lines' | 'checkerboard' {
    return value === 'checkerboard' ? value : 'lines';
  }
};

const countConverter = {
  fromAttribute(value: string | null): number {
    return normalizeCount(value === null ? DEFAULT_COUNT : Number(value));
  }
};

/**
 * @element nve-scene-gridlines
 * @description Renders finite reference lines or checkerboard squares on frame-local Z = 0.
 * @since 0.0.0
 * @entrypoint \@nvidia-elements/scene/gridlines
 * @cssprop --color - Sets the line or primary square color. Defaults to the theme's border color.
 * @cssprop --alternate-color - Sets the alternate square color. Defaults to the theme's canvas background.
 * @stable false
 */
export class SceneGridlines extends LitElement {
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

  static styles = useStyles([hostStyles, styles]);

  static readonly metadata = {
    tag: 'nve-scene-gridlines',
    version: '0.0.0'
  };

  #spacing = DEFAULT_SPACING;
  #count = DEFAULT_COUNT;
  #rgba = DEFAULT_COLOR;
  #width = DEFAULT_WIDTH;
  #pattern: 'lines' | 'checkerboard' = 'lines';
  #alternateRGBA = DEFAULT_ALTERNATE_COLOR;
  #colorSource?: string;
  #alternateColorSource?: string;

  /** Reference-grid pattern. Checkerboards contain filled squares without line borders. */
  @property({ converter: patternConverter })
  get pattern(): 'lines' | 'checkerboard' {
    return this.#pattern;
  }

  set pattern(value: 'lines' | 'checkerboard') {
    const next = value === 'checkerboard' ? value : 'lines';
    const previous = this.#pattern;
    if (next !== previous) {
      this.#pattern = next;
      this.requestUpdate('pattern', previous);
    }
  }

  /** World-unit distance between grid lines or side length of one checkerboard square. */
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

  /** Screen-space line width in CSS pixels. Inactive for the checkerboard pattern. */
  @property({ converter: createPositiveFiniteNumberConverter(DEFAULT_WIDTH) })
  get width(): number {
    return this.#width;
  }

  set width(value: number) {
    const next = positiveFiniteOr(value, DEFAULT_WIDTH);
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
    registerGridlinesStyleSampler(this, this.#sampleColors);
    this.#replaceVertices();
  }

  render(): TemplateResult<1> {
    return html`<slot hidden @slotchange=${this.#handleSlotChange}></slot>`;
  }

  protected override updated(): void {
    this.#sampleColors();
  }

  protected override willUpdate(changed: PropertyValues<this>): void {
    if (
      changed.has('pattern') ||
      changed.has('spacing') ||
      changed.has('count') ||
      (this.pattern === 'lines' && changed.has('width'))
    ) {
      this.#replaceVertices();
    }
  }

  #sampleColors = (): void => {
    if (!this.hasUpdated) return;
    const computed = scenePlatform.getComputedStyle(this);
    const color = resolveGridColor(computed, '--color');
    const alternateColor =
      this.pattern === 'checkerboard' ? resolveGridColor(computed, '--alternate-color') : this.#alternateColorSource;
    if (color === this.#colorSource && alternateColor === this.#alternateColorSource) return;
    this.#colorSource = color;
    this.#alternateColorSource = alternateColor;
    const rgba = parseCSSColor(color) ?? DEFAULT_COLOR;
    const alternateRGBA = resolveAlternateColor(alternateColor);
    if (sameRGBA(this.#rgba, rgba) && sameRGBA(this.#alternateRGBA, alternateRGBA)) return;
    this.#rgba = rgba;
    this.#alternateRGBA = alternateRGBA;
    this.#replaceVertices();
  };

  #replaceVertices(): void {
    const checkerboard = this.pattern === 'checkerboard';
    const options = {
      alternateColor: this.#alternateRGBA,
      color: this.#rgba,
      count: this.count,
      spacing: this.spacing,
      width: this.width
    };
    const count = checkerboard ? 2 : gridVertexCount(this.count);
    const bytes = checkerboard ? createCheckerboardVertices(options) : createGridVertices(options);
    setGridlinesCheckerboard(this, checkerboard ? options : undefined);
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

function normalizeCount(value: number): number {
  return Number.isSafeInteger(value) && value >= 1 && value <= MAX_GRID_COUNT ? value : DEFAULT_COUNT;
}

function resolveAlternateColor(source: string | undefined): RGBA {
  return source === undefined ? DEFAULT_ALTERNATE_COLOR : (parseCSSColor(source) ?? DEFAULT_ALTERNATE_COLOR);
}

function resolveGridColor(computed: CSSStyleDeclaration, name: '--color' | '--alternate-color'): string {
  const source = computed.getPropertyValue(name).trim();
  return source.toLowerCase() === 'currentcolor' ? computed.color : source;
}
