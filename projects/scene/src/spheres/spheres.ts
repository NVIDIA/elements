// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useStyles } from '@nvidia-elements/core/internal';
import { MarkerLayerElement } from '../internal/markers/layer-element.js';
import { MARKER } from '../internal/layouts/built-ins.js';
import { SphereBuffer, type Sphere, type SphereInit, type SphereSource } from '../internal/markers/semantic-buffer.js';
import styles from '../internal/styles/host.css?inline';

/**
 * @element nve-scene-spheres
 * @description Renders fixed-geometry spheres from semantic source records.
 * @since 0.0.0
 * @entrypoint \@nvidia-elements/scene/spheres
 * @stable false
 */
export class SceneSpheres extends MarkerLayerElement<SphereSource, SphereInit> {
  static styles = useStyles([styles]);

  static readonly layout = MARKER;

  static readonly metadata = {
    tag: 'nve-scene-spheres',
    version: '0.0.0'
  };

  constructor() {
    super('sphere', { create: records => new SphereBuffer({ records }), kind: 'sphere' });
  }
}

export { SphereBuffer };
export type { Sphere, SphereInit, SphereSource };
