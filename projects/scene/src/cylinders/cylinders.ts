// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useStyles } from '@nvidia-elements/core/internal';
import { MarkerLayerElement } from '../internal/markers/layer-element.js';
import { MARKER } from '../internal/layouts/built-ins.js';
import {
  CylinderBuffer,
  type Cylinder,
  type CylinderInit,
  type CylinderSource
} from '../internal/markers/semantic-buffer.js';
import styles from '../internal/styles/host.css?inline';

/**
 * @element nve-scene-cylinders
 * @description Renders fixed-geometry cylinders from semantic source records.
 * @since 0.0.0
 * @entrypoint \@nvidia-elements/scene/cylinders
 * @stable false
 */
export class SceneCylinders extends MarkerLayerElement<CylinderSource, CylinderInit> {
  static styles = useStyles([styles]);

  static readonly layout = MARKER;

  static readonly metadata = {
    tag: 'nve-scene-cylinders',
    version: '0.0.0'
  };

  constructor() {
    super('cylinder', { create: records => new CylinderBuffer({ records }), kind: 'cylinder' });
  }
}

export { CylinderBuffer };
export type { Cylinder, CylinderInit, CylinderSource };
