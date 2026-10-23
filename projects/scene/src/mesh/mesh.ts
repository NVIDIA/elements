// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { PropertyValues } from 'lit';
import { property } from 'lit/decorators/property.js';
import { useStyles } from '@nvidia-elements/core/internal';
import { MarkerLayerElement } from '../internal/layers/markers/layer-element.js';
import { MarkerBuffer, type MarkerInit, type MarkerSource } from '../internal/layers/markers/buffer.js';
import { MARKER } from '../internal/records/layouts/built-ins.js';
import {
  captureMeshTexture,
  publishMeshGeometry,
  registerMeshLayer,
  setMeshColor,
  setMeshGeometryProperty,
  replaceMeshGeometry,
  hasMeshTexture
} from '../internal/layers/mesh/layer-state.js';
import { MeshAssetLoader } from '../internal/layers/mesh/asset-loader.js';
import { notifyOwningBodyPart } from '../internal/layers/body/part-notifications.js';
import { isSceneBodyPart } from '../internal/layers/registry.js';
import { MESH_PROPERTY_INACTIVE } from '../internal/diagnostics/errors.js';
import { diagnosticReporterService } from '../internal/diagnostics/reporter.service.js';
import type { Quaternion, Vec3 } from '../internal/math/types.js';
import type { SceneTextureCaptureResult } from '../internal/layers/mesh/layer-state.js';
import {
  getElementFeatureId,
  registerElementFeatureId,
  sceneFeatureIdConverter,
  setElementFeatureId
} from '../internal/interaction/element-feature-id.js';
import styles from '../internal/dom/host.css?inline';

import type { SceneMeshGeometry } from '../internal/layers/mesh/types.js';

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
export type MeshInstanceSource = MarkerSource;

/**
 * @element nve-scene-mesh
 * @description Triangle mesh from assigned arrays or a geometry file, either as its own layer or as part of a body.
 * Standalone, geometry without a source uses one identity placement. Assign a MarkerBuffer for many
 * placements, or a JSON source attribute for modest static instance sets.
 * Use for persistent lit, textured, or instanced assets; frequently changing overlays that need
 * range-proportional updates or per-triangle picking belong in nve-scene-triangles.
 * @since 0.0.0
 * @entrypoint \@nvidia-elements/scene/mesh
 * @stable false
 */
export class SceneMesh extends MarkerLayerElement<MeshInstanceSource, MarkerInit> {
  static styles = useStyles([styles]);
  static readonly layout = MARKER;
  static readonly metadata = { tag: 'nve-scene-mesh', version: '0.0.0' };

  #geometry: SceneMeshGeometry | null = null;
  readonly #loader = new MeshAssetLoader(this, geometry => this.#applyGeometry(geometry));

  /**
   * Reflected geometry file URL, loaded while connected. Its case-insensitive path extension
   * selects a lazy decoder, ignoring query and fragment; the original fragment passes unchanged
   * for sub-asset selection. The file must decode to one untransformed mesh, as STL does. Failures
   * reject loadComplete and report mesh-src. Assigning geometry clears src.
   */
  @property({
    type: String,
    reflect: true,
    converter: { fromAttribute: (value: string | null) => value ?? '', toAttribute: (value: string) => value || null }
  })
  get src(): string {
    return this.#loader.src;
  }

  set src(value: string) {
    this.#loader.src = value;
  }

  /**
   * Current file request, resolving after decoding and geometry capture, before GPU presentation.
   * Changing src, assigning geometry, or disconnecting cancels pending work with AbortError;
   * only the newest request can apply. An unfinished request restarts on reconnect.
   */
  get loadComplete(): Promise<void> {
    return this.#loader.loadComplete;
  }

  /** Body-local translation in x y z order. Applies only to direct nve-scene-body children. */
  @property({ type: Array, noAccessor: true })
  get position(): Vec3 {
    return this.#position;
  }

