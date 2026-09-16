// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { LitElement, nothing } from 'lit';
import { property } from 'lit/decorators/property.js';
import { LAYER_SOURCE_INVALID } from '../../errors.js';
import { getLayerInteractive, registerInteractiveLayer, setLayerInteractive } from '../interactive-layer-state.js';
import type { SceneInteractionTarget } from '../interaction.js';
import {
  getPackedRecordKind,
  isExternalPackedRecordSource,
  isPackedRecordSource,
  type AnyPackedRecordSource,
  type ExternalMarkerSource,
  type ScenePublishOptions
} from '../packed-record-source.js';
import type { PrimitiveKind } from '../primitive-geometry.js';
import { diagnosticReporterService } from '../services/diagnostic-reporter.service.js';
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
 * @event {ScenePickHit} nve-scene-click - Dispatched when pointer activation resolves to this layer.
 * @event {ScenePickHit} nve-scene-pointerenter - Dispatched when the pointer enters this layer.
 * @event {ScenePickHit} nve-scene-pointerleave - Dispatched when the pointer leaves this layer.
 */
export abstract class MarkerLayerElement<Source extends AnyPackedRecordSource<'marker'>, Init = never>
  extends LitElement
  implements SceneInteractionTarget
{
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

  /** Enables automatic pointer hit testing and routed interaction events for this layer. */
  @property({ type: Boolean })
  get interactive(): boolean {
    return getLayerInteractive(this);
  }

  set interactive(value: boolean) {
    setLayerInteractive(this, value);
  }

  /** Resolved packed instance source. The HTML attribute is a JSON initialization format. */
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

  /** Limits how many records render; undefined renders the complete source. */
  get countLimit(): number | undefined {
    return getLayerCount(this);
  }

  set countLimit(value: number | undefined) {
    setLayerCount(this, value);
  }

  /** Captures changed records and publishes the selected active source prefix to this layer. */
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
