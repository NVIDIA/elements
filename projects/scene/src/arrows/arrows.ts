// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useStyles } from '@nvidia-elements/core/internal';
import { MARKER } from '../internal/layouts/built-ins.js';
import { MarkerLayerElement } from '../internal/markers/layer-element.js';
import { ArrowBuffer, type Arrow, type ArrowInit, type ArrowSource } from '../internal/markers/semantic-buffer.js';
import styles from '../internal/styles/host.css?inline';

/**
 * @element nve-scene-arrows
 * @description Renders fixed-geometry arrows from semantic source records.
 * @since 0.0.0
 * @entrypoint \@nvidia-elements/scene/arrows
 * @stable false
 */
export class SceneArrows extends MarkerLayerElement<ArrowSource, ArrowInit> {
  static styles = useStyles([styles]);

  static readonly layout = MARKER;

  static readonly metadata = {
    tag: 'nve-scene-arrows',
    version: '0.0.0'
  };

  constructor() {
    super('arrow', { create: records => new ArrowBuffer({ records }), kind: 'arrow' });
  }
}

export { ArrowBuffer };
export type { Arrow, ArrowInit, ArrowSource };
