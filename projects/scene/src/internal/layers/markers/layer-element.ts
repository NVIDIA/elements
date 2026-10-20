// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { LitElement, nothing } from 'lit';
import { property } from 'lit/decorators/property.js';
import { getFrameReference, setFrameReference } from '../../composition/frame/state.js';
import { LAYER_SOURCE_INVALID } from '../../diagnostics/errors.js';
import { getLayerInteractive, registerInteractiveLayer, setLayerInteractive } from '../../interaction/layer-state.js';
import type { SceneInteractionTarget } from '../../interaction/target.js';
import {
  getPackedRecordKind,
  isExternalPackedRecordSource,
  isPackedRecordSource,
  type AnyPackedRecordSource,
  type ExternalMarkerSource,
  type ScenePublishOptions
} from '../../records/packed-record-source.js';
import type { PrimitiveKind } from '../../math/primitive-geometry.js';
import { diagnosticReporterService } from '../../diagnostics/reporter.service.js';
import {
  connectMarkerLayer,
  disconnectMarkerLayer,
  getLayerCount,
  getLayerInstances,
  publishLayerInstances,
  registerMarkerLayer,
  setLayerCount,
  setLayerInstances
} from './layer-state.js';
import { getSemanticMarkerKind, type SemanticMarkerKind } from './semantic-brand.js';

interface MarkerLayerSourceConfig<Source extends AnyPackedRecordSource<'marker'>, Init> {
  readonly create: (records: readonly Init[]) => Source;
  readonly kind: SemanticMarkerKind;
}

/**
 * @event {SceneClick} nve-scene-click - Dispatched when pointer activation resolves to this layer.
 * @event {ScenePointerEnter} nve-scene-pointerenter - Dispatched when the pointer enters this layer.
 * @event {ScenePointerLeave} nve-scene-pointerleave - Dispatched when the pointer leaves this layer.
 */
