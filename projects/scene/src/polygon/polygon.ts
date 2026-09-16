// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useStyles } from '@nvidia-elements/core/internal';
import { property } from 'lit/decorators/property.js';
import { createCSSColorConverter, normalizeCSSColor, type CSSColor } from '../internal/utils/color.js';
import { MARKER } from '../internal/layouts/built-ins.js';
import { MarkerLayerElement } from '../internal/markers/layer-element.js';
import { MarkerBuffer, type MarkerInit, type MarkerSource } from '../internal/markers/buffer.js';
import {
  registerPolygonLayer,
  setPolygonLayerColor,
  setPolygonLayerGeometry
} from '../internal/polygon/layer-state.js';
import type { PolygonGeometry } from '../internal/polygon/types.js';
import {
  getElementFeatureId,
  registerElementFeatureId,
  sceneFeatureIdConverter,
  setElementFeatureId
} from '../internal/element-feature-id.js';
import styles from '../internal/styles/host.css?inline';

const DEFAULT_COLOR = { rgba: [1, 1, 1, 1], source: '#ffffff' } satisfies CSSColor;

const colorConverter = createCSSColorConverter(DEFAULT_COLOR);

export type PolygonInstanceSource = MarkerSource;

/**
 * @element nve-scene-polygon
 * @description An unlit, frame-local polygon surface with optional holes and source-backed instancing.
 * @since 0.0.0
 * @entrypoint \@nvidia-elements/scene/polygon
 * @stable false
 */
export class ScenePolygon extends MarkerLayerElement<PolygonInstanceSource, MarkerInit> {
  static styles = useStyles([styles]);
  static readonly layout = MARKER;
  static readonly metadata = { tag: 'nve-scene-polygon', version: '0.0.0' };

  #color = DEFAULT_COLOR.source;
  #geometry: PolygonGeometry | null = null;

  /** Stable application identity returned when picking the uninstanced polygon. */
  @property({ attribute: 'feature-id', converter: sceneFeatureIdConverter })
  get featureId(): number | undefined {
    return getElementFeatureId(this);
  }

  set featureId(value: number | undefined) {
    setElementFeatureId(this, value);
  }

  /** Atomic outer boundary and optional hole rings, rendered in local xy at z zero. */
  @property({ type: Object })
  get geometry(): PolygonGeometry | null {
    return this.#geometry;
  }

  set geometry(value: PolygonGeometry | null) {
    if (value === undefined) throw new TypeError('Polygon geometry must be an object or null.');
    const previous = this.#geometry;
    this.#geometry = value;
    setPolygonLayerGeometry(this, value);
    this.requestUpdate('geometry', previous);
  }

  /** CSS base color multiplied by each instance tint. */
  @property({ converter: colorConverter })
  get color(): string {
    return this.#color;
  }

  set color(value: string) {
    const next = normalizeCSSColor(value, DEFAULT_COLOR);
    const previous = this.#color;
    if (next.source === previous) return;
    this.#color = next.source;
    setPolygonLayerColor(this, next.rgba);
    this.requestUpdate('color', previous);
  }

  constructor() {
    super('cube', { create: records => new MarkerBuffer({ records }), kind: 'marker' });
    registerElementFeatureId(this);
    registerPolygonLayer(this, DEFAULT_COLOR.rgba);
  }
}