  set position(value: Vec3 | null) {
    this.#setPartProperty({
      name: 'position',
      previous: this.#position,
      value: value ?? [0, 0, 0],
      assign: next => (this.#position = next)
    });
  }

  #position: Vec3 = [0, 0, 0];

  /** Body-local x y z w quaternion; null uses identity. Applies only to direct nve-scene-body children. */
  @property({ type: Array, noAccessor: true })
  get orientation(): Quaternion | null {
    return this.#orientation;
  }

  set orientation(value: Quaternion | null) {
    this.#setPartProperty({
      name: 'orientation',
      previous: this.#orientation,
      value: value ?? null,
      assign: next => (this.#orientation = next)
    });
  }

  #orientation: Quaternion | null = null;

  /** Nonzero body-local scale in x y z order. Applies only to direct nve-scene-body children. */
  @property({ type: Array, noAccessor: true })
  get scale(): Vec3 {
    return this.#scale;
  }

  set scale(value: Vec3 | null) {
    this.#setPartProperty({
      name: 'scale',
      previous: this.#scale,
      value: value ?? [1, 1, 1],
      assign: next => (this.#scale = next)
    });
  }

  #scale: Vec3 = [1, 1, 1];

  /** Stable application identity returned when picking the uninstanced mesh. */
  @property({ attribute: 'feature-id', converter: sceneFeatureIdConverter })
  get featureId(): number | undefined {
    return getElementFeatureId(this);
  }

  set featureId(value: number | undefined) {
    setElementFeatureId(this, value);
  }

  /**
   * Captures a complete geometry snapshot. Omitted arrays clear prior fields; null clears
   * all geometry. Assigning clears src; loaded files show here. Reassign even unchanged
   * arrays to publish edits, or use publishGeometry(). Producer mutations stay invisible across
   * recovery. Invalid input reports mesh-geometry and makes this mesh inert until a valid
   * assignment. Materials and instances stay unchanged.
   */
  @property({ attribute: false })
  get geometry(): SceneMeshGeometry | null {
    return this.#geometry;
  }

  set geometry(value: SceneMeshGeometry | null) {
    this.#applyGeometry(value);
    this.#loader.geometryAssigned();
  }

  /**
   * Captures an independently owned texture recovery source; the newest request wins.
   * Keep the input open until the promise settles. An applied result means the capture
   * succeeded and the caller can close its bitmap; Scene never closes caller inputs.
   * Replacing or clearing closes only Scene's owned captures. A superseded request resolves
   * with superseded. A current failure resolves with failed, reports mesh-texture-capture,
   * and makes the mesh inert; a valid replacement or explicit clear recovers it.
   *
   * setTexture(null) clears the rendering texture and releases the owned capture. Capture
   * needs no connected scene or GPU device. Successful CPU snapshots survive disconnect
   * and device recovery, where Scene rebuilds GPU resources from the capture.
   * Clearing geometry UVs preserves the capture but ignores it with a warning until valid
   * UVs return. Materials, textures, and instance data are independent of geometry replacement.
   */
  setTexture(source: ImageBitmap | null): Promise<SceneTextureCaptureResult> {
    return captureMeshTexture(this, source).then(result => {
      this.#updateInactiveDiagnostic();
      return result;
    });
  }

  /**
   * Captures a producer-array range for one geometry attribute without replacing capacity.
   * start and count select vertices for positions, normals, colors, and UV coordinates;
   * indices uses scalar indices. Omit source to read the current producer array, or supply
   * a replacement. Mutations outside the range remain invisible, including after recovery.
   * Consecutive publications before a frame preserve all changed ranges. Invalid ranges
   * or values throw without changing the last valid snapshot.
   * Valid geometry needs validation only for the selected records. Preserving a captured
   * renderer or body snapshot requires one full attribute copy; large copies prepare in
   * bounded asynchronous chunks while rendering keeps the last ready snapshot. Publications
   * share the pending copy. Repairing invalid geometry validates
   * the complete result.
   *
   * Changing indices updates topology. Position changes refresh generated normals when
   * normals are absent. Indexed flat geometry may need a full derived-attribute upload
   * even for a partial publication. The inherited publish() affects instance records only.
   */
  publishGeometry(options: SceneMeshGeometryPublishOptions): void {
    if (typeof options !== 'object' || options === null || !isMeshGeometryAttribute(options.attribute)) {
      throw new TypeError('Mesh geometry publication requires a supported attribute.');
    }
    const source = options.source === undefined ? this.#getProducerGeometry(options.attribute) : options.source;
    if (options.source !== undefined && options.start === undefined && options.count === undefined) {
      setMeshGeometryProperty(this, options.attribute, source);
      this.#setProducerGeometry(options.attribute, source);
      notifyOwningBodyPart(this);
      return;
    }
    const result = publishMeshGeometry(this, {
      attribute: options.attribute,
      count: options.count,
      source,
      start: options.start
    });
    if (options.source !== undefined) this.#setProducerGeometry(options.attribute, source);
    if (result === 'applied') notifyOwningBodyPart(this);
  }

  /** CSS base-color factor multiplied with mesh colors and texture samples. */
  @property({ type: String }) color = '#ffffff';
  #positions: Float32Array | null = null;
  #normals: Float32Array | null = null;
  #uvs: Float32Array | null = null;
  #colors: Float32Array | null = null;
  #indices: Uint32Array | null = null;

  #applyGeometry(value: SceneMeshGeometry | null): void {
    const previous = this.#geometry;
    const replacement =
      value === null ? { colors: null, indices: null, normals: null, positions: null, uvs: null } : value;
    replaceMeshGeometry(this, replacement);
    this.#storeProducerGeometry(value);
    this.requestUpdate('geometry', previous);
  }

  #setPartProperty<T extends Vec3 | Quaternion | null>(options: {
    readonly assign: (value: T) => void;
    readonly name: 'position' | 'orientation' | 'scale';
    readonly previous: T;
    readonly value: T;
  }): void {
    const { assign, name, previous, value } = options;
    if (
      value === previous ||
      (Array.isArray(value) &&
        Array.isArray(previous) &&
        value.length === previous.length &&
        value.every((entry, i) => entry === previous[i]))
    )
      return;
    assign(value);
    this.requestUpdate(name, previous);
  }

  #updateInactiveDiagnostic(): void {
    const part = isSceneBodyPart(this);
    const active = part
      ? this.source !== null ||
        this.frame !== null ||
        this.featureId !== undefined ||
        this.interactive ||
        hasMeshTexture(this)
      : !isIdentityTransform(this.#position, this.#orientation, this.#scale);
    diagnosticReporterService.update({
      active,
      code: MESH_PROPERTY_INACTIVE,
      element: this,
      message: part
        ? 'Body meshes ignore source, frame, feature-id, interactive, and textures; the body owns them.'
        : 'Mesh position, orientation, and scale apply only to direct nve-scene-body children.',
      severity: 'warning'
    });
  }

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
    super('cube', { create: records => new MarkerBuffer({ records }), kind: 'marker' });
    registerElementFeatureId(this);
    registerMeshLayer(this);
  }
  protected override updated(changed: PropertyValues<this>): void {
    if (changed.has('color')) setMeshColor(this, this.color);
    if (
      changed.has('color') ||
      changed.has('geometry') ||
      changed.has('position') ||
      changed.has('orientation') ||
      changed.has('scale')
    )
      notifyOwningBodyPart(this);
    this.#updateInactiveDiagnostic();
  }
  override connectedCallback(): void {
    super.connectedCallback();
    this.#loader.connect();
    this.#updateInactiveDiagnostic();
  }
  override disconnectedCallback(): void {
    this.#loader.disconnect();
    super.disconnectedCallback();
  }
}

function isMeshGeometryAttribute(value: unknown): value is SceneMeshGeometryAttribute {
  return ['positions', 'normals', 'uvs', 'colors', 'indices'].includes(String(value));
}

function isIdentityTransform(
  position: Readonly<Vec3>,
  orientation: Readonly<Quaternion> | null,
  scale: Readonly<Vec3>
): boolean {
  const rotation = orientation ?? [0, 0, 0, 1];
  return (
    position.every(value => value === 0) &&
    rotation[0] === 0 &&
    rotation[1] === 0 &&
    rotation[2] === 0 &&
    rotation[3] === 1 &&
    scale.every(value => value === 1)
  );
}
