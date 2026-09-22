// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useStyles } from '@nvidia-elements/core/internal';
import { StreamingLayerElement } from '../internal/layers/streaming/layer-element.js';
import { TRIANGLE_VERTEX } from '../internal/records/layouts/built-ins.js';
import type { TriangleVertexSource } from '../internal/layers/triangles/buffer.js';
import styles from '../internal/dom/host.css?inline';

/**
 * @element nve-scene-triangles
 * @description Renders an unlit triangle soup from nve.triangle-vertex records.
 * @since 0.0.0
 * @entrypoint \@nvidia-elements/scene/triangles
 * @stable false
 */
export class SceneTriangles extends StreamingLayerElement<TriangleVertexSource> {
  static styles = useStyles([styles]);

  static readonly layout = TRIANGLE_VERTEX;

  static readonly metadata = {
    tag: 'nve-scene-triangles',
    version: '0.0.0'
  };

  constructor() {
    super('triangles', TRIANGLE_VERTEX);
  }
}
