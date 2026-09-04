// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useStyles } from '@nvidia-elements/core/internal';
import { property } from 'lit/decorators/property.js';
import { parseCSSColor } from '../internal/color.js';
import { MARKER } from '../internal/layouts/built-ins.js';
import { MarkerLayerElement } from '../internal/markers/layer-element.js';
import {
  registerPolygonLayer,
  setPolygonLayerColor,
  setPolygonLayerGeometry
} from '../internal/polygon/layer-state.js';
import type { PolygonGeometry } from '../internal/polygon/types.js';
import type { RGBA } from '../internal/types.js';
import styles from './polygon.css?inline';

const DEFAULT_COLOR = '#ffffff';
const DEFAULT_RGBA: RGBA = [1, 1, 1, 1];

const colorConverter = {
  fromAttribute(value: string | null): string {
    return normalizeColor(value ?? DEFAULT_COLOR).source;
  }
};

/**
 * @element nve-scene-polygon
 * @description An unlit, frame-local polygon surface with optional holes and marker instancing.
 * @since 0.0.0
 * @entrypoint \@nvidia-elements/scene/polygon
 * @slot - Contains direct nve-scene-marker children.
 * @stable false
 */
export class ScenePolygon extends MarkerLayerElement {
  static styles = useStyles([styles]);
  static readonly layout = MARKER;
  static readonly metadata = { tag: 'nve-scene-polygon', version: '0.0.0' };

  #color = DEFAULT_COLOR;
  #geometry: PolygonGeometry | undefined;

  /** Atomic outer boundary and optional hole rings, rendered in local xy at z zero. */
  @property({ type: Object })
  get geometry(): PolygonGeometry | undefined {
    return this.#geometry;
  }

  set geometry(value: PolygonGeometry | null | undefined) {
    const previous = this.#geometry;
    this.#geometry = value ?? undefined;
    setPolygonLayerGeometry(this, value);
    this.requestUpdate('geometry', previous);
  }

  /** CSS base color multiplied by each marker tint. */
  @property({ converter: colorConverter, reflect: true })
  get color(): string {
    return this.#color;
  }

  set color(value: string) {
    const next = normalizeColor(value);
    const previous = this.#color;
    if (next.source === previous) return;
    this.#color = next.source;
    setPolygonLayerColor(this, next.source);
    this.requestUpdate('color', previous);
  }

  constructor() {
    super('cube');
    registerPolygonLayer(this, DEFAULT_RGBA);
  }

  override attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    super.attributeChangedCallback(name, oldValue, newValue);
    if (name === 'color') this.#normalizeColorAttribute();
  }

  protected override updated(): void {
    this.#normalizeColorAttribute();
  }

  #normalizeColorAttribute(): void {
    if (this.hasAttribute('color') && this.getAttribute('color') !== this.color) this.setAttribute('color', this.color);
  }
}

function normalizeColor(value: string): { readonly rgba: RGBA; readonly source: string } {
  const rgba = parseCSSColor(value);
  return rgba ? { rgba, source: value } : { rgba: DEFAULT_RGBA, source: DEFAULT_COLOR };
}
