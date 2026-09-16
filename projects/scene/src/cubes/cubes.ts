// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useStyles } from '@nvidia-elements/core/internal';
import { MarkerLayerElement } from '../internal/markers/layer-element.js';
import { MARKER } from '../internal/layouts/built-ins.js';
import { CubeBuffer, type Cube, type CubeInit, type CubeSource } from '../internal/markers/semantic-buffer.js';
import styles from '../internal/styles/host.css?inline';

/**
 * @element nve-scene-cubes
 * @description Renders fixed-geometry cubes from semantic source records.
 * @since 0.0.0
 * @entrypoint \@nvidia-elements/scene/cubes
 * @stable false
 */
export class SceneCubes extends MarkerLayerElement<CubeSource, CubeInit> {
  static styles = useStyles([styles]);

  static readonly layout = MARKER;

  static readonly metadata = {
    tag: 'nve-scene-cubes',
    version: '0.0.0'
  };

  constructor() {
    super('cube', { create: records => new CubeBuffer({ records }), kind: 'cube' });
  }
}

export { CubeBuffer };
export type { Cube, CubeInit, CubeSource };
