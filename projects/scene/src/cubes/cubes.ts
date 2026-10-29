// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useStyles } from '@nvidia-elements/foundations/internal/styles';
import { MarkerLayerElement } from '../internal/layers/markers/layer-element.js';
import { MARKER } from '../internal/records/layouts/built-ins.js';
import { CubeBuffer, type Cube, type CubeInit, type CubeSource } from '../internal/layers/markers/semantic-buffer.js';
import styles from '../internal/dom/host.css?inline';

/**
 * @element nve-scene-cubes
 * @description Renders fixed-geometry cubes from semantic source records.
 * CubeBuffer and JSON source records use position (default origin), orientation (default
 * identity XYZW quaternion), and size (default [1, 1, 1]) for full local width, depth, and height.
 * outlineColor is independent of face color, preserving boundaries through overlapping
 * translucent faces. Packed and JSON records expose the same fields.
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
