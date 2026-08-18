// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { property } from 'lit/decorators/property.js';
import { useStyles } from '@nvidia-elements/core/internal';
import { StreamingLayerElement } from '../internal/streaming-layer-element.js';
import { POINT } from '../internal/layouts/built-ins.js';
import { normalizePointSizeUnit, type PointSizeUnit } from '../internal/point-data.js';
import styles from './points.css?inline';

const positiveFiniteNumberConverter = {
  fromAttribute(value: string | null): number {
    const parsed = value === null ? 3 : Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 3;
  }
};

const sizeUnitConverter = { fromAttribute: normalizePointSizeUnit };

/**
 * @element nve-scene-points
 * @description Renders streamed pixel- or world-sized square points from nve.point records.
 * @since 0.0.0
 * @entrypoint \@nvidia-elements/scene/points
 * @stable false
 */
export class ScenePoints extends StreamingLayerElement {
  #sizeUnit: PointSizeUnit = 'pixel';

  static styles = useStyles([styles]);

  static readonly layout = POINT;

  static readonly metadata = {
    tag: 'nve-scene-points',
    version: '0.0.0'
  };

  /** Uniform point size in the selected size unit. */
  @property({ converter: positiveFiniteNumberConverter }) size = 3;

  /** Unit used by the point size. Defaults to CSS pixels. */
  @property({ attribute: 'size-unit', converter: sizeUnitConverter })
  get sizeUnit(): PointSizeUnit {
    return this.#sizeUnit;
  }

  set sizeUnit(value: PointSizeUnit) {
    const previous = this.#sizeUnit;
    const next = normalizePointSizeUnit(value);
    if (next !== previous) {
      this.#sizeUnit = next;
      this.requestUpdate('sizeUnit', previous);
    }
  }

  constructor() {
    super('point', POINT, { allowChildren: false });
  }
}
