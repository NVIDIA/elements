// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { property } from 'lit/decorators/property.js';
import { useStyles } from '@nvidia-elements/core/internal';
import { MarkerLayerElement } from '../internal/markers/layer-element.js';
import { MARKER } from '../internal/layouts/built-ins.js';
import {
  connectMeshLayer,
  captureMeshTexture,
  disconnectMeshLayer,
  publishMeshGeometry,
  registerMeshLayer,
  setMeshColor,
  setMeshGeometryProperty,
  replaceMeshGeometry
} from '../internal/mesh/layer-state.js';
import type { SceneTextureCaptureResult } from '../internal/mesh/layer-state.js';
import styles from '../internal/host.css?inline';

/** Complete producer input captured by SceneMesh.geometry. */
export interface SceneMeshGeometry {
  readonly colors?: Float32Array | null;
  readonly indices?: Uint32Array | null;
  readonly normals?: Float32Array | null;
  readonly positions: Float32Array;
  readonly uvs?: Float32Array | null;
}

interface SceneMeshGeometryPublishRange {
  /** Number of vertices, or number of scalar indices for the indices attribute. */
  readonly count?: number;
  /** First vertex, or first scalar index for the indices attribute. */
  readonly start?: number;
}

/** Selects producer records to capture for one mesh geometry attribute. */
export type SceneMeshGeometryPublishOptions = SceneMeshGeometryPublishRange &
  (
    | {
        readonly attribute: Exclude<SceneMeshGeometryAttribute, 'indices'>;
        /** Optional replacement producer array. Omit to publish from the current geometry source. */
        readonly source?: Float32Array | null;
      }
    | {
        readonly attribute: 'indices';
        /** Optional replacement producer array. Omit to publish from the current geometry source. */
        readonly source?: Uint32Array | null;
      }
  );

/** Mesh attribute accepted by SceneMesh.publishGeometry(). */
export type SceneMeshGeometryAttribute = 'positions' | 'normals' | 'uvs' | 'colors' | 'indices';

export type { SceneTextureCaptureResult };

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

  #geometry: SceneMeshGeometry | null = null;

  /** Captures and replaces the complete geometry, or clears it when null. */
  @property({ attribute: false })
  get geometry(): SceneMeshGeometry | null {
    return this.#geometry;
  }

  set geometry(value: SceneMeshGeometry | null) {
    const previous = this.#geometry;
    const replacement =
      value === null ? { colors: null, indices: null, normals: null, positions: null, uvs: null } : value;
    replaceMeshGeometry(this, replacement);
    this.#storeProducerGeometry(value);
    this.requestUpdate('geometry', previous);
  }

  /** Captures an independently owned texture source; the newest request wins. */
  setTexture(source: ImageBitmap | null): Promise<SceneTextureCaptureResult> {
    return captureMeshTexture(this, source);
  }

  /** Captures a producer-array range without replacing geometry capacity. */
  publishGeometry(options: SceneMeshGeometryPublishOptions): void {
    if (typeof options !== 'object' || options === null || !isMeshGeometryAttribute(options.attribute)) {
      throw new TypeError('Mesh geometry publication requires a supported attribute.');
    }
    const source = options.source === undefined ? this.#getProducerGeometry(options.attribute) : options.source;
    if (options.source !== undefined && options.start === undefined && options.count === undefined) {
      setMeshGeometryProperty(this, options.attribute, source);
      this.#setProducerGeometry(options.attribute, source);
      return;
    }
    publishMeshGeometry(this, {
      attribute: options.attribute,
      count: options.count,
      source,
      start: options.start
    });
    if (options.source !== undefined) this.#setProducerGeometry(options.attribute, source);
  }

  /** CSS base-color factor multiplied with mesh colors and texture samples. */
  @property({ type: String, reflect: true }) color = '#ffffff';
  #positions: Float32Array | null = null;
  #normals: Float32Array | null = null;
  #uvs: Float32Array | null = null;
  #colors: Float32Array | null = null;
  #indices: Uint32Array | null = null;

  #getProducerGeometry(attribute: SceneMeshGeometryAttribute): Float32Array | Uint32Array | null {
    if (attribute === 'positions') return this.#positions;
    if (attribute === 'normals') return this.#normals;
    if (attribute === 'uvs') return this.#uvs;
    if (attribute === 'colors') return this.#colors;
    return this.#indices;
  }

  #storeProducerGeometry(geometry: unknown): void {
    const input = typeof geometry === 'object' && geometry !== null ? geometry : {};
    const positions = Reflect.get(input, 'positions');
    const normals = Reflect.get(input, 'normals');
    const uvs = Reflect.get(input, 'uvs');
    const colors = Reflect.get(input, 'colors');
    const indices = Reflect.get(input, 'indices');
    this.#positions = positions instanceof Float32Array ? positions : null;
    this.#normals = normals instanceof Float32Array ? normals : null;
    this.#uvs = uvs instanceof Float32Array ? uvs : null;
    this.#colors = colors instanceof Float32Array ? colors : null;
    this.#indices = indices instanceof Uint32Array ? indices : null;
    this.#updateGeometry();
  }

  #setProducerGeometry(attribute: SceneMeshGeometryAttribute, source: Float32Array | Uint32Array | null): void {
    if (attribute === 'indices') {
      if (source !== null && !(source instanceof Uint32Array)) {
        throw new TypeError('Mesh indices must be a Uint32Array or null.');
      }
      this.#indices = source;
    } else {
      if (source !== null && !(source instanceof Float32Array)) {
        throw new TypeError(`Mesh ${attribute} must be a Float32Array or null.`);
      }
      if (attribute === 'positions') this.#positions = source;
      else if (attribute === 'normals') this.#normals = source;
      else if (attribute === 'uvs') this.#uvs = source;
      else this.#colors = source;
    }
    this.#updateGeometry();
  }

  #updateGeometry(): void {
    this.#geometry = this.#positions
      ? {
          positions: this.#positions,
          ...(this.#normals ? { normals: this.#normals } : {}),
          ...(this.#uvs ? { uvs: this.#uvs } : {}),
          ...(this.#colors ? { colors: this.#colors } : {}),
          ...(this.#indices ? { indices: this.#indices } : {})
        }
      : null;
  }

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

function isMeshGeometryAttribute(value: unknown): value is SceneMeshGeometryAttribute {
  return ['positions', 'normals', 'uvs', 'colors', 'indices'].includes(String(value));
}
