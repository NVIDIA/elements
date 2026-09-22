// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useStyles } from '@nvidia-elements/core/internal';
import { MarkerLayerElement } from '../internal/layers/markers/layer-element.js';
import { MARKER } from '../internal/records/layouts/built-ins.js';
import {
  PyramidBuffer,
  type Pyramid,
  type PyramidInit,
  type PyramidSource
} from '../internal/layers/markers/semantic-buffer.js';
import styles from '../internal/dom/host.css?inline';

/**
 * @element nve-scene-pyramids
 * @description Renders fixed-geometry square pyramids from semantic source records.
 * @since 0.0.0
 * @entrypoint \@nvidia-elements/scene/pyramids
 * @stable false
 */
export class ScenePyramids extends MarkerLayerElement<PyramidSource, PyramidInit> {
  static styles = useStyles([styles]);

  static readonly layout = MARKER;

  static readonly metadata = {
    tag: 'nve-scene-pyramids',
    version: '0.0.0'
  };

  constructor() {
    super('pyramid', { create: records => new PyramidBuffer({ records }), kind: 'pyramid' });
  }
}

export { PyramidBuffer };
export type { Pyramid, PyramidInit, PyramidSource };
