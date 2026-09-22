// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { property } from 'lit/decorators/property.js';
import { useStyles } from '@nvidia-elements/core/internal';
import { StreamingLayerElement } from '../internal/streaming-layer-element.js';
import { POINT } from '../internal/layouts/built-ins.js';
import { normalizePointSizeUnit, type PointSizeUnit } from '../internal/points/data.js';
import type { PointSource } from '../internal/points/buffer.js';
import { createPositiveFiniteNumberConverter } from '../internal/utils/converters.js';
import styles from '../internal/styles/host.css?inline';

const sizeUnitConverter = { fromAttribute: normalizePointSizeUnit };

/**
 * @element nve-scene-points
 * @description Renders streamed pixel- or world-sized square points from nve.point records.
 * @since 0.0.0
 * @entrypoint \@nvidia-elements/scene/points
 * @stable false
 */
export class ScenePoints extends StreamingLayerElement<PointSource> {
  static styles = useStyles([styles]);

  static readonly layout = POINT;

  static readonly metadata = {
    tag: 'nve-scene-points',
    version: '0.0.0'
  };

  /** Uniform point size in the selected size unit. */
  @property({ converter: createPositiveFiniteNumberConverter(3) }) size = 3;

  /** Unit used by the point size. Defaults to CSS pixels. */
  @property({ attribute: 'size-unit', converter: sizeUnitConverter })
  sizeUnit: PointSizeUnit = 'pixel';

  constructor() {
    super('point', POINT);
  }
}
