// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useStyles } from '@nvidia-elements/core/internal';
import { MarkerLayerElement } from '../internal/markers/layer-element.js';
import { MARKER } from '../internal/layouts/built-ins.js';
import styles from './cylinders.css?inline';

/**
 * @element nve-scene-cylinders
 * @description Renders fixed-geometry cylinders from declarative markers or streamed marker records.
 * @since 0.0.0
 * @entrypoint \@nvidia-elements/scene/cylinders
 * @slot - Contains direct nve-scene-marker children.
 * @stable false
 */
export class SceneCylinders extends MarkerLayerElement {
  static styles = useStyles([styles]);

  static readonly layout = MARKER;

  static readonly metadata = {
    tag: 'nve-scene-cylinders',
    version: '0.0.0'
  };

  constructor() {
    super('cylinder');
  }
}
