// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { property } from 'lit/decorators/property.js';
import { useStyles } from '@nvidia-elements/core/internal';
import { MarkerLayerElement } from '../internal/markers/layer-element.js';
import { MARKER } from '../internal/layouts/built-ins.js';
import {
  connectMeshLayer,
  disconnectMeshLayer,
  registerMeshLayer,
  setMeshColor,
  setMeshGeometryProperty,
  setMeshTexture
} from '../internal/mesh/layer-state.js';
import styles from './mesh.css?inline';

/**
 * @element nve-scene-mesh
 * @description Raw triangle mesh with optional marker instancing.
 * @since 0.0.0
 * @entrypoint \@nvidia-elements/scene/mesh
 * @slot - Contains direct nve-scene-marker children.
 * @stable false
 */
export class SceneMesh extends MarkerLayerElement {
  static styles = useStyles([styles]);
  static readonly layout = MARKER;
  static readonly metadata = { tag: 'nve-scene-mesh', version: '0.0.0' };

  /** XYZ position triples in frame-local coordinates. */
  get positions(): Float32Array | null {
    return this.#positions;
  }
  set positions(value: Float32Array | null) {
    setMeshGeometryProperty(this, 'positions', value);
    this.#positions = value;
  }
  /** Optional XYZ normal triples; absent normals use deterministic flat normals. */
  get normals(): Float32Array | null {
    return this.#normals;
  }
  set normals(value: Float32Array | null) {
    setMeshGeometryProperty(this, 'normals', value);
    this.#normals = value;
  }
  /** Optional UV pairs that enable texture sampling. */
  get uvs(): Float32Array | null {
    return this.#uvs;
  }
  set uvs(value: Float32Array | null) {
    setMeshGeometryProperty(this, 'uvs', value);
    this.#uvs = value;
  }
  /** Optional RGBA vertex colors in the range 0..1. */
  get colors(): Float32Array | null {
    return this.#colors;
  }
  set colors(value: Float32Array | null) {
    setMeshGeometryProperty(this, 'colors', value);
    this.#colors = value;
  }
  /** Optional uint32 triangle indices. */
  get indices(): Uint32Array | null {
    return this.#indices;
  }
  set indices(value: Uint32Array | null) {
    setMeshGeometryProperty(this, 'indices', value);
    this.#indices = value;
  }
  /** Optional sRGB base-color image to sample with UVs. */
  get texture(): ImageBitmap | null {
    return this.#texture;
  }
  set texture(value: ImageBitmap | null) {
    setMeshTexture(this, value);
    this.#texture = value;
  }

  /** CSS base-color factor multiplied with mesh colors and texture samples. */
  @property({ type: String, reflect: true }) color = '#ffffff';
  #positions: Float32Array | null = null;
  #normals: Float32Array | null = null;
  #uvs: Float32Array | null = null;
  #colors: Float32Array | null = null;
  #indices: Uint32Array | null = null;
  #texture: ImageBitmap | null = null;

  constructor() {
    super('cube');
    registerMeshLayer(this);
  }
  protected override updated(): void {
    setMeshColor(this, this.color);
  }
  override connectedCallback(): void {
    super.connectedCallback();
    connectMeshLayer(this);
  }
  override disconnectedCallback(): void {
    disconnectMeshLayer(this);
    super.disconnectedCallback();
  }
}
