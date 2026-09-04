// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useStyles } from '@nvidia-elements/core/internal';
import { MarkerLayerElement } from '../internal/markers/layer-element.js';
import { MARKER } from '../internal/layouts/built-ins.js';
import styles from './cubes.css?inline';

/**
 * @element nve-scene-cubes
 * @description Renders fixed-geometry cubes from declarative markers or streamed marker records.
 * @since 0.0.0
 * @entrypoint \@nvidia-elements/scene/cubes
 * @slot - Contains direct nve-scene-marker children.
 * @stable false
 */
export class SceneCubes extends MarkerLayerElement {
  static styles = useStyles([styles]);

  static readonly layout = MARKER;

  static readonly metadata = {
    tag: 'nve-scene-cubes',
    version: '0.0.0'
  };

  constructor() {
    super('cube');
  }
}
