// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useStyles } from '@nvidia-elements/core/internal';
import { MarkerLayerElement } from '../internal/markers/layer-element.js';
import { MARKER } from '../internal/layouts/built-ins.js';
import { ConeBuffer, type Cone, type ConeInit, type ConeSource } from '../internal/markers/semantic-buffer.js';
import styles from '../internal/styles/host.css?inline';

/**
 * @element nve-scene-cones
 * @description Renders fixed-geometry cones from semantic source records.
 * @since 0.0.0
 * @entrypoint \@nvidia-elements/scene/cones
 * @stable false
 */
export class SceneCones extends MarkerLayerElement<ConeSource, ConeInit> {
  static styles = useStyles([styles]);

  static readonly layout = MARKER;

  static readonly metadata = {
    tag: 'nve-scene-cones',
    version: '0.0.0'
  };

  constructor() {
    super('cone', { create: records => new ConeBuffer({ records }), kind: 'cone' });
  }
}

export { ConeBuffer };
export type { Cone, ConeInit, ConeSource };
