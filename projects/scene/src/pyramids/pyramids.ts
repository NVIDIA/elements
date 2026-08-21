// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useStyles } from '@nvidia-elements/core/internal';
import { MarkerLayerElement } from '../internal/markers/layer-element.js';
import { MARKER } from '../internal/layouts/built-ins.js';
import styles from './pyramids.css?inline';

/**
 * @element nve-scene-pyramids
 * @description Renders fixed-geometry square pyramids from declarative markers or streamed marker records.
 * @since 0.0.0
 * @entrypoint \@nvidia-elements/scene/pyramids
 * @slot - Contains direct nve-scene-marker children.
 * @stable false
 */
export class ScenePyramids extends MarkerLayerElement {
  static styles = useStyles([styles]);

  static readonly layout = MARKER;

  static readonly metadata = {
    tag: 'nve-scene-pyramids',
    version: '0.0.0'
  };

  constructor() {
    super('pyramid');
  }
}