export abstract class MarkerLayerElement<Source extends AnyPackedRecordSource<'marker'>, Init = never>
  extends LitElement
  implements SceneInteractionTarget
{
  /**
   * Names the owning coordinate frame instead of the nearest DOM ancestor frame.
   * Resolves in the nearest model scope, then outward; qualified paths such as arm/tcp
   * address model members. Omit to use DOM ancestry. Missing, duplicate, cross-scene,
   * or cyclic references report frame-unresolved and suppress this contribution until
   * corrected. Hidden or invalid resolved ancestors also suppress it.
   */
  @property({ type: String })
  get frame(): string | null {
    return getFrameReference(this);
  }

  set frame(value: string | null) {
    const previous = this.frame;
    setFrameReference(this, value);
    this.requestUpdate('frame', previous);
  }

  static override get observedAttributes(): string[] {
    return [...super.observedAttributes, 'source'];
  }

  readonly #sourceConfig: MarkerLayerSourceConfig<Source, Init>;

  protected constructor(kind: PrimitiveKind, sourceConfig: MarkerLayerSourceConfig<Source, Init>) {
    super();
    this.#sourceConfig = sourceConfig;
    registerInteractiveLayer(this);
    registerMarkerLayer(this, kind);
  }

  /**
   * Enables automatic nve-scene-click, nve-scene-pointerenter, and nve-scene-pointerleave
   * events; default false avoids picking work for decorative geometry. Records create no
   * DOM targets: detail.target identifies submitted slots and detail.featureId provides
   * application identity. Explicit scene.pick() includes rendered geometry regardless.
   */
  @property({ type: Boolean })
  get interactive(): boolean {
    return getLayerInteractive(this);
  }

  set interactive(value: boolean) {
    setLayerInteractive(this, value);
  }

  /**
   * Packed instances: use the primitive's matching buffer, or MarkerBuffer for body, mesh,
   * and polygon; layers reject other buffers. External sources must meet layer encoding. The HTML
   * attribute initializes from strict JSON records; this property accepts packed sources,
   * never arrays, and does not reflect. Removing the attribute clears source. Edit records,
   * then publish() on each consumer.
   */
  @property({ attribute: false })
  get source(): Source | ExternalMarkerSource | null {
    return getLayerInstances(this) as Source | ExternalMarkerSource | null;
  }

  set source(value: Source | ExternalMarkerSource | null) {
    this.#assertSource(value);
    const previous = this.source;
    setLayerInstances(this, value);
    this.#updateSourceDiagnostic(false, '');
    this.requestUpdate('source', previous);
  }

  /**
   * Limits rendered records independently of source count; undefined uses the complete
   * active prefix. Shrinking a source clamps effective draw count without rewriting the
   * authored limit. Regrowing can restore records under that same limit.
   */
  get countLimit(): number | undefined {
    return getLayerCount(this);
  }

  set countLimit(value: number | undefined) {
    setLayerCount(this, value);
  }

  /**
   * Synchronously validates and captures changed records for this layer's rendering snapshot.
   * Options start and count describe changed records, not bytes; activeCount selects the
   * complete active prefix. With no options, uses the typed buffer's current count and
   * never activates unused capacity. Source mutations and setCount() alone do not publish.
   *
   * Each layer owns its capture: publishing one consumer never changes another that shares
   * the source. Device recovery uses each layer's last publication, not unpublished producer edits.
   * Invalid records or ranges make this contribution inert without partially mixing
   * generations; a valid publication recovers it. Other valid layers remain usable.
   * Record APIs advance source version so consumers can reuse an unchanged prepared generation.
   * Accessing mutableBytes permanently disables prepared-source caching because later direct
   * writes cannot advance version. Byte publication uses the canonical layout's field offsets,
   * stride, and little-endian encoding.
   *
   * Pass the smallest accurate changed range. A count-only reduction can use count: 0;
   * growth also captures newly exposed records even outside the requested dirty range.
   * Fixed-size edits upload only their record range. Mesh publish() affects instance records;
   * use publishGeometry() for mesh vertices or indices.
   */
  publish(options?: ScenePublishOptions): void {
    publishLayerInstances(this, options);
  }

  render() {
    return nothing;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    connectMarkerLayer(this);
  }

  override disconnectedCallback(): void {
    disconnectMarkerLayer(this);
    super.disconnectedCallback();
  }

  override attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    super.attributeChangedCallback(name, oldValue, newValue);
    if (name === 'source' && oldValue !== newValue) this.#setSourceAttribute(newValue);
  }

  #setSourceAttribute(value: string | null): void {
    if (value === null) {
      this.source = null;
      return;
    }
    try {
      const records: unknown = JSON.parse(value);
      if (!Array.isArray(records)) throw new TypeError('The source attribute must contain a JSON array.');
      this.source = this.#sourceConfig.create(records as readonly Init[]);
    } catch (error) {
      const previous = this.source;
      setLayerInstances(this, null);
      this.requestUpdate('source', previous);
      this.#updateSourceDiagnostic(true, sourceErrorMessage(error));
    }
  }

  #assertSource(value: Source | ExternalMarkerSource | null): void {
    if (value === null) return;
    if (!isPackedRecordSource(value) || getPackedRecordKind(value) !== 'marker') throw sourceTypeError();
    if (isExternalPackedRecordSource(value)) return;
    if (getSemanticMarkerKind(value) !== this.#sourceConfig.kind) throw sourceTypeError();
  }

  #updateSourceDiagnostic(active: boolean, message: string): void {
    diagnosticReporterService.update({
      active,
      code: LAYER_SOURCE_INVALID,
      element: this,
      message,
      severity: 'error'
    });
  }
}

function sourceTypeError(): TypeError {
  return new TypeError(
    'Layer source must be its matching record buffer, a compatible external marker source, or null.'
  );
}

function sourceErrorMessage(error: unknown): string {
  const detail = error instanceof Error ? ` ${error.message}` : '';
  return `The source attribute must contain valid JSON records for this layer.${detail}`;
}
