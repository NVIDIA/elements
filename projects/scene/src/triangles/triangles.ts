// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useStyles } from '@nvidia-elements/core/internal';
import { StreamingLayerElement } from '../internal/streaming-layer-element.js';
import { TRI_VERTEX } from '../internal/layouts/built-ins.js';
import type { TriangleVertexInstanceSource } from '../internal/triangles/buffer.js';
import styles from './triangles.css?inline';

/**
 * @element nve-scene-triangles
 * @description Renders an unlit triangle soup from nve.tri-vertex records.
 * @since 0.0.0
 * @entrypoint \@nvidia-elements/scene/triangles
 * @stable false
 */
export class SceneTriangles extends StreamingLayerElement<TriangleVertexInstanceSource> {
  static styles = useStyles([styles]);

  static readonly layout = TRI_VERTEX;

  static readonly metadata = {
    tag: 'nve-scene-triangles',
    version: '0.0.0'
  };

  constructor() {
    super('triangles', TRI_VERTEX, { allowChildren: false });
  }

  get vertices(): TriangleVertexInstanceSource | null {
    return this.instances;
  }

  set vertices(value: TriangleVertexInstanceSource | null) {
    this.instances = value;
  }
}
